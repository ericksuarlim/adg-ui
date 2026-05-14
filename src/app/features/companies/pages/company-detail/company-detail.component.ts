import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from 'src/app/core/services/i18n.service';
import { SessionService } from 'src/app/core/services/session.service';
import { translateUserWriteError } from 'src/app/core/utils/user-write-error.util';
import { ConfirmDialogComponent } from 'src/app/shared/components/modals/confirm-dialog/confirm-dialog.component';
import { UserFormValue } from 'src/app/shared/components/forms/user-form/user-form.component';
import { RanchFormValue } from 'src/app/shared/components/forms/ranch-form/ranch-form.component';
import { UserRole } from 'src/app/shared/constants/domain.constants';
import { hasPermission, Permission } from 'src/app/shared/constants/permissions';
import { CompanyManagement, CompanyPayment, CompanyUser, RanchSummary } from '../../models/company-management.model';
import { SaasManagementService } from '../../services/saas-management.service';
import { UserManagementService } from 'src/app/features/users/services/user-management.service';
import { companyCanArchive, companyCanEndSubscription, companyCanReactivate } from '../../utils/company-subscription-display';
import {
  normalizeBillingCycle,
  normalizeCompanyPlanType,
  PLAN_HEAD_LIMIT
} from 'src/app/shared/constants/subscription.constants';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnDestroy {
  company: CompanyManagement | null = null;
  subscriptions: CompanyPayment[] = [];
  users: CompanyUser[] = [];
  ranches: RanchSummary[] = [];
  /** UUID del rancho a resaltar (query `ranch` al venir desde ranch-management). */
  focusedRanchUuid: string | null = null;
  showUserForm = false;
  isSavingUser = false;
  userFormValue: UserFormValue = this.buildEmptyUserForm();
  readonly assignableRoles: UserRole[] = ['administrator', 'ranch_staff'];
  isLoading = false;
  errorMessage = '';

  showRanchForm = false;
  ranchFormMode: 'create' | 'edit' = 'create';
  ranchBeingEdited: RanchSummary | null = null;
  ranchForm: RanchFormValue = { name: '', location: '', area: '' };
  isSavingRanch = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly saasManagementService: SaasManagementService,
    private readonly userManagementService: UserManagementService,
    private readonly i18nService: I18nService,
    private readonly sessionService: SessionService
  ) {}

  get canManageRanches(): boolean {
    return hasPermission(this.sessionService.getRoles(), Permission.RANCH_WRITE);
  }

  get canReadRanches(): boolean {
    return hasPermission(this.sessionService.getRoles(), Permission.RANCH_READ);
  }

  get canManageRanchUsers(): boolean {
    return hasPermission(this.sessionService.getRoles(), Permission.USER_READ);
  }

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
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyRanchFocusFromQuery();
    });
    this.loadCompanyDetail(uuidCompany);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.loadRanches(uuidCompany);
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
        second_last_name: value.second_last_name?.trim() || null,
        phone: value.phone?.trim() || null,
        email: value.email,
        username: value.username,
        password: value.password,
        uuid_company: this.company.uuid_company,
        role: value.role
      })
      .subscribe({
        next: (user) => {
          const finishSuccess = () => {
            this.isSavingUser = false;
            this.errorMessage = '';
            this.cancelCreateUserForm();
            if (this.company) {
              this.loadCompanyUsers(this.company.uuid_company);
            }
          };

          const finishMembershipError = () => {
            this.isSavingUser = false;
            this.errorMessage = this.i18nService.translate('errors.saveUserRole');
          };

          if (value.role === 'administrator') {
            this.userManagementService.promoteCompanyAdministrator(user.uuid_user).subscribe({
              next: () => finishSuccess(),
              error: () => finishMembershipError()
            });
            return;
          }

          if (value.role === 'ranch_staff') {
            const ranchId =
              this.ranches.find((r) => r.is_active !== false)?.uuid_ranch ?? this.ranches[0]?.uuid_ranch;
            if (!ranchId) {
              this.isSavingUser = false;
              this.errorMessage = this.i18nService.translate('errors.noActiveRanchForStaff');
              this.cancelCreateUserForm();
              if (this.company) {
                this.loadCompanyUsers(this.company.uuid_company);
              }
              return;
            }
            this.userManagementService.assignMembership(user.uuid_user, ranchId, value.role).subscribe({
              next: () => finishSuccess(),
              error: () => finishMembershipError()
            });
            return;
          }

          finishSuccess();
        },
        error: (err: unknown) => {
          this.errorMessage = translateUserWriteError(this.i18nService, err, 'errors.createUser');
          this.isSavingUser = false;
        }
      });
  }

  cancelCreateUserForm(): void {
    this.userFormValue = this.buildEmptyUserForm();
    this.showUserForm = false;
  }

  toggleRanchForm(): void {
    if (this.showRanchForm) {
      this.cancelRanchForm();
      return;
    }
    this.openCreateRanchForm();
  }

  openCreateRanchForm(): void {
    this.ranchFormMode = 'create';
    this.ranchBeingEdited = null;
    this.ranchForm = { name: '', location: '', area: '' };
    this.showRanchForm = true;
  }

  openEditRanchForm(ranch: RanchSummary): void {
    this.ranchFormMode = 'edit';
    this.ranchBeingEdited = ranch;
    this.ranchForm = {
      name: ranch.name ?? '',
      location: ranch.location ?? '',
      area: ranch.area ?? ''
    };
    this.showRanchForm = true;
  }

  cancelRanchForm(): void {
    this.showRanchForm = false;
    this.ranchBeingEdited = null;
    this.ranchForm = { name: '', location: '', area: '' };
  }

  saveRanch(value: RanchFormValue): void {
    if (!this.company) {
      return;
    }
    this.isSavingRanch = true;
    const payload = {
      name: value.name.trim(),
      uuid_company: this.company.uuid_company,
      location: value.location.trim() || null,
      area: value.area.trim() || null
    };

    const request$ =
      this.ranchFormMode === 'edit' && this.ranchBeingEdited
        ? this.saasManagementService.updateRanch(this.ranchBeingEdited.uuid_ranch, {
            name: payload.name,
            location: payload.location,
            area: payload.area
          })
        : this.saasManagementService.createRanch(payload);

    request$.subscribe({
      next: () => {
        this.isSavingRanch = false;
        this.errorMessage = '';
        this.cancelRanchForm();
        this.loadRanches(this.company!.uuid_company);
      },
      error: () => {
        this.isSavingRanch = false;
        this.errorMessage = this.i18nService.translate('errors.saveRanch');
      }
    });
  }

  openDeleteRanchModal(ranch: RanchSummary): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent, { centered: true, backdrop: 'static' });
    const dialog = modalRef.componentInstance as ConfirmDialogComponent;
    dialog.titleKey = 'saas.deleteRanch';
    dialog.messageKey = 'saas.deleteRanchConfirm';
    dialog.confirmKey = 'common.confirm';
    dialog.cancelKey = 'common.cancel';
    dialog.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      () => {
        this.saasManagementService.deleteRanch(ranch.uuid_ranch).subscribe({
          next: () => {
            if (this.company) {
              this.loadRanches(this.company.uuid_company);
            }
          },
          error: () => {
            this.errorMessage = this.i18nService.translate('errors.deleteRanch');
          }
        });
      },
      () => undefined
    );
  }

  planTypeI18nSuffix(plan: string | undefined): string {
    if (!plan) {
      return 'essential';
    }
    return normalizeCompanyPlanType(plan).toLowerCase();
  }

  billingCycleI18nSuffix(cycle: string | undefined): string {
    if (!cycle) {
      return 'annual';
    }
    return normalizeBillingCycle(cycle).toLowerCase();
  }

  getAnimalHeadLimit(plan: string | undefined): number {
    return PLAN_HEAD_LIMIT[normalizeCompanyPlanType(plan ?? 'ESSENTIAL')];
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

  private loadRanches(uuidCompany: string): void {
    if (!this.canReadRanches) {
      this.ranches = [];
      this.applyRanchFocusFromQuery();
      return;
    }
    this.saasManagementService.getRanchesByCompany(uuidCompany).subscribe({
      next: (list) => {
        this.ranches = list;
        this.applyRanchFocusFromQuery();
      },
      error: () => {
        this.ranches = [];
        this.errorMessage = this.i18nService.translate('errors.loadRanches');
        this.applyRanchFocusFromQuery();
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

  private applyRanchFocusFromQuery(): void {
    const ranchId = this.route.snapshot.queryParamMap.get('ranch');
    if (!ranchId || !this.ranches.some((r) => r.uuid_ranch === ranchId)) {
      this.focusedRanchUuid = null;
      return;
    }
    this.focusedRanchUuid = ranchId;
    setTimeout(() => {
      document.getElementById(`ranch-row-${ranchId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  }

  private buildEmptyUserForm(): UserFormValue {
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
}
