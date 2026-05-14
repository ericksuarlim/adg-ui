import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/core/services/session.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { normalizeUserRoles } from 'src/app/shared/constants/domain.constants';
import { CompanyOption, RanchOption } from 'src/app/features/users/models/user-management.model';
import { UserManagementService } from 'src/app/features/users/services/user-management.service';

@Component({
  selector: 'app-ranch-list',
  templateUrl: './ranch-list.component.html',
  styleUrls: ['./ranch-list.component.scss']
})
export class RanchListComponent implements OnInit {
  companies: CompanyOption[] = [];
  ranches: RanchOption[] = [];
  selectedCompany = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly sessionService: SessionService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    if (this.isSaasOwner) {
      this.loadCompanies();
      return;
    }
    this.loadRanchesForTenant();
  }

  get isSaasOwner(): boolean {
    return normalizeUserRoles(this.sessionService.getRoles() as string[]).includes('saas_owner');
  }

  get selectedCompanyName(): string {
    if (!this.selectedCompany?.trim()) {
      return '';
    }
    return this.companies.find((c) => c.uuid_company === this.selectedCompany)?.name ?? '';
  }

  companyNameForRanch(ranch: RanchOption): string {
    return this.companies.find((c) => c.uuid_company === ranch.uuid_company)?.name ?? ranch.uuid_company;
  }

  onCompanyChange(uuid: string): void {
    this.selectedCompany = uuid;
    this.loadRanchesForCompany();
  }

  private loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userManagementService.getCompanies().subscribe({
      next: (list) => {
        this.companies = list;
        this.selectedCompany = '';
        this.loadRanchesForCompany();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('errors.loadCompanies');
        this.isLoading = false;
      }
    });
  }

  private loadRanchesForCompany(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const filter = this.isSaasOwner ? (this.selectedCompany.trim() || undefined) : this.selectedCompany;
    if (!this.isSaasOwner && !filter) {
      this.ranches = [];
      this.isLoading = false;
      return;
    }
    this.userManagementService.getRanches(filter).subscribe({
      next: (rows) => {
        this.ranches = rows;
        this.isLoading = false;
      },
      error: () => {
        this.ranches = [];
        this.errorMessage = this.i18nService.translate('errors.loadRanches');
        this.isLoading = false;
      }
    });
  }

  private loadRanchesForTenant(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userManagementService.getRanches(undefined).subscribe({
      next: (rows) => {
        this.ranches = rows;
        this.isLoading = false;
      },
      error: () => {
        this.ranches = [];
        this.errorMessage = this.i18nService.translate('errors.loadRanches');
        this.isLoading = false;
      }
    });
  }
}
