import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from 'src/app/core/services/session.service';
import { translateUserWriteError } from 'src/app/core/utils/user-write-error.util';
import { normalizeUserRole, normalizeUserRoles, UserRole } from 'src/app/shared/constants/domain.constants';
import { UserFormValue } from 'src/app/shared/components/forms/user-form/user-form.component';
import { I18nService } from 'src/app/core/services/i18n.service';
import { CompanyOption, RanchOption, UserManagementItem, UserManagementPayload } from '../../models/user-management.model';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  readonly normalizeUserRole = normalizeUserRole;

  users: UserManagementItem[] = [];
  companies: CompanyOption[] = [];
  ranches: RanchOption[] = [];
  selectedCompany = '';
  selectedRanch = '';
  isLoading = false;
  errorMessage = '';
  editUser: UserManagementItem | null = null;
  formValue: UserFormValue = this.buildEmptyForm();
  readonly assignableRoles: UserRole[] = ['administrator', 'ranch_staff'];

  constructor(
    private readonly route: ActivatedRoute,
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

  get sessionRoles(): UserRole[] {
    return normalizeUserRoles(this.sessionService.getRoles() as string[]);
  }

  get isSaasOwner(): boolean {
    return this.sessionRoles.includes('saas_owner');
  }

  /** Tenant admins may assign and change ranch roles (aligned with MEMBERSHIP_WRITE). */
  get canManageRanchRoles(): boolean {
    return this.isSaasOwner || this.sessionRoles.includes('administrator');
  }

  get selectedCompanyName(): string {
    return this.companies.find((c) => c.uuid_company === this.selectedCompany)?.name ?? '';
  }

  get selectedRanchName(): string {
    return this.ranches.find((r) => r.uuid_ranch === this.selectedRanch)?.name ?? '';
  }

  get userFormTenantCompanyDisplay(): string {
    if (this.isSaasOwner) {
      return this.selectedCompanyName || this.i18nService.translate('users.tenantCompanyPlaceholder');
    }
    return this.i18nService.translate('users.tenantCompanyReadonly');
  }

  get userFormTenantContextVisible(): boolean {
    if (!this.editUser) {
      return false;
    }
    if (this.isSaasOwner) {
      return this.companies.length > 0 && !!this.selectedCompany;
    }
    return Boolean(this.sessionService.getSession()?.uuid_company);
  }

  get createQueryParams(): Record<string, string> {
    const q: Record<string, string> = {};
    if (this.selectedCompany) {
      q['company'] = this.selectedCompany;
    }
    if (this.selectedRanch) {
      q['ranch'] = this.selectedRanch;
    }
    return q;
  }

  get availabilityCompanyId(): string | null {
    if (this.isSaasOwner) {
      return this.selectedCompany || null;
    }
    return this.sessionService.getSession()?.uuid_company ?? null;
  }

  get availabilityExcludeUserId(): string | null {
    return this.editUser?.uuid_user ?? null;
  }

  openEdit(user: UserManagementItem): void {
    this.editUser = user;
    this.formValue = {
      id_card: user.id_card ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      second_last_name: user.second_last_name ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      username: user.username ?? '',
      role: user.role ?? 'ranch_staff',
      password: ''
    };
  }

  saveUser(value: UserFormValue): void {
    if (!this.editUser) {
      return;
    }

    const payload: UserManagementPayload = {
      id_card: value.id_card,
      first_name: value.first_name,
      last_name: value.last_name,
      second_last_name: value.second_last_name?.trim() || null,
      phone: value.phone?.trim() || null,
      email: value.email,
      username: value.username,
      role: value.role
    };

    if (this.isSaasOwner && this.selectedCompany) {
      payload.uuid_company = this.selectedCompany;
    }
    if (this.isSaasOwner && value.password?.trim()) {
      payload.password = value.password;
    }

    this.userManagementService.updateUser(this.editUser.uuid_user, payload).subscribe({
      next: (user) => {
        this.errorMessage = '';
        this.syncRole(user.uuid_user, value.role, () => {
          this.editUser = null;
          this.formValue = this.buildEmptyForm();
          this.loadUsers();
        }, false);
      },
      error: (err: unknown) => {
        this.errorMessage = translateUserWriteError(this.i18nService, err, 'errors.saveUser');
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
  }

  onCompanyChange(uuidCompany: string): void {
    this.selectedCompany = uuidCompany;
    this.loadRanchAndUsers();
  }

  onRanchChange(uuidRanch: string): void {
    this.selectedRanch = uuidRanch;
    this.loadUsers();
  }

  private loadCompanies(): void {
    this.userManagementService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        const want = this.route.snapshot.queryParamMap.get('company') ?? '';
        this.selectedCompany =
          want && companies.some((c) => c.uuid_company === want) ? want : companies[0]?.uuid_company ?? '';
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
            const roleMap = new Map<string, UserRole>(
              memberships.filter((m) => m.is_active !== false).map((m) => [m.uuid_user, m.role])
            );
            this.users = users
              .filter((user) => roleMap.has(user.uuid_user))
              .map((user) => ({
                ...user,
                role: roleMap.get(user.uuid_user) as UserRole
              }));
            this.isLoading = false;
          },
          error: () => {
            this.users = [];
            this.errorMessage = this.i18nService.translate('errors.loadUsers');
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
      second_last_name: '',
      phone: '',
      email: '',
      username: '',
      role: 'ranch_staff',
      password: ''
    };
  }

  private loadRanchAndUsers(): void {
    this.userManagementService.getRanches(this.isSaasOwner ? this.selectedCompany : undefined).subscribe({
      next: (ranches) => {
        this.ranches = ranches;
        const wantRanch = this.route.snapshot.queryParamMap.get('ranch') ?? '';
        this.selectedRanch =
          wantRanch && ranches.some((r) => r.uuid_ranch === wantRanch) ? wantRanch : ranches[0]?.uuid_ranch ?? '';
        this.loadUsers();
      },
      error: () => {
        this.ranches = [];
        this.selectedRanch = '';
        this.loadUsers();
      }
    });
  }

  private syncRole(uuidUser: string, role: UserRole, onSuccess: () => void, isCreate: boolean): void {
    if (!this.canManageRanchRoles) {
      onSuccess();
      return;
    }

    if (role === 'administrator') {
      this.userManagementService.promoteCompanyAdministrator(uuidUser).subscribe({
        next: () => {
          this.errorMessage = '';
          onSuccess();
        },
        error: () => {
          this.errorMessage = this.i18nService.translate('errors.saveUserRole');
        }
      });
      return;
    }

    if (!this.selectedRanch?.trim()) {
      this.errorMessage = this.i18nService.translate(
        this.ranches.length === 0 ? 'errors.noActiveRanchForStaff' : 'errors.selectRanchForStaff'
      );
      return;
    }

    const assign$ = this.userManagementService.assignMembership(uuidUser, this.selectedRanch, role);
    const request$ = isCreate
      ? assign$
      : this.userManagementService.updateMembershipRole(uuidUser, this.selectedRanch, role).pipe(
          catchError((err: { status?: number }) => {
            if (err?.status === 404) {
              return assign$;
            }
            return throwError(() => err);
          })
        );

    request$.subscribe({
      next: () => {
        this.errorMessage = '';
        onSuccess();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.saveUserRole');
      }
    });
  }
}
