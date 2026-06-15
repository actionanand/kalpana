import { Component, computed, inject, input, linkedSignal, signal, output } from '@angular/core';
import { BrowseFilter, BrowseSelectionKey, SelectedFilterMap } from '../../../models/browse.models';
import { BrowseFilterService, FilterSortMode } from '../../../services/browse-filter.service';

@Component({
  selector: 'app-browse-more-filters-dialog',
  templateUrl: './browse-more-filters-dialog.component.html',
  styleUrl: './browse-more-filters-dialog.component.scss',
})
export class BrowseMoreFiltersDialogComponent {
  readonly filters = input.required<readonly BrowseFilter[]>();
  readonly selectedFilters = input<SelectedFilterMap>({});

  readonly applied = output<SelectedFilterMap>();
  readonly closed = output<void>();

  private readonly filterService = inject(BrowseFilterService);

  protected readonly activeKey = linkedSignal<readonly BrowseFilter[], BrowseSelectionKey | null>({
    source: this.filters,
    computation: (filters) => filters[0]?.key ?? null,
  });
  protected readonly draftFilters = linkedSignal<SelectedFilterMap, SelectedFilterMap>({
    source: this.selectedFilters,
    computation: (filters) => ({ ...filters }),
  });
  protected readonly searchByKey = signal<Partial<Record<BrowseSelectionKey, string>>>({});
  protected readonly sortByKey = signal<Partial<Record<BrowseSelectionKey, FilterSortMode>>>({});
  protected readonly sortMenuOpen = signal(false);

  protected readonly activeFilter = computed(
    () => this.filters().find((filter) => filter.key === this.activeKey()) ?? this.filters()[0],
  );

  protected readonly groups = computed(() => {
    const filter = this.activeFilter();
    if (!filter) {
      return [];
    }

    return this.filterService.buildGroups({
      filter,
      searchQuery: this.searchByKey()[filter.key] ?? '',
      sortMode: this.currentSortMode(),
    });
  });

  protected readonly selectedCount = computed(() =>
    Object.values(this.draftFilters()).reduce(
      (total, selectedIds) => total + (selectedIds?.length ?? 0),
      0,
    ),
  );

  protected readonly summary = computed(() => {
    const count = this.selectedCount();
    if (count === 0) {
      return 'None selected';
    }

    return count === 1 ? '1 selected' : `${count} selected`;
  });

  protected selectCategory(filter: BrowseFilter): void {
    this.activeKey.set(filter.key);
    this.sortMenuOpen.set(false);
  }

  protected activeCount(filter: BrowseFilter): number {
    return this.draftFilters()[filter.key]?.length ?? 0;
  }

  protected currentSearch(): string {
    const filter = this.activeFilter();
    return filter ? (this.searchByKey()[filter.key] ?? '') : '';
  }

  protected updateSearch(event: Event): void {
    const filter = this.activeFilter();
    const input = event.target as HTMLInputElement | null;
    if (!filter) {
      return;
    }

    this.searchByKey.update((search) => ({
      ...search,
      [filter.key]: input?.value ?? '',
    }));
  }

  protected currentSortMode(): FilterSortMode {
    const filter = this.activeFilter();
    return filter ? (this.sortByKey()[filter.key] ?? 'frequency') : 'frequency';
  }

  protected sortLabel(): string {
    return this.currentSortMode() === 'alpha' ? 'Sort alphabetically' : 'Sort by frequency';
  }

  protected toggleSortMenu(): void {
    this.sortMenuOpen.update((open) => !open);
  }

  protected setSortMode(mode: FilterSortMode): void {
    const filter = this.activeFilter();
    if (!filter) {
      return;
    }

    this.sortByKey.update((sort) => ({
      ...sort,
      [filter.key]: mode,
    }));
    this.sortMenuOpen.set(false);
  }

  protected isSelected(optionId: string): boolean {
    const filter = this.activeFilter();
    return !!filter && (this.draftFilters()[filter.key] ?? []).includes(optionId);
  }

  protected toggleOption(optionId: string): void {
    const filter = this.activeFilter();
    if (!filter) {
      return;
    }

    this.draftFilters.update((filters) => ({
      ...filters,
      [filter.key]: this.filterService.toggleSelection(filters[filter.key] ?? [], optionId),
    }));
  }

  protected allVisibleSelected(): boolean {
    const optionIds = this.visibleOptionIds();
    const filter = this.activeFilter();
    return (
      !!filter &&
      optionIds.length > 0 &&
      optionIds.every((id) => (this.draftFilters()[filter.key] ?? []).includes(id))
    );
  }

  protected visibleIndeterminate(): boolean {
    const optionIds = this.visibleOptionIds();
    const filter = this.activeFilter();
    const selectedIds = filter ? (this.draftFilters()[filter.key] ?? []) : [];
    const selectedCount = optionIds.filter((id) => selectedIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < optionIds.length;
  }

  protected toggleSelectAll(): void {
    const filter = this.activeFilter();
    if (!filter) {
      return;
    }

    const visibleIds = this.visibleOptionIds();
    const shouldSelect = !this.allVisibleSelected();
    this.draftFilters.update((filters) => ({
      ...filters,
      [filter.key]: shouldSelect
        ? [...new Set([...(filters[filter.key] ?? []), ...visibleIds])]
        : (filters[filter.key] ?? []).filter((id) => !visibleIds.includes(id)),
    }));
  }

  protected apply(): void {
    this.applied.emit(this.draftFilters());
  }

  private visibleOptionIds(): readonly string[] {
    return this.groups().flatMap((group) => group.options.map((option) => option.id));
  }
}
