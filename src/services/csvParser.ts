import Papa from 'papaparse';
import { buildDynamicSchema } from '@/parsers/schema';
import type { ParsedCsvDataset } from '@/types/csv';

export const parseCsvFile = (file: File): Promise<ParsedCsvDataset> =>
  new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'utf-8',
      worker: true,
      dynamicTyping: false,
      complete(result) {
        if (result.errors.length) {
          reject(new Error(result.errors.map((e) => e.message).join(', ')));
          return;
        }
        resolve(buildDynamicSchema(result.data));
      }
    });
  });
