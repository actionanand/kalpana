import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  BrowseFilter,
  BrowseFilterOption,
  BrowseSelectionKey,
  FilterGroup,
} from '../../../models/browse.models';
import { BrowseFilterService, FilterSortMode } from '../../../services/browse-filter.service';

export interface FilterApplyEvent {
  readonly key: BrowseSelectionKey;
  readonly selectedIds: readonly string[];
}

@Component({
  selector: 'app-browse-filter-dialog',
  templateUrl: './browse-filter-dialog.component.html',
  styleUrl: './browse-filter-dialog.component.scss',
})
export class BrowseFilterDialogComponent {
  readonly filter = input.required<BrowseFilter>();
  readonly selectedIds = input<readonly string[]>([]);

  readonly applied = output<FilterApplyEvent>();
  readonly closed = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterService = inject(BrowseFilterService);

  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  protected readonly searchQuery = signal('');
  protected readonly sortMode = linkedSignal<BrowseFilter, FilterSortMode>({
    source: this.filter,
    computation: (filter) => (filter.grouped ? 'region' : 'frequency'),
  });
  protected readonly sortMenuOpen = signal(false);
  protected readonly expandedGroups = signal<Record<string, boolean>>({});

  private readonly selectionSource = computed(() => ({
    key: this.filter().key,
    selectedIds: this.selectedIds(),
  }));

  protected readonly draftSelectedIds = linkedSignal<
    { key: BrowseSelectionKey; selectedIds: readonly string[] },
    readonly string[]
  >({
    source: this.selectionSource,
    computation: (source) => source.selectedIds,
  });

  protected readonly groups = computed<readonly FilterGroup[]>(() =>
    this.filterService.buildGroups({
      filter: this.filter(),
      searchQuery: this.searchQuery(),
      sortMode: this.sortMode(),
    }),
  );

  protected readonly selectionSummary = computed(() =>
    this.filterService.selectionSummary(this.filter(), this.draftSelectedIds()),
  );

  protected readonly selectedCount = computed(() => this.draftSelectedIds().length);
  protected readonly allVisibleOptions = computed(() =>
    this.groups().flatMap((group) => group.options),
  );

  protected readonly allVisibleSelected = computed(() => {
    const visibleOptions = this.allVisibleOptions();
    return (
      visibleOptions.length > 0 &&
      visibleOptions.every((option) => this.draftSelectedIds().includes(option.id))
    );
  });

  protected readonly visibleIndeterminate = computed(() => {
    const visibleOptions = this.allVisibleOptions();
    const selectedCount = visibleOptions.filter((option) =>
      this.draftSelectedIds().includes(option.id),
    ).length;
    return selectedCount > 0 && selectedCount < visibleOptions.length;
  });

  constructor() {
    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        this.closed.emit();
      }
    };

    this.document.addEventListener('keydown', onKeydown);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('keydown', onKeydown));

    afterNextRender(() => {
      this.searchInput()?.nativeElement.focus();
    });
  }

  protected updateSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.searchQuery.set(inputElement?.value ?? '');
  }

  protected setSortMode(mode: FilterSortMode): void {
    this.sortMode.set(mode);
    this.sortMenuOpen.set(false);
  }

  protected toggleSortMenu(): void {
    this.sortMenuOpen.update((open) => !open);
  }

  protected sortLabel(): string {
    if (this.sortMode() === 'region') {
      return 'Group by region';
    }

    if (this.sortMode() === 'alpha') {
      return 'Sort alphabetically';
    }

    return 'Sort by frequency';
  }

  protected isSelected(option: BrowseFilterOption): boolean {
    return this.draftSelectedIds().includes(option.id);
  }

  protected toggleOption(option: BrowseFilterOption): void {
    this.draftSelectedIds.update((selectedIds) =>
      selectedIds.includes(option.id)
        ? selectedIds.filter((id) => id !== option.id)
        : [...selectedIds, option.id],
    );
  }

  protected toggleSelectAll(): void {
    const shouldSelect = !this.allVisibleSelected();
    const visibleIds = this.allVisibleOptions().map((option) => option.id);

    this.draftSelectedIds.set(
      shouldSelect
        ? [...new Set([...this.draftSelectedIds(), ...visibleIds])]
        : this.draftSelectedIds().filter((id) => !visibleIds.includes(id)),
    );
  }

  protected toggleGroup(group: FilterGroup): void {
    const shouldSelect = !this.isGroupSelected(group);
    const groupIds = new Set(group.options.map((option) => option.id));
    this.draftSelectedIds.update((selectedIds) =>
      shouldSelect
        ? [...new Set([...selectedIds, ...groupIds])]
        : selectedIds.filter((id) => !groupIds.has(id)),
    );
  }

  protected isGroupSelected(group: FilterGroup): boolean {
    const selectedIds = this.draftSelectedIds();
    return (
      group.options.length > 0 && group.options.every((option) => selectedIds.includes(option.id))
    );
  }

  protected isGroupIndeterminate(group: FilterGroup): boolean {
    const selectedIds = this.draftSelectedIds();
    const selectedCount = group.options.filter((option) => selectedIds.includes(option.id)).length;
    return selectedCount > 0 && selectedCount < group.options.length;
  }

  protected isGroupExpanded(group: FilterGroup): boolean {
    return this.expandedGroups()[group.id] ?? true;
  }

  protected toggleGroupExpanded(group: FilterGroup): void {
    this.expandedGroups.update((groups) => ({
      ...groups,
      [group.id]: !this.isGroupExpanded(group),
    }));
  }

  protected clearSelection(): void {
    this.draftSelectedIds.set([]);
  }

  protected apply(): void {
    this.applied.emit({
      key: this.filter().key,
      selectedIds: this.draftSelectedIds(),
    });
  }
}
