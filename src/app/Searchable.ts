import { TreeModel, TreeNode } from 'angular-tree-component';
import { GraphTab } from "./GraphTab";
import * as Rx from 'rxjs';
import { debounce } from 'rxjs/operators';
import Fuse from 'fuse.js';
import { FullDocNode } from './standard-map';

// Wraps searching functionality for a FullDocNode. You could create multiple of
//  these to search one doc from multiple views.
export class Searchable {
    private searchSubject = new Rx.BehaviorSubject(null);

    // https://fusejs.io/api/options.html#basic-options
    private options = {
        includeMatches: true,
        includeScore: true,
        shouldSort: false,
        tokenize: false,
        threshold: 0.3,
        location: 0,
        distance: 800,
        maxPatternLength: 32,
        minMatchCharLength: 3,
        keys: ["value"]
    };
    private fuse: any;
    private cachedDoc: FullDocNode;
    private cachedLang: string;

    constructor() {
      this.searchSubject.pipe(debounce(() => Rx.timer(500))).subscribe({
        next: (v) => {
          if (v)
            this.filterFn(v[0], v[1], v[2]);
        }
      });
    }
  
    // This is the public interface to this class. Pass an empty string to clear the search.
    //  Searching is debounced. So it will just queue a message in the subject.
    public filter(value: string, treeModel: TreeModel, tab: GraphTab) {
        this.searchSubject.next([value, treeModel, tab]);
    }

    // Create a search index, if the searchable data has changed.
    private tryRunIndex(doc: FullDocNode, lang: string) {
      if (!this.fuse || this.cachedDoc != doc || this.cachedLang != lang) {
        var data = [];
        this.recursiveGetData(doc, lang, data);
        this.fuse = new Fuse(data, this.options);
        this.cachedDoc = doc;
        this.cachedLang = lang;
      }
    }

    // Recurse the tree of data collecting searchable data.
    private recursiveGetData(doc: FullDocNode, lang: string, data: any[]) {
      var body = doc.getBody(lang);
      if (body) {
        data.push({
          value: body,
          isSection: false,
          node: doc
        });
      }

      var section = doc.getSection(lang);
      if (section) {
        data.push({
          value: section,
          isSection: true,
          node: doc
        });
      }

      for (var c of doc.children)
        this.recursiveGetData(c, lang, data);
    }

    // Called from the debounced search subject to do the actual searching.
    private filterFn(value: string, treeModel: TreeModel, tab: GraphTab) {
        if (value != "") {
            this.tryRunIndex(tab.doc, tab.selectedLang);

            // Do actual search
            var searchResult = this.fuse.search(value);

            // Update tree
            treeModel.filterNodes((node: TreeNode) => this.fuzzysearch(searchResult, node, tab));
        }
        else {
            // Clear tree filter
            treeModel.filterNodes((node: TreeNode) => this.clearSearch(node));

            // Collapse tree for performance reasons. (otherwise whole tree will be expanded which is slow.)
            treeModel.collapseAll();
        }
    }

    // Update a node to have no filter applied.
    private clearSearch(node: TreeNode): boolean {
        node.data.highlight = undefined;
        return true;
    }

    // Update a node to have fuzzy search results applied.
    private fuzzysearch(searchResult: any[], node: TreeNode, tab: GraphTab): boolean {
        var item = node.data;
        var result = searchResult.find(v => v.item.node == item);
        if (result) {
            // record the longest matching span for highlight
            var length = -1;
            var longest = undefined;
            var match = result.matches[0];
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
            node.data.highlightName = result.item.isSection;
            return true;
        }
        node.data.highlight = undefined;
        return false;
    }
}
