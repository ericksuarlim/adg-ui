import { Component, Input } from '@angular/core';
import { CompanyPayment } from '../../models/company-management.model';
import { normalizeCompanyPlanType } from 'src/app/shared/constants/subscription.constants';

@Component({
  selector: 'app-company-subscription-list',
  templateUrl: './company-subscription-list.component.html',
  styleUrls: ['./company-subscription-list.component.scss']
})
export class CompanySubscriptionListComponent {
  @Input() subscriptions: CompanyPayment[] = [];

  planTypeI18nSuffix(plan: string | undefined): string {
    if (!plan) {
      return 'essential';
    }
    return normalizeCompanyPlanType(plan).toLowerCase();
  }
}
