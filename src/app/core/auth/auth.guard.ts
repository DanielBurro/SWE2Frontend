// auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isTokenValid()) {
    return true;
  }

  // Token fehlt oder abgelaufen → ausloggen & zur Login-Seite
  auth.logout();
  return router.createUrlTree(['/auth/login']);
};