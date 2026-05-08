import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';

@Pipe({
  name: 't',
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private readonly subscription: Subscription;

  constructor(
    private readonly i18nService: I18nService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.subscription = this.i18nService.language$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.translate(key, params);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
