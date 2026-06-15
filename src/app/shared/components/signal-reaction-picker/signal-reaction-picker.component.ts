import { Component, computed, input, model } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormValueControl } from '../../../models/form-value-control.model';
import { connectSignalFormControl } from '../../utils/signal-form-control-sync';

interface ReactionOption {
  readonly value: string;
  readonly label: string;
  readonly description: string;
  readonly path: string;
}

@Component({
  selector: 'app-signal-reaction-picker',
  templateUrl: './signal-reaction-picker.component.html',
  styleUrl: './signal-reaction-picker.component.scss',
})
export class SignalReactionPickerComponent implements FormValueControl<string> {
  readonly label = input('Reaction');
  readonly required = input(false);
  readonly control = input<FormControl<string> | null>(null);
  readonly value = model('');
  readonly disabled = input(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || (this.control()?.disabled ?? false),
  );

  protected readonly reactions: readonly ReactionOption[] = [
    {
      value: 'like',
      label: 'Like',
      description: 'This feels useful',
      path: 'M2 21h4V9H2v12Zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 6.59 7.59C6.22 7.95 6 8.45 6 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2Z',
    },
    {
      value: 'insightful',
      label: 'Insightful',
      description: 'Strong learning signal',
      path: 'M9 21h6v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Zm2.85 11.1-.85.6V16h-4v-2.3l-.85-.6C7.8 12.14 7 10.61 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.61-.8 3.14-2.15 4.1Z',
    },
    {
      value: 'share',
      label: 'Share',
      description: 'Worth sending onward',
      path: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 8.04 14l7.12 4.18c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.75Z',
    },
    {
      value: 'review',
      label: 'Review',
      description: 'Needs another look',
      path: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    },
  ];

  protected readonly selectedReaction = computed(
    () =>
      this.reactions.find((reaction) => reaction.value === this.value())?.label ??
      'No reaction selected',
  );

  constructor() {
    connectSignalFormControl(this.control, this.value);
  }

  protected select(reaction: ReactionOption): void {
    if (this.isDisabled()) {
      return;
    }

    this.value.set(reaction.value);
  }
}
