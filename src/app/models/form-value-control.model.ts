import { WritableSignal } from '@angular/core';

export interface FormValueControl<T> {
  readonly value: WritableSignal<T>;
}
