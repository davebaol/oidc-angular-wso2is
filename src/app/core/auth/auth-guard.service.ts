import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getIsAuthorizedObservable().pipe(
      map((isAuthorized: boolean) => {
          if (!isAuthorized) {
              this.router.navigate(['/unauthorized']);
              return false;
          }
          return true;
      })
    );
  }
}
