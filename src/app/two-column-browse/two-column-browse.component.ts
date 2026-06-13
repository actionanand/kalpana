import { Component, computed, inject, resource, signal, viewChild } from '@angular/core';
import { BrowseDateDialogComponent } from '../browse-date-dialog/browse-date-dialog.component';
import {
  BrowseFilterDialogComponent,
  FilterApplyEvent,
} from '../browse-filter-dialog/browse-filter-dialog.component';
import { BrowseMoreFiltersDialogComponent } from '../browse-more-filters-dialog/browse-more-filters-dialog.component';
import { BrowsePanelComponent } from '../browse-panel/browse-panel.component';
import { BrowseToolbarComponent, FilterSummary } from '../browse-toolbar/browse-toolbar.component';
import { EMPTY_BROWSE_RESPONSE } from '../data/browse-data';
import {
  BrowseDateEntry,
  BrowseDateSelection,
  BrowseFilter,
  BrowseSelectionKey,
  SelectedFilterMap,
} from '../data/browse.models';
import { BrowseDataService } from '../services/browse-data.service';

@Component({
  selector: 'app-two-column-browse',
  imports: [
    BrowseDateDialogComponent,
    BrowseFilterDialogComponent,
    BrowseMoreFiltersDialogComponent,
    BrowsePanelComponent,
    BrowseToolbarComponent,
  ],
  templateUrl: './two-column-browse.component.html',
  styleUrl: './two-column-browse.component.scss',
})
export class TwoColumnBrowseComponent {
  private readonly browseDataService = inject(BrowseDataService);
  private readonly browsePanel = viewChild(BrowsePanelComponent);

  protected readonly selectedFilters = signal<SelectedFilterMap>({});
  protected readonly selectedDates = signal<readonly BrowseDateSelection[]>([]);
  protected readonly activeFilter = signal<BrowseFilter | null>(null);
  protected readonly activeDateEntries = signal<readonly BrowseDateEntry[] | null>(null);
  protected readonly activeMoreFilters = signal<readonly BrowseFilter[] | null>(null);
  protected readonly loadingKey = signal<BrowseSelectionKey | 'date' | 'more' | null>(null);

  protected readonly browseResource = resource({
    params: () => ({
      selectedFilters: this.selectedFilters(),
      dateFilters: this.selectedDates(),
    }),
    loader: ({ params, abortSignal }) => this.browseDataService.loadBrowseData(params, abortSignal),
    defaultValue: EMPTY_BROWSE_RESPONSE,
  });

  protected readonly filtersResource = resource({
    loader: ({ abortSignal }) => this.browseDataService.loadToolbarFilters(abortSignal),
    defaultValue: [] as readonly BrowseFilter[],
  });

  protected readonly filterSummaries = computed<readonly FilterSummary[]>(() => [
    ...this.filtersResource.value().map((filter) => {
      const selectedIds = this.selectedFilters()[filter.key] ?? [];
      return {
        key: filter.key,
        count: selectedIds.length,
        label: this.selectedLabel(filter, selectedIds),
      };
    }),
    {
      key: 'date' as const,
      count: this.selectedDates().length,
      label: 'Date',
    },
    {
      key: 'more' as const,
      count: this.moreFilterCount(),
      label: 'More',
    },
  ]);

  protected async openFilter(filter: BrowseFilter): Promise<void> {
    const abortController = new AbortController();
    this.loadingKey.set(filter.key);
    const loadedFilter = await this.browseDataService.loadFilter(
      filter.key,
      abortController.signal,
    );
    this.activeFilter.set(loadedFilter ?? filter);
    this.loadingKey.set(null);
  }

  protected async openDateFilter(): Promise<void> {
    const abortController = new AbortController();
    this.loadingKey.set('date');
    this.activeDateEntries.set(
      await this.browseDataService.loadDateEntries(abortController.signal),
    );
    this.loadingKey.set(null);
  }

  protected async openMoreFilters(): Promise<void> {
    const abortController = new AbortController();
    this.loadingKey.set('more');
    this.activeMoreFilters.set(
      await this.browseDataService.loadMoreFilters(abortController.signal),
    );
    this.loadingKey.set(null);
  }

  protected closeFilter(): void {
    this.activeFilter.set(null);
  }

  protected closeDateFilter(): void {
    this.activeDateEntries.set(null);
  }

  protected closeMoreFilters(): void {
    this.activeMoreFilters.set(null);
  }

  protected applyFilter(event: FilterApplyEvent): void {
    this.selectedFilters.update((filters) => ({
      ...filters,
      [event.key]: event.selectedIds,
    }));
    this.closeFilter();
  }

  protected applyDateFilter(dates: readonly BrowseDateSelection[]): void {
    this.selectedDates.set(dates);
    this.closeDateFilter();
  }

  protected applyMoreFilters(filters: SelectedFilterMap): void {
    this.selectedFilters.set(filters);
    this.closeMoreFilters();
  }

  protected selectedIdsFor(filter: BrowseFilter): readonly string[] {
    return this.selectedFilters()[filter.key] ?? [];
  }

  protected expandAll(): void {
    this.browsePanel()?.expandAll();
  }

  protected collapseAll(): void {
    this.browsePanel()?.collapseAll();
  }

  private selectedLabel(filter: BrowseFilter, selectedIds: readonly string[]): string {
    if (selectedIds.length === 0) {
      return filter.label;
    }

    if (selectedIds.length === 1) {
      return filter.options.find((option) => option.id === selectedIds[0])?.label ?? filter.label;
    }

    return `${selectedIds.length} selected`;
  }

  private moreFilterCount(): number {
    const toolbarKeys = new Set(this.filtersResource.value().map((filter) => filter.key));
    return Object.entries(this.selectedFilters())
      .filter(([key]) => !toolbarKeys.has(key as BrowseSelectionKey))
      .reduce((total, [, selectedIds]) => total + (selectedIds?.length ?? 0), 0);
  }
}
