import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./two-column-browse/two-column-browse.component').then(
        (module) => module.TwoColumnBrowseComponent,
      ),
  },
  {
    path: 'report/:id',
    loadComponent: () =>
      import('./report-page/report-page.component').then((module) => module.ReportPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
