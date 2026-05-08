import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18nService } from 'src/app/core/services/i18n.service';
import { UserRole } from 'src/app/shared/constants/domain.constants';

export interface UserFormValue {
  id_card: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: UserRole;
  password: string;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() submitLabelKey = 'common.save';
  @Input() cancelLabelKey = 'common.clear';
  @Input() loading = false;
  @Input() showPassword = true;
  @Input() roleDisabled = false;
  @Input() availableRoles: UserRole[] = ['administrator', 'supervisor', 'healthcare_staff', 'user'];
  @Input() value: UserFormValue = this.buildEmptyValue();

  @Output() readonly submitForm = new EventEmitter<UserFormValue>();
  @Output() readonly cancelForm = new EventEmitter<void>();

  touched: Record<string, boolean> = {};
  submitAttempted = false;
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;

  constructor(private readonly i18nService: I18nService) {}

  onSubmit(): void {
    this.submitAttempted = true;
    if (!this.isValid) {
      return;
    }

    this.submitForm.emit({ ...this.value });
  }

  onCancel(): void {
    this.cancelForm.emit();
  }

  markTouched(field: string): void {
    this.touched[field] = true;
  }

  fieldInvalid(field: string): boolean {
    return (this.submitAttempted || !!this.touched[field]) && this.getFieldError(field) !== null;
  }

  fieldError(field: string): string | null {
    const key = this.getFieldError(field);
    return key ? this.i18nService.translate(key) : null;
  }

  get isValid(): boolean {
    const fields = ['id_card', 'first_name', 'last_name', 'email', 'username', 'role'];
    if (this.showPassword) {
      fields.push('password');
    }

    return fields.every((field) => this.getFieldError(field) === null);
  }

  private getFieldError(field: string): string | null {
    switch (field) {
      case 'id_card':
        return this.value.id_card.trim() ? null : 'userForm.idCardRequired';
      case 'first_name':
        return this.value.first_name.trim() ? null : 'userForm.firstNameRequired';
      case 'last_name':
        return this.value.last_name.trim() ? null : 'userForm.lastNameRequired';
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
        if (!this.value.password.trim()) {
          return 'userForm.passwordRequired';
        }
        return this.passwordPolicyRegex.test(this.value.password)
          ? null
          : 'userForm.passwordPolicy';
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
      email: '',
      username: '',
      role: 'user',
      password: ''
    };
  }
}
