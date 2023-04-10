import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase/app';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthenticationServiceService } from './services/authentication-service.service';
import { Router,NavigationEnd  } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'adg-ui';
  user : string;
  openSidebar: boolean;
  
  constructor(
    private bnIdle: BnNgIdleService,
    private authenticationService: AuthenticationServiceService,
    private router:Router
  ) {     
  }

  async ngOnInit(){
    await this.initFirebase();
   
    this.user = localStorage.getItem('user_name')!;
    if(localStorage.getItem('user_token')!=null){
      if(!this.isTokenExpired(localStorage.getItem('user_token')!)){
        this.CerrarSesion();
      }
    }
    if(localStorage.getItem('user_token')==null){
      this.openSidebar =true;
    }
    this.bnIdle.startWatching(28800).subscribe((isTimedOut: boolean) => {
      this.CerrarSesion()
    });


  }

  isTokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return expiry * 1000 > Date.now();
  }
  
  async initFirebase(){
    await firebase.initializeApp(environment.firebaseConfig);
  }

  
  toggleSidebarToParent(openSidebar:boolean){
    this.openSidebar = openSidebar;
  }

  CerrarSesion(){
    const datos ={user_name: localStorage.getItem('user_name')}
    this.authenticationService.Logout(datos).subscribe((result)=>{
      localStorage.clear();
      this.router.navigateByUrl(`/`).then(() => {
        window.location.reload();
      });
    })
  }


}
