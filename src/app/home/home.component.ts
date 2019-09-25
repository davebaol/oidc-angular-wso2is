import { Component } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  private userDataSubscription: Subscription;
  public userData: any;

  /**
   *
   */
  constructor(private authService: AuthService) {
    this.userDataSubscription = this.authService.getUserData().subscribe((userData: any) => {
      this.userData = userData;
    });
  }

  ngOnDestroy(): void {
    this.userDataSubscription.unsubscribe();
  }
}
