import { Injectable, OnDestroy, Inject } from '@angular/core';
import { OidcSecurityService, OpenIdConfiguration, AuthWellKnownEndpoints, AuthorizationResult, AuthorizationState } from 'angular-auth-oidc-client';
import { Observable ,  Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthService implements OnDestroy {

    // Set this property to true to enable the auto-login feature
    readonly autoLogin = false;

    // Set this property to true to revoke access and refresh tokens on logout
    readonly revokeTokenOnLogout = true;

    isAuthorized = false;

    openIdConfiguration: OpenIdConfiguration;
    authWellKnownEndpoints: AuthWellKnownEndpoints;

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
        this.openIdConfiguration = {
            stsServer: `${this.authUrl}/oauth2/oidcdiscovery`,
            redirect_url: `${this.originUrl}callback`,
            client_id: 'n1ktw0Y3rAXtKQk0MC2UR1Otp9Ma',
            response_type: 'code',
            scope: 'openid profile resourceApi',
            post_logout_redirect_uri: `${this.originUrl}callback`,
            post_login_route: '/home',
            forbidden_route: '/forbidden', // HTTP 403
            unauthorized_route: '/unauthorized', // HTTP 401
            use_refresh_token: false, // to refresh token silent_renew must be true too
            silent_renew: true,
            silent_renew_url: `${this.originUrl}silent_renew.html`,
            history_cleanup_off: true,
            auto_userinfo: true,
            trigger_authorization_result_event: true,
            log_console_warning_active: true,
            log_console_debug_active: true,
            max_id_token_iat_offset_allowed_in_seconds: 10,
        };

        this.authWellKnownEndpoints = {
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

        this.oidcSecurityService.setupModule(this.openIdConfiguration, this.authWellKnownEndpoints);

        if (this.oidcSecurityService.moduleSetup) {
            this.onOidcModuleSetup();
        } else {
            this.oidcSecurityService.onModuleSetup.subscribe(() => {
                this.onOidcModuleSetup();
            });
        }
        this.isAuthorizedSubscription = this.oidcSecurityService.getIsAuthorized().subscribe((isAuthorized => {
            this.isAuthorized = isAuthorized;
        }));

        this.oidcSecurityService.onAuthorizationResult.subscribe(
            (authorizationResult: AuthorizationResult) => {
                if (this.autoLogin) {
                    this.onAuthorizationResultCompleteWithAutoLogin(authorizationResult);
                } else {
                    this.onAuthorizationResultComplete(authorizationResult);
                }
            });
    }

    private onAuthorizationResultComplete(authorizationResult: AuthorizationResult) {

        console.log('onAuthorizationResultComplete: Auth result received AuthorizationState:'
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

    private onAuthorizationResultCompleteWithAutoLogin(authorizationResult: AuthorizationResult) {

        console.log('onAuthorizationResultCompleteWithAutologin: Auth result received AuthorizationState:'
            + authorizationResult.authorizationState
            + ' validationResult:' + authorizationResult.validationResult);

        if (authorizationResult.authorizationState === AuthorizationState.authorized) {
            const path = this.readFromLocalStorage('redirect');
            this.router.navigate([path]);
        } else {
            this.router.navigate(['/unauthorized']);
        }
    }

    private doCallbackLogicIfRequired() {
        // Will do a callback, if the url has a code and state parameter.
        this.oidcSecurityService.authorizedCallbackWithCode(window.location.toString());
    }

    private isAuthorizedCallbackWithCode(url: string) {
        const params = (new URL(url)).searchParams;
        const code = params.get("code");
        const state = params.get("state");
        return !!code && !!state;
    }

    private onOidcModuleSetup() {
        if (!this.autoLogin) {
            this.doCallbackLogicIfRequired();
        }
        //else if (window.location.hash) { // only implicit grant returns the token in the hash; code grant uses query string
        else if (this.isAuthorizedCallbackWithCode(window.location.toString())) {
            this.doCallbackLogicIfRequired();
        } else {
            if ('/autologin' !== window.location.pathname) {
                this.writeToLocalStorage('redirect', window.location.pathname);
            }
            console.log('AuthService:onModuleSetup');
            this.oidcSecurityService.getIsAuthorized().subscribe((authorized: boolean) => {
                if (!authorized) {
                    this.router.navigate(['/autologin']);
                }
            });
        }
    }

    getOnModuleSetupObservable(): Observable<boolean> {
        return this.oidcSecurityService.onModuleSetup;
    }

    getUserDataObservable(): Observable<any> {
        return this.oidcSecurityService.getUserData();
    }

    getIsAuthorizedObservable(): Observable<boolean> {
        return this.oidcSecurityService.getIsAuthorized();
    }

    moduleSetupCompleted(): boolean {
        return this.oidcSecurityService.moduleSetup;
    }

    login(): void {
        console.log('start login');
        this.oidcSecurityService.authorize();
    }

    logout(): void {
        console.log('start logoff');

        if (this.revokeTokenOnLogout) {
            const token = this.oidcSecurityService.getToken();
            this.oidcSecurityService.logoff(url => this.revokeToken(token));
        }
        else {
            this.oidcSecurityService.logoff();
        }
    }

    // Revoke access token
    // Notice that WSO2 IS 5.8.0 automatically revokes the associated refresh token
    // (check response headers of access token revocation) which looks very reasonable.
    private revokeToken(token: string) {
        console.log('Revoking token = ' + token);
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('token', token);
        urlSearchParams.append('token_type_hint', 'access_token');
        urlSearchParams.append('client_id', this.openIdConfiguration.client_id);
        this.http.post(this.authWellKnownEndpoints.revocation_endpoint, urlSearchParams.toString(), { headers })
            .subscribe(result => {
                console.log('Access token and related refresh token (if any) have been successfully revoked');
            }, (error) => {
                console.error('Something went wrong on token revocation');
                this.oidcSecurityService.handleError(error);
                return throwError(error);
            });
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

    private readFromLocalStorage(key: string): any {
        const data = localStorage.getItem(key);
        if (data != null) {
            return JSON.parse(data);
        }

        return;
    }

    private writeToLocalStorage(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
