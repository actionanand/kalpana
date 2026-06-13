import { Component, input, output } from '@angular/core';
import { BrowseFilter, BrowseFilterKey } from '../data/browse.models';

export interface FilterSummary {
  readonly key: BrowseFilterKey;
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

  readonly filterSelected = output<BrowseFilter>();
  readonly expandAllSelected = output<void>();
  readonly collapseAllSelected = output<void>();

  protected activeSummary(filter: BrowseFilter): FilterSummary | undefined {
    return this.summaries().find((summary) => summary.key === filter.key);
  }
}
