import { Component, computed, input, linkedSignal, output } from '@angular/core';
import {
  BrowseDateEntry,
  BrowseDateKey,
  BrowseDateSelection,
  DateOperator,
} from '../data/browse.models';

interface DateDraft {
  readonly key: BrowseDateKey;
  readonly label: string;
  readonly operator: DateOperator;
  readonly date: string;
  readonly dateTo: string;
}

@Component({
  selector: 'app-browse-date-dialog',
  templateUrl: './browse-date-dialog.component.html',
  styleUrl: './browse-date-dialog.component.scss',
})
export class BrowseDateDialogComponent {
  readonly entries = input.required<readonly BrowseDateEntry[]>();
  readonly selectedDates = input<readonly BrowseDateSelection[]>([]);

  readonly applied = output<readonly BrowseDateSelection[]>();
  readonly closed = output<void>();

  protected readonly drafts = linkedSignal<
    { entries: readonly BrowseDateEntry[]; selectedDates: readonly BrowseDateSelection[] },
    readonly DateDraft[]
  >({
    source: computed(() => ({
      entries: this.entries(),
      selectedDates: this.selectedDates(),
    })),
    computation: (source) =>
      source.entries.map((entry) => {
        const selected = source.selectedDates.find((date) => date.key === entry.key);
        return {
          key: entry.key,
          label: entry.label,
          operator: selected?.operator ?? entry.defaultOperator,
          date: selected?.date ?? '',
          dateTo: selected?.dateTo ?? '',
        };
      }),
  });

  protected readonly selectedCount = computed(
    () => this.drafts().filter((draft) => draft.date.length > 0).length,
  );

  protected readonly summary = computed(() => {
    const count = this.selectedCount();
    if (count === 0) {
      return 'None selected';
    }

    return count === 1 ? '1 date selected' : `${count} dates selected`;
  });

  protected updateOperator(key: BrowseDateKey, event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    const operator = (select?.value ?? 'after') as DateOperator;
    this.updateDraft(key, (draft) => ({
      ...draft,
      operator,
      dateTo: operator === 'between' ? draft.dateTo : '',
    }));
  }

  protected updateDate(key: BrowseDateKey, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.updateDraft(key, (draft) => ({ ...draft, date: input?.value ?? '' }));
  }

  protected updateDateTo(key: BrowseDateKey, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.updateDraft(key, (draft) => ({ ...draft, dateTo: input?.value ?? '' }));
  }

  protected apply(): void {
    this.applied.emit(
      this.drafts()
        .filter((draft) => draft.date.length > 0)
        .map((draft) => ({
          key: draft.key,
          operator: draft.operator,
          date: draft.date,
          dateTo: draft.operator === 'between' && draft.dateTo ? draft.dateTo : undefined,
        })),
    );
  }

  private updateDraft(key: BrowseDateKey, update: (draft: DateDraft) => DateDraft): void {
    this.drafts.update((drafts) =>
      drafts.map((draft) => (draft.key === key ? update(draft) : draft)),
    );
  }
}
