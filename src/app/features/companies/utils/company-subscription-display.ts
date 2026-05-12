import { CompanyManagement } from '../models/company-management.model';

export function companyIsArchived(company: CompanyManagement): boolean {
  return !company.is_active;
}

export function companyHasActiveSubscription(company: CompanyManagement): boolean {
  if (!company.is_active) {
    return false;
  }
  if (company.membership_status === 'CANCELLED') {
    return false;
  }
  const renewalMs = company.membership_renewal_at
    ? new Date(company.membership_renewal_at).getTime()
    : null;
  const now = Date.now();
  if (company.membership_status === 'ACTIVE') {
    if (renewalMs === null || Number.isNaN(renewalMs)) {
      return true;
    }
    return renewalMs >= now;
  }
  if (company.membership_status === 'TRIAL') {
    if (renewalMs === null || Number.isNaN(renewalMs)) {
      return true;
    }
    return renewalMs >= now;
  }
  return false;
}

export function companySubscriptionLooksInactive(company: CompanyManagement): boolean {
  return companyIsArchived(company) || !companyHasActiveSubscription(company);
}

export function companyCanEndSubscription(company: CompanyManagement): boolean {
  return company.is_active && companyHasActiveSubscription(company);
}

export function companyCanArchive(company: CompanyManagement): boolean {
  return company.is_active;
}

export function companyCanReactivate(company: CompanyManagement): boolean {
  return !company.is_active;
}
