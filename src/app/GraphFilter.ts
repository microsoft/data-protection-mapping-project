import { TreeModel, TreeNode } from 'angular-tree-component';
import { VisibleLink, GraphService } from './graph.service';
import { GraphTab } from './GraphTab';
import { GraphComponent } from './graph/graph.component';

export class GraphFilter {
    public static runFilter(tab: GraphTab) {
        tab.visibleNodes = [];
        tab.visibleLinks = [];
        if (tab.treeModel) {
            tab.treeModel.clearFilter();
            var noSelection = Object.keys(tab.parent.treeModel.selectedLeafNodeIds).length == 0;
            tab.treeModel.filterNodes((node: TreeNode) => {
                node.data.connectedTo = {}; // clear connectivity
                var show = false;
                if (tab.autoFilterSrc) {
                    if (tab.autoFilterSelf) {
                        show = GraphFilter.filterByMyLinks(tab, tab.visibleNodes, tab.autoFilterSrc, node);
                    }
                    else
                        show = GraphFilter.filterByVisibleLinks(tab.visibleNodes, tab.autoFilterSrc.visibleLinks, node);
                }
                else {
                    show = GraphFilter.filterBySelectedLeafs(tab.visibleNodes, tab.parent.treeModel, node, noSelection);
                }
                return show;
            }, false);
          
            if (tab.isAll) {
              // if it's isAll, put icons on all roots
              for (var r of tab.treeModel.getVisibleRoots()) {
                  tab.iconStatus[r.id] = r.visibleChildren.length ? GraphComponent.None : GraphComponent.Unmapped;
              }
            }

            if (tab.autoFilterParent && !tab.isAll) {
                if (tab.autoFilterParent.anySelected)
                    tab.treeModel.expandAll();
                else
                    tab.treeModel.collapseAll();
            }
            tab.visibleLinks = GraphTab.flatten(tab.visibleNodes.map(v => {
                var links = v.data.node.links;
                return links ? links.map(l => new VisibleLink(v, l)) : [];
            }));
        }
    }

    // Filter this tree by filterSrc tree.
    //  If a node is selected (checked) in the filterSrc, display it in this tree.
    private static filterBySelectedLeafs(visibleNodes: TreeNode[], filterSrc: TreeModel, node: TreeNode, noSelection: boolean): boolean {
        var inSelection = node.data.id in filterSrc.selectedLeafNodeIds;
        node.data.filterColor = inSelection ? "yellow" : undefined;
        var show = noSelection || inSelection;
        if (show)
            visibleNodes.push(node);
        return show;
    }
  
    // Filter this tree by filterSrc link list.
    //  If a node has a link that's in the 
    private static filterByVisibleLinks(visibleNodes: TreeNode[], filterSrc: VisibleLink[], node: TreeNode): boolean {
        var show = GraphFilter.containsNode(filterSrc, node);
        var parent = node.parent;
        while (!show && parent) {
            // didnt find us but see if any parent is linked
            show = GraphFilter.containsNode(filterSrc, parent);
            parent = parent.parent;
        }
        if (show)
            visibleNodes.push(node);
        return show;
    }

  private static filterByMyLinks(myTab: GraphTab, visibleNodes: TreeNode[], parentTree: GraphTab, node: TreeNode): boolean {
      var isRootInAllTab = myTab.isAll && !node.parent.parent;
      var show = isRootInAllTab;

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

    private static containsNode(parentTree: VisibleLink[], node: TreeNode): boolean {
        return parentTree.find(n => {
            return n.link.id == node.data.id;
        }) != null;
    }
}
