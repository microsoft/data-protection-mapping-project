
var Excel = require('exceljs');

var xlsxFile = "./src/assets/database.xlsx";

var outputDir1 = "./src/assets/output/";
var outputDir2 = "./docs/assets/output/"; // write one straight to the bin file so the user doesnt have to run the build pipeline.
var outputFile = "db.json";

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

function writeResultDir(dir, result, optional) {
    const fs = require('fs');

    /*
    try {
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
    } catch (e) {
      console.log("writeResultDir()", dir, result, optional," e=", e);
      if (!optional)
        throw e;
    }
    */

    let data = JSON.stringify(result, null, 4); 
    fs.writeFileSync(dir + outputFile, data);

    // for perf reasons, write it out in chunks to
    var index = Object.assign({}, result);
    var docs = index.docs;
    index.docs = index.docs.map(v => { return { id: v.id, type: v.type }; });

    // write out the index
    fs.writeFileSync(dir + 'docs-index.json', JSON.stringify(index));

    // write out each doc
    for (var d of docs)
      fs.writeFileSync(dir + 'docs-' + d.id + '.json', JSON.stringify(d)); 
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
            "langs": [],
            "notes": []
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

var mergeDocRecursive = function (src, dst, prefix = '') {
    for (var d of src)
    {
        var node = findOrCreateSection(dst, prefix + d.id);

        // copy properties
        node.id = prefix + d.id;
        node.section = d.section;
        node.body = d.body;
        node.hyperlink = d.hyperlink;
        if (d.links)
          mergeLinks(d, node);
        node.langs = d.langs;

        if (d.children)
          mergeDocRecursive(d.children, dst, prefix);
    }
};

var mergeDoc = function (src, dst, prefix = '') {
    mergeDocRecursive(src, dst, prefix);

    recursiveSort(dst);

    return dst;
};

var parseIsoLinks = function (isoLinks) {
  return isoLinks.split(';').filter(v => v).map(v => {
    return {
      "id": v.trim(),
      "type": "ISO"
    };
  })
};


function processRegulation(worksheet) {
  var idsCol = worksheet.getColumn(1);
  var headerRow = worksheet.getRow(1);

  // override ISO tab name so its real name can be anything
  var sheetName = worksheet.id > 1 ? worksheet.name : "ISO";

  var ids = [];
  var doc = {
      "type": sheetName.trim(),
      "id": sheetName.replace(/\W/g, ''), // keep only alphanumeric
      "section": worksheet.name,
      "rev": 1,
      "children": [],
      "langs": []
  };

  const defaultLangKey = "en";

  var newChildren = [];
  var langDictTotal = { [defaultLangKey]: true };
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
        console.log("notes. rowNumber=", rowNumber);
        
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

        var section = row.getCell(2).text;
        var body = row.getCell(3).text;
        var hyperlink = row.getCell(4).text;
        var isoLinks = row.getCell(5).text;
        var langDict = {
          [defaultLangKey]: {
            section: section,
            body: body.length ? body : undefined
          }
        };

        for (var i = 6; i < headerRow.cellCount; i += 2) {
          var lang = headerRow.getCell(i).text.replace("_section", "");
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

  mergeDoc(newChildren, doc);

  // zip in notes
  //doc.notes = notes;
  for (var n of notes) {
    var node = findOrCreateSection(doc, n.id);
    node.notes.push(n);
  }

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

          // Create all-doc
          var allDoc = {
              "type": "All",
              "id": "All",
              "rev": 1,
              "children": [],
              "langs": []
          };

          for (var d of allDocs) {
            if (d.type != "ISO") {
              var rootKey = d.type.replace(/\W/g, '_'); // replace nonalphanumeric with _ so it doesnt get parsed as id structure.
              mergeDoc(d.children, allDoc, rootKey + ".");
              allDoc.children[allDoc.children.length - 1].section = d.type;
            }
          }

          allDocs.push(allDoc);

          var db = {
            "changelog": changeLog,
            "docs": allDocs
          };
          writeResultDir(outputDir1, db);
          writeResultDir(outputDir2, db, true); // this is only here to hot fix an existing build. if there's no build, no need.
      });
};

module.exports = {
    exportXlsx,
    mergeDoc,
    normalizePath,
    mergeLinks
};

importXlsx();
