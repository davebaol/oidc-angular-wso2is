import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'https://localhost:9443/oauth2/oidcdiscovery',
  skipIssuerCheck: true,

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'iVilYq3pIWeG4xP6Xnbi09xut0ka',

  redirectUri: `${window.location.origin}/index.html`,
  silentRefreshRedirectUri: `${window.location.origin}/silent-refresh.html`,
  postLogoutRedirectUri: `${window.location.origin}/index.html`,

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
  showDebugInformation: true, // Also requires enabling "Verbose" level in devtools
  clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040

  // turn off validation that discovery document endpoints start with the issuer url defined above
  strictDiscoveryDocumentValidation: false,
};
