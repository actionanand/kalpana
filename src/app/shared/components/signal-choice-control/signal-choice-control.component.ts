import { Component, computed, input, model } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormValueControl } from '../../../models/form-value-control.model';
import { connectSignalFormControl } from '../../utils/signal-form-control-sync';

export interface SignalChoiceOption {
  readonly label: string;
  readonly value: string;
  readonly description: string;
}

@Component({
  selector: 'app-signal-choice-control',
  templateUrl: './signal-choice-control.component.html',
  styleUrl: './signal-choice-control.component.scss',
})
export class SignalChoiceControlComponent implements FormValueControl<string> {
  readonly label = input('Choose an option');
  readonly options = input<readonly SignalChoiceOption[]>([]);
  readonly control = input<FormControl<string> | null>(null);
  readonly value = model('');
  readonly disabled = input(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || (this.control()?.disabled ?? false),
  );

  constructor() {
    connectSignalFormControl(this.control, this.value);
  }

  protected choose(option: SignalChoiceOption): void {
    if (this.isDisabled()) {
      return;
    }

    this.value.set(option.value);
  }
}
