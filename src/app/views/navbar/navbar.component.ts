import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationServiceService } from 'src/app/services/authentication-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  openSidebar = false;
  @Output() toggleSidebarToParent = new EventEmitter<boolean>();

  constructor(
    private authenticationService: AuthenticationServiceService,
    private router:Router
  ) { }

  ngOnInit(): void {
  }
  
  toggleSidebar() {
    this.openSidebar = !this.openSidebar;
    this.toggleSidebarToParent.emit(this.openSidebar);
  }

  Logout(){
    const data ={user_name: localStorage.getItem('user_name')}
    this.authenticationService.Logout(data).subscribe((resultado)=>{
      localStorage.clear();
      this.router.navigateByUrl(`/`).then(() => {
        window.location.reload();
      });
    })
  }

}
