import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { I18nService } from 'src/app/core/services/i18n.service';
import { SessionService } from 'src/app/core/services/session.service';
import { MembershipItem, RanchOption, UserManagementItem } from '../../models/user-management.model';
import { UserManagementService } from '../../services/user-management.service';
import { normalizeUserRole, normalizeUserRoles, UserRole } from 'src/app/shared/constants/domain.constants';
import { hasPermission, Permission } from 'src/app/shared/constants/permissions';

export interface UserDetailRanchRow {
  uuid_ranch: string;
  ranchName: string;
  role: UserRole | null;
}

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  readonly normalizeUserRole = normalizeUserRole;

  user: UserManagementItem | null = null;
  companyName = '-';
  /** Rol más alto entre membresías activas (el API de usuario no devuelve rol por rancho). */
  summaryRole: UserRole | null = null;
  ranchRows: UserDetailRanchRow[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userManagementService: UserManagementService,
    private readonly sessionService: SessionService,
    private readonly i18nService: I18nService
  ) {}

  get isSaasOwner(): boolean {
    return normalizeUserRoles(this.sessionService.getRoles() as string[]).includes('saas_owner');
  }

  get canOpenRanchDetail(): boolean {
    return hasPermission(normalizeUserRoles(this.sessionService.getRoles() as string[]), Permission.RANCH_READ);
  }

  ngOnInit(): void {
    const uuidUser = this.route.snapshot.paramMap.get('uuidUser');
    if (!uuidUser) {
      this.errorMessage = this.i18nService.translate('errors.loadUsers');
      return;
    }
    this.loadUser(uuidUser);
  }

  private loadUser(uuidUser: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.user = null;
    this.summaryRole = null;
    this.ranchRows = [];

    this.userManagementService
      .getUserById(uuidUser)
      .pipe(
        catchError(() => of(null as UserManagementItem | null)),
        switchMap((user) => {
          if (!user) {
            return of({ user: null as UserManagementItem | null, memberships: [] as MembershipItem[], ranches: [] as RanchOption[] });
          }
          return forkJoin({
            user: of(user),
            memberships: this.userManagementService.getMembershipsByUser(uuidUser).pipe(catchError(() => of([] as MembershipItem[]))),
            ranches: this.userManagementService
              .getRanches(this.isSaasOwner ? user.uuid_company : undefined)
              .pipe(catchError(() => of([] as RanchOption[])))
          });
        })
      )
      .subscribe({
        next: ({ user, memberships, ranches }) => {
          if (!user) {
            this.errorMessage = this.i18nService.translate('users.detailNotFound');
            this.companyName = '-';
            this.isLoading = false;
            return;
          }
          this.user = user;
          this.companyName = user.company?.name ?? user.uuid_company ?? '-';
          const activeMemberships = memberships.filter((m) => m.is_active !== false);
          this.summaryRole = this.pickHighestRole(activeMemberships);
          this.ranchRows = this.buildRanchRows(user.uuid_company, activeMemberships, ranches);
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = this.i18nService.translate('errors.loadUsers');
          this.isLoading = false;
        }
      });
  }

  /** Filas por rancho según membresías activas devueltas por el API (sin inferencia en cliente). */
  private buildRanchRows(
    uuidCompany: string,
    activeMemberships: MembershipItem[],
    ranches: RanchOption[]
  ): UserDetailRanchRow[] {
    const byId = new Map(
      ranches.filter((r) => r.uuid_company === uuidCompany).map((r) => [r.uuid_ranch, r])
    );
    return activeMemberships
      .map((m) => ({
        uuid_ranch: m.uuid_ranch,
        ranchName: byId.get(m.uuid_ranch)?.name ?? m.uuid_ranch,
        role: normalizeUserRole(String(m.role))
      }))
      .sort((a, b) => a.ranchName.localeCompare(b.ranchName, undefined, { sensitivity: 'base' }));
  }

  private pickHighestRole(memberships: MembershipItem[]): UserRole | null {
    if (!memberships.length) {
      return null;
    }
    const rank: Record<UserRole, number> = {
      ranch_staff: 1,
      administrator: 3,
      saas_owner: 4
    };
    const normalized = memberships
      .map((m) => normalizeUserRole(String(m.role)))
      .filter((r): r is UserRole => r !== null);
    if (!normalized.length) {
      return null;
    }
    return normalized.reduce<UserRole>((best, r) => ((rank[r] ?? 0) > (rank[best] ?? 0) ? r : best), normalized[0]);
  }
}
