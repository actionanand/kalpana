import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ClientAuthService } from './client-auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(ClientAuthService);
  if (authService.isAuthenticated()) {
    return true;
  }

  authService.requestLogin(state.url);
  return false;
};
