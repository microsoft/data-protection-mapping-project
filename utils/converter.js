
var Excel = require('exceljs');


var inputFile = "./src/app/data/notcheckedin/MSFT ISO 27552 Country Mapping - Merged- Macro.xlsm";
var inputFileGdpr = "./src/app/data/notcheckedin/27552 to GDPR.xlsx";

var importer = require("./importer");

var keepNWords = function (input, n) {
    var frags = input.split(" ");
    var result = frags.slice(0, n).join(" ");
    if (frags.length > n)
      result += "...";
    return result;
    //return input.replace(new RegExp("(([^\s]+\s\s*){" + n + "})(.*)"),"$1…");
}

var removeSpecialCharacters = function (input) {
    return input.replace(/[^\w\s]/gi, '');
}

var nestDoc = function (doc) {
    var result = { "children" : [] };

    importer.mergeDoc(doc, result);

    return result;
}



var reduceDoc = function(doc) {
    var result = { };
    for (var i = 0; i < doc.length; ++i)
    {
      var newCell = doc[i];

      var copywriteWordLimit = 25;
      newCell.body = keepNWords(newCell.body, copywriteWordLimit);

      if (newCell.id in result)
      {
        var lastCell = result[newCell.id];

        //console.log("merge: " + newCell.id);
        //console.log("with: " + lastCell.id);
        // merge
        if (!lastCell.body.includes(newCell.body))
        {
            // append body
            lastCell.body += ' \n' + newCell.body;
        }

        importer.mergeLinks(newCell, lastCell);
      }
      else
      {
          result[newCell.id] = newCell;
      }
    }


    var keys = Object.keys(result).sort();
    var objs = keys.map(v => result[v]);
    return objs;
}

var makeDoc = function (doc, type) {
    doc.type = type;
    doc.rev = 1;
    return doc;
}

var mainMapping = function() {
  // read from a file
  var workbook = new Excel.Workbook();
  return workbook.xlsx.readFile(inputFile)
    .then(function() {
        // use workbook
        var sheetName = 'ISO 27552 Country Mapping';
        var worksheet = workbook.getWorksheet(sheetName);

        // build iso doc
        var sectionColumn = worksheet.getColumn(1);
        var sectionsByRow = { };
        var unmappedRows = {};

        sectionColumn.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
            // see if this is one of our unmapped/red rows
            var row = worksheet.getRow(rowNumber);
            row.eachCell({ includeEmpty: true }, function(cell, col) {
                if (cell.fill && cell.fill.fgColor && cell.fill.fgColor.argb == 'FFF04C3E')
                {
                  //console.log(JSON.stringify(cell.fill) + cell.text);
                  unmappedRows[rowNumber] = col;
                }
            });

            if (!(rowNumber in unmappedRows))
            {
              var section = cell.text.match(/(\d.*)/); // must start with a number
              if (section)
              {
                sectionsByRow[rowNumber] = importer.normalizePath(section[1])
              }
            }

        });

        var allDocs = [];
        var isoDoc = [];
        var descriptionColumn = worksheet.getColumn(2);
        descriptionColumn.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
          var section = sectionsByRow[rowNumber];
          if (section)
          {
            isoDoc.push({
                id: section,
                section: section,
                body: cell.text
            });
          }
        });

        isoDoc = makeDoc(nestDoc(reduceDoc(isoDoc)), "ISO");
        //console.log(JSON.stringify(isoDoc, null, 4));
        allDocs.push(isoDoc);





        var headerRow = worksheet.getRow(1);
        headerRow.eachCell(function(cell, colNumber) {
          if (colNumber <= 2)
            return; // skip iso columns.

          console.log('Header ' + colNumber + ' = ' + cell.text);
        
          var newDoc = [];
        
          var sectionColumn = worksheet.getColumn(colNumber);
          sectionColumn.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
            var bodyOverride = null;

            if (rowNumber in unmappedRows && unmappedRows[rowNumber] == colNumber)
            {
                // if it's unmapped/red, there is special handling of the text source
                var row = worksheet.getRow(rowNumber);
                cell = row.getCell(1); // section column
                bodyOverride = row.getCell(2).text; // description column
            }

            
            var section = cell.text.match(/.*\((.*[0-9].*)\).*/);
            if (section)
            {
              var body = cell.text;

              // Look for hyperlink in brackets at end of line
              var hyperlink = body.match(/\[http(.*)\]/);
              if (hyperlink)
              {
                // format hyperlink
                hyperlink = 'http' + hyperlink[1];

                // trim hyperlink from the end
                body = body.slice(0, -(hyperlink.length + 2)); // + 2 for brackets
              }

              var normalized = importer.normalizePath(section[1]);
              var sectionText = normalized;
              if (bodyOverride)
              {
                  body += " - " + bodyOverride;
              }

              var isoSection = sectionsByRow[rowNumber];
              links = isoSection
                ? [ {
                      "id": isoSection,
                      "type": "ISO"
                    }
                  ]
                : [];

              newDoc.push({
                  id: normalized,
                  section: sectionText,
                  body: body,
                  hyperlink: hyperlink,
                  links: links
              });
            }
          });

          newDoc = makeDoc(nestDoc(reduceDoc(newDoc)), removeSpecialCharacters(cell.text));
          //console.log(JSON.stringify(newDoc, null, 4));
          allDocs.push(newDoc);
        });
        //console.log(JSON.stringify(worksheet.rowCount));
        
        return allDocs;
    });
}


