import { Service } from '@angular/core';
import { BROWSE_COLUMNS, BROWSE_FILTERS, EMPTY_BROWSE_RESPONSE } from '../data/browse-data';
import {
  BrowseColumn,
  BrowseFilter,
  BrowseNode,
  BrowseQuery,
  BrowseResponse,
  BrowseSection,
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

  async loadFilters(abortSignal: AbortSignal): Promise<readonly BrowseFilter[]> {
    await this.simulateLatency(abortSignal, 120);
    return BROWSE_FILTERS;
  }

  private filterColumn(column: BrowseColumn, query: BrowseQuery): BrowseColumn | null {
    const sections = column.sections
      .map((section) => this.filterNode(section, query, false))
      .filter((section): section is BrowseSection => section !== null);

    return sections.length > 0 ? { ...column, sections } : null;
  }

  private filterNode(
    node: BrowseNode,
    query: BrowseQuery,
    inheritedAreaMatch: boolean,
  ): BrowseNode | null {
    const areaMatch =
      inheritedAreaMatch ||
      query.areaIds.length === 0 ||
      this.hasOverlap(node.areaIds, query.areaIds);

    const links = (node.links ?? []).filter(
      (link) => query.territoryIds.length === 0 || query.territoryIds.includes(link.territoryId),
    );

    const children = (node.children ?? [])
      .map((child) => this.filterNode(child, query, areaMatch))
      .filter((child): child is BrowseNode => child !== null);

    const territoryMatch =
      query.territoryIds.length === 0 ||
      this.hasOverlap(node.territoryIds, query.territoryIds) ||
      links.length > 0 ||
      children.length > 0;

    const isLeaf = !node.links?.length && !node.children?.length;
    if ((!areaMatch && children.length === 0) || !territoryMatch) {
      return null;
    }

    if (!isLeaf && links.length === 0 && children.length === 0) {
      return null;
    }

    return {
      ...node,
      links,
      children,
    };
  }

  private hasOverlap(source: readonly string[] | undefined, selected: readonly string[]): boolean {
    return !!source?.some((id) => selected.includes(id));
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
