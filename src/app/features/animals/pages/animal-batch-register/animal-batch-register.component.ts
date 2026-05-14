import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { I18nService } from 'src/app/core/services/i18n.service';
import {
  ANIMAL_BATCH_DEFAULT_ROW_SLOTS,
  ANIMAL_BATCH_MAX_ROW_SLOTS,
  ANIMAL_BATCH_MIN_ROW_SLOTS,
  ANIMAL_BATCH_PERSIST_DEBOUNCE_MS
} from '../../constants/animal-batch.constants';
import {
  ANIMAL_BATCH_DRAFT_VERSION,
  AnimalBatchDraftRow,
  AnimalBatchDraftSnapshot
} from '../../models/animal-batch-draft.model';
import { AnimalBatchDraftStorageService } from '../../services/animal-batch-draft-storage.service';
import { AnimalBatchExcelImportService } from '../../services/animal-batch-excel-import.service';
import { batchDraftRowHasData, emptyBatchDraftRow } from '../../utils/animal-batch-draft.utils';

@Component({
  selector: 'app-animal-batch-register',
  templateUrl: './animal-batch-register.component.html',
  styleUrls: ['./animal-batch-register.component.scss']
})
export class AnimalBatchRegisterComponent implements OnInit, OnDestroy {
  readonly minSlots = ANIMAL_BATCH_MIN_ROW_SLOTS;
  readonly maxSlots = ANIMAL_BATCH_MAX_ROW_SLOTS;

  @ViewChild('excelFileInput') excelFileInput?: ElementRef<HTMLInputElement>;

  form: FormGroup;
  requestedSlotCount = ANIMAL_BATCH_DEFAULT_ROW_SLOTS;
  feedback: { type: 'success' | 'error'; message: string } | null = null;

  private suppressDraftPersist = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly draftStorage: AnimalBatchDraftStorageService,
    private readonly excelImport: AnimalBatchExcelImportService,
    private readonly i18n: I18nService
  ) {
    this.form = this.fb.group({
      rows: this.fb.array([])
    });
  }

  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }

  ngOnInit(): void {
    const draft = this.draftStorage.load();
    if (draft) {
      const count = this.clampSlotCount(draft.rowSlotCount);
      this.requestedSlotCount = count;
      this.rebuildRows(count, draft.rows);
    } else {
      this.requestedSlotCount = ANIMAL_BATCH_DEFAULT_ROW_SLOTS;
      this.rebuildRows(ANIMAL_BATCH_DEFAULT_ROW_SLOTS, []);
    }

    this.form.valueChanges
      .pipe(debounceTime(ANIMAL_BATCH_PERSIST_DEBOUNCE_MS), takeUntil(this.destroy$.asObservable()))
      .subscribe(() => {
        if (this.suppressDraftPersist) {
          return;
        }
        this.draftStorage.save(this.toSnapshot());
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openExcelPicker(): void {
    this.excelFileInput?.nativeElement.click();
  }

  onExcelFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.feedback = null;
    if (!file) {
      return;
    }

    file
      .arrayBuffer()
      .then((buffer) => {
        const imported = this.excelImport.parseFirstSheet(buffer);
        if (imported.length === 0) {
          this.feedback = { type: 'error', message: this.i18n.translate('animal.batchImportEmpty') };
          return;
        }
        const slotCount = this.clampSlotCount(Math.max(this.minSlots, imported.length));
        this.requestedSlotCount = slotCount;
        const merged = this.excelImport.mergeIntoSlotCount(imported, slotCount);
        this.rebuildRows(slotCount, merged);
        this.feedback = {
          type: 'success',
          message: this.i18n.translate('animal.batchImportSuccess', { count: String(imported.length) })
        };
      })
      .catch(() => {
        this.feedback = { type: 'error', message: this.i18n.translate('animal.batchImportError') };
      })
      .finally(() => {
        input.value = '';
      });
  }

  applyRequestedSlotCount(): void {
    const next = this.clampSlotCount(this.requestedSlotCount);
    this.requestedSlotCount = next;
    const currentValues = this.rows.getRawValue() as AnimalBatchDraftRow[];
    if (next === currentValues.length) {
      return;
    }
    if (next < currentValues.length) {
      const dropped = currentValues.slice(next);
      if (dropped.some((r) => batchDraftRowHasData(r))) {
        const ok = globalThis.confirm(this.i18n.translate('animal.batchShrinkConfirm'));
        if (!ok) {
          this.requestedSlotCount = currentValues.length;
          return;
        }
      }
    }
    this.rebuildRows(next, currentValues);
  }

  saveBatch(): void {
    this.feedback = null;
    const values = this.rows.getRawValue() as AnimalBatchDraftRow[];
    const filled = values.filter((r) => batchDraftRowHasData(r));
    if (filled.length === 0) {
      this.feedback = { type: 'error', message: this.i18n.translate('animal.batchNoRows') };
      return;
    }

    this.draftStorage.clear();
    this.suppressDraftPersist = true;
    this.rebuildRows(values.length, []);
    globalThis.setTimeout(() => {
      this.suppressDraftPersist = false;
    }, ANIMAL_BATCH_PERSIST_DEBOUNCE_MS + 80);

    this.feedback = { type: 'success', message: this.i18n.translate('animal.batchSaveLocalDone') };
  }

  trackByIndex(index: number): number {
    return index;
  }

  private toSnapshot(): AnimalBatchDraftSnapshot {
    return {
      version: ANIMAL_BATCH_DRAFT_VERSION,
      rowSlotCount: this.rows.length,
      rows: this.rows.getRawValue() as AnimalBatchDraftRow[]
    };
  }

  private clampSlotCount(raw: number): number {
    const n = Math.floor(Number(raw));
    if (Number.isNaN(n)) {
      return ANIMAL_BATCH_MIN_ROW_SLOTS;
    }
    return Math.min(ANIMAL_BATCH_MAX_ROW_SLOTS, Math.max(ANIMAL_BATCH_MIN_ROW_SLOTS, n));
  }

  private rebuildRows(count: number, previous: AnimalBatchDraftRow[]): void {
    const safeCount = this.clampSlotCount(count);
    this.rows.clear();
    for (let i = 0; i < safeCount; i++) {
      const seed = previous[i] ?? emptyBatchDraftRow();
      this.rows.push(this.createRowGroup(seed));
    }
  }

  private createRowGroup(seed: AnimalBatchDraftRow): FormGroup {
    return this.fb.group({
      ranchUuid: [seed.ranchUuid],
      breedUuid: [seed.breedUuid],
      sex: [seed.sex]
    });
  }
}
