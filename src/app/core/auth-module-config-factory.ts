import { OAuthModuleConfig } from 'angular-oauth2-oidc';
import { ConfigService } from './config.service';

export function authModuleConfigFactory(configService: ConfigService): OAuthModuleConfig {
  return {
    resourceServer: {
      // Url prefixes for which calls should be intercepted 
      allowedUrls: [`${configService.apiUrl}`],

      // If specified as a funtion of type (url: string) => boolean
      // it will be used in place of the allowedUrls whitelist.
      customUrlValidation: undefined,

      // If true access token is attached to request headers
      sendAccessToken: true
    }
  };
}
