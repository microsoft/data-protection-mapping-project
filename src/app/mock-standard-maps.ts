import { DocNode2, Doc2 } from './standard-map';
//import * as mockMapDb from './data/msftgdprsample.json'
//import * as mockMapDb from './data/sampledb.json'

interface SampleModule {
    default: Doc2[]
};


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var mockText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel velit magna. Ut ex est, consequat ultricies aliquam in, rutrum quis tortor. Etiam ex turpis, lacinia ac blandit eget, ultrices ac urna. Morbi pulvinar, leo vel gravida lacinia, velit dolor iaculis est, at porta arcu leo tempus lacus. Proin tincidunt, urna non varius mollis, turpis nisl hendrerit felis, nec scelerisque dui velit a tellus. Praesent consequat ante lacus, ac euismod libero elementum lacinia. Ut libero turpis, interdum id quam quis, malesuada dapibus tortor. Nulla ut orci eu odio pretium gravida et et nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Curabitur lorem magna, malesuada in placerat scelerisque, lacinia sit amet dui. Vestibulum non elementum dui. Proin et pellentesque nisl, efficitur congue tortor. Cras dapibus vel libero vel efficitur. Duis vitae diam quam. Vivamus ornare ullamcorper dolor, at facilisis est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.";


function GenerateStandardMapRecursive(doc: Doc2, result: DocNode2, sections: number, depth: number): void {
  if (depth > 0)
  {
      for (var i = 1; i <= sections; ++i)
      {
          var body = null;
          if (depth == 1)
          {
              var textLen = getRandomInt(40);
              var textStart = getRandomInt(mockText.length - textLen);
              body = mockText.substr(textStart, textLen);
          }

          var newId = i.toString();

          // prepend parent
          if (result.id)
              newId = result.id + "." + newId;

          var child = {
              id: newId,
              section: newId,
              body: body,
              compliance_level: 1,
              children: [],
              links: []
          };

          if (body && doc.type != "ISO")
          {
              // Link to iso doc
              child.links.push({
                  id: newId,
                  type: "ISO",
                  rev: "1"
              });
          }

          result.children.push(child);

          GenerateStandardMapRecursive(doc, child, sections / 2, depth - 1);
      }
  }
}

function GenerateStandardMap(type: string, rev: string, sections: number, depth: number): Doc2 {
    var result = {
        type: type,
        rev: rev,
        children: [],
        links: []
    };

    GenerateStandardMapRecursive(result, result, sections, depth);

    return result;
}


//export var mapDb: Doc2[] = (mockMapDb as any as SampleModule).default;

//export var mapDb2: Doc2[] = [
//    GenerateStandardMap('ISO', "1", 8, 3),
//    GenerateStandardMap('PIPEDA', "1", 8, 3),
//    GenerateStandardMap('APP', "1", 8, 3)
//];