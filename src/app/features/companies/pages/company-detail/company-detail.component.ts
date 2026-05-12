import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from 'src/app/core/services/i18n.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/modals/confirm-dialog/confirm-dialog.component';
import { UserFormValue } from 'src/app/shared/components/forms/user-form/user-form.component';
import { UserRole } from 'src/app/shared/constants/domain.constants';
import { CompanyManagement, CompanyPayment, CompanyUser } from '../../models/company-management.model';
import { SaasManagementService } from '../../services/saas-management.service';
import { companyCanArchive, companyCanEndSubscription, companyCanReactivate } from '../../utils/company-subscription-display';

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
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly saasManagementService: SaasManagementService,
    private readonly i18nService: I18nService
  ) {}

  get canEndSubscriptionOnDetail(): boolean {
    return this.company ? companyCanEndSubscription(this.company) : false;
  }

  get canArchiveCompanyOnDetail(): boolean {
    return this.company ? companyCanArchive(this.company) : false;
  }

  get canReactivateCompanyOnDetail(): boolean {
    return this.company ? companyCanReactivate(this.company) : false;
  }

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

  openReactivateCompanyModal(): void {
    if (!this.company) {
      return;
    }
    const uuidCompany = this.company.uuid_company;
    const modalRef = this.modalService.open(ConfirmDialogComponent, { centered: true, backdrop: 'static' });
    const dialog = modalRef.componentInstance as ConfirmDialogComponent;
    dialog.titleKey = 'saas.reactivateCompany';
    dialog.messageKey = 'saas.reactivateCompanyConfirm';
    dialog.confirmKey = 'common.confirm';
    dialog.cancelKey = 'common.cancel';
    dialog.confirmButtonClass = 'btn-success';

    modalRef.result.then(
      () => {
        this.saasManagementService.reactivateCompany(uuidCompany).subscribe({
          next: () => {
            this.loadCompanyDetail(uuidCompany);
          },
          error: () => {
            this.errorMessage = this.i18nService.translate('errors.reactivateCompany');
          }
        });
      },
      () => undefined
    );
  }

  openArchiveCompanyModal(): void {
    if (!this.company) {
      return;
    }
    const uuidCompany = this.company.uuid_company;
    const modalRef = this.modalService.open(ConfirmDialogComponent, { centered: true, backdrop: 'static' });
    const dialog = modalRef.componentInstance as ConfirmDialogComponent;
    dialog.titleKey = 'saas.archiveCompany';
    dialog.messageKey = 'saas.archiveCompanyConfirm';
    dialog.confirmKey = 'common.confirm';
    dialog.cancelKey = 'common.cancel';
    dialog.confirmButtonClass = 'btn-dark';

    modalRef.result.then(
      () => {
        this.saasManagementService.deactivateCompany(uuidCompany).subscribe({
          next: () => {
            this.router.navigateByUrl('/saas-management');
          },
          error: () => {
            this.errorMessage = this.i18nService.translate('errors.deactivateCompany');
          }
        });
      },
      () => undefined
    );
  }

  openEndSubscriptionModal(): void {
    if (!this.company) {
      return;
    }
    const uuidCompany = this.company.uuid_company;
    const modalRef = this.modalService.open(ConfirmDialogComponent, { centered: true, backdrop: 'static' });
    const dialog = modalRef.componentInstance as ConfirmDialogComponent;
    dialog.titleKey = 'saas.endSubscription';
    dialog.messageKey = 'saas.endSubscriptionConfirm';
    dialog.confirmKey = 'common.confirm';
    dialog.cancelKey = 'common.cancel';
    dialog.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      () => {
        this.saasManagementService.endCompanySubscription(uuidCompany).subscribe({
          next: (updated) => {
            this.company = updated;
            this.loadSubscriptionHistory(uuidCompany);
          },
          error: () => {
            this.errorMessage = this.i18nService.translate('errors.endSubscription');
          }
        });
      },
      () => undefined
    );
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
