import { Injectable } from '@angular/core';
import { SessionService } from 'src/app/core/services/session.service';
import { ANIMAL_BATCH_STORAGE_PREFIX } from '../constants/animal-batch.constants';
import {
  ANIMAL_BATCH_DRAFT_VERSION,
  AnimalBatchDraftRow,
  AnimalBatchDraftSnapshot
} from '../models/animal-batch-draft.model';

function isDraftRow(value: unknown): value is AnimalBatchDraftRow {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row['ranchUuid'] === 'string' &&
    typeof row['breedUuid'] === 'string' &&
    typeof row['sex'] === 'string'
  );
}

@Injectable({
  providedIn: 'root'
})
export class AnimalBatchDraftStorageService {
  constructor(private readonly sessionService: SessionService) {}

  private storageKey(): string | null {
    const company = this.sessionService.getUuidCompany();
    const username = this.sessionService.getUsername();
    if (!company?.trim() || !username?.trim()) {
      return null;
    }
    return `${ANIMAL_BATCH_STORAGE_PREFIX}_${company}_${username}`;
  }

  load(): AnimalBatchDraftSnapshot | null {
    const key = this.storageKey();
    if (!key) {
      return null;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<AnimalBatchDraftSnapshot>;
      if (
        parsed.version !== ANIMAL_BATCH_DRAFT_VERSION ||
        typeof parsed.rowSlotCount !== 'number' ||
        !Array.isArray(parsed.rows) ||
        parsed.rows.length === 0 ||
        !parsed.rows.every(isDraftRow)
      ) {
        return null;
      }
      return parsed as AnimalBatchDraftSnapshot;
    } catch {
      return null;
    }
  }

  save(snapshot: AnimalBatchDraftSnapshot): void {
    const key = this.storageKey();
    if (!key) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(snapshot));
  }

  clear(): void {
    const key = this.storageKey();
    if (!key) {
      return;
    }
    localStorage.removeItem(key);
  }
}
