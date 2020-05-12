
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
            "links": [],
            "langs": []
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
        node.langs = d.langs;

        if (d.children)
          mergeDocRecursive(d.children, dst);
    }
};

var mergeDoc = function (src, dst) {
    mergeDocRecursive(src, dst);

    recursiveSort(dst);

    return dst;
};

var parseIsoLinks = function (isoLinks) {
  return isoLinks.split(';').filter(v => v).map(v => {
    return {
      "id": v,
      "type": "ISO"
    };
  })
};


function processRegulation(worksheet) {
  var idsCol = worksheet.getColumn(1);
  var headerRow = worksheet.getRow(1);

  var ids = [];
  var doc = {
      "type": worksheet.name,
      "rev": 1,
      "children": []
  };

  var newChildren = [];
  var langDictTotal = { "default": true };
  var processingNotes = false;
  var skippedNotesRows = 0;
  var notes = [];

  idsCol.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
      if (rowNumber == 1)
          return; // skip the header row

      var row = worksheet.getRow(rowNumber);
      var idText = cell.text;

      if (processingNotes)
      {
        // process notes row
          console.log("notez.");
        
        // skip blank rows
        if (idText == "")
          return;

        // skip title and header rows
        if (skippedNotesRows++ < 2)
          return;
        
        var isoLinks = row.getCell(2).text;
        var comment = row.getCell(3).text;
        notes.push({
            id: idText,
            links: parseIsoLinks(isoLinks),
            comment: comment
        });
      }
      else
      {
        // process regulation
        if (idText == "")
        {
          // Switch to notes.
          processingNotes = true;
          return;
        }
          console.log(idText);

        var section = row.getCell(2).text;
        var body = row.getCell(3).text;
        var hyperlink = row.getCell(4).text;
        var isoLinks = row.getCell(5).text;
        var langDict = {
          "default": {
            section: section,
            body: body.length ? body : undefined
          }
        };

        for (var i = 6; i < headerRow.cellCount; i += 2) {
          var lang = headerRow.getCell(i).text.replace("-section", "");
          var langSection = row.getCell(i).text;
          var langBody = row.getCell(i + 1).text;
          langDictTotal[lang] = true;
          langDict[lang] = {
            lang: lang,
            section: langSection,
            body: langBody.length ? langBody : undefined
          };
        }
        
        newChildren.push({
            id: idText,
            hyperlink: hyperlink.length ? hyperlink : undefined,
            links: parseIsoLinks(isoLinks),
            langs: langDict
        });
      }
  });

  doc.langs = Object.keys(langDictTotal);
  doc.notes = notes;

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
