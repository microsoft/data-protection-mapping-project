
export class Link {
  id: string;
  type: string;
  rev: string;
}

export class DocNode2 {
  id?: string;
  section?: string;
  body?: string;
  hyperlink?: string;
  compliance_level?: number;
  children: DocNode2[];
  links: Link[];
}


export class Doc2 extends DocNode2 {
  type: string;
  rev?: string;
}

export class FullDocNode {
  public highlight: number[];
  public highlightName: boolean;
  public bodyFuse: any;
  public sectionFuse: any;
  public isUnmappedCached: boolean;
  public isAnyChildUnmappedCached: boolean;
  public shouldBeMappedCached: boolean;
  public filterColor: string;

  public constructor(
    public node: Doc2 | DocNode2,
    public children: FullDocNode[] = []) {
  }

  get name():string {
    var name = this.node.section ? this.node.section : (this.node as Doc2).type;
    if (this.node.body)
      name += " - " + this.node.body;
    return name;
  }

  get id(): string {
    return this.node.id;
  }

  get isAnyChildUnmapped(): boolean {
    if (this.isAnyChildUnmappedCached === undefined)
    {
        this.isAnyChildUnmappedCached = false;
        for (var c of this.children)
        {
            if (c.isUnmapped || c.isAnyChildUnmapped)
            {
                this.isAnyChildUnmappedCached = true;
                break;
            }
        }
    }

    return this.isAnyChildUnmappedCached;
  }

  get isUnmapped(): boolean {
    if (this.isUnmappedCached === undefined)
    {
        // to be qualified as unmapped        
        this.isUnmappedCached = this.shouldBeMapped
            && (!this.node.links || this.node.links.length == 0); // no links
    }

    return this.isUnmappedCached;
  }

  get shouldBeMapped(): boolean {
    if (this.shouldBeMappedCached === undefined)
    {
        // to be qualified as unmapped        
        this.shouldBeMappedCached = this.node.body  //  needs a body
            && (!this.node.children || this.node.children.length == 0); // no children
    }

    return this.shouldBeMappedCached;
  }
}