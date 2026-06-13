import { Component } from '@angular/core';
import { TwoColumnBrowseComponent } from './two-column-browse/two-column-browse.component';

@Component({
  selector: 'app-root',
  imports: [TwoColumnBrowseComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
