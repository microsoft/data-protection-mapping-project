import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of, forkJoin } from 'rxjs';
import * as Rx from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { FullDocNode, DocNode2, Doc2, Link, Change, Db } from './standard-map';
import { MessageService } from './message.service';
import * as d3Sankey from 'd3-sankey';
import { TreeNode, IActionMapping } from 'angular-tree-component';
import { GraphTab } from './GraphTab';
import { GraphFilter } from './GraphFilter';


export interface ICategory {
    id: string;
    title: string;
    active?: boolean;
}

export type CategoryList = ICategory[]; 

export class FilterCriteria {
    constructor(
        public categoryIds: string[] = null,
        public categoryOrder: string[] = null) {
        
        }
}


// -- Dag Node --
export interface SNodeExtra {
    nodeId: number;
    name: string;
    data?: any;
}

export interface SLinkExtra {
    source: number;
    target: number;
    value: number;
    uom: string;
    sourceNode: any;
    targetNode: any;
}

export type SNode = d3Sankey.SankeyNode<SNodeExtra, SLinkExtra>;
export type SLink = d3Sankey.SankeyLink<SNodeExtra, SLinkExtra>;

export interface DAG {
    nodes: SNode[];
    links: SLink[];
}
// -- Dag Node --

export class VisibleLink {
    constructor(
         public fromNode: TreeNode,
         public link: Link) {
         
         }
}

@Injectable({ providedIn: 'root' })
export class GraphService {
  private docGuids = {};
  private docDb: Db = null;
  private nextDocGuid = 0;
  private filterOrder = [];
  private runningFilters = false;
  public updateSubject = new Rx.BehaviorSubject(0);
  public updateViewSubject = new Rx.BehaviorSubject(0);

  constructor(
    private messageService: MessageService,
    private http: HttpClient) {
      this.addTab("ISO");
    }

  public runFilters(changedTab: GraphTab, parentChanged: boolean) 
  {
      if (this.runningFilters)
          return; // prevent re-entry

      this.runningFilters = true;
      var tabs = this.graphTabs;
      var anyChanged = false;

      for (var i of this.filterOrder)
      {
          var t = tabs[i];
          if (!t)
            continue;

          if (anyChanged || t.column.autoFilterSrc == changedTab.column || (parentChanged && t == changedTab))
          {
              anyChanged = true;
              // filter child tree
              GraphFilter.runFilter(t.column);
          }
      }

      //if (anyChanged)
        this.updateSubject.next(0);

      this.runningFilters = false;
  }

  getGuid(id: string, type: string, rev: string, createMissing: boolean = true): number {
      var key = `${type}-${id}-${rev}`;
      if (key in this.docGuids)
        return this.docGuids[key];

      if (!createMissing)
        return null;

      var value = this.nextDocGuid++;
      this.docGuids[key] = value;
      return value;
  }

  getDb() : Observable<Db> {
      if (this.docDb)
          return of(this.docDb);

      return this.http.get<Db>('assets/db.json', {responseType: 'json'})
        .pipe(
          tap(
            data => {
              this.docDb = data;
              this.docDb.changelog = this.docDb.changelog.map(v => {
                v.date = new Date(v.date).toLocaleDateString();
                return v;
              });
            },
            error => this.handleError("getDb", [])
          )
        );
  }

  getDocTypes() : Observable<CategoryList> {
      return this.getDb().pipe(
        map(
          data => {
              return data.docs.map(v => { return { id: v.id, title: v.type }; });
          }
        )
      );
  }

  private addToDoc(parent: FullDocNode, input: DocNode2) {
      var child = new FullDocNode(input);

      if (parent)
      {
        parent.children.push(child);
      }

      // Recurse
      for (var c of input.children)
      {
        this.addToDoc(child, c);
      }

      return child;
  }

  getFullDocByType(id: string) : Observable<FullDocNode> {
      return this.getDb().pipe(
        map(
          data => {
              var doc = data.docs.find(n => n.id == id);
              return this.addToDoc(null, doc);
          }
        )
      );
  }

  getChangeLog(): Observable<Change[]> {
    return this.getDb().pipe(
      map(
        data => {
          return data.changelog;
        }
      )
    );
  }

  // Live state management: maybe move this to a different service.  
  public graphTabs: GraphTab[] = [ ];
  public selectedTab: number = 0;

  public get canAdd(): boolean {
      return this.graphTabs.length < 3;
  }

  public addTab(id: string) {
      if (!this.canAdd)
          return;

      this.getFullDocByType(id)
        .subscribe(doc => {
          var newTab = new GraphTab(this, null, doc);

          newTab.nodes = doc.children;
          newTab.column.nodes = doc.children;

          this.graphTabs.push(newTab);
          this.ensureISOIsInMiddle();
            
          if (id != "ISO") 
          {
              // compare with iso.
              newTab.coverage = this.compareDocs(newTab.column, this.graphTabs[1]);
          }

          var selectTab = newTab;
          if (newTab.isAll) {
            selectTab = this.graphTabs.find(t => t.isIso);
          }

          // Activate tab
          this.selectedTab = -1; // set it to non-value so change is detected if the index is the same
          setTimeout(() => this.activateTab(selectTab), 1); // need to let dom regenerate
        });
  }

