import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  SignalChoiceControlComponent,
  SignalChoiceOption,
} from '../../shared/components/signal-choice-control/signal-choice-control.component';

interface SignalCvaForm {
  readonly section: FormControl<string>;
}

@Component({
  selector: 'app-signal-cva-demo',
  imports: [JsonPipe, ReactiveFormsModule, SignalChoiceControlComponent],
  templateUrl: './signal-cva-demo.component.html',
  styleUrl: './signal-cva-demo.component.scss',
})
export class SignalCvaDemoComponent {
  protected readonly options: readonly SignalChoiceOption[] = [
    {
      label: 'Urban Systems',
      value: 'urban-systems',
      description: 'Mobility, housing, public space, and digital service examples.',
    },
    {
      label: 'Climate Resilience',
      value: 'climate-resilience',
      description: 'Water, heat, coastal adaptation, and resilience planning examples.',
    },
    {
      label: 'Shared Components',
      value: 'shared-components',
      description: 'Reusable controls, data display patterns, and interaction states.',
    },
  ];

  protected readonly disabled = signal(false);
  protected readonly form = new FormGroup<SignalCvaForm>({
    section: new FormControl('urban-systems', { nonNullable: true }),
  });

  private readonly sectionValue = toSignal(this.form.controls.section.valueChanges, {
    initialValue: this.form.controls.section.value,
  });

  protected readonly formSnapshot = computed(() => ({
    section: this.sectionValue(),
    valid: this.form.valid,
    disabled: this.disabled(),
    touched: this.form.controls.section.touched,
    dirty: this.form.controls.section.dirty,
  }));

  protected chooseClimate(): void {
    this.form.controls.section.setValue('climate-resilience');
  }

  protected resetForm(): void {
    this.form.reset({ section: 'urban-systems' });
    this.disabled.set(false);
    this.form.enable();
  }

  protected toggleDisabled(): void {
    this.disabled.update((disabled) => !disabled);
    if (this.disabled()) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
