import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  SignalChoiceControlComponent,
  SignalChoiceOption,
} from '../../shared/components/signal-choice-control/signal-choice-control.component';
import { SignalReactionPickerComponent } from '../../shared/components/signal-reaction-picker/signal-reaction-picker.component';
import { SignalStarRatingComponent } from '../../shared/components/signal-star-rating/signal-star-rating.component';

interface SignalCvaForm {
  readonly section: FormControl<string>;
}

interface FeedbackForm {
  readonly rating: FormControl<number>;
  readonly reaction: FormControl<string>;
  readonly message: FormControl<string>;
}

interface FeedbackSubmission {
  readonly rating: number;
  readonly reaction: string;
  readonly message: string;
}

@Component({
  selector: 'app-signal-cva-demo',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    SignalChoiceControlComponent,
    SignalReactionPickerComponent,
    SignalStarRatingComponent,
  ],
  templateUrl: './signal-cva-demo.component.html',
  styleUrl: './signal-cva-demo.component.scss',
})
export class SignalCvaDemoComponent {
  protected readonly feedbackDemoVisible = signal(true);
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
  protected readonly feedbackForm = new FormGroup<FeedbackForm>({
    rating: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    reaction: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
  });
  protected readonly submittedFeedback = signal<FeedbackSubmission | null>(null);

  private readonly sectionValue = toSignal(this.form.controls.section.valueChanges, {
    initialValue: this.form.controls.section.value,
  });
  private readonly ratingValue = toSignal(this.feedbackForm.controls.rating.valueChanges, {
    initialValue: this.feedbackForm.controls.rating.value,
  });
  private readonly reactionValue = toSignal(this.feedbackForm.controls.reaction.valueChanges, {
    initialValue: this.feedbackForm.controls.reaction.value,
  });
  private readonly messageValue = toSignal(this.feedbackForm.controls.message.valueChanges, {
    initialValue: this.feedbackForm.controls.message.value,
  });

  protected readonly formSnapshot = computed(() => ({
    section: this.sectionValue(),
    valid: this.form.valid,
    disabled: this.disabled(),
    touched: this.form.controls.section.touched,
    dirty: this.form.controls.section.dirty,
  }));
  protected readonly feedbackSnapshot = computed(() => ({
    rating: this.ratingValue(),
    reaction: this.reactionValue(),
    message: this.messageValue(),
    valid: this.feedbackForm.valid,
    touched: this.feedbackForm.touched,
    dirty: this.feedbackForm.dirty,
    disabled: this.feedbackForm.disabled,
  }));

  protected toggleFeedbackDemo(): void {
    this.feedbackDemoVisible.update((visible) => !visible);
  }

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

  protected resetFeedback(): void {
    this.feedbackForm.reset({
      rating: 0,
      reaction: '',
      message: '',
    });
    this.submittedFeedback.set(null);
  }

  protected submitFeedback(): void {
    this.feedbackForm.markAllAsTouched();
    if (this.feedbackForm.invalid) {
      this.submittedFeedback.set(null);
      return;
    }

    this.submittedFeedback.set(this.feedbackForm.getRawValue());
  }
}
