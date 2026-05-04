import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase/app';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthenticationServiceService } from './services/authentication-service.service';
import { Router } from '@angular/router';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'adg-ui';
  user: string | null = null;
  openSidebar = false;
  
  constructor(
    private readonly bnIdle: BnNgIdleService,
    private readonly authenticationService: AuthenticationServiceService,
    private readonly sessionService: SessionService,
    private readonly router:Router
  ) {     
  }

  ngOnInit(): void {
    this.initFirebase();
   
    this.user = this.authenticationService.getUsername();
    this.openSidebar = this.user === null;

    if (!this.authenticationService.isAuthenticated()) {
      this.authenticationService.clearSession();
      this.user = null;
      this.openSidebar = true;
    }

    this.sessionService.session$.subscribe((session) => {
      this.user = session?.username ?? null;
      this.openSidebar = !session;
    });

    this.bnIdle.startWatching(28800).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        this.CerrarSesion();
      }
    });


  }

  initFirebase(): void {
    firebase.initializeApp(environment.firebaseConfig);
  }
  
  toggleSidebarToParent(openSidebar:boolean){
    this.openSidebar = openSidebar;
  }

  CerrarSesion(){
    this.authenticationService.logout().subscribe({
      next: () => {
        this.authenticationService.clearSession();
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.authenticationService.clearSession();
        this.router.navigateByUrl('/login');
      }
    });
  }
}
