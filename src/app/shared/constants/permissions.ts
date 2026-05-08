import { UserRole } from './domain.constants';

export enum Permission {
  COMPANY_READ = 'COMPANY_READ',
  COMPANY_WRITE = 'COMPANY_WRITE',
  USER_READ = 'USER_READ',
  USER_WRITE = 'USER_WRITE',
  RANCH_READ = 'RANCH_READ',
  RANCH_WRITE = 'RANCH_WRITE',
  MEMBERSHIP_READ = 'MEMBERSHIP_READ',
  MEMBERSHIP_WRITE = 'MEMBERSHIP_WRITE',
  ANIMAL_READ = 'ANIMAL_READ',
  ANIMAL_WRITE = 'ANIMAL_WRITE',
  ANIMAL_WORK_SESSION_READ = 'ANIMAL_WORK_SESSION_READ',
  ANIMAL_WORK_SESSION_WRITE = 'ANIMAL_WORK_SESSION_WRITE',
}

const PERMISSION_ROLE_MAP: Record<Permission, UserRole[]> = {
  [Permission.COMPANY_READ]: ['saas_owner'],
  [Permission.COMPANY_WRITE]: ['saas_owner'],
  [Permission.USER_READ]: ['administrator', 'saas_owner'],
  [Permission.USER_WRITE]: ['administrator', 'saas_owner'],
  [Permission.RANCH_READ]: ['user', 'healthcare_staff', 'supervisor', 'administrator', 'saas_owner'],
  [Permission.RANCH_WRITE]: ['supervisor', 'administrator', 'saas_owner'],
  [Permission.MEMBERSHIP_READ]: ['administrator', 'saas_owner'],
  [Permission.MEMBERSHIP_WRITE]: ['saas_owner'],
  [Permission.ANIMAL_READ]: ['user', 'healthcare_staff', 'supervisor', 'administrator', 'saas_owner'],
  [Permission.ANIMAL_WRITE]: ['healthcare_staff', 'supervisor', 'administrator', 'saas_owner'],
  [Permission.ANIMAL_WORK_SESSION_READ]: ['user', 'healthcare_staff', 'supervisor', 'administrator', 'saas_owner'],
  [Permission.ANIMAL_WORK_SESSION_WRITE]: ['healthcare_staff', 'supervisor', 'administrator', 'saas_owner'],
};

export const hasPermission = (roles: UserRole[], permission: Permission): boolean => {
  const allowedRoles = PERMISSION_ROLE_MAP[permission];
  return roles.some((role) => allowedRoles.includes(role));
};
