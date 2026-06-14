import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
