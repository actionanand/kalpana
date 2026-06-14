import { Component, input, output } from '@angular/core';
import { BrowseFilter, BrowseSelectionKey } from '../data/browse.models';

export interface FilterSummary {
  readonly key: BrowseSelectionKey | 'date' | 'more';
  readonly count: number;
  readonly label: string;
}

@Component({
  selector: 'app-browse-toolbar',
  templateUrl: './browse-toolbar.component.html',
  styleUrl: './browse-toolbar.component.scss',
})
export class BrowseToolbarComponent {
  readonly filters = input<readonly BrowseFilter[]>([]);
  readonly summaries = input<readonly FilterSummary[]>([]);
  readonly loadingKey = input<BrowseSelectionKey | 'date' | 'more' | null>(null);

  readonly filterSelected = output<BrowseFilter>();
  readonly dateSelected = output<void>();
  readonly moreSelected = output<void>();
  readonly expandAllSelected = output<void>();
  readonly collapseAllSelected = output<void>();

  protected activeSummary(filter: BrowseFilter): FilterSummary | undefined {
    return this.summaries().find((summary) => summary.key === filter.key);
  }

  protected summaryFor(key: 'date' | 'more'): FilterSummary | undefined {
    return this.summaries().find((summary) => summary.key === key);
  }

  protected isLoading(key: BrowseSelectionKey | 'date' | 'more'): boolean {
    return this.loadingKey() === key;
  }
}
