export type BrowseFilterKey = 'territory' | 'knowledgeArea';

export interface BrowseLink {
  readonly label: string;
  readonly href: string;
  readonly territoryId: string;
}

export interface BrowseNode {
  readonly id: string;
  readonly title: string;
  readonly expanded?: boolean;
  readonly territoryIds?: readonly string[];
  readonly areaIds?: readonly string[];
  readonly links?: readonly BrowseLink[];
  readonly children?: readonly BrowseNode[];
}

export type BrowseSection = BrowseNode;

export interface BrowseColumn {
  readonly id: string;
  readonly title: string;
  readonly sections: readonly BrowseSection[];
}

export interface BrowseResponse {
  readonly title: string;
  readonly columns: readonly BrowseColumn[];
}

export interface BrowseQuery {
  readonly territoryIds: readonly string[];
  readonly areaIds: readonly string[];
}

export interface BrowseFilterOption {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly region?: string;
}

export interface BrowseFilter {
  readonly key: BrowseFilterKey;
  readonly label: string;
  readonly searchable: boolean;
  readonly grouped: boolean;
  readonly options: readonly BrowseFilterOption[];
}

export interface FilterGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly BrowseFilterOption[];
}
