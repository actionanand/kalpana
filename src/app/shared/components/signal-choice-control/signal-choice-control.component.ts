import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SignalChoiceOption {
  readonly label: string;
  readonly value: string;
  readonly description: string;
}

@Component({
  selector: 'app-signal-choice-control',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignalChoiceControlComponent),
      multi: true,
    },
  ],
  templateUrl: './signal-choice-control.component.html',
  styleUrl: './signal-choice-control.component.scss',
})
export class SignalChoiceControlComponent implements ControlValueAccessor {
  readonly label = input('Choose an option');
  readonly options = input<readonly SignalChoiceOption[]>([]);

  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal(false);
  protected readonly touched = signal(false);

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value);
  }

  registerOnChange(onChange: (value: string | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected choose(option: SignalChoiceOption): void {
    if (this.disabled()) {
      return;
    }

    this.value.set(option.value);
    this.onChange(option.value);
    this.markTouched();
  }

  protected markTouched(): void {
    if (this.touched()) {
      return;
    }

    this.touched.set(true);
    this.onTouched();
  }
}
