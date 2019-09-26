import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-auto-component',
    templateUrl: './auto-login.component.html'
})

export class AutoLoginComponent implements OnInit, OnDestroy {
    lang: any;

    private onModuleSetupSubscription: Subscription;

    constructor(private authService: AuthService) {
        this.onModuleSetupSubscription = this.authService.getOnModuleSetupObservable().subscribe(() => {
            this.authService.login();
        });
    }

    ngOnInit() {
        if (this.authService.moduleSetupCompleted()) {
            this.authService.login();
        }
    }

    ngOnDestroy(): void {
        this.onModuleSetupSubscription.unsubscribe();
    }
}
