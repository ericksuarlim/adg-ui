import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from 'src/app/core/services/i18n.service';
import { SessionService } from 'src/app/core/services/session.service';
import { translateUserWriteError } from 'src/app/core/utils/user-write-error.util';
import { UserFormValue } from 'src/app/shared/components/forms/user-form/user-form.component';
import { normalizeUserRoles, UserRole } from 'src/app/shared/constants/domain.constants';
import { CompanyOption, RanchOption, UserManagementPayload } from '../../models/user-management.model';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit {
  companies: CompanyOption[] = [];
  ranches: RanchOption[] = [];
  selectedCompany = '';
  selectedRanch = '';
  errorMessage = '';
  formValue: UserFormValue = this.buildEmptyForm();
  readonly assignableRoles: UserRole[] = ['administrator', 'ranch_staff'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
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
    if (this.isSaasOwner) {
      return this.companies.length > 0 && !!this.selectedCompany;
    }
    return Boolean(this.sessionService.getSession()?.uuid_company);
  }

  get availabilityCompanyId(): string | null {
    if (this.isSaasOwner) {
      return this.selectedCompany || null;
    }
    return this.sessionService.getSession()?.uuid_company ?? null;
  }

  get backQueryParams(): Record<string, string> {
    const q: Record<string, string> = {};
    if (this.selectedCompany) {
      q['company'] = this.selectedCompany;
    }
    if (this.selectedRanch) {
      q['ranch'] = this.selectedRanch;
    }
    return q;
  }

  onCompanyChange(uuidCompany: string): void {
    this.selectedCompany = uuidCompany;
    this.loadRanchAndUsers();
  }

  onRanchChange(uuidRanch: string): void {
    this.selectedRanch = uuidRanch;
  }

  saveUser(value: UserFormValue): void {
    if (value.role === 'administrator' && this.ranches.length === 0) {
      this.errorMessage = this.i18nService.translate('errors.noActiveRanchForStaff');
      return;
    }
    if (value.role === 'ranch_staff' && !this.selectedRanch?.trim()) {
      this.errorMessage = this.i18nService.translate(
        this.ranches.length === 0 ? 'errors.noActiveRanchForStaff' : 'errors.selectRanchForStaff'
      );
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
      password: value.password,
      role: value.role
    };
    if (this.isSaasOwner && this.selectedCompany) {
      payload.uuid_company = this.selectedCompany;
    }

    this.userManagementService.createUser(payload).subscribe({
      next: (user) => {
        this.errorMessage = '';
        this.syncRole(user.uuid_user, value.role, () => {
          this.router.navigate(['/user-management'], { queryParams: this.backQueryParams });
        });
      },
      error: (err: unknown) => {
        this.errorMessage = translateUserWriteError(this.i18nService, err, 'errors.saveUser');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/user-management'], { queryParams: this.backQueryParams });
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

  private loadRanchAndUsers(): void {
    this.userManagementService.getRanches(this.isSaasOwner ? this.selectedCompany : undefined).subscribe({
      next: (ranches) => {
        this.ranches = ranches;
        const wantRanch = this.route.snapshot.queryParamMap.get('ranch') ?? '';
        this.selectedRanch =
          wantRanch && ranches.some((r) => r.uuid_ranch === wantRanch) ? wantRanch : ranches[0]?.uuid_ranch ?? '';
      },
      error: () => {
        this.ranches = [];
        this.selectedRanch = '';
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

  private syncRole(uuidUser: string, role: UserRole, onSuccess: () => void): void {
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

    this.userManagementService.assignMembership(uuidUser, this.selectedRanch, role).subscribe({
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
