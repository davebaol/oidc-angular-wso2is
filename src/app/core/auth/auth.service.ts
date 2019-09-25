import { Injectable, OnDestroy, Inject } from '@angular/core';
import { OidcSecurityService, OpenIdConfiguration, AuthWellKnownEndpoints, AuthorizationResult, AuthorizationState } from 'angular-auth-oidc-client';
import { Observable ,  Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthService implements OnDestroy {

    isAuthorized = false;

    constructor(
        private oidcSecurityService: OidcSecurityService,
        private http: HttpClient,
        private router: Router,
        @Inject('BASE_URL') private originUrl: string,
        @Inject('AUTH_URL') private authUrl: string,
    ) {
    }

    private isAuthorizedSubscription: Subscription = new Subscription;

    ngOnDestroy(): void {
        if (this.isAuthorizedSubscription) {
            this.isAuthorizedSubscription.unsubscribe();
        }
    }

    public initAuth() {
        const openIdConfiguration: OpenIdConfiguration = {
            stsServer: `${this.authUrl}/oauth2/oidcdiscovery`,
            redirect_url: `${this.originUrl}callback`,
            client_id: 'n1ktw0Y3rAXtKQk0MC2UR1Otp9Ma',
            response_type: 'code',
            scope: 'openid profile resourceApi',
            post_logout_redirect_uri: this.originUrl,
            post_login_route: '/home',
            forbidden_route: '/forbidden',
            unauthorized_route: '/unauthorized',
            silent_renew: true,
            silent_renew_url: `${this.originUrl}silent_renew.html`,
            history_cleanup_off: true,
            auto_userinfo: true,
            trigger_authorization_result_event: true,
            log_console_warning_active: true,
            log_console_debug_active: true,
            max_id_token_iat_offset_allowed_in_seconds: 10,
        };

        const authWellKnownEndpoints: AuthWellKnownEndpoints = {
            issuer: `${this.authUrl}/oauth2/token`,
            jwks_uri: `${this.authUrl}/oauth2/jwks`,
            authorization_endpoint: `${this.authUrl}/oauth2/authorize`,
            token_endpoint: `${this.authUrl}/oauth2/token`,
            end_session_endpoint: `${this.authUrl}/oidc/logout`,
            userinfo_endpoint: `${this.authUrl}/oauth2/userinfo`,
            check_session_iframe: `${this.authUrl}/oidc/checksession`,
            revocation_endpoint: `${this.authUrl}/oauth2/revoke`,
            introspection_endpoint: `${this.authUrl}/oauth2/introspect`,
        };

        this.oidcSecurityService.setupModule(openIdConfiguration, authWellKnownEndpoints);

        if (this.oidcSecurityService.moduleSetup) {
            this.doCallbackLogicIfRequired();
        } else {
            this.oidcSecurityService.onModuleSetup.subscribe(() => {
                this.doCallbackLogicIfRequired();
            });
        }
        this.isAuthorizedSubscription = this.oidcSecurityService.getIsAuthorized().subscribe((isAuthorized => {
            this.isAuthorized = isAuthorized;
        }));

        this.oidcSecurityService.onAuthorizationResult.subscribe(
            (authorizationResult: AuthorizationResult) => {
                this.onAuthorizationResultComplete(authorizationResult);
            });
    }

    private onAuthorizationResultComplete(authorizationResult: AuthorizationResult) {

        console.log('Auth result received AuthorizationState:'
            + authorizationResult.authorizationState
            + ' validationResult:' + authorizationResult.validationResult);

        if (authorizationResult.authorizationState === AuthorizationState.unauthorized) {
            if (window.parent) {
                // sent from the child iframe, for example the silent renew
                this.router.navigate(['/unauthorized']);
            } else {
                window.location.href = '/unauthorized';
            }
        }
    }

    private doCallbackLogicIfRequired() {

        this.oidcSecurityService.authorizedCallbackWithCode(window.location.toString());
    }

    getIsAuthorized(): Observable<boolean> {
        return this.oidcSecurityService.getIsAuthorized();
    }

    login() {
        console.log('start login');
        this.oidcSecurityService.authorize();
    }

    logout() {
        console.log('start logoff');
        this.oidcSecurityService.logoff();
    }

    httpGet(url: string): Observable<any> {
        return this.http.get(url, { headers: this.getHeaders() })
        .pipe(catchError((error) => {
            this.oidcSecurityService.handleError(error);
            return throwError(error);
        }));
    }

    httpPut(url: string, data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.put(url, body, { headers: this.getHeaders() })
        .pipe(catchError((error) => {
            this.oidcSecurityService.handleError(error);
            return throwError(error);
        }));
    }

    httpDelete(url: string): Observable<any> {
        return this.http.delete(url, { headers: this.getHeaders() })
        .pipe(catchError((error) => {
            this.oidcSecurityService.handleError(error);
            return throwError(error);
        }));
    }

    httpPost(url: string, data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(url, body, { headers: this.getHeaders() })
        .pipe(catchError((error) => {
            this.oidcSecurityService.handleError(error);
            return throwError(error);
        }));
    }

    private getHeaders() {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json');
        return this.appendAuthHeader(headers);
    }

    public getToken() {
        const token = this.oidcSecurityService.getToken();
        return token;
    }

    private appendAuthHeader(headers: HttpHeaders) {
        const token = this.oidcSecurityService.getToken();

        if (token === '') { return headers; }

        const tokenValue = 'Bearer ' + token;
        return headers.set('Authorization', tokenValue);
    }
}
