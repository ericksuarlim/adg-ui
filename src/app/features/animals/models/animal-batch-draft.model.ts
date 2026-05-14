import { AnimalSex } from './animal-api-fields.model';

export interface AnimalBatchDraftRow {
  ranchUuid: string;
  breedUuid: string;
  sex: AnimalSex | '';
}

export const ANIMAL_BATCH_DRAFT_VERSION = 2 as const;

export interface AnimalBatchDraftSnapshot {
  version: typeof ANIMAL_BATCH_DRAFT_VERSION;
  rowSlotCount: number;
  rows: AnimalBatchDraftRow[];
}
