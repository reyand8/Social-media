import { inject } from '@angular/core'
import { Router, UrlTree } from '@angular/router'

import { AuthService } from './auth.service'


export const canActivateAuth = (): boolean | UrlTree => {
  const isLoggedIn: boolean = inject(AuthService).isAuth
  if (isLoggedIn) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
}
