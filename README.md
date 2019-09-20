# oidc-angular-wso2is

Simple [Angular](https://angular.io/) single-page application demonstrating [OAuth2 code flow with PKCE](https://oauth.net/2/pkce/) using [WSO2 Identity Server](https://wso2.com/identity-and-access-management/).

This version is tested with **WSO2 Identity Server 5.8.0**.

The project is a standard Angular CLI application. If you open a command prompt in that directory, you can run any ng command (e.g., ng test), or use npm to install extra packages into it.

- Prepare WSO2 Identity Server
  - Sign in to the WSO2 Identity Server Management Console.
  - On the `Main` tab, click `Identity` > `Service Providers` > `Add`. Enter the Service Provider Name and optionally provide a brief description. Click `Register`.
  - Expand the `Inbound Authentication Configuration` section and then expand `OAuth/OpenID Connect Configuration`. Click `Configure`.
  - For the `Allowed Grant Types` enable `code` only.
  - Set the `Callback Url`, which is the exact location in the service provider's application where an access token would be sent. Since our single-page application has 2 callback URLs you have to use a regex pattern like `regexp=(http://localhost:4200/callback|http://localhost:4200/silent_renew.html)`. Notice that you must have the prefix `regexp=` before your regex pattern.
  - Flag the `PKCE Mandatory` checkbox.
  - Flag the `Allow authentication without the client secret` checkbox.
  - Click `Add`. Note that client key and client secret get generated.
- Prepare sources according to your configuration 
  - In `src/app/main.ts` properly set `BASE_URL`, `AUTH_URL` and `API_URL`.
  - In `src/app/core/auth/auth.service.ts` properly set `openIdConfiguration` properties. Especially, you have to set property `client_id` to the value of the `OAuth client key` previously generated for the service provider in WSO2 IS. 
- Run `npm install` to install dependencies.
- Run `ng serve` to startup a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
- If you encounter a CORS issue apply solution #2 reported at https://docs.wso2.com/display/IS580/Invoking+an+Endpoint+from+a+Different+Domain


