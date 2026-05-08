import { Component, OnInit } from '@angular/core';
import { CompanyManagement } from '../../models/company-management.model';
import { SaasManagementService } from '../../services/saas-management.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { BillingCycle, CompanyPlanType, MembershipStatus } from 'src/app/shared/constants/domain.constants';

@Component({
  selector: 'app-saas-management',
  templateUrl: './saas-management.component.html',
  styleUrls: ['./saas-management.component.scss']
})
export class SaasManagementComponent implements OnInit {
  companies: CompanyManagement[] = [];
  isLoading = false;
  errorMessage = '';
  companySearch = '';
  companyPage = 1;
  readonly companyPageSize = 8;

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;

  companyForm: Partial<CompanyManagement> = this.buildEmptyCompanyForm();
  initialOwnerForm: { enabled: boolean; username: string; email: string; password: string } = {
    enabled: false,
    username: '',
    email: '',
    password: ''
  };
  showCompanyForm = false;
  companyFormSubmitAttempted = false;
  companyFormTouched: Record<string, boolean> = {};

  constructor(
    private readonly saasManagementService: SaasManagementService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.saasManagementService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.loadCompanies');
        this.isLoading = false;
      }
    });
  }

  saveCompany(): void {
    this.companyFormSubmitAttempted = true;
    if (!this.canSaveCompany) {
      return;
    }

    const payload: Partial<CompanyManagement> = {
      name: this.companyForm.name?.trim(),
      legal_name: this.companyForm.legal_name?.trim() || null,
      tax_id: this.companyForm.tax_id?.trim() || null
    };

    const request$ = this.saasManagementService.createCompany(payload);

    request$.subscribe({
      next: (company) => {
        if (!this.companyForm.uuid_company && this.initialOwnerForm.enabled && this.initialOwnerForm.username && this.initialOwnerForm.password) {
          this.saasManagementService
            .createCompanyUser({
              username: this.initialOwnerForm.username,
              email: this.initialOwnerForm.email,
              password: this.initialOwnerForm.password,
              uuid_company: company.uuid_company
            })
            .subscribe();
        }
        this.resetCompanyForm();
        this.showCompanyForm = false;
        this.loadCompanies();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.saveCompany');
      }
    });
  }

  deactivateCompany(company: CompanyManagement): void {
    this.saasManagementService.deactivateCompany(company.uuid_company).subscribe({
      next: () => {
        this.loadCompanies();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.deactivateCompany');
      }
    });
  }

  get canSaveCompany(): boolean {
    return this.getCompanyFormErrors().length === 0;
  }

  get companyFormErrors(): string[] {
    return this.getCompanyFormErrors();
  }

  markCompanyFieldTouched(field: string): void {
    this.companyFormTouched[field] = true;
  }

  shouldShowCompanyFieldError(field: string): boolean {
    return this.companyFormSubmitAttempted || !!this.companyFormTouched[field];
  }

  isCompanyFieldInvalid(field: string): boolean {
    return this.shouldShowCompanyFieldError(field) && this.getCompanyFieldError(field) !== null;
  }

  getCompanyFieldError(field: string): string | null {
    const errorKey = this.getCompanyFieldErrorKey(field);
    if (!errorKey) {
      return null;
    }
    return this.i18nService.translate(errorKey);
  }

  getPlanLabel(plan: CompanyPlanType | undefined): string {
    if (!plan) {
      return '-';
    }
    return this.i18nService.translate(`saas.planType.${plan.toLowerCase()}`);
  }

  getBillingCycleLabel(cycle: BillingCycle | undefined): string {
    if (!cycle) {
      return '-';
    }
    return this.i18nService.translate(`saas.billingCycle.${cycle.toLowerCase()}`);
  }

  getMembershipStatusLabel(status: MembershipStatus | undefined): string {
    if (!status) {
      return '-';
    }
    return this.i18nService.translate(`saas.membershipStatus.${status.toLowerCase()}`);
  }


  resetCompanyForm(): void {
    this.companyForm = this.buildEmptyCompanyForm();
    this.companyFormSubmitAttempted = false;
    this.companyFormTouched = {};
    this.initialOwnerForm = {
      enabled: false,
      username: '',
      email: '',
      password: ''
    };
  }

  openCreateCompanyForm(): void {
    this.resetCompanyForm();
    this.showCompanyForm = true;
  }

  toggleCreateCompanyForm(): void {
    if (this.showCompanyForm) {
      this.cancelCompanyForm();
      return;
    }
    this.openCreateCompanyForm();
  }

  cancelCompanyForm(): void {
    this.resetCompanyForm();
    this.showCompanyForm = false;
  }

  get filteredCompanies(): CompanyManagement[] {
    const query = this.companySearch.trim().toLowerCase();
    if (!query) {
      return this.companies;
    }
    return this.companies.filter((company) =>
      company.name?.toLowerCase().includes(query) ||
      company.legal_name?.toLowerCase().includes(query) ||
      company.tax_id?.toLowerCase().includes(query)
    );
  }

  get paginatedCompanies(): CompanyManagement[] {
    const start = (this.companyPage - 1) * this.companyPageSize;
    return this.filteredCompanies.slice(start, start + this.companyPageSize);
  }

  get companyTotalPages(): number {
    const pages = Math.ceil(this.filteredCompanies.length / this.companyPageSize);
    return pages > 0 ? pages : 1;
  }

  get companyPageNumbers(): number[] {
    return Array.from({ length: this.companyTotalPages }, (_, index) => index + 1);
  }

  updateCompanySearch(value: string): void {
    this.companySearch = value;
    this.companyPage = 1;
  }

  goToCompanyPage(page: number): void {
    if (page < 1 || page > this.companyTotalPages) {
      return;
    }
    this.companyPage = page;
  }

  private buildEmptyCompanyForm(): Partial<CompanyManagement> {
    return {
      name: '',
      legal_name: '',
      tax_id: '',
      is_active: true
    };
  }

  private getCompanyFormErrors(): string[] {
    const fields = [
      'name',
      'legal_name',
      'tax_id',
      'initial_username',
      'initial_email',
      'initial_password'
    ];

    return fields
      .map((field) => this.getCompanyFieldErrorKey(field))
      .filter((key): key is string => key !== null)
      .map((key) => this.i18nService.translate(key));
  }

  private getCompanyFieldErrorKey(field: string): string | null {
    const name = (this.companyForm.name ?? '').trim();
    const legalName = (this.companyForm.legal_name ?? '').trim();
    const taxId = (this.companyForm.tax_id ?? '').trim();
    const ownerUsername = this.initialOwnerForm.username.trim();
    const ownerEmail = this.initialOwnerForm.email.trim();
    const ownerPassword = this.initialOwnerForm.password.trim();

    switch (field) {
      case 'name':
        return !name ? 'saas.validation.tradeNameRequired' : null;
      case 'legal_name':
        return !legalName ? 'saas.validation.legalNameRequired' : null;
      case 'tax_id':
        return !taxId ? 'saas.validation.taxIdRequired' : null;
      case 'initial_username':
        if (!this.initialOwnerForm.enabled) {
          return null;
        }
        return !ownerUsername ? 'saas.validation.initialUsernameRequired' : null;
      case 'initial_email':
        if (!this.initialOwnerForm.enabled) {
          return null;
        }
        if (!ownerEmail) {
          return 'saas.validation.initialEmailRequired';
        }
        return !this.emailRegex.test(ownerEmail) ? 'saas.validation.initialEmailInvalid' : null;
      case 'initial_password':
        if (!this.initialOwnerForm.enabled) {
          return null;
        }
        if (!ownerPassword) {
          return 'saas.validation.initialPasswordRequired';
        }
        return !this.passwordPolicyRegex.test(ownerPassword) ? 'saas.validation.passwordPolicy' : null;
      default:
        return null;
    }
  }

}
