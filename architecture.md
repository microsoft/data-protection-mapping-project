Copyright (c) Data Protection Mapping Project. All rights reserved.
Licensed under the MIT License.

## Architecture

### Build pipeline
  Git: https://github.com/microsoft/data-protection-mapping-project

  CI/CD: https://dev.azure.com/PRAOps/Standards%20and%20Regulations%20Mapping

  The CI/CD is triggered by a push to master or dev branches.

  The CI/CD pipeline:
  * Pulls latest branch source.
  * Converts Xlsx file to a json file for app consumption.
  * Builds the production Angular web app.
  * Publishes the built files to an Azure WebApp.

### Data
  The data originates from the [Xlsx file](src/assets/database.xlsx).

  The build pipeline runs the [converter.js](package.json#L15) script to convert the Xlsx to a json file that is optimized for the app to consume.

  The data is static in the app. There are no external APIs or data sources connected to this app. 

### UI
#### Overview:

 The UI is a modern [Angular](https://angular.io/) application. It's intended to be kept up to date with the latest version which is constantly evolving.

 Localling you can run a dev server that will automatically detect changes and refresh your browser. There is a production build to run to package the deployable app.

#### Noteable Files:

* GraphComponent:

  This class encapsulated all the view related logic to display the filters, results, and their mapping connections. This is the primary view of the app.

  This class also contains the logic for generating the SVG graph.

* GraphTab:

  This class encapsulates a tree for a regulation. It contains the nodes, mappings, and any other metadata for a regulation.

  The GraphTabs are stored as a parent child relationship so there are 2 for each regulation added. The parent is the tab and tree in the filter, and the child is the tab and tree in the graph.

* GraphService:

  This class accesses the raw regulation data and maintains persistent state for the application.

* GraphFilter:

  This class encapsulates all the logic related to filtering trees.

  Trees can be filtered directly, by checking nodes in the parent filter tree. Or indirectly, by being linked to another tree and filtering based on visible connections to that tree.

* Searchable:

  This class encapsulates the search box functionality including fuzzy search and highlighting. It's possible to create more than one searchable so you could search the same data from different views simultaneously.

* *DialogComponent:

  These present dismissable messages to the user.


* SideNav:

  Sidenav is contained in the AppComponent.

### Filter
 * Todo, how does the filter work?

### Search
 * Todo, how does the search work?



# MIT License

Copyright <2020> Data Protection Mapping Project
  
  MIT License
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
