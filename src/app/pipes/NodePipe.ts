import { Pipe, PipeTransform } from '@angular/core';
import { FullDocNode, Note } from '../standard-map';
import { ViewSettings } from '../ViewSettings';
import { GraphTab } from '../GraphTab';
import { TreeNode } from 'angular-tree-component';
import { GraphFilter } from '../GraphFilter';

 import convert from 'color-convert';


function saturateColor(input, saturationZeroToOne){
    if (input == "unset")
        return input;

    var out = (input[0] == '#' ? input : ('#' + convert.keyword.hex(input))) + saturationZeroToOne ;
    return out;
}


function getNodeStatus(tab: GraphTab, node: TreeNode)
{
    // if we're a tree in the right side view, highlight active nodes
    var status = GraphFilter.None;

    if (tab.parent && node.data.filterColor)
    {
        if (!tab.isIso && node.data.isUnmapped)
        {
            status = GraphFilter.Unmapped;
        }
        else
        {
            status = GraphFilter.Filtered;
        }
    }
    else if (!tab.isIso)
    {
        // Iso never has outward mappings
        if (node.data.isUnmapped)
        {
            status = GraphFilter.Unmapped;
        }
        else if (node.data.isAnyChildUnmapped)
        {
            status = GraphFilter.ChildrenUnmapped;
        }
    }
        
    return status;
}

function getNodeColor(tab: GraphTab, node: TreeNode)
{
    // all tab doesnt get coloring
    if (tab.isAll)
      return "unset";

    var color = GraphFilter.visualTraits[getNodeStatus(tab, node)].color;
                  
    // if we're a tree in the right side view
    if (tab.parent)
    {
        if (!node.isActive)
        {
          // desaturate background color unless active node
          color = saturateColor(color, 'A0');
        }
    }
        
    return color;
}

function getNodeIcon(tab: GraphTab, node: TreeNode)
{
    var status = (tab.isAll ? tab.iconStatus[node.id] : getNodeStatus(tab, node)) || GraphFilter.None;
    var icon = GraphFilter.visualTraits[status].icon;
    return icon;
}

function getNodeIconAlt(tab: GraphTab, node: TreeNode)
{
    var alt = GraphFilter.visualTraits[getNodeStatus(tab, node)].alt;
    return alt;
}

@Pipe({ name: 'getNodeColor' })
export class getNodeColorPipe implements PipeTransform {
    constructor() {
    }

    transform(node: TreeNode, tab: GraphTab): string {
        return getNodeColor(tab, node);
    }
}

@Pipe({ name: 'getNodeIcon' })
export class getNodeIconPipe implements PipeTransform {
    constructor() {
    }

    transform(node: TreeNode, tab: GraphTab): string {
        return getNodeIcon(tab, node);
    }
}

@Pipe({ name: 'getNodeIconAlt' })
export class getNodeIconAltPipe implements PipeTransform {
    constructor() {
    }

    transform(node: TreeNode, tab: GraphTab): string {
        return getNodeIconAlt(tab, node);
    }
}
