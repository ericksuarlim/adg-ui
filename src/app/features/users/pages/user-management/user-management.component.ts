import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/core/services/session.service';
import { UserRole } from 'src/app/shared/constants/domain.constants';
import { UserFormValue } from 'src/app/shared/components/forms/user-form/user-form.component';
import { I18nService } from 'src/app/core/services/i18n.service';
import { CompanyOption, UserManagementItem, UserManagementPayload } from '../../models/user-management.model';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: UserManagementItem[] = [];
  companies: CompanyOption[] = [];
  selectedCompany = '';
  selectedRanch = '';
  isLoading = false;
  errorMessage = '';
  showUserForm = false;

  editUser: UserManagementItem | null = null;
  formValue: UserFormValue = this.buildEmptyForm();
  readonly assignableRoles: UserRole[] = ['administrator', 'supervisor', 'healthcare_staff', 'user'];

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly sessionService: SessionService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    if (this.isSaasOwner) {
      this.loadCompanies();
      return;
    }

    this.loadRanchAndUsers();
  }

  get isSaasOwner(): boolean {
    return this.sessionService.getRoles().includes('saas_owner' as UserRole);
  }

  openCreate(): void {
    this.editUser = null;
    this.formValue = this.buildEmptyForm();
    this.showUserForm = true;
  }

  toggleCreateForm(): void {
    if (this.showUserForm) {
      this.cancelForm();
      return;
    }
    this.openCreate();
  }

  openEdit(user: UserManagementItem): void {
    this.editUser = user;
    this.formValue = {
      id_card: user.id_card ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      username: user.username ?? '',
      role: user.role ?? 'user',
      password: ''
    };
    this.showUserForm = true;
  }

  saveUser(value: UserFormValue): void {
    const payload: UserManagementPayload = {
      id_card: value.id_card,
      first_name: value.first_name,
      last_name: value.last_name,
      email: value.email,
      username: value.username
    };
    payload.role = value.role;

    if (!this.editUser) {
      payload.password = value.password;
      if (this.isSaasOwner && this.selectedCompany) {
        payload.uuid_company = this.selectedCompany;
      }
    } else if (this.isSaasOwner && this.selectedCompany) {
      payload.uuid_company = this.selectedCompany;
    }

    const request$ = this.editUser
      ? this.userManagementService.updateUser(this.editUser.uuid_user, payload)
      : this.userManagementService.createUser(payload);

    request$.subscribe({
      next: (user) => {
        this.syncRole(user.uuid_user, value.role, () => {
          this.editUser = null;
          this.formValue = this.buildEmptyForm();
          this.showUserForm = false;
          this.loadUsers();
        });
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.saveUser');
      }
    });
  }

  deactivateUser(user: UserManagementItem): void {
    this.userManagementService.deactivateUser(user.uuid_user).subscribe({
      next: () => this.loadUsers(),
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.deactivateUser');
      }
    });
  }

  cancelForm(): void {
    this.editUser = null;
    this.formValue = this.buildEmptyForm();
    this.showUserForm = false;
  }

  onCompanyChange(uuidCompany: string): void {
    this.selectedCompany = uuidCompany;
    this.loadRanchAndUsers();
  }

  private loadCompanies(): void {
    this.userManagementService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.selectedCompany = companies[0]?.uuid_company ?? '';
        this.loadRanchAndUsers();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.loadCompanies');
      }
    });
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.userManagementService.getUsers(this.isSaasOwner ? this.selectedCompany : undefined).subscribe({
      next: (users) => {
        if (!this.selectedRanch) {
          this.users = users;
          this.isLoading = false;
          return;
        }

        this.userManagementService.getMembershipsByRanch(this.selectedRanch).subscribe({
          next: (memberships) => {
            const roleMap = new Map<string, UserRole>(memberships.map((m) => [m.uuid_user, m.role]));
            this.users = users.map((user) => ({ ...user, role: roleMap.get(user.uuid_user) ?? 'user' }));
            this.isLoading = false;
          },
          error: () => {
            this.users = users;
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.users = [];
        this.errorMessage = this.i18nService.translate('errors.loadUsers');
        this.isLoading = false;
      }
    });
  }

  private buildEmptyForm(): UserFormValue {
    return {
      id_card: '',
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      role: 'user',
      password: ''
    };
  }

  private loadRanchAndUsers(): void {
    this.userManagementService.getRanches(this.isSaasOwner ? this.selectedCompany : undefined).subscribe({
      next: (ranches) => {
        this.selectedRanch = ranches[0]?.uuid_ranch ?? '';
        this.loadUsers();
      },
      error: () => {
        this.selectedRanch = '';
        this.loadUsers();
      }
    });
  }

  private syncRole(uuidUser: string, role: UserRole, onSuccess: () => void): void {
    if (!this.isSaasOwner || !this.selectedRanch) {
      onSuccess();
      return;
    }

    const currentMembership = this.users.find((user) => user.uuid_user === uuidUser)?.role;
    const request$ = currentMembership
      ? this.userManagementService.updateMembershipRole(uuidUser, this.selectedRanch, role)
      : this.userManagementService.assignMembership(uuidUser, this.selectedRanch, role);

    request$.subscribe({
      next: () => onSuccess(),
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.saveUserRole');
      }
    });
  }
}
