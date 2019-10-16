import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public data: any;

  constructor(http: HttpClient) {
    http.get('$API_URL$/oraesatta/v1/ora')
      .subscribe(
        result => { this.data = result; },
        error => { console.error(error); }
      );
  }
}
