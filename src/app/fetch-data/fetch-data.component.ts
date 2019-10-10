import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public data: any;

  constructor(private authService: AuthService, http: HttpClient, @Inject('API_URL') apiUrl: string) {

    this.authService.httpGet(apiUrl + '/api/oraesatta/v1/ora').subscribe(result => {
      this.data = result;
    }, (error) => {
      console.error(error);
    });
  }
}
