import { Signal, WritableSignal, effect, untracked } from '@angular/core';
import { FormControl } from '@angular/forms';

export function connectSignalFormControl<T>(
  control: Signal<FormControl<T> | null>,
  value: WritableSignal<T>,
): void {
  effect((onCleanup) => {
    const formControl = control();

    if (!formControl) {
      return;
    }

    untracked(() => value.set(formControl.value));

    const subscription = formControl.valueChanges.subscribe((nextValue) => {
      value.set(nextValue);
    });

    onCleanup(() => subscription.unsubscribe());
  });

  effect(() => {
    const formControl = control();
    const nextValue = value();

    if (!formControl || formControl.value === nextValue) {
      return;
    }

    untracked(() => formControl.setValue(nextValue));
  });
}
