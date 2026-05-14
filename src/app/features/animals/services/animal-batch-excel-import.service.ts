import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { AnimalBatchDraftRow } from '../models/animal-batch-draft.model';
import { batchDraftRowHasData, emptyBatchDraftRow } from '../utils/animal-batch-draft.utils';

function normalizeHeaderKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, '_');
}

function normalizeSexCell(raw: string): AnimalBatchDraftRow['sex'] {
  const u = raw.trim().toUpperCase();
  if (u === 'MALE' || u === 'M' || u === 'MACHO' || u === '1') {
    return 'MALE';
  }
  if (u === 'FEMALE' || u === 'F' || u === 'HEMBRA' || u === 'FEMEA' || u === '2') {
    return 'FEMALE';
  }
  return '';
}

function normalizedCells(record: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(record)) {
    out[normalizeHeaderKey(k)] = String(v ?? '').trim();
  }
  return out;
}

function pickRanchUuid(cells: Record<string, string>): string {
  const direct = ['ranch_uuid', 'ranchuuid', 'uuid_ranch', 'uuid_rancho', 'ranch', 'rancho'];
  for (const key of direct) {
    if (cells[key]) {
      return cells[key];
    }
  }
  for (const [key, value] of Object.entries(cells)) {
    if (!value) {
      continue;
    }
    if (key.includes('ranch') && key.includes('uuid')) {
      return value;
    }
  }
  return '';
}

function pickBreedUuid(cells: Record<string, string>): string {
  const direct = ['breed_uuid', 'breeduuid', 'uuid_breed', 'uuid_raza', 'breed', 'raza'];
  for (const key of direct) {
    if (cells[key]) {
      return cells[key];
    }
  }
  for (const [key, value] of Object.entries(cells)) {
    if (!value) {
      continue;
    }
    if (key.includes('breed') && key.includes('uuid')) {
      return value;
    }
  }
  return '';
}

function pickSexRaw(cells: Record<string, string>): string {
  return cells['sex'] || cells['sexo'] || cells['gender'] || '';
}

function mapObjectRow(record: Record<string, unknown>): AnimalBatchDraftRow {
  const cells = normalizedCells(record);
  return {
    ranchUuid: pickRanchUuid(cells),
    breedUuid: pickBreedUuid(cells),
    sex: normalizeSexCell(pickSexRaw(cells))
  };
}

function parseFromObjectRows(worksheet: XLSX.WorkSheet): AnimalBatchDraftRow[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
  return rows
    .map((row: Record<string, unknown>) => mapObjectRow(row))
    .filter((r: AnimalBatchDraftRow) => batchDraftRowHasData(r));
}

function parseFromGridRows(worksheet: XLSX.WorkSheet): AnimalBatchDraftRow[] {
  const matrix = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(worksheet, {
    header: 1,
    defval: ''
  }) as unknown[][];
  const out: AnimalBatchDraftRow[] = [];
  for (const row of matrix) {
    if (!Array.isArray(row)) {
      continue;
    }
    const ranch = String(row[0] ?? '').trim();
    const breed = String(row[1] ?? '').trim();
    const sex = normalizeSexCell(String(row[2] ?? ''));
    const draft: AnimalBatchDraftRow = { ranchUuid: ranch, breedUuid: breed, sex };
    if (batchDraftRowHasData(draft)) {
      out.push(draft);
    }
  }
  return out;
}

@Injectable({
  providedIn: 'root'
})
export class AnimalBatchExcelImportService {
  parseFirstSheet(buffer: ArrayBuffer): AnimalBatchDraftRow[] {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
    const firstName = workbook.SheetNames[0];
    if (!firstName) {
      return [];
    }
    const worksheet = workbook.Sheets[firstName];
    if (!worksheet) {
      return [];
    }

    const fromObjects = parseFromObjectRows(worksheet);
    if (fromObjects.length > 0) {
      return fromObjects;
    }

    return parseFromGridRows(worksheet);
  }

  mergeIntoSlotCount(imported: AnimalBatchDraftRow[], slotCount: number): AnimalBatchDraftRow[] {
    const safe: AnimalBatchDraftRow[] = imported.slice(0, slotCount).map((r: AnimalBatchDraftRow) => ({ ...r }));
    while (safe.length < slotCount) {
      safe.push(emptyBatchDraftRow());
    }
    return safe;
  }
}
