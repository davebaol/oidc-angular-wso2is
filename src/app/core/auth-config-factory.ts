import { AuthConfig } from 'angular-oauth2-oidc';
import { ConfigService } from './config.service';

export function authConfigFactory(configService: ConfigService): AuthConfig {
  return {
    // Url of the Identity Provider
    issuer: `${configService.authUrl}/oauth2/oidcdiscovery`,

    // The SPA's id. The SPA is registerd with this id at the auth-server
    clientId: 'iVilYq3pIWeG4xP6Xnbi09xut0ka',

    redirectUri: `${configService.originUrl}/index.html`,
    silentRefreshRedirectUri: `${configService.originUrl}/silent-refresh.html`,
    postLogoutRedirectUri: `${configService.originUrl}/index.html`,

    // Specify whether to skip the validation of the issuer in the discovery document.
    // Normally, the discovey document's url starts with the url of the issuer.
    skipIssuerCheck: true,

    // Specify whether every endpoint provided by the discovery document
    // has to start with the issuer's url defined above
    strictDiscoveryDocumentValidation: false,

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    // Use either 'code' for code flow (recommended) or '' for implicit flow
    responseType: 'code',

    // Set to true to use pure code flow without PKCE (not recommended)
    disablePKCE: false,

    // Set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one
    scope: 'openid profile email offline_access api',

    //silentRefreshTimeout: 5000, // For faster testing
    //timeoutFactor: 0.25, // For faster testing
    silentRefreshTimeout: 500000, // For faster testing
    timeoutFactor: 0.75, // For faster testing

    sessionChecksEnabled: true,

    // Specify whether additional debug information should
    // be shown at the console.
    // Also requires enabling "Verbose" level in devtools
    showDebugInformation: true,
  
    // Specify whether to clear the hash fragment after logging in.
    // See https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040
    clearHashAfterLogin: false,
  };
}
