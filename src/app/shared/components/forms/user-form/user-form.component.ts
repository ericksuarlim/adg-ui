import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { I18nService } from 'src/app/core/services/i18n.service';
import { UserFieldAvailabilityService } from 'src/app/core/services/user-field-availability.service';
import { UserRole } from 'src/app/shared/constants/domain.constants';

export interface UserFormValue {
  id_card: string;
  first_name: string;
  last_name: string;
  second_last_name: string;
  phone: string;
  email: string;
  username: string;
  role: UserRole;
  password: string;
}

export interface UserFormTenantCompany {
  uuid_company: string;
  name: string;
}

export interface UserFormTenantRanch {
  uuid_ranch: string;
  name: string;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() submitLabelKey = 'common.save';
  @Input() cancelLabelKey = 'common.clear';
  @Input() loading = false;
  @Input() showPassword = true;
  @Input() roleDisabled = false;
  @Input() availableRoles: UserRole[] = ['administrator', 'ranch_staff'];
  /** Company display name used to build username suggestion (name+lastInitial.companySlug). */
  @Input() companyNameHint = '';
  /** When set, id_card / email / username are checked against the API on blur. */
  @Input() availabilityUuidCompany: string | null = null;
  /** When editing, exclude this user from uniqueness checks. */
  @Input() availabilityExcludeUserUuid: string | null = null;
  @Input() value: UserFormValue = this.buildEmptyValue();

  /** Muestra compañía y rancho de contexto (gestión de usuarios por rancho). */
  @Input() showTenantContext = false;
  @Input() tenantCompanyName = '';
  @Input() tenantRanchName = '';
  /** SaaS: puede cambiar compañía. */
  @Input() canChangeTenantCompany = false;
  /** SaaS o administrador: puede cambiar rancho si hay lista. */
  @Input() canChangeTenantRanch = false;
  @Input() tenantCompanies: UserFormTenantCompany[] = [];
  @Input() tenantRanches: UserFormTenantRanch[] = [];
  @Input() selectedTenantCompanyUuid = '';
  @Input() selectedTenantRanchUuid = '';

  @Output() readonly submitForm = new EventEmitter<UserFormValue>();
  @Output() readonly cancelForm = new EventEmitter<void>();
  @Output() readonly tenantCompanyChange = new EventEmitter<string>();
  @Output() readonly tenantRanchChange = new EventEmitter<string>();

  passwordConfirm = '';
  passwordPlainVisible = false;
  touched: Record<string, boolean> = {};
  submitAttempted = false;
  /** i18n keys for remote uniqueness (errors.emailInUse, etc.). */
  private remoteUniqueness: Partial<Record<'id_card' | 'email' | 'username', string>> = {};
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;

