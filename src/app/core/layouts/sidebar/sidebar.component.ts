import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { hasPermission, Permission } from 'src/app/shared/constants/permissions';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  constructor(private readonly sessionService: SessionService) { }

  @Input() classApplied = false;
  @Output() sidebarLinkClicked = new EventEmitter<void>();

  get canAccessCompanies(): boolean {
    return this.hasPermission(Permission.COMPANY_READ);
  }

  get canAccessUsers(): boolean {
    return this.hasPermission(Permission.USER_READ);
  }

  get hasAdministrationSection(): boolean {
    return this.canAccessCompanies || this.canAccessUsers;
  }

  private hasPermission(permission: Permission): boolean {
    const roles = this.sessionService.getRoles();
    return hasPermission(roles, permission);
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 992) {
      this.sidebarLinkClicked.emit();
    }
  }
}
