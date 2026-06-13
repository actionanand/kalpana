export type BrowseFilterKey = 'territory' | 'documentType' | 'topic' | 'knowledgeArea';
export type MoreFilterKey =
  | 'format'
  | 'audience'
  | 'sourceType'
  | 'status'
  | 'language'
  | 'ownerTeam';
export type BrowseSelectionKey = BrowseFilterKey | MoreFilterKey;
export type BrowseDateKey = 'publishedOn' | 'updatedOn' | 'reviewedOn' | 'effectiveOn';
export type DateOperator = 'after' | 'before' | 'between';
export type SelectedFilterMap = Partial<Record<BrowseSelectionKey, readonly string[]>>;

export interface BrowseMode {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly subtitle: string;
}

export interface BrowseLink {
  readonly label: string;
  readonly href: string;
  readonly territoryId: string;
  readonly filterIds: SelectedFilterMap;
  readonly date: string;
}

export interface BrowseNode {
  readonly id: string;
  readonly title: string;
  readonly href?: string;
  readonly abstract?: string;
  readonly expanded?: boolean;
  readonly filterIds?: SelectedFilterMap;
  readonly date?: string;
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
  readonly modeId: string;
  readonly selectedFilters: SelectedFilterMap;
  readonly dateFilters: readonly BrowseDateSelection[];
}

export interface BrowseFilterOption {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly region?: string;
}

export interface BrowseFilter {
  readonly key: BrowseSelectionKey;
  readonly label: string;
  readonly searchable: boolean;
  readonly grouped: boolean;
  readonly options: readonly BrowseFilterOption[];
}

export interface BrowseFilterDefinition extends BrowseFilter {
  readonly placement: 'toolbar' | 'more';
}

export interface BrowseDateEntry {
  readonly key: BrowseDateKey;
  readonly label: string;
  readonly defaultOperator: DateOperator;
}

export interface BrowseDateSelection {
  readonly key: BrowseDateKey;
  readonly operator: DateOperator;
  readonly date: string;
  readonly dateTo?: string;
}

export interface FilterGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly BrowseFilterOption[];
}
