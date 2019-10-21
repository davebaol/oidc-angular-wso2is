import { Component } from '@angular/core';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-should-login',
  template: `<p class="alert alert-dark">You need to be logged in to view requested page.</p>
    <p>Please <a href="#" (click)="login($event)">log in</a> before continuing.</p>`,
})
export class ShouldLoginComponent {
  constructor(private authService: AuthService) { }

  public login($event) {
    $event.preventDefault();
    this.authService.login();
  }
}
