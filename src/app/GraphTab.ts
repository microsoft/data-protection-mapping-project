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
        actionMapping: {
            mouse: {
                click: (tree, node, $event) => {
                    TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);
                },
            }
        }
    };
    public state: ITreeState = {};
    public treeModel: TreeModel;
    public visibleNodes: TreeNode[] = [];
    public visibleLinks: VisibleLink[] = [];
    public displayLinks: any[] = [];
    public isIso: boolean = false;
    public searchValue: string = null;
    public coverage: any = null;
    public autoFilterSrc: GraphTab;
    public autoFilterSelf: boolean;
    public autoFilterParent: GraphTab;
    public errors: any = {};
    private updateSubjectParent = new Rx.BehaviorSubject(null);
    private updateSubjectColumn = new Rx.BehaviorSubject(null);
    public selectedLang: string = "default";
    public inputObjectsMap: any = {};

    constructor(
      public title: string,
      public graphService: GraphService,
      public parent: GraphTab = null,
      public doc: FullDocNode = null) {
        this.isIso = title == "ISO";
        if (!parent) {
            this.column = new GraphTab(title, this.graphService, this);
            this.column.options.useCheckbox = false;
            this.updateSubjectParent.pipe(debounce(() => Rx.timer(1))).subscribe({
                next: (v) => this.parentTabTreeChangedImp(v)
            });
            this.updateSubjectColumn.pipe(debounce(() => Rx.timer(1))).subscribe({
                next: (v) => this.columnTabTreeChangedImp(v)
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
    public static filterBySelectedLeafs(visibleNodes: TreeNode[], parentTree: TreeModel, node: TreeNode, noSelection: boolean): boolean {
        var inSelection = node.data.id in parentTree.selectedLeafNodeIds;
        node.data.filterColor = inSelection ? "yellow" : undefined;
        var show = noSelection || inSelection;
        if (show)
            visibleNodes.push(node);
        return show;
    }
    public static containsNode(parentTree: VisibleLink[], node: TreeNode): boolean {
        return parentTree.find(n => {
            return n.link.id == node.data.id;
        }) != null;
    }
    public static filterByVisibleLinks(visibleNodes: TreeNode[], parentTree: VisibleLink[], node: TreeNode): boolean {
        var show = GraphTab.containsNode(parentTree, node);
        var parent = node.parent;
        while (!show && parent) {
            // didnt find us but see if any parent is linked
            show = GraphTab.containsNode(parentTree, parent);
            parent = parent.parent;
        }
        if (show)
            visibleNodes.push(node);
        return show;
    }
    public static filterByMyLinks(visibleNodes: TreeNode[], parentTree: GraphTab, node: TreeNode): boolean {
        // keep unmapped stuff by default
        var show = node.data.isUnmapped;
        if (!show) {
            // include linked stuff
            var links = node.data.node.links;
            if (links) {
                for (var l of links) {
                    if (!(l.id in parentTree.state.hiddenNodeIds) || !parentTree.state.hiddenNodeIds[l.id]) {
                        show = true;
                        break;
                    }
                }
            }
        }
        if (show)
            visibleNodes.push(node);
        return show;
    }
    public runFilter() {
        this.visibleNodes = [];
        this.visibleLinks = [];
        if (this.treeModel) {
            this.treeModel.clearFilter();
            var noSelection = Object.keys(this.parent.treeModel.selectedLeafNodeIds).length == 0;
            this.treeModel.filterNodes((node: TreeNode) => {
                var show = false;
                if (this.autoFilterSrc) {
                    if (this.autoFilterSelf) {
                        show = GraphTab.filterByMyLinks(this.visibleNodes, this.autoFilterSrc, node);
                    }
                    else
                        show = GraphTab.filterByVisibleLinks(this.visibleNodes, this.autoFilterSrc.visibleLinks, node);
                }
                else {
                    show = GraphTab.filterBySelectedLeafs(this.visibleNodes, this.parent.treeModel, node, noSelection);
                }
                return show;
            }, false);
            if (this.autoFilterParent) {
                if (this.autoFilterParent.anySelected)
                    this.treeModel.expandAll();
                else
                    this.treeModel.collapseAll();
            }
            this.visibleLinks = GraphTab.flatten(this.visibleNodes.map(v => {
                var links = v.data.node.links;
                return links ? links.map(l => new VisibleLink(v, l)) : [];
            }));
        }
    }
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
    public parentTabTreeChanged(updateSubject: any) {
        this.updateSubjectParent.next([updateSubject]);
    }
    public parentTabTreeChangedImp(data: any) {
        if (!data)
            return;
        var updateSubject = data[0];
        if (this.column.treeModel) {
            // Due to a bug https://github.com/500tech/angular-tree-component/issues/521
            //  must manually clear nodes that are no longer selected
            for (var n of Object.keys(this.treeModel.selectedLeafNodeIds)) {
                var node = this.treeModel.getNodeById(n);
                if (node && !node.isSelected)
                    delete this.treeModel.selectedLeafNodeIds[n];
            }
            this.graphService.runFilters(this, true, updateSubject);
            updateSubject.next(0);
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
    public columnTabTreeChanged(event: any, updateSubject: any) {
        this.updateSubjectColumn.next([event, updateSubject]);
    }
    public columnTabTreeChangedImp(data: any) {
        if (!data)
            return;
        var event = data[0];
        var updateSubject = data[1];
        if (this.column.treeModel) {
            if (event) {
                // on expand
                if (event.isExpanded && event.node.isActive) {
                    var allNodes = this.graphService.getNodesWithLinks(event.node.data.children, []);
                    // select children with links
                    for (var c of allNodes) {
                        this.column.state.activeNodeIds[c.id] = true; // select child
                    }
                }
            }
            this.graphService.runFilters(this, false, updateSubject);
            updateSubject.next(0);
        }
    }

    public static flatten(array) {
        return array.reduce((a,b)=>a.concat(b), []);
    }
}
