import { AnimalBatchDraftRow } from '../models/animal-batch-draft.model';

export function batchDraftRowHasData(row: AnimalBatchDraftRow): boolean {
  return [row.ranchUuid, row.breedUuid, row.sex].some((v) => String(v ?? '').trim().length > 0);
}

export function emptyBatchDraftRow(): AnimalBatchDraftRow {
  return { ranchUuid: '', breedUuid: '', sex: '' };
}
