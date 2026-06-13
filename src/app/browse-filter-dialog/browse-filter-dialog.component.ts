import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  injectAsync,
  input,
  linkedSignal,
  onIdle,
  output,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import {
  BrowseFilter,
  BrowseFilterOption,
  BrowseSelectionKey,
  FilterGroup,
} from '../data/browse.models';
import type { BrowseFilterService, FilterSortMode } from '../services/browse-filter.service';

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
  private readonly loadFilterService = injectAsync<BrowseFilterService>(
    () => import('../services/browse-filter.service').then((module) => module.BrowseFilterService),
    { prefetch: onIdle },
  );

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

  protected readonly groupsResource = resource({
    params: () => ({
      filter: this.filter(),
      searchQuery: this.searchQuery(),
      sortMode: this.sortMode(),
    }),
    loader: async ({ params }) => {
      const filterService = await this.loadFilterService();
      return filterService.buildGroups(params);
    },
    defaultValue: [] as readonly FilterGroup[],
  });

  protected readonly selectionSummary = resource({
    params: () => ({
      filter: this.filter(),
      selectedIds: this.draftSelectedIds(),
    }),
    loader: async ({ params }) => {
      const filterService = await this.loadFilterService();
      return filterService.selectionSummary(params.filter, params.selectedIds);
    },
    defaultValue: 'None selected',
  });

  protected readonly selectedCount = computed(() => this.draftSelectedIds().length);
  protected readonly allVisibleOptions = computed(() =>
    this.groupsResource.value().flatMap((group) => group.options),
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

  protected toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement | null;
    const checked = !!checkbox?.checked;
    const visibleIds = this.allVisibleOptions().map((option) => option.id);

    this.draftSelectedIds.set(
      checked
        ? [...new Set([...this.draftSelectedIds(), ...visibleIds])]
        : this.draftSelectedIds().filter((id) => !visibleIds.includes(id)),
    );
  }

  protected toggleGroup(group: FilterGroup, event: Event): void {
    const checkbox = event.target as HTMLInputElement | null;
    const checked = !!checkbox?.checked;

    const groupIds = new Set(group.options.map((option) => option.id));
    this.draftSelectedIds.update((selectedIds) =>
      checked
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
