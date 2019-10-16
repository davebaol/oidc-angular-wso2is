import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { ApiCallInterceptor } from './auth/api.call.interceptor';
import { AuthModule, OidcSecurityService } from 'angular-auth-oidc-client';

@NgModule({
  imports: [
    CommonModule,
    AuthModule.forRoot()
  ],
  declarations: [],
  providers: [
    AuthService,
    OidcSecurityService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiCallInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }
