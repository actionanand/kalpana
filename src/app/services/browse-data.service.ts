import { Service } from '@angular/core';
import {
  BROWSE_COLUMNS,
  BROWSE_DATE_ENTRIES,
  BROWSE_FILTERS,
  BROWSE_MODES,
  EMPTY_BROWSE_RESPONSE,
} from '../data/browse-data';
import {
  BrowseColumn,
  BrowseDateEntry,
  BrowseDateSelection,
  BrowseFilter,
  BrowseFilterDefinition,
  BrowseLink,
  BrowseMode,
  BrowseNode,
  BrowseQuery,
  BrowseResponse,
  BrowseSection,
  BrowseSelectionKey,
  SelectedFilterMap,
} from '../data/browse.models';

@Service()
export class BrowseDataService {
  async loadBrowseData(query: BrowseQuery, abortSignal: AbortSignal): Promise<BrowseResponse> {
    await this.simulateLatency(abortSignal);

    const columns = BROWSE_COLUMNS.map((column) => this.filterColumn(column, query)).filter(
      (column): column is BrowseColumn => column !== null,
    );

    return {
      ...EMPTY_BROWSE_RESPONSE,
      columns,
    };
  }

  async loadBrowseModes(abortSignal: AbortSignal): Promise<readonly BrowseMode[]> {
    await this.simulateLatency(abortSignal, 100);
    return BROWSE_MODES;
  }

  async loadToolbarFilters(abortSignal: AbortSignal): Promise<readonly BrowseFilter[]> {
    await this.simulateLatency(abortSignal, 120);
    return BROWSE_FILTERS.filter((filter) => filter.placement === 'toolbar');
  }

  async loadMoreFilters(abortSignal: AbortSignal): Promise<readonly BrowseFilter[]> {
    await this.simulateLatency(abortSignal, 180);
    return BROWSE_FILTERS.filter((filter) => filter.placement === 'more');
  }

  async loadDateEntries(abortSignal: AbortSignal): Promise<readonly BrowseDateEntry[]> {
    await this.simulateLatency(abortSignal, 120);
    return BROWSE_DATE_ENTRIES;
  }

  async loadFilter(
    key: BrowseSelectionKey,
    abortSignal: AbortSignal,
  ): Promise<BrowseFilterDefinition | undefined> {
    await this.simulateLatency(abortSignal, 420);
    return BROWSE_FILTERS.find((filter) => filter.key === key);
  }

  private filterColumn(column: BrowseColumn, query: BrowseQuery): BrowseColumn | null {
    const sections = column.sections
      .map((section) => this.filterNode(section, query, {}))
      .filter((section): section is BrowseSection => section !== null);

    return sections.length > 0 ? { ...column, sections } : null;
  }

  private filterNode(
    node: BrowseNode,
    query: BrowseQuery,
    inheritedFilters: SelectedFilterMap,
  ): BrowseNode | null {
    const nodeFilters = this.mergeFilters(inheritedFilters, node.filterIds);
    const links = (node.links ?? []).filter((link) => this.matchesLink(link, query, nodeFilters));
    const children = (node.children ?? [])
      .map((child) => this.filterNode(child, query, nodeFilters))
      .filter((child): child is BrowseNode => child !== null);
    const abstractMatches =
      !!node.abstract &&
      this.matchesMode(nodeFilters, query.modeId) &&
      this.matchesSelectedFilters(nodeFilters, query.selectedFilters) &&
      this.matchesDateFilters(node.date ?? '2026-01-01', query.dateFilters);

    if (links.length === 0 && children.length === 0 && !abstractMatches) {
      return null;
    }

    return {
      ...node,
      links,
      children,
    };
  }

  private matchesLink(
    link: BrowseLink,
    query: BrowseQuery,
    inheritedFilters: SelectedFilterMap,
  ): boolean {
    const linkFilters = this.mergeFilters(inheritedFilters, {
      ...link.filterIds,
      territory: [link.territoryId],
    });

    return (
      this.matchesMode(linkFilters, query.modeId) &&
      this.matchesSelectedFilters(linkFilters, query.selectedFilters) &&
      this.matchesDateFilters(link.date, query.dateFilters)
    );
  }

  private matchesMode(candidateFilters: SelectedFilterMap, modeId: string): boolean {
    const documentTypes = candidateFilters.documentType ?? [];

    if (modeId === 'place-summaries') {
      return documentTypes.some((type) => ['brief', 'case-study', 'guide'].includes(type));
    }

    if (modeId === 'benchmark-matrices') {
      return documentTypes.some((type) =>
        ['atlas', 'dashboard', 'directory', 'scorecard', 'tracker'].includes(type),
      );
    }

    return true;
  }

  private matchesSelectedFilters(
    candidateFilters: SelectedFilterMap,
    selectedFilters: SelectedFilterMap,
  ): boolean {
    return Object.entries(selectedFilters).every(([key, selectedIds]) => {
      if (!selectedIds || selectedIds.length === 0) {
        return true;
      }

      const candidateIds = candidateFilters[key as BrowseSelectionKey] ?? [];
      return selectedIds.some((id) => candidateIds.includes(id));
    });
  }

  private matchesDateFilters(
    dateValue: string,
    dateFilters: readonly BrowseDateSelection[],
  ): boolean {
    if (dateFilters.length === 0) {
      return true;
    }

    const candidateTime = new Date(dateValue).getTime();
    return dateFilters.every((filter) => {
      const fromTime = new Date(filter.date).getTime();
      const toTime = filter.dateTo ? new Date(filter.dateTo).getTime() : fromTime;

      if (filter.operator === 'before') {
        return candidateTime <= fromTime;
      }

      if (filter.operator === 'between') {
        return candidateTime >= fromTime && candidateTime <= toTime;
      }

      return candidateTime >= fromTime;
    });
  }

  private mergeFilters(
    first: SelectedFilterMap,
    second: SelectedFilterMap | undefined,
  ): SelectedFilterMap {
    const merged: Record<string, readonly string[]> = { ...first };

    Object.entries(second ?? {}).forEach(([key, values]) => {
      merged[key] = [...new Set([...(merged[key] ?? []), ...(values ?? [])])];
    });

    return merged as SelectedFilterMap;
  }

  private simulateLatency(abortSignal: AbortSignal, delay = 220): Promise<void> {
    if (abortSignal.aborted) {
      return Promise.reject(new DOMException('Request aborted', 'AbortError'));
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, delay);
      abortSignal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          reject(new DOMException('Request aborted', 'AbortError'));
        },
        { once: true },
      );
    });
  }
}
