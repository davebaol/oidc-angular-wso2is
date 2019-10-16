# oidc-angular-wso2is

Simple [Angular](https://angular.io/) single-page application demonstrating [OAuth2 code flow with PKCE](https://oauth.net/2/pkce/) using [WSO2 Identity Server](https://wso2.com/identity-and-access-management/).

This version is tested with **WSO2 Identity Server 5.8.0**.

## Additional features
The project supports a few additional features that can help you with authentication in your Angular apps:
- **API call interceptor**: By intercepting calls to the API's the access token is silently attached to request headers.
- **Token revocation on logout**: When this feature is enabled (see [Preparing sources](#two-preparing-sources)) the access token and its refresh token (if present) are revoked when the user logs out.
- **Auto-login**: When this feature is enabled (see [Preparing sources](#two-preparing-sources)) the user is automatically redirected to the login page on the STS server.
- **Route guards**: Angular's route guards are interfaces which can tell the router whether or not it should allow navigation to a requested route. 

## Getting started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- [WSO2 Identity Server 5.8.0 or higher](https://wso2.com/identity-and-access-management/)
- [npm](https://www.npmjs.com/get-npm)

### Installing
The project is a standard Angular CLI application. If you open a command prompt in that directory, you can run any ng command (e.g., ng test), or use npm to install extra packages into it.

#### :one: Preparing WSO2 Identity Server
- Sign in to the WSO2 Identity Server Management Console.
- On the `Main` tab, click `Identity` > `Service Providers` > `Add`. Enter the Service Provider Name and optionally provide a brief description. Click <kbd>Register</kbd>.
- Expand the `Inbound Authentication Configuration` section and then expand `OAuth/OpenID Connect Configuration`. Click <kbd>Configure</kbd>.
  - For the `Allowed Grant Types` enable `Code`. Notice that for security reasons, especially for your production environment, this should be the only allowed grant type apart from the optional `Refresh Token` grant type.
  - Set the `Callback Url`, which is the exact location in the service provider's application where an access token would be sent. Since our single-page application has 2 callback URLs you have to use a regex pattern like `regexp=(http://localhost:4200/callback|http://localhost:4200/silent_renew.html)`. Notice that you must have the prefix `regexp=` before your regex pattern.
  - Flag the `PKCE Mandatory` checkbox in order to reject pure authorization code grant.
  - Flag the `Allow authentication without the client secret` checkbox since single-page applications cannot guarantee the confidentiality of the client secret. 
  - Click <kbd>Add</kbd>. Note that client key and client secret get generated.
- Expand the `Claim Configuration` section to specify information of the user that the application needs form the Identity Server where the service provider authenticates. Refer to [Configuring Claims for a Service Provider](https://docs.wso2.com/display/IS580/Configuring+Claims+for+a+Service+Provider).

#### :two: Preparing sources 
- In `src/main.ts` properly set `BASE_URL`, `AUTH_URL` and `API_URL`. If needed, you can change the base url in the tag `<base href="/">` of the file `src/index.html` with something like `<base href="/my/context">`.
- In `src/app/core/auth/auth.service.ts`:
  - Properly set `openIdConfiguration` properties:
    - Set property `client_id` to the value of the `OAuth client key` previously generated for the service provider in WSO2 IS.
    - Set property `silent_renew` to `true` to renew the client tokens, once the token_id expires
    - Set property `use_refresh_token` to `true` to use refresh token grant during silent renew (which in turn must be enabled). Also make sure `Refresh Token` grant type is checked for the service provider previously defined in WSO2 IS.
  - Set the `revokeTokenOnLogout` variable according to your needs. When `revokeTokenOnLogout` is `true` the access token and its refresh token (if present) are revoked when the user logs out.
  - Set the `autoLogin` variable according to your needs. When `autoLogin` is `true` the user is automatically redirected to the login page on the STS server.
- Run `npm install` to install dependencies.
- Run `ng serve` to startup a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
- If you encounter a CORS issue apply solution #2 reported at https://docs.wso2.com/display/IS580/Invoking+an+Endpoint+from+a+Different+Domain

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* The Angular application uses the [OIDC lib angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client) that is  certified by OpenID Foundation.
* The project is heavily inspired by the article [OpenID Connect with Angular 8](https://christianlydemann.com/openid-connect-with-angular-8-oidc-part-7/).
* The API call interceptor is inspired by the article [Angular Authentication: Using the Http Client and Http Interceptors](https://medium.com/@ryanchenkie_40935/angular-authentication-using-the-http-client-and-http-interceptors-2f9d1540eb8)
* Route guards are implemented as specified by the official documentation of the angular-auth-oidc-client library; see https://github.com/damienbod/angular-auth-oidc-client#using-guards
* Auto-login implementation is inspired by the article [AUTO REDIRECT TO AN STS SERVER IN AN ANGULAR APP USING OIDC IMPLICIT FLOW](https://damienbod.com/2017/09/26/auto-redirect-to-an-sts-server-in-an-angular-app-using-oidc-implicit-flow/) with appropriate adjustments for code flow.
