import { Injectable, Inject } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

const API_URL_PLACEHOLDER = '$API_URL$';

@Injectable()
export class ApiCallInterceptor implements HttpInterceptor {
    constructor(public authService: AuthService, @Inject('API_URL') private apiUrl: string) {        
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Check API url placeholder
        if (!request.url.startsWith(API_URL_PLACEHOLDER)) {
            return next.handle(request);
        }

        // Replace API url placeholder
        const update: any = {
            url: `${this.apiUrl}${request.url.substring(API_URL_PLACEHOLDER.length)}`
        };

        // Attach token
        const token = this.authService.getToken();
        if (token !== '') {
            update.setHeaders = { Authorization: `Bearer ${token}` };
        }

        // Clone and update request
        const newRequest = request.clone(update);

        return next.handle(newRequest)
            .pipe(catchError((error) => {
                // Handle and re-throw authorization errors
                this.authService.handleError(error);
                return throwError(error);
            }));
    }
}