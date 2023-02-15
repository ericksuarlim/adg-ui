import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase/app'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'adg-ui';
  user : string;
  
  async ngOnInit(){
    await this.initFirebase();
    this.user = localStorage.getItem('user_name')!;
    console.log("Ahora",this.user)
  }
  
  async initFirebase(){
    await firebase.initializeApp(environment.firebaseConfig);
  }
}
