import { UserRole } from 'src/app/shared/constants/domain.constants';

export interface UserManagementItem {
  uuid_user: string;
  uuid_company: string;
  id_card: string;
  first_name: string;
  last_name: string;
  second_last_name?: string | null;
  email: string;
  username: string;
  role?: UserRole;
  company?: {
    uuid_company: string;
    name: string;
  };
  phone?: string | null;
  is_active: boolean;
}

export interface UserManagementPayload {
  uuid_company?: string;
  id_card: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role?: UserRole;
  password?: string;
}

export interface CompanyOption {
  uuid_company: string;
  name: string;
}

export interface RanchOption {
  uuid_ranch: string;
  uuid_company: string;
  name: string;
}

export interface MembershipItem {
  uuid_user: string;
  uuid_ranch: string;
  role: UserRole;
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
