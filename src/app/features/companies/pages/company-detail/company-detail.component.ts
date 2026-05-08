import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from 'src/app/core/services/i18n.service';
import { UserFormValue } from 'src/app/shared/components/forms/user-form/user-form.component';
import { UserRole } from 'src/app/shared/constants/domain.constants';
import { CompanyManagement, CompanyPayment, CompanyUser } from '../../models/company-management.model';
import { SaasManagementService } from '../../services/saas-management.service';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {
  company: CompanyManagement | null = null;
  subscriptions: CompanyPayment[] = [];
  users: CompanyUser[] = [];
  showUserForm = false;
  isSavingUser = false;
  userFormValue: UserFormValue = this.buildEmptyUserForm();
  readonly assignableRoles: UserRole[] = ['administrator', 'supervisor', 'healthcare_staff', 'user'];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly saasManagementService: SaasManagementService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    const uuidCompany = this.route.snapshot.paramMap.get('uuidCompany');
    if (!uuidCompany) {
      this.errorMessage = this.i18nService.translate('errors.loadCompanies');
      return;
    }
    this.loadCompanyDetail(uuidCompany);
  }

  private loadCompanyDetail(uuidCompany: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.saasManagementService.getCompanies().subscribe({
      next: (companies) => {
        this.company = companies.find((item) => item.uuid_company === uuidCompany) ?? null;
        if (!this.company) {
          this.errorMessage = this.i18nService.translate('saas.companyNotFound');
          this.isLoading = false;
          return;
        }

        this.loadCompanyUsers(uuidCompany);
        this.loadSubscriptionHistory(uuidCompany);
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.loadCompanies');
        this.isLoading = false;
      }
    });
  }

  toggleCreateUserForm(): void {
    if (this.showUserForm) {
      this.cancelCreateUserForm();
      return;
    }
    this.userFormValue = this.buildEmptyUserForm();
    this.showUserForm = true;
  }

  saveCompanyUser(value: UserFormValue): void {
    if (!this.company) {
      return;
    }
    this.isSavingUser = true;
    this.saasManagementService
      .createCompanyUser({
        id_card: value.id_card,
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email,
        username: value.username,
        password: value.password,
        uuid_company: this.company.uuid_company,
        role: value.role
      })
      .subscribe({
        next: () => {
          this.isSavingUser = false;
          this.cancelCreateUserForm();
          if (this.company) {
            this.loadCompanyUsers(this.company.uuid_company);
          }
        },
        error: () => {
          this.errorMessage = this.i18nService.translate('errors.createUser');
          this.isSavingUser = false;
        }
      });
  }

  cancelCreateUserForm(): void {
    this.userFormValue = this.buildEmptyUserForm();
    this.showUserForm = false;
  }

  private loadCompanyUsers(uuidCompany: string): void {
    this.saasManagementService.getCompanyUsers(uuidCompany).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.users = [];
      }
    });
  }

  private loadSubscriptionHistory(uuidCompany: string): void {
    this.saasManagementService.getCompanyPayments(uuidCompany).subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions;
        this.isLoading = false;
      },
      error: () => {
        this.subscriptions = [];
        this.isLoading = false;
      }
    });
  }

  private buildEmptyUserForm(): UserFormValue {
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
}
