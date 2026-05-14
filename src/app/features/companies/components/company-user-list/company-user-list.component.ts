import { Component, Input } from '@angular/core';
import { normalizeUserRole } from 'src/app/shared/constants/domain.constants';
import { CompanyUser } from '../../models/company-management.model';

@Component({
  selector: 'app-company-user-list',
  templateUrl: './company-user-list.component.html',
  styleUrls: ['./company-user-list.component.scss']
})
export class CompanyUserListComponent {
  readonly normalizeUserRole = normalizeUserRole;

  @Input() users: CompanyUser[] = [];
}
