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

    if (tab.isAll && !tab.column) {
      // We're on the right side all tab, We want dynamic connection coloring.
      //  Show red if there are no visible connections. This is different than how we
      //  normally show red if there are missing ISO connections.
      var any = tab.displayLinks.filter(v => v.fromNode.id.startsWith(node.id)).length;
      return any ? GraphFilter.None : GraphFilter.NoConnections;
    }

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
    var status = getNodeStatus(tab, node) || GraphFilter.None;
    var icon = GraphFilter.visualTraits[status].icon;
    return icon;
}

function getNodeIconAlt(tab: GraphTab, node: TreeNode)
{
    var alt = GraphFilter.visualTraits[getNodeStatus(tab, node)].alt;
    return alt;
}

/*
 * These pipes are "pure". They're only calculated once and the value is cached.
 * The value is recalculated when the first parameter changes.
 * We use the 'displayLinks' as the cache key so that when the display links change
 * (in response to a filter or expansion operation), then we recalculate these pipes.
 *
 * The displayLinks cache key is unused in the actual computation of the pipe.
 */
@Pipe({ name: 'getNodeColor' })
export class getNodeColorPipe implements PipeTransform {
    constructor() {
    }

    transform(displayLinks: any, tab: GraphTab, node: TreeNode): string {
        return getNodeColor(tab, node);
    }
}

/*
 * Same comment as above.
 */
@Pipe({ name: 'getNodeIcon' })
export class getNodeIconPipe implements PipeTransform {
    constructor() {
    }
  
    transform(displayLinks: any, tab: GraphTab, node: TreeNode): string {
        return getNodeIcon(tab, node);
    }
}

/*
 * Same comment as above.
 */
@Pipe({ name: 'getNodeIconAlt' })
export class getNodeIconAltPipe implements PipeTransform {
    constructor() {
    }

    transform(node: TreeNode, tab: GraphTab): string {
        return getNodeIconAlt(tab, node);
    }
}

@Pipe({ name: 'getBody' })
export class getBodyPipe implements PipeTransform {
    constructor() {
    }

    transform(node: TreeNode, viewSettings: ViewSettings): string {
        return (node.data as FullDocNode).getBody(viewSettings.selectedLang);
    }
}

@Pipe({ name: 'getSection' })
export class getSectionPipe implements PipeTransform {
    constructor() {
    }

    transform(node: TreeNode, viewSettings: ViewSettings): string {
        return (node.data as FullDocNode).getSection(viewSettings.selectedLang);
    }
}

@Pipe({ name: 'getConnectionsText' })
export class getConnectionsTextPipe implements PipeTransform {
    constructor() {
    }

    transform(node: TreeNode, viewSettings: ViewSettings): string {
        return (node.data as FullDocNode).getConnectionsText(viewSettings.selectedLang);
    }
}
