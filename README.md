# oidc-angular-wso2is

Example of an [Angular](https://angular.io/) single-page application demonstrating [OAuth 2](https://oauth.net/2/) / [OpenID Connect (OIDC)](https://openid.net/connect/) authentication using [WSO2 Identity Server](https://wso2.com/identity-and-access-management/).

The entire project relies on [the `angular-oauth2-oidc` library](https://github.com/manfredsteyer/angular-oauth2-oidc) and has been successfully tested with
- WSO2 Identity Server 5.7.0 as key manager for WSO2 API Manager 2.6.0 (both with recent WUM update)
- WSO2 Identity Server 5.8.0

The application is supposed to look somewhat like this (click the image to enlarge it):
<p align="center">
  <a href="screenshot-001.png">
    <img alt="Application Screenshot" width="600" src="screenshot-001.png"/>
  </a>
</p>


## Features
This project supports a reach set of features.
Most interesting ones can be found in [the core module](./src/app/core).

### Main features
Main features are strictly related to the authorization process, especially from a generic single-page application:
- **OAuth2 grants**: Support for either [code flow](https://oauth.net/2/grant-types/authorization-code/) with [PKCE](https://oauth.net/2/pkce/) (recommended) or [implicit flow](https://oauth.net/2/grant-types/implicit/) for authorization
- **OpenID discovery**: This process determines the location of the OpenID Provider.
- **Silent refresh on startup**: Trying silent refresh on app startup before potentially starting a login flow gives the Identity Server the opportunity to recognize the user (typically through a cookie), so avoiding an unnecessary login.
- **Token revocation on logout**: When this feature is enabled (see [Preparing sources](#two-preparing-sources)) the access token and its refresh token (if present) are revoked when the user logs out.
- **Auto-login**: When this feature is enabled (see [Preparing sources](#two-preparing-sources)) the user is automatically redirected to the login page on the STS server.
- **OpenID's external logout**
- **Token Storage**: Using `localStorage` for storing tokens

### Additional features
The project supports a few additional features that can help you with authentication in your Angular apps:
- **API call interceptor**: By intercepting calls to the API's the access token is silently attached to request headers. In fact, this feature is directly provided by the [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc) library itself.
- **Route guards**: Angular's route guards are interfaces which can tell the router whether or not it should allow navigation to a requested route: 
  - An auth guard that forces you to login when navigating to protected routes
  - An auth guard that just prevents you from navigating to protected routes
  - Asynchronous loading of login information (and thus async auth guards)
- **Angular modules**: core, shared, and two feature modules

## Getting started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- [WSO2 Identity Server 5.7.0 or higher](https://wso2.com/identity-and-access-management/)
- [npm](https://www.npmjs.com/get-npm)

### Installing
The project is a standard Angular CLI application. If you open a command prompt in that directory, you can run any ng command (e.g., ng test), or use npm to install extra packages into it.

#### :one: Preparing WSO2 Identity Server
- To make the OIDC discovery process work without having to use WSO2 IS administrator credentials from the single-page app you have to unsecure the dicovery endpoint:
  - Open the file `<IS_HOME>/repository/conf/identity/identity.xml`
  - Find this line
    ```xml
    <Resource context="(.*)/.well-known(.*)" secured="true" http-method="all"/>
    ```
  - Set `secure` attribute to `false` and save the file
  - Restart the WSO2 Identity Server
- Sign in to the WSO2 Identity Server Management Console.
- On the `Main` tab, click `Identity` > `Service Providers` > `Add`. Enter the Service Provider Name and optionally provide a brief description. Click <kbd>Register</kbd>.
- Expand the `Inbound Authentication Configuration` section and then expand `OAuth/OpenID Connect Configuration`. Click <kbd>Configure</kbd>.
  - **For authorization code grant only (recommended)**:
    - For the `Allowed Grant Types` enable `Code`. Notice that for security reasons, especially for your production environment, this should be the only allowed grant type apart from the optional `Refresh Token` grant type.
    - Flag the `PKCE Mandatory` checkbox in order to reject pure authorization code grant.
    - Flag the `Allow authentication without the client secret` checkbox since single-page applications cannot guarantee the confidentiality of the client secret. 
  - **For implicit grant only (NOT recommended)**:
    - For the `Allowed Grant Types` enable `Implicit`.
  - Set the `Callback Url`, which is the exact location in the service provider's application where an access token would be sent. Since our single-page application has 2 callback URLs you have to use a regex pattern like `regexp=(http://localhost:4200/index.html|http://localhost:4200/silent-refresh.html)`. Notice that you must have the prefix `regexp=` before your regex pattern.
  - Click <kbd>Add</kbd>. Note that client key and client secret get generated.
- Expand the `Claim Configuration` section to specify information of the user that the application needs form the Identity Server where the service provider authenticates. Refer to [Configuring Claims for a Service Provider](https://docs.wso2.com/display/IS580/Configuring+Claims+for+a+Service+Provider).

#### :two: Preparing sources
- If you need to specify a context for your app just change the tag `<base href="/">` of the file `src/index.html` with something like `<base href="/my/context">`. 
- In `src/app/core/config.service.ts` properly set the following properties:
  - `authUrl`: the URL of your authorization server (WSO2 Identity Server in our case)
  - `apiUrl`: the URL of your API server (WSO2 API Manager in our case)
  - `revokeTokenOnLogout`: if `true` the access token and its refresh token (if present) are revoked when the user logs out.
  - `autoLogin`: if `true` the user is automatically redirected to the login page on the STS server.
- In `src/app/core/auth.config.ts`:
  - Set property `clientId` to the value of the `OAuth client key` previously generated for the service provider in WSO2 IS.
  - Set property `responseType` according to the authorization grant you have previously chosen for the service provider in WSO2 IS: `'code'` for code flow and `''` for implicit flow.
- Run `npm install` to install dependencies.
- Run `ng serve` to startup a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Troubleshooting
Here is a list of known symptoms and malfunctions with their respective solutions:
- If you encounter a CORS issue apply solution #2 reported at https://docs.wso2.com/display/IS580/Invoking+an+Endpoint+from+a+Different+Domain
- If you're dealing with different domains and you get `403 Forbidden` on login or logout, it's likely due to a cross-site request forgery (CSRF) issue. In file `<HOME_IS>/repository/conf/security/Owasp.CsrfGuard.Carbon.properties` try disabling the csrfguard filter like that
  ```
  org.owasp.csrfguard.Enabled = false
  ```

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

* The Angular application uses [the `angular-oauth2-oidc` library](https://github.com/manfredsteyer/angular-oauth2-oidc) that is certified by OpenID Foundation.
* The project is heavily inspired by the project [sample-angular-oauth2-oidc-with-auth-guards](https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards).
