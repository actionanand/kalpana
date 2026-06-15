import { Component, computed, input, model, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormValueControl } from '../../../models/form-value-control.model';
import { connectSignalFormControl } from '../../utils/signal-form-control-sync';

interface RatingOption {
  readonly stars: number;
  readonly text: string;
}

@Component({
  selector: 'app-signal-star-rating',
  templateUrl: './signal-star-rating.component.html',
  styleUrl: './signal-star-rating.component.scss',
})
export class SignalStarRatingComponent implements FormValueControl<number> {
  readonly label = input('Rating');
  readonly required = input(false);
  readonly control = input<FormControl<number> | null>(null);
  readonly value = model(0);
  readonly disabled = input(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || (this.control()?.disabled ?? false),
  );

  protected readonly ratings: readonly RatingOption[] = [
    { stars: 1, text: 'Poor' },
    { stars: 2, text: 'Fair' },
    { stars: 3, text: 'Good' },
    { stars: 4, text: 'Very good' },
    { stars: 5, text: 'Excellent' },
  ];

  protected readonly hoverText = signal('');
  protected readonly selectedText = computed(
    () => this.ratings.find((rating) => rating.stars === this.value())?.text ?? '',
  );
  protected readonly displayText = computed(
    () => this.hoverText() || this.selectedText() || 'No rating selected',
  );

  constructor() {
    connectSignalFormControl(this.control, this.value);
  }

  protected preview(text: string): void {
    if (!this.isDisabled()) {
      this.hoverText.set(text);
    }
  }

  protected clearPreview(): void {
    this.hoverText.set('');
  }

  protected setRating(rating: RatingOption): void {
    if (this.isDisabled()) {
      return;
    }

    this.value.set(rating.stars);
  }
}
