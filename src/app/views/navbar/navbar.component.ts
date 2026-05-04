import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationServiceService } from 'src/app/services/authentication-service.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  openSidebar = false;
  isNavbarCollapsed = true;
  username = '';
  membershipStatus = '';
  renewalDateLabel = '';
  remainingDaysLabel = '';
  @Output() toggleSidebarToParent = new EventEmitter<boolean>();

  constructor(
    private readonly authenticationService: AuthenticationServiceService,
    private readonly sessionService: SessionService,
    private readonly router:Router
  ) { }

  ngOnInit(): void {
    this.username = this.authenticationService.getUsername() ?? 'Usuario';
    this.buildMembershipSummary();
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

  private buildMembershipSummary(): void {
    const session = this.sessionService.getSession();
    if (!session) {
      return;
    }

    this.membershipStatus = session.membership_status ?? 'UNKNOWN';
    if (!session.membership_renewal_at) {
      this.renewalDateLabel = 'Sin fecha';
      this.remainingDaysLabel = '';
      return;
    }

    const renewalDate = new Date(session.membership_renewal_at);
    this.renewalDateLabel = renewalDate.toLocaleDateString();

    const msPerDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.ceil((renewalDate.getTime() - Date.now()) / msPerDay);
    this.remainingDaysLabel = remainingDays >= 0
      ? `${remainingDays} dias restantes`
      : `Vencida hace ${Math.abs(remainingDays)} dias`;
  }

}
