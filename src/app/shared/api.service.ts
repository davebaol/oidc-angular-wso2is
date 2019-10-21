import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {
  constructor(private http: HttpClient) { }

  getProtectedApiResponse(): Observable<string> {
    return this.http.get<any>('https://localhost:9443/api/oraesatta/v1/ora')
      .pipe(
        map(response => response.find(i => i.type === 'iss').value),
        map(iss => '☁ API Success from ' + iss),
        catchError((e: HttpErrorResponse) => of(`🌩 API Error: ${e.status} ${e.statusText}`)),
      );
  }
}
