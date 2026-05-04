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
  isNavbarCollapsed = true;
  username = '';
  @Output() toggleSidebarToParent = new EventEmitter<boolean>();

  constructor(
    private readonly authenticationService: AuthenticationServiceService,
    private readonly router:Router
  ) { }

  ngOnInit(): void {
    this.username = this.authenticationService.getUsername() ?? 'Usuario';
  }
  
  toggleSidebar() {
    this.openSidebar = !this.openSidebar;
    this.toggleSidebarToParent.emit(this.openSidebar);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  Logout(): void {
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
