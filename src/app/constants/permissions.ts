export enum Permission {
  COMPANY_READ = 'COMPANY_READ',
  COMPANY_WRITE = 'COMPANY_WRITE',
  USER_READ = 'USER_READ',
  USER_WRITE = 'USER_WRITE',
  RANCH_READ = 'RANCH_READ',
  RANCH_WRITE = 'RANCH_WRITE',
  MEMBERSHIP_READ = 'MEMBERSHIP_READ',
  MEMBERSHIP_WRITE = 'MEMBERSHIP_WRITE',
  CATTLE_READ = 'CATTLE_READ',
  CATTLE_WRITE = 'CATTLE_WRITE',
  CATTLE_WORK_SESSION_READ = 'CATTLE_WORK_SESSION_READ',
  CATTLE_WORK_SESSION_WRITE = 'CATTLE_WORK_SESSION_WRITE',
}

const PERMISSION_ROLE_MAP: Record<Permission, string[]> = {
  [Permission.COMPANY_READ]: ['ADMIN', 'SUPER_ADMIN'],
  [Permission.COMPANY_WRITE]: ['ADMIN', 'SUPER_ADMIN'],
  [Permission.USER_READ]: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  [Permission.USER_WRITE]: ['ADMIN', 'SUPER_ADMIN'],
  [Permission.RANCH_READ]: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  [Permission.RANCH_WRITE]: ['ADMIN', 'SUPER_ADMIN'],
  [Permission.MEMBERSHIP_READ]: ['ADMIN', 'SUPER_ADMIN'],
  [Permission.MEMBERSHIP_WRITE]: ['ADMIN', 'SUPER_ADMIN'],
  [Permission.CATTLE_READ]: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  [Permission.CATTLE_WRITE]: ['ADMIN', 'SUPER_ADMIN'],
  [Permission.CATTLE_WORK_SESSION_READ]: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  [Permission.CATTLE_WORK_SESSION_WRITE]: ['ADMIN', 'SUPER_ADMIN'],
};

export const hasPermission = (roles: string[], permission: Permission): boolean => {
  const allowedRoles = PERMISSION_ROLE_MAP[permission];
  return roles.some((role) => allowedRoles.includes(role));
};
