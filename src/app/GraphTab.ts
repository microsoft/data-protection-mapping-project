import { debounce } from 'rxjs/operators';
import * as Rx from 'rxjs';
import { FullDocNode } from './standard-map';
import { TreeModel, TreeNode, ITreeState, TREE_ACTIONS } from 'angular-tree-component';
import { VisibleLink, GraphService } from './graph.service';

export class GraphTab {
    public options = {
        useCheckbox: true,
        allowDrag: false,
        allowDrop: false,
        scrollOnActivate: false,
        scrollContainer: <HTMLElement>document.body,
        //actionMapping: {
        //    mouse: {
        //        click: (tree, node, $event) => {
        //            TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);
        //        },
        //    }
        //}
    };
    public state: ITreeState = {};
    public treeModel: TreeModel;
    public visibleNodes: TreeNode[] = [];
    public visibleLinks: VisibleLink[] = [];
    public displayLinks: any[] = [];
    public isIso: boolean = false;
    public isAll: boolean = false;
    public searchValue: string = null;
    public coverage: any = null;
    public autoFilterSrc: GraphTab;
    public autoFilterSelf: boolean;
    public autoFilterParent: GraphTab;
    public errors: any = {};
    private updateSubjectParent = new Rx.BehaviorSubject(null);
    public selectedLang: string = "default";
    public inputObjectsMap: any = {};
    public id: string;
    public title: string;
    public iconStatus: any = { };

    constructor(
      public graphService: GraphService,
      public parent: GraphTab,
      public doc: FullDocNode) {
        this.id = doc.id;
        this.title = doc.name;
        this.isIso = this.id == "ISO";
        this.isAll = this.id == "All";
        if (!parent) {
            this.column = new GraphTab(this.graphService, this, doc);
            this.column.options.useCheckbox = false;
            this.updateSubjectParent.pipe(debounce(() => Rx.timer(1))).subscribe({
                next: (v) => this.parentTabTreeChangedImp(v)
            });
        }
    }
    public get errorStrings(): string[] {
        return Object.keys(this.errors);
    }
    public get anyErrors(): boolean {
        return this.errorStrings.length > 0;
    }
    public get anyExpanded(): boolean {
        return this.treeModel && this.treeModel.expandedNodes.length > 0;
    }
    public get anySelected(): boolean {
        return this.treeModel && this.treeModel.selectedLeafNodeIds && Object.keys(this.treeModel.selectedLeafNodeIds).length > 0;
    }
    public nodes = [];
    public column: GraphTab;

    public filterMapped() {
        // collapse all
        this.forAllTreeNodes(n => n.collapse());
        this.treeModel.selectedLeafNodeIds = {};
        var scrolledOnce = false;
        this.forAllTreeNodes(n => {
            if (n.level > 0) {
                n.setIsSelected(n.data.isUnmapped);
                if (n.data.isUnmapped) {
                    n.ensureVisible();
                    if (!scrolledOnce) {
                        scrolledOnce = true;
                        n.scrollIntoView();
                    }
                }
            }
        });
    }
    public filterToIds(ids: string[]) {
        // collapse all
        this.forAllTreeNodes(n => n.collapse());
        this.treeModel.selectedLeafNodeIds = {};
        var scrolledOnce = false;
        this.forAllTreeNodes(n => {
            if (n.level > 0) {
                var select = ids.includes(n.id);
                n.setIsSelected(select);
                if (select) {
                    n.ensureVisible();
                    if (!scrolledOnce) {
                        scrolledOnce = true;
                        n.scrollIntoView();
                    }
                }
            }
        });
    }
    public expandAll() {
        if (this.anyExpanded) {
            this.treeModel.collapseAll();
        }
        else {
            this.treeModel.expandAll();
        }
    }
    public selectAll() {
        if (this.anySelected) {
            this.treeModel.selectedLeafNodeIds = {};
        }
        else {
            this.treeModel.selectedLeafNodeIds = {};
            this.forAllTreeNodes(n => {
                if (n.level > 0)
                    n.setIsSelected(true);
            });
        }
    }
    public mergedOptions(opts) {
        return Object.assign(this.options, opts);
    }
    // Due to a bug in the tree control (forall is async but does not return the promise)
    //   create our own synchronous forall
    public forAllTreeNodes(cb: (tn: TreeNode) => void) {
        for (var n of this.treeModel.roots)
            this.forAllTreeNodesRecursive(n, cb);
    }
    private forAllTreeNodesRecursive(node: TreeNode, cb: (tn: TreeNode) => void) {
        cb(node);
        if (node.children) {
            for (var n of node.children)
                this.forAllTreeNodesRecursive(n, cb);
        }
    }
    public parentTabTreeChanged() {
        this.updateSubjectParent.next(0);
    }
    public parentTabTreeChangedImp(data: any) {
        if (this.column.treeModel) {
            // Due to a bug https://github.com/500tech/angular-tree-component/issues/521
            //  must manually clear nodes that are no longer selected
            for (var n of Object.keys(this.treeModel.selectedLeafNodeIds)) {
                var node = this.treeModel.getNodeById(n);
                if (node && !node.isSelected)
                    delete this.treeModel.selectedLeafNodeIds[n];
            }
            this.graphService.runFilters(this, true);
            this.graphService.updateSubject.next(0);
            // Must be delayed or you'll get an infinite loop of change events.
            //setTimeout(() => {
            // by default, collapse everything
            this.column.forAllTreeNodes(n => n.collapse());
            // ensure selected nodes are visible
            for (var n in this.treeModel.selectedLeafNodeIds) {
                var columnNode = this.column.treeModel.getNodeById(n);
                if (columnNode)
                    columnNode.ensureVisible();
            }
            //}, 1);
        }
    }

    public columnTabTreeChanged() {
        if (this.column.treeModel) {
            this.graphService.runFilters(this, false);
        }
    }

    public static flatten(array) {
        return array.reduce((a,b)=>a.concat(b), []);
    }
}
