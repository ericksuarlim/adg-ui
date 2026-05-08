import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BillingCycle,
  BILLING_CYCLES,
  CompanyPlanType,
  COMPANY_PLAN_TYPES,
  PAYMENT_METHODS,
  PaymentMethod
} from 'src/app/shared/constants/domain.constants';
import { ANNUAL_DISCOUNT_PERCENT, PLAN_PRICES_BS } from 'src/app/shared/constants/subscription.constants';
import { I18nService } from 'src/app/core/services/i18n.service';
import { CompanyManagement, CompanyPaidActivationPayload, CompanyPayment } from '../../models/company-management.model';
import { SaasManagementService } from '../../services/saas-management.service';

@Component({
  selector: 'app-company-activation',
  templateUrl: './company-activation.component.html',
  styleUrls: ['./company-activation.component.scss']
})
export class CompanyActivationComponent implements OnInit {
  company: CompanyManagement | null = null;
  payments: CompanyPayment[] = [];
  errorMessage = '';
  isLoading = false;

  readonly planTypes: CompanyPlanType[] = [...COMPANY_PLAN_TYPES];
  readonly billingCycles: BillingCycle[] = [...BILLING_CYCLES];
  readonly paymentMethods: PaymentMethod[] = [...PAYMENT_METHODS];

  paymentForm: CompanyPaidActivationPayload = {
    payment_method: 'bank_transfer',
    payment_reference: '',
    notes: '',
    paid_at: new Date().toISOString().slice(0, 10),
    plan_type: 'BASIC',
    billing_cycle: 'MONTHLY'
  };

  trialForm = {
    trial_start_date: new Date().toISOString().slice(0, 10),
    trial_end_date: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10)
  };

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
    this.loadCompany(uuidCompany);
  }

  get calculatedAmountBs(): number {
    const monthlyPrice = PLAN_PRICES_BS[this.paymentForm.plan_type];
    if (this.paymentForm.billing_cycle === 'ANNUAL') {
      return Number((monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT_PERCENT / 100)).toFixed(2));
    }
    return monthlyPrice;
  }

  get hasActivePaidSubscription(): boolean {
    if (this.company?.membership_status !== 'ACTIVE') {
      return false;
    }
    if (!this.company.membership_renewal_at) {
      return true;
    }
    return new Date(this.company.membership_renewal_at).getTime() >= Date.now();
  }

  createPayment(): void {
    if (!this.company) {
      return;
    }
    this.saasManagementService.createCompanyPayment(this.company.uuid_company, this.paymentForm).subscribe({
      next: () => {
        if (this.company) {
          this.company.membership_status = 'ACTIVE';
          this.company.plan_type = this.paymentForm.plan_type;
          this.company.billing_cycle = this.paymentForm.billing_cycle;
          this.loadPayments(this.company.uuid_company);
        }
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.subscriptionAlreadyActive');
      }
    });
  }

  activateTrial(): void {
    if (!this.company) {
      return;
    }

    this.saasManagementService.activateTrial(this.company.uuid_company, this.trialForm).subscribe({
      next: (company) => {
        this.company = company;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.subscriptionAlreadyActive');
      }
    });
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

  getPaymentMethodLabel(method: PaymentMethod): string {
    return this.i18nService.translate(`saas.paymentMethod.${method}`);
  }

  private loadCompany(uuidCompany: string): void {
    this.isLoading = true;
    this.saasManagementService.getCompanies().subscribe({
      next: (companies) => {
        this.company = companies.find((item) => item.uuid_company === uuidCompany) ?? null;
        if (!this.company) {
          this.errorMessage = this.i18nService.translate('saas.companyNotFound');
          this.isLoading = false;
          return;
        }
        this.paymentForm.plan_type = this.company.plan_type;
        this.paymentForm.billing_cycle = this.company.billing_cycle;
        this.loadPayments(uuidCompany);
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.loadCompanies');
        this.isLoading = false;
      }
    });
  }

  private loadPayments(uuidCompany: string): void {
    this.saasManagementService.getCompanyPayments(uuidCompany).subscribe({
      next: (payments) => {
        this.payments = payments;
        this.isLoading = false;
      },
      error: () => {
        this.payments = [];
        this.isLoading = false;
      }
    });
  }
}
