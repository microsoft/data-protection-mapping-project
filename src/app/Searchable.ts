import { TreeModel, TreeNode } from 'angular-tree-component';
import { GraphTab } from "./GraphTab";
import * as Rx from 'rxjs';
import { debounce } from 'rxjs/operators';
import Fuse from 'fuse.js';

export class Searchable {
    private searchSubject = new Rx.BehaviorSubject(null);

    constructor() {
      this.searchSubject.pipe(debounce(() => Rx.timer(100))).subscribe({
        next: (v) => {
          if (v)
            this.filterFn(v[0], v[1], v[2]);
        }
      });
    }

    public filter(value: string, treeModel: TreeModel, tab: GraphTab) {
        this.searchSubject.next([value, treeModel, tab]);
    }
    public filterFn(value: string, treeModel: TreeModel, tab: GraphTab) {
        if (value != "")
            treeModel.filterNodes((node: TreeNode) => this.fuzzysearch(value, node, tab));
        else
            treeModel.filterNodes((node: TreeNode) => this.clearSearch(node));
    }
    public clearSearch(node: TreeNode): boolean {
        node.data.highlight = undefined;
        return true;
    }
    public fuzzysearch(searchTerm: string, node: TreeNode, tab: GraphTab): boolean {
        var options = {
            includeMatches: true,
            includeScore: true,
            shouldSort: false,
            tokenize: false,
            threshold: 0.3,
            location: 0,
            distance: 800,
            maxPatternLength: 32,
            minMatchCharLength: 3,
        };
        var result = [];
        var scoreThresh = 0;
        var inName = false;
        // Test body first
        var body = node.data.getBody(tab.selectedLang);
        if (body) {
            if (!node.data.bodyFuse) {
                node.data.bodyFuse = new Fuse([body], options);
            }
            result = node.data.bodyFuse.search(searchTerm);
            result = result.filter(a => a.score > scoreThresh);
        }
        if (result.length == 0) {
            // test title
            if (!node.data.sectionFuse) {
                var section = node.data.getSection(tab.selectedLang);
                node.data.sectionFuse = new Fuse([section], options);
            }
            result = node.data.sectionFuse.search(searchTerm);
            result = result.filter(a => a.score > scoreThresh);
            inName = true;
        }
        if (result.length > 0) {
            // record the longest matching span for highlight
            var length = -1;
            var longest = undefined;
            var match = result[0].matches[0];
            if (match) {
                for (var span of match.indices) {
                    var newLength = span[1] - span[0];
                    if (newLength > length) {
                        length = newLength;
                        longest = span;
                        span[1] += 1; // convert ending index to js substring convention of end + 1
                    }
                }
            }
            node.data.highlight = longest;
            node.data.highlightName = inName;
            return true;
        }
        node.data.highlight = undefined;
        return false;
    }
}
