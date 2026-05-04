export type PlanType = 'BASIC' | 'PROFESSIONAL' | 'PREMIUM';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
export type MembershipStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
export type PaymentStatus = 'POSTED' | 'VOIDED';

export interface CompanyManagement {
  uuid_company: string;
  name: string;
  legal_name?: string | null;
  tax_id?: string | null;
  plan_type: PlanType;
  billing_cycle: BillingCycle;
  membership_status: MembershipStatus;
  membership_started_at?: string | null;
  membership_renewal_at?: string | null;
  is_active: boolean;
}

export interface CompanyUser {
  uuid_user: string;
  username: string;
  email?: string | null;
  uuid_company: string;
  is_active: boolean;
}

export interface CompanyPayment {
  uuid_company_payment: string;
  uuid_company: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference?: string | null;
  notes?: string | null;
  paid_at: string;
  period_start?: string | null;
  period_end?: string | null;
  plan_type: PlanType;
  billing_cycle: BillingCycle;
  status: PaymentStatus;
  is_active: boolean;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}
