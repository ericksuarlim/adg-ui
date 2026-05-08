export const USER_ROLES = ['saas_owner', 'administrator', 'supervisor', 'healthcare_staff', 'user'] as const;
export type UserRole = typeof USER_ROLES[number];

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  SUPER_ADMIN: 'saas_owner',
  ADMIN: 'administrator',
  USER: 'user'
};

export const normalizeUserRole = (role: string): UserRole | null => {
  if ((USER_ROLES as readonly string[]).includes(role)) {
    return role as UserRole;
  }

  return LEGACY_ROLE_MAP[role] ?? null;
};

export const normalizeUserRoles = (roles: string[]): UserRole[] =>
  Array.from(
    new Set(
      roles
        .map((role) => normalizeUserRole(role))
        .filter((role): role is UserRole => role !== null)
    )
  );

export const COMPANY_PLAN_TYPES = ['BASIC', 'PROFESSIONAL', 'PREMIUM'] as const;
export type CompanyPlanType = typeof COMPANY_PLAN_TYPES[number];

export const BILLING_CYCLES = ['MONTHLY', 'ANNUAL'] as const;
export type BillingCycle = typeof BILLING_CYCLES[number];

export const MEMBERSHIP_STATUSES = ['TRIAL', 'ACTIVE', 'CANCELLED'] as const;
export type MembershipStatus = typeof MEMBERSHIP_STATUSES[number];

export const PAYMENT_STATUSES = ['POSTED', 'VOIDED'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const PAYMENT_METHODS = ['bank_transfer', 'qr_payment', 'manual_payment'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];
