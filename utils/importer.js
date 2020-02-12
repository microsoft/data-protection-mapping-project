
var Excel = require('exceljs');

var xlsxFile = "./src/assets/database.xlsx";
var outputFile = "./src/assets/db.json";
var outputFile2 = "./docs/assets/db.json"; // write one straight to the bin file so the user doesnt have to run the build pipeline.

function flatten(nodes, result) {
    for (var n of nodes)
    {
      result.push(n);
      if (n.children)
        flatten(n.children, result);
    }

    return result;
}

function exportXlsx(allDocs) {

    var workbook = new Excel.Workbook();

    for (var doc of allDocs)
    {
        var sections = flatten(doc.children, []);
        var worksheet = workbook.addWorksheet(doc.type);

        worksheet.columns = [
          { key: 'id' },
          { key: 'section' },
          { key: 'body' },
          { key: 'hyperlink' },
          { key: 'isolinks' }
        ];
    
        worksheet.getColumn('id').values = ["id"].concat(sections.map(v => v.id));
        worksheet.getColumn('section').values = ["section"].concat(sections.map(v => v.section));
        worksheet.getColumn('body').values = ["body"].concat(sections.map(v => v.body));
        worksheet.getColumn('hyperlink').values = ["hyperlink"].concat(sections.map(v => v.hyperlink));
        worksheet.getColumn('isolinks').values = ["isolinks"].concat(sections.map(v => v.links.map(l => l.id).join(";")));
    }

    workbook.xlsx.writeFile(xlsxFile)
      .then(function() {
        // done
      });
}

function writeResult(result) {
    const fs = require('fs');
    let data = JSON.stringify(result, null, 4);  
    console.log(data);
    fs.writeFileSync(outputFile, data); 
    fs.writeFileSync(outputFile2, data); 
}

var mergeLinks = function (src, dst) {
    if (src.links)
    {
      if (!dst.links)
        dst.links = [];

      for (var l of src.links)
      {
          if (!dst.links.find(n => n.id == l.id && n.type == l.type))
          {
              dst.links.push(l);
          }
      }
    }
}


var breakPath = function (path) {
    if (!path)
      return [];

    var frags = path.split(/\W+/);
    frags = frags.filter(f => f);
    return frags;
}

var normalizePath = function (path) {
    var frags = breakPath(path);
    var assembled = frags.join(".");
    return assembled;
}

var findOrCreateSection = function (root, id) {
  var frags = breakPath(id);
  var assembled = "";

  for (var f of frags)
  {
      if (assembled.length)
        assembled += '.';
      assembled += f;

      var child = root.children ? root.children.find(c => c.id == assembled) : null;
      if (child)
        root = child;
      else
      {
          var node = { 
            "id": assembled,
            "frag": f, // sortable fragment
            "section": assembled,
            "children": [],
            "links": []
          };

          root.children.push(node);
          root = node;
      }
  }

  return root;
}

var recursiveSort = function (doc) {
    doc.children.sort((a,b) => {
      if (!isNaN(a.frag) && !isNaN(b.frag))
        return parseInt(a.frag) - parseInt(b.frag);

      return a.frag - b.frag;
    });

    for (var c of doc.children)
      recursiveSort(c);
}

var mergeDocRecursive = function (src, dst) {
    for (var d of src)
    {
        var node = findOrCreateSection(dst, d.id);

        // copy properties
        node.id = d.id;
        node.section = d.section;
        node.body = d.body;
        node.hyperlink = d.hyperlink;
        if (d.links)
          mergeLinks(d, node);

        if (d.children)
          mergeDocRecursive(d.children, dst);
    }
};

var mergeDoc = function (src, dst) {
    mergeDocRecursive(src, dst);

    recursiveSort(dst);

    return dst;
};

function processRegulation(worksheet) {
  var idsCol = worksheet.getColumn(1);

  var ids = [];
  var doc = {
      "type": worksheet.name,
      "rev": 1,
      "children": []
  };

  var newChildren = [];

  idsCol.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
      if (rowNumber == 1)
          return; // skip the header row

      var row = worksheet.getRow(rowNumber);
                      
      var section = row.getCell(2).text;
      var body = row.getCell(3).text;
      var hyperlink = row.getCell(4).text;
      var isolinks = row.getCell(5).text;

      var links = isolinks.split(';').filter(v => v).map(v => { return {
              "id": v,
              "type": "ISO"
            }; });

      newChildren.push({
          id: cell.text,
          section: section,
          body: body.length ? body : undefined,
          hyperlink: hyperlink.length ? hyperlink : undefined,
          links: links
      });
  });

  mergeDoc(newChildren, doc);
  return doc;
}

function processChangeLog(worksheet) {
  var changeLog = [];
  var datesCol = worksheet.getColumn(1);

  datesCol.eachCell({ includeEmpty: false }, function(cell, rowNumber) {
      if (rowNumber == 1)
          return; // skip the header row

      var row = worksheet.getRow(rowNumber);
                      
      var author = row.getCell(2).text;
      var change = row.getCell(3).text;
      
      changeLog.push({
          date: new Date(cell),
          author: author,
          change: change
      });
  });

  return changeLog;
}

function importXlsx() {
    var workbook = new Excel.Workbook();
    return workbook.xlsx.readFile(xlsxFile)
      .then(function() {
          var allDocs = [];
          var changeLog = [];

          workbook.eachSheet(function(worksheet, sheetId) {
              console.log(worksheet.name);
              if (worksheet.name == "ChangeLog") {
                changeLog = processChangeLog(worksheet);
              }
              else {
                var doc = processRegulation(worksheet);
                allDocs.push(doc);
              }
          });

          var db = {
            "changelog": changeLog,
            "docs": allDocs
          };
          writeResult(db);
      });
};

module.exports = {
    exportXlsx,
    writeResult,
    mergeDoc,
    normalizePath,
    mergeLinks
};

importXlsx();
