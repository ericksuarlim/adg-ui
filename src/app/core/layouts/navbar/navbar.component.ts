import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationServiceService } from '../../services/authentication-service.service';
import { SessionService } from '../../services/session.service';
import { AppLanguage, I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isNavbarCollapsed = true;
  username = '';
  membershipStatus = '';
  renewalDateLabel = '';
  remainingDaysLabel = '';
  currentLanguage: AppLanguage = 'es';
  readonly languages: { code: AppLanguage; label: string }[] = [
    { code: 'es', label: 'ES' },
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' }
  ];
  @Input() isSidebarOpen = false;
  @Output() toggleSidebarToParent = new EventEmitter<boolean>();
  @Output() themeChanged = new EventEmitter<'light' | 'dark'>();

  constructor(
    private readonly authenticationService: AuthenticationServiceService,
    private readonly sessionService: SessionService,
    private readonly i18nService: I18nService,
    private readonly router:Router
  ) { }

  ngOnInit(): void {
    this.username = this.authenticationService.getUsername() ?? this.i18nService.translate('common.username');
    this.currentLanguage = this.i18nService.getCurrentLanguage();
    this.buildMembershipSummary();
  }
  
  toggleSidebar() {
    this.toggleSidebarToParent.emit(!this.isSidebarOpen);
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

  changeLanguage(language: AppLanguage): void {
    this.i18nService.setLanguage(language);
    this.currentLanguage = language;
    this.buildMembershipSummary();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.themeChanged.emit(theme);
  }

  private buildMembershipSummary(): void {
    const session = this.sessionService.getSession();
    if (!session) {
      return;
    }

    this.membershipStatus = session.membership_status ?? 'UNKNOWN';
    if (!session.membership_renewal_at) {
      this.renewalDateLabel = this.i18nService.translate('nav.membership.noDate');
      this.remainingDaysLabel = '';
      return;
    }

    const renewalDate = new Date(session.membership_renewal_at);
    this.renewalDateLabel = renewalDate.toLocaleDateString();

    const msPerDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.ceil((renewalDate.getTime() - Date.now()) / msPerDay);
    this.remainingDaysLabel = remainingDays >= 0
      ? this.i18nService.translate('nav.membership.remainingDays', { days: remainingDays })
      : this.i18nService.translate('nav.membership.expiredDays', { days: Math.abs(remainingDays) });
  }

}