var gdprMapping = function() {
  // read from a file
  var workbook = new Excel.Workbook();
  return workbook.xlsx.readFile(inputFileGdpr)
    .then(function() {
        // use workbook
        var sheetName = 'Sheet1';
        var worksheet = workbook.getWorksheet(sheetName);

        // build iso doc
        var sectionColumn = worksheet.getColumn(1);
        var sectionsByRow = { };

        var allDocs = [];
        var isoDoc = [];
        var gdprDoc = [];

        var gdprArticlesColIndex = 2;
        var gdprTextColIndex = 3;
        var titleColIndex = 4;
        var descriptionColIndex = 5;

        sectionColumn.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
          var section = cell.text.match(/(\d.*)/); // must start with a number
          if (section)
          {
            var sectionId = importer.normalizePath(section[1]);
            sectionsByRow[rowNumber] = sectionId;

            var row = worksheet.getRow(rowNumber);
            var gdprIds = row.getCell(gdprArticlesColIndex).text.split(",").map(v => v.match(/(\w+)*/g).filter(m => m).join("."));
            var gdprText = row.getCell(gdprTextColIndex).text.split("\r\n\r\n");

            var gdprZipped = gdprIds.map((v, i, a) => {
                return {
                    id: v,
                    section: v,
                    body: gdprText[i],
                    links: [ {
                        "id": sectionId,
                        "type": "ISO"
                      }
                    ]
                }
            });

            gdprDoc = gdprDoc.concat(gdprZipped);

            isoDoc.push({
                id: sectionId,
                section: sectionId + " - " + row.getCell(titleColIndex).text,
                body: row.getCell(descriptionColIndex).text
            });
          }
        });

        isoDoc = makeDoc(nestDoc(reduceDoc(isoDoc)), "ISO");
        gdprDoc = makeDoc(nestDoc(reduceDoc(gdprDoc)), "GDPR");
        allDocs.push(isoDoc);
        allDocs.push(gdprDoc);

        return allDocs;
    });
}

mainMapping()
  .then(allDocs => {
    
        gdprMapping()
          .then(isoGdpr => {
            var isoDocMain = allDocs[0];
            var isoDocGdpr = isoGdpr[0];
            var gdprDoc = isoGdpr[1];

            allDocs.push(gdprDoc);

            importer.mergeDoc(isoDocGdpr.children, isoDocMain);
    
            //console.log(JSON.stringify(allDocs, null, 4));

            importer.writeDocs(allDocs);

            importer.exportXlsx(allDocs);
        });
  });