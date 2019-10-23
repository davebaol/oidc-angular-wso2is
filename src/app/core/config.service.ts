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

  // Set this to false if you don't use Shibboleth
  public readonly shibboleth = true;
  public readonly shibbolethLogoutUrl = `${this.authUrl}/tst_liv1_spid_GASP_REGIONE/Shibboleth.sso/Logout?logout=SERVICE_PROVIDER_TST_APIM-A2C-2_ECOSIS.CSI.IT_LIV1_GASP_REGIONE`;

}
