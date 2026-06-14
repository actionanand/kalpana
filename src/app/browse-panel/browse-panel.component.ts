import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrowseColumn, BrowseNode, BrowseSection } from '../data/browse.models';

type ExpandedState = Record<string, boolean>;

@Component({
  selector: 'app-browse-panel',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './browse-panel.component.html',
  styleUrl: './browse-panel.component.scss',
})
export class BrowsePanelComponent {
  readonly columns = input<readonly BrowseColumn[]>([]);
  protected readonly expandedState = signal<ExpandedState>({});

  protected readonly itemCount = computed(() => this.collectIds(this.columns()).length);

  expandAll(): void {
    this.setAllExpanded(true);
  }

  collapseAll(): void {
    this.setAllExpanded(false);
  }

  resetExpansion(): void {
    this.expandedState.set({});
  }

  protected isSectionExpanded(section: BrowseSection): boolean {
    return this.expandedState()[section.id] ?? section.expanded ?? true;
  }

  protected isItemExpanded(item: BrowseNode): boolean {
    return this.expandedState()[item.id] ?? false;
  }

  protected toggleSection(section: BrowseSection): void {
    this.toggleById(section.id, this.isSectionExpanded(section));
  }

  protected toggleItem(item: BrowseNode): void {
    this.toggleById(item.id, this.isItemExpanded(item));
  }

  protected hasSectionContent(section: BrowseSection): boolean {
    return this.hasItems(section.children) || this.hasItems(section.links);
  }

  protected hasItemContent(item: BrowseNode): boolean {
    return this.hasItems(item.children) || this.hasItems(item.links) || !!item.abstract;
  }

  private toggleById(id: string, currentlyExpanded: boolean): void {
    this.expandedState.update((state) => ({
      ...state,
      [id]: !currentlyExpanded,
    }));
  }

  private setAllExpanded(expanded: boolean): void {
    const nextState = this.collectIds(this.columns()).reduce<ExpandedState>((state, id) => {
      state[id] = expanded;
      return state;
    }, {});

    this.expandedState.set(nextState);
  }

  private collectIds(columns: readonly BrowseColumn[]): readonly string[] {
    return columns.flatMap((column) =>
      column.sections.flatMap((section) => [
        section.id,
        ...this.collectItemIds(section.children ?? []),
      ]),
    );
  }

  private collectItemIds(items: readonly BrowseNode[]): readonly string[] {
    return items.flatMap((item) => [item.id, ...this.collectItemIds(item.children ?? [])]);
  }

  private hasItems(items: readonly unknown[] | undefined): boolean {
    return Array.isArray(items) && items.length > 0;
  }
}
