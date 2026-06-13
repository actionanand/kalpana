import { Service } from '@angular/core';
import { BrowseFilter, BrowseFilterOption, FilterGroup } from '../data/browse.models';

export type FilterSortMode = 'region' | 'alpha' | 'frequency';

export interface FilterGroupQuery {
  readonly filter: BrowseFilter;
  readonly searchQuery: string;
  readonly sortMode: FilterSortMode;
}

@Service()
export class BrowseFilterService {
  buildGroups(query: FilterGroupQuery): readonly FilterGroup[] {
    const options = this.filterOptions(query.filter.options, query.searchQuery);
    const sortedOptions = this.sortOptions(options, query.sortMode);

    if (!query.filter.grouped || query.sortMode !== 'region') {
      return [
        {
          id: 'all',
          label: query.filter.label,
          options: sortedOptions,
        },
      ];
    }

    const regions = new Map<string, BrowseFilterOption[]>();
    sortedOptions.forEach((option) => {
      const region = option.region ?? 'Other';
      regions.set(region, [...(regions.get(region) ?? []), option]);
    });

    return [...regions.entries()].map(([region, regionOptions]) => ({
      id: region.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
      label: region,
      options: regionOptions,
    }));
  }

  selectionSummary(filter: BrowseFilter, selectedIds: readonly string[]): string {
    if (selectedIds.length === 0) {
      return 'None selected';
    }

    if (selectedIds.length === 1) {
      return filter.options.find((option) => option.id === selectedIds[0])?.label ?? '1 selected';
    }

    return `${selectedIds.length} selected`;
  }

  toggleSelection(selectedIds: readonly string[], optionId: string): readonly string[] {
    return selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];
  }

  toggleGroupSelection(
    selectedIds: readonly string[],
    group: FilterGroup,
    selected: boolean,
  ): readonly string[] {
    const groupIds = new Set(group.options.map((option) => option.id));
    if (!selected) {
      return selectedIds.filter((id) => !groupIds.has(id));
    }

    return [...new Set([...selectedIds, ...groupIds])];
  }

  isGroupSelected(group: FilterGroup, selectedIds: readonly string[]): boolean {
    return (
      group.options.length > 0 && group.options.every((option) => selectedIds.includes(option.id))
    );
  }

  isGroupIndeterminate(group: FilterGroup, selectedIds: readonly string[]): boolean {
    const selectedCount = group.options.filter((option) => selectedIds.includes(option.id)).length;
    return selectedCount > 0 && selectedCount < group.options.length;
  }

  private filterOptions(
    options: readonly BrowseFilterOption[],
    searchQuery: string,
  ): readonly BrowseFilterOption[] {
    const query = searchQuery.trim().toLowerCase();
    return query
      ? options.filter((option) => option.label.toLowerCase().includes(query))
      : [...options];
  }

  private sortOptions(
    options: readonly BrowseFilterOption[],
    sortMode: FilterSortMode,
  ): readonly BrowseFilterOption[] {
    if (sortMode === 'frequency') {
      return [...options].sort((first, second) => second.count - first.count);
    }

    return [...options].sort((first, second) => first.label.localeCompare(second.label));
  }
}
