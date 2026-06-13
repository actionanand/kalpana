import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, Routes } from '@angular/router';

const isValidReportId = (id: string): boolean => /^\d{3,5}$/.test(id) && `${Number(id)}` === id;

const reportIdGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('id') ?? '';
  return isValidReportId(id) || inject(Router).createUrlTree(['/404']);
};

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
    canActivate: [reportIdGuard],
    loadComponent: () =>
      import('./report-page/report-page.component').then((module) => module.ReportPageComponent),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./not-found-page/not-found-page.component').then(
        (module) => module.NotFoundPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
