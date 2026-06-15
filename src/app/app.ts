import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { AppNavbarComponent } from './components/app-navbar/app-navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthDialogComponent, AppNavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
