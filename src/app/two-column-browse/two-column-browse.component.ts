import { Component, computed, inject, resource, signal, viewChild } from '@angular/core';
import {
  BrowseFilterDialogComponent,
  FilterApplyEvent,
} from '../browse-filter-dialog/browse-filter-dialog.component';
import { BrowsePanelComponent } from '../browse-panel/browse-panel.component';
import { BrowseToolbarComponent, FilterSummary } from '../browse-toolbar/browse-toolbar.component';
import { EMPTY_BROWSE_RESPONSE } from '../data/browse-data';
import { BrowseFilter, BrowseFilterKey } from '../data/browse.models';
import { BrowseDataService } from '../services/browse-data.service';

type SelectedFilters = Record<BrowseFilterKey, readonly string[]>;

const EMPTY_SELECTION: SelectedFilters = {
  territory: [],
  knowledgeArea: [],
};

@Component({
  selector: 'app-two-column-browse',
  imports: [BrowseFilterDialogComponent, BrowsePanelComponent, BrowseToolbarComponent],
  templateUrl: './two-column-browse.component.html',
  styleUrl: './two-column-browse.component.scss',
})
export class TwoColumnBrowseComponent {
  private readonly browseDataService = inject(BrowseDataService);
  private readonly browsePanel = viewChild(BrowsePanelComponent);

  protected readonly selectedFilters = signal<SelectedFilters>(EMPTY_SELECTION);
  protected readonly activeFilter = signal<BrowseFilter | null>(null);

  protected readonly browseResource = resource({
    params: () => ({
      territoryIds: this.selectedFilters().territory,
      areaIds: this.selectedFilters().knowledgeArea,
    }),
    loader: ({ params, abortSignal }) => this.browseDataService.loadBrowseData(params, abortSignal),
    defaultValue: EMPTY_BROWSE_RESPONSE,
  });

  protected readonly filtersResource = resource({
    loader: ({ abortSignal }) => this.browseDataService.loadFilters(abortSignal),
    defaultValue: [] as readonly BrowseFilter[],
  });

  protected readonly filterSummaries = computed<readonly FilterSummary[]>(() =>
    this.filtersResource.value().map((filter) => {
      const selectedIds = this.selectedFilters()[filter.key];
      return {
        key: filter.key,
        count: selectedIds.length,
        label: this.selectedLabel(filter, selectedIds),
      };
    }),
  );

  protected openFilter(filter: BrowseFilter): void {
    this.activeFilter.set(filter);
  }

  protected closeFilter(): void {
    this.activeFilter.set(null);
  }

  protected applyFilter(event: FilterApplyEvent): void {
    this.selectedFilters.update((filters) => ({
      ...filters,
      [event.key]: event.selectedIds,
    }));
    this.closeFilter();
  }

  protected selectedIdsFor(filter: BrowseFilter): readonly string[] {
    return this.selectedFilters()[filter.key];
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
}
