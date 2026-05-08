import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from 'src/app/core/services/i18n.service';
import { UserManagementItem } from '../../models/user-management.model';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  user: UserManagementItem | null = null;
  companyName = '-';
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userManagementService: UserManagementService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    const uuidUser = this.route.snapshot.paramMap.get('uuidUser');
    if (!uuidUser) {
      this.errorMessage = this.i18nService.translate('errors.loadUsers');
      return;
    }
    this.loadUser(uuidUser);
  }

  private loadUser(uuidUser: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userManagementService.getUserById(uuidUser).subscribe({
      next: (user) => {
        this.user = user ?? null;
        if (!this.user) {
          this.errorMessage = this.i18nService.translate('users.detailNotFound');
          this.companyName = '-';
          this.isLoading = false;
          return;
        }
        this.companyName = this.user.company?.name ?? this.user.uuid_company ?? '-';
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.loadUsers');
        this.isLoading = false;
      }
    });
  }
}
