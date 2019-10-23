import { OAuthModuleConfig } from 'angular-oauth2-oidc';
import { ConfigService } from './config.service';

export function authModuleConfigFactory(configService: ConfigService): OAuthModuleConfig {
  return {
    resourceServer: {
      allowedUrls: [`${configService.apiUrl}`],
      sendAccessToken: true,
    }
  };
}
