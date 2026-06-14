import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientAuthService } from '../services/client-auth.service';

interface AuthForm {
  readonly username: FormControl<string>;
  readonly password: FormControl<string>;
}

@Component({
  selector: 'app-auth-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.scss',
})
export class AuthDialogComponent {
  protected readonly authService = inject(ClientAuthService);
  protected readonly busy = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly wobble = signal(false);
  protected readonly usernameInput = viewChild<ElementRef<HTMLInputElement>>('usernameInput');

  protected readonly form = new FormGroup<AuthForm>({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      if (this.authService.promptOpen()) {
        queueMicrotask(() => this.usernameInput()?.nativeElement.focus());
      }
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showError('Enter a user name and password.');
      return;
    }

    this.busy.set(true);
    let authenticated = false;
    try {
      authenticated = await this.authService.login(
        this.form.controls.username.value,
        this.form.controls.password.value,
      );
    } catch {
      this.showError('Authentication could not be completed in this browser.');
      this.form.controls.password.setValue('');
      return;
    } finally {
      this.busy.set(false);
    }

    if (!authenticated) {
      this.form.controls.password.setValue('');
      this.showError('The password is incorrect.');
    }
  }

  protected resetWobble(): void {
    this.wobble.set(false);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    this.wobble.set(false);
    setTimeout(() => this.wobble.set(true));
  }
}
