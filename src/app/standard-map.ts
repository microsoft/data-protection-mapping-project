
export class Link {
  id: string;
  type: string;
  rev: string;
}

export class Note {
  id: string;
  links: Link[];  
  comment: string;
}

export class DocNode2 {
  id?: string;
  section?: string;
  body?: string;
  hyperlink?: string;
  compliance_level?: number;
  children: DocNode2[];
  links: Link[];
  notes: Note[];
  langs: any;
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
  public connectedTo: any[] = [];

  public constructor(
    public node: Doc2 | DocNode2,
    public children: FullDocNode[] = []) {
  }

  get name(): string {
    var section = this.getSection();
    var name = section ? section : (this.node as Doc2).type;
    var body = this.getBody();
    if (body)
      name += " - " + body;
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
        this.shouldBeMappedCached = this.getBody()  //  needs a body
            && (!this.node.children || this.node.children.length == 0); // no children
    }

    return this.shouldBeMappedCached;
  }

  // pass null for default lang
  public getBody(lang: string = null, includeNotes: boolean = false): string {
    var langs = this.node.langs;
    var l = lang ? langs[lang] : langs['default'];
    var text = l ? (l.body ? (' - ' + l.body) : '') : this.node.body;
    return text;
  }
  
  // pass null for default lang
  public getSection(lang: string = null): string {
    var langs = this.node.langs;
    var l = lang ? langs[lang] : langs['default'];
    return l ? l.section : this.node.section;
  }
  
  // pass null for default lang
  public getConnectionsText(lang: string = null): string {
    return "References ISO sections: " + Object.keys(this.connectedTo).join(", ") + ".";
  }
  
  // pass null for default lang
  public getCommentText(note: Note, lang: string = null): string {
    return note.comment + " [Iso Sections: " + note.links.map(v=>v.id).join(", ") + "]";
  }
}

export class Db {
  public changelog: Change[];
  public docs: Doc2[];
};

export class Change {
  public date: string;
  public author: string;
  public change: string;
};
