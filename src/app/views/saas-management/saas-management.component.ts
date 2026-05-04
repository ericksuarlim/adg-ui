import { Component, OnInit } from '@angular/core';
import {
  BillingCycle,
  CompanyManagement,
  CompanyPayment,
  CompanyUser,
  MembershipStatus,
  PlanType
} from 'src/app/models/company-management.model';
import { SaasManagementService } from 'src/app/services/saas-management.service';

@Component({
  selector: 'app-saas-management',
  templateUrl: './saas-management.component.html',
  styleUrls: ['./saas-management.component.css']
})
export class SaasManagementComponent implements OnInit {
  companies: CompanyManagement[] = [];
  users: CompanyUser[] = [];
  payments: CompanyPayment[] = [];
  selectedCompany: CompanyManagement | null = null;
  isLoading = false;
  errorMessage = '';
  supportModeEnabled = false;

  readonly planTypes: PlanType[] = ['BASIC', 'PROFESSIONAL', 'PREMIUM'];
  readonly billingCycles: BillingCycle[] = ['MONTHLY', 'ANNUAL'];
  readonly membershipStatuses: MembershipStatus[] = ['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED'];

  companyForm: Partial<CompanyManagement> = this.buildEmptyCompanyForm();
  userForm: { username: string; email: string; password: string } = { username: '', email: '', password: '' };
  initialOwnerForm: { enabled: boolean; username: string; email: string; password: string } = {
    enabled: false,
    username: '',
    email: '',
    password: ''
  };
  paymentForm: Partial<CompanyPayment> = {
    amount: 0,
    currency: 'USD',
    payment_method: 'BANK_TRANSFER',
    payment_reference: '',
    notes: '',
    paid_at: new Date().toISOString().slice(0, 10),
    plan_type: 'BASIC',
    billing_cycle: 'MONTHLY',
    status: 'POSTED'
  };

  constructor(private readonly saasManagementService: SaasManagementService) {}

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
        this.errorMessage = 'No se pudieron cargar las companias.';
        this.isLoading = false;
      }
    });
  }

  selectCompany(company: CompanyManagement): void {
    this.selectedCompany = company;
    this.companyForm = { ...company };
    this.loadUsers(company.uuid_company);
    this.loadPayments(company.uuid_company);
  }

  saveCompany(): void {
    const request$ = this.companyForm.uuid_company
      ? this.saasManagementService.updateCompany(this.companyForm.uuid_company, this.companyForm)
      : this.saasManagementService.createCompany(this.companyForm);

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
        this.loadCompanies();
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar la compania.';
      }
    });
  }

  deactivateCompany(company: CompanyManagement): void {
    this.saasManagementService.deactivateCompany(company.uuid_company).subscribe({
      next: () => {
        if (this.selectedCompany?.uuid_company === company.uuid_company) {
          this.selectedCompany = null;
          this.users = [];
          this.payments = [];
        }
        this.loadCompanies();
      },
      error: () => {
        this.errorMessage = 'No se pudo dar de baja la compania.';
      }
    });
  }

  loadUsers(uuidCompany: string): void {
    this.saasManagementService.getCompanyUsers(uuidCompany).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.users = [];
      }
    });
  }

  createUser(): void {
    if (!this.selectedCompany) {
      return;
    }

    this.saasManagementService
      .createCompanyUser({
        username: this.userForm.username,
        email: this.userForm.email,
        password: this.userForm.password,
        uuid_company: this.selectedCompany.uuid_company
      })
      .subscribe({
        next: () => {
          this.userForm = { username: '', email: '', password: '' };
          this.loadUsers(this.selectedCompany!.uuid_company);
        },
        error: () => {
          this.errorMessage = 'No se pudo crear el usuario.';
        }
      });
  }

  deactivateUser(user: CompanyUser): void {
    if (!this.selectedCompany) {
      return;
    }
    this.saasManagementService.deactivateCompanyUser(user.uuid_user).subscribe({
      next: () => this.loadUsers(this.selectedCompany!.uuid_company),
      error: () => {
        this.errorMessage = 'No se pudo desactivar el usuario.';
      }
    });
  }

  loadPayments(uuidCompany: string): void {
    this.saasManagementService.getCompanyPayments(uuidCompany).subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: () => {
        this.payments = [];
      }
    });
  }

  createPayment(): void {
    if (!this.selectedCompany) {
      return;
    }
    this.saasManagementService.createCompanyPayment(this.selectedCompany.uuid_company, this.paymentForm).subscribe({
      next: () => {
        this.loadPayments(this.selectedCompany!.uuid_company);
      },
      error: () => {
        this.errorMessage = 'No se pudo registrar el pago manual.';
      }
    });
  }

  voidPayment(payment: CompanyPayment): void {
    if (!this.selectedCompany) {
      return;
    }
    this.saasManagementService
      .voidCompanyPayment(this.selectedCompany.uuid_company, payment.uuid_company_payment)
      .subscribe({
        next: () => this.loadPayments(this.selectedCompany!.uuid_company),
        error: () => {
          this.errorMessage = 'No se pudo anular el pago.';
        }
      });
  }

  resetCompanyForm(): void {
    this.companyForm = this.buildEmptyCompanyForm();
    this.initialOwnerForm = {
      enabled: false,
      username: '',
      email: '',
      password: ''
    };
  }

  private buildEmptyCompanyForm(): Partial<CompanyManagement> {
    return {
      name: '',
      legal_name: '',
      tax_id: '',
      plan_type: 'BASIC',
      billing_cycle: 'MONTHLY',
      membership_status: 'TRIAL',
      membership_started_at: new Date().toISOString().slice(0, 10),
      membership_renewal_at: null,
      is_active: true
    };
  }
}