  constructor(
    private readonly i18nService: I18nService,
    private readonly userFieldAvailability: UserFieldAvailabilityService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']?.currentValue && !changes['value'].currentValue.password) {
      this.passwordConfirm = '';
    }
    if (changes['value']?.currentValue) {
      const v = changes['value'].currentValue as UserFormValue;
      if (!v.id_card?.trim() && !v.email?.trim() && !v.username?.trim()) {
        this.remoteUniqueness = {};
      }
    }
    if (changes['availabilityUuidCompany'] || changes['availabilityExcludeUserUuid']) {
      this.remoteUniqueness = {};
    }
  }

  onTenantCompanySelect(uuid: string): void {
    this.tenantCompanyChange.emit(uuid);
  }

  onTenantRanchSelect(uuid: string): void {
    this.tenantRanchChange.emit(uuid);
  }

  onSubmit(): void {
    this.submitAttempted = true;
    if (!this.isValid) {
      return;
    }

    this.submitForm.emit({ ...this.value });
  }

  onCancel(): void {
    this.passwordConfirm = '';
    this.submitAttempted = false;
    this.passwordPlainVisible = false;
    this.remoteUniqueness = {};
    this.cancelForm.emit();
  }

  markTouched(field: string): void {
    this.touched[field] = true;
  }

  onAvailabilityBlur(field: 'id_card' | 'email' | 'username'): void {
    if (!this.availabilityUuidCompany) {
      delete this.remoteUniqueness[field];
      return;
    }

    const intrinsic = this.getIntrinsicFieldError(field);
    if (intrinsic !== null) {
      delete this.remoteUniqueness[field];
      return;
    }

    const params: {
      uuid_company: string;
      exclude_uuid_user?: string;
      email?: string;
      username?: string;
      id_card?: string;
    } = {
      uuid_company: this.availabilityUuidCompany
    };
    if (this.availabilityExcludeUserUuid) {
      params.exclude_uuid_user = this.availabilityExcludeUserUuid;
    }
    if (field === 'id_card') {
      params.id_card = this.value.id_card.trim();
    }
    if (field === 'email') {
      params.email = this.value.email.trim();
    }
    if (field === 'username') {
      params.username = this.value.username.trim();
    }

    this.userFieldAvailability.check(params).subscribe({
      next: (result) => {
        const taken =
          field === 'id_card'
            ? !result.idCardAvailable
            : field === 'email'
              ? !result.emailAvailable
              : !result.usernameAvailable;
        if (taken) {
          this.remoteUniqueness[field] =
            field === 'id_card'
              ? 'errors.idCardInUse'
              : field === 'email'
                ? 'errors.emailInUse'
                : 'errors.usernameInUse';
        } else {
          delete this.remoteUniqueness[field];
        }
      },
      error: () => {
        delete this.remoteUniqueness[field];
      }
    });
  }

  fieldInvalid(field: string): boolean {
    return (this.submitAttempted || !!this.touched[field]) && this.getCombinedFieldError(field) !== null;
  }

  fieldError(field: string): string | null {
    const key = this.getCombinedFieldError(field);
    return key ? this.i18nService.translate(key) : null;
  }

  get isValid(): boolean {
    const fields = ['id_card', 'first_name', 'last_name', 'email', 'username', 'role'];
    if (this.showPassword) {
      fields.push('password', 'passwordConfirm');
    }

    return fields.every((field) => this.getCombinedFieldError(field) === null);
  }

  get submitDisabled(): boolean {
    return this.loading || !this.isValid;
  }

  get passwordHasLower(): boolean {
    return /[a-z]/.test(this.value.password);
  }

  get passwordHasUpper(): boolean {
    return /[A-Z]/.test(this.value.password);
  }

  get passwordHasDigit(): boolean {
    return /\d/.test(this.value.password);
  }

  get passwordHasMinLength(): boolean {
    return this.value.password.length >= 9;
  }

  get canSuggestUsername(): boolean {
    return Boolean(this.slugPart(this.value.first_name) && this.firstLetterLastName());
  }

  get suggestedUsernamePreview(): string {
    return this.buildSuggestedUsername();
  }

  applySuggestedUsername(): void {
    const suggestion = this.buildSuggestedUsername();
    if (suggestion) {
      this.value.username = suggestion;
      this.markTouched('username');
      setTimeout(() => this.onAvailabilityBlur('username'));
    }
  }

  private buildSuggestedUsername(): string {
    const first = this.slugPart(this.value.first_name);
    const initial = this.firstLetterLastName();
    const company = this.slugPart(this.companyNameHint);
    if (!first || !initial) {
      return '';
    }
    if (company) {
      return `${first}${initial}.${company}`;
    }
    return `${first}${initial}`;
  }

  private firstLetterLastName(): string {
    const slug = this.slugPart(this.value.last_name);
    return slug ? slug.charAt(0) : '';
  }

  private slugPart(text: string): string {
    const raw = (text ?? '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return raw.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  private getCombinedFieldError(field: string): string | null {
    const intrinsic = this.getIntrinsicFieldError(field);
    if (intrinsic !== null) {
      return intrinsic;
    }
    if (field === 'id_card' || field === 'email' || field === 'username') {
      return this.remoteUniqueness[field] ?? null;
    }
    return null;
  }

  private getIntrinsicFieldError(field: string): string | null {
    switch (field) {
      case 'id_card':
        return this.value.id_card.trim() ? null : 'userForm.idCardRequired';
      case 'first_name':
        return this.value.first_name.trim() ? null : 'userForm.firstNameRequired';
      case 'last_name':
        return this.value.last_name.trim() ? null : 'userForm.lastNameRequired';
      case 'second_last_name':
        return null;
      case 'phone':
        return null;
      case 'email':
        if (!this.value.email.trim()) {
          return 'userForm.emailRequired';
        }
        return this.emailRegex.test(this.value.email.trim()) ? null : 'userForm.emailInvalid';
      case 'username':
        return this.value.username.trim() ? null : 'userForm.usernameRequired';
      case 'password':
        if (!this.showPassword) {
          return null;
        }
        if (this.mode === 'edit') {
          if (!this.value.password.trim()) {
            return null;
          }
          return this.passwordPolicyRegex.test(this.value.password)
            ? null
            : 'userForm.passwordPolicy';
        }
        if (!this.value.password.trim()) {
          return 'userForm.passwordRequired';
        }
        return this.passwordPolicyRegex.test(this.value.password)
          ? null
          : 'userForm.passwordPolicy';
      case 'passwordConfirm':
        if (!this.showPassword) {
          return null;
        }
        if (this.mode === 'edit' && !this.value.password.trim()) {
          return null;
        }
        if (!this.passwordConfirm.trim()) {
          return 'userForm.passwordConfirmRequired';
        }
        return this.passwordConfirm === this.value.password ? null : 'userForm.passwordMismatch';
      case 'role':
        return this.value.role ? null : 'userForm.roleRequired';
      default:
        return null;
    }
  }

  private buildEmptyValue(): UserFormValue {
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