  private ensureISOIsInMiddle() {
      var isoTab = this.graphTabs.find(t => t.isIso);

      if (this.graphTabs.length > 1)
      {
          this.graphTabs = this.graphTabs.filter(t => t != isoTab);
          this.graphTabs.splice(1, 0, isoTab);
      }
  }

  public configureFilterStack() {
      switch (this.selectedTab)
      {
        case 0: this.filterOrder = [0, 1, 2]; break;
        case 1: this.filterOrder = [1, 0, 2]; break;
        case 2: this.filterOrder = [2, 1, 0]; break;
      }

      // setup filters
      var isoTab = this.graphTabs.find(t => t.isIso);
      var primary = this.graphTabs[this.filterOrder[0]];

      if (!primary)
        return;
      
      // clear auto filter of left tab
      primary.column.autoFilterSrc = null;
      primary.column.autoFilterParent = null;
      primary.column.autoFilterSelf = false;

      var secondary = this.graphTabs[this.filterOrder[1]];
      if (secondary)
      {
          if (secondary == isoTab)
          {
              // assure iso filters from the primary: "auto filter"
              isoTab.column.autoFilterSrc = primary.column;
              isoTab.column.autoFilterParent = primary.column.parent;
              isoTab.column.autoFilterSelf = false;
          }
          else
          {
              // auto filter with this tabs connections to iso
              secondary.column.autoFilterSrc = isoTab.column;
              secondary.column.autoFilterParent = primary.column.parent; // the primary tab always drives the selection
              secondary.column.autoFilterSelf = true;
          }
      }

      var third = this.graphTabs[this.filterOrder[2]];
      if (third)
      {
          // auto filter with this tabs connections to iso
          third.column.autoFilterSrc = isoTab.column;
          third.column.autoFilterParent = primary.column.parent; // the primary tab always drives the selection
          third.column.autoFilterSelf = true;
      }
  }

  public removeTab(tab) {
      this.graphTabs = this.graphTabs.filter(t => t!=tab);
      this.ensureISOIsInMiddle();
      this.activateTab(this.graphTabs[0]);
  }

  public activateTab(tab: GraphTab): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

      var newIndex = this.graphTabs.indexOf(tab);
      if (newIndex != this.selectedTab)
      {
        this.selectedTab = newIndex;
        this.configureFilterStack();
        setTimeout(() => {
          resolve(true);
        }, 1000);
      }
      else
      {
        this.selectedTab = -1;
        setTimeout(() => {
          this.selectedTab = newIndex;
          this.configureFilterStack();
          setTimeout(() => {
            resolve(true);
          }, 1000);
        }, 10);
      }
    });
  }

  public getNodesWithLinks(children: FullDocNode[], result: FullDocNode[])
  {
      for (var c of children)
      {
          if (c.node.links && c.node.links.length > 0)
            result.push(c);
          this.getNodesWithLinks(c.children, result);
      }

      return result;
  }

  public flattenSections(children: FullDocNode[], result: string[])
  {
      for (var c of children)
      {
          if (c.getBody())
            result.push(c.id);
          this.flattenSections(c.children, result);
      }

      return result;
  }

  public flattenLinks(children: FullDocNode[], result: Link[], linkData: any)
  {
      for (var c of children)
      {
          if (c.shouldBeMapped)
          {
            linkData.total++;
            if (!c.isUnmapped)
            {
              linkData.linked++;
              result = result.concat(c.node.links);
            }
          }
          result = this.flattenLinks(c.children, result, linkData);
      }

      return result;
  }

  public compareDocs(aTab: GraphTab, bTab: GraphTab): any {
    var bSections = [];
    this.flattenSections(bTab.nodes, bSections);
    var bCopy = bSections.slice();
    
    var linkData = { total: 0, linked: 0 };
    var aLinks = this.flattenLinks(aTab.nodes, [], linkData);

    var found = 0;
    var checked = 0;
    for (var a of aLinks)
    {
      ++checked;
      var b = bCopy.find(x => x == a.id)
      if (b)
      {
          bCopy = bCopy.filter(x => x != b);
          ++found;
      }
    }

    return {
        coverage: found + "/" + bSections.length,
        mapped: linkData.linked + "/" + linkData.total,
        uniqueconnections: found + "/" + checked,
        uncoveredIds: bCopy

        //"coverage": (found / bSections.length * 100).toFixed(1) + "% (" + found + "/" + bSections.length + ")",
        //"mapped": (linkData.linked / linkData.total * 100).toFixed(1) + "% (" + linkData.linked + "/" + linkData.total + ")",
        //"uniqueconnections": (found / checked * 100).toFixed(1) + "% (" + found + "/" + checked + ")"
    };
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a GraphService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`GraphService: ${message}`);
  }
}
