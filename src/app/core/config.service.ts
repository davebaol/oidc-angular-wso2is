import { Injectable, Inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  constructor(@Inject('BASE_URL') public readonly originUrl: string) {
  }

  public readonly authUrl = 'https://localhost:9443';

  public readonly apiUrl = 'https://localhost:9443/api';

  // Set this to true to enable the auto-login feature
  public readonly autoLogin = false;

  // Set this to true to revoke access and refresh tokens on logout
  public readonly revokeTokenOnLogout = true;

}
