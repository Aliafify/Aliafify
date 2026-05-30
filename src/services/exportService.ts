import { UNKNOWN_BRANCH_ID } from '@/constants/branches';
import type { BranchDefinition, ClassificationBuckets, ClassificationResult, JsonValue, KeywordRecord, ParsedKeywordDocument } from '@/types/keyword';
import { normalizeArabic } from '@/utils/arabicNormalizer';

const quoteCsv = (value: string): string => `"${value.replace(/"/g, '""')}"`;

const downloadTextFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const isRecord = (value: JsonValue): value is KeywordRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const cloneJson = <T extends JsonValue>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const buildClassificationLookup = (result: ClassificationResult) => {
  const byId = new Map(result.allKeywords.map((keyword) => [keyword.id, keyword]));
  const byNormalized = new Map(result.allKeywords.map((keyword) => [keyword.normalized, keyword]));

  return { byId, byNormalized };
};

const addBranchFields = (record: KeywordRecord, branchType: string, branchTypes: string[], matchedAliases: string[]) => ({
  ...record,
  branch_type: branchType,
  branch_types: branchTypes,
  matched_aliases: matchedAliases,
});

export const buildAugmentedDocuments = (documents: ParsedKeywordDocument[], result: ClassificationResult): JsonValue[] => {
  const lookup = buildClassificationLookup(result);

  return documents.map((document) => {
    if (document.sourceType === 'batch_object' && isRecord(document.data) && Array.isArray(document.data.results)) {
      const clonedDocument = cloneJson(document.data);
      if (!isRecord(clonedDocument) || !Array.isArray(clonedDocument.results)) {
        return document.data;
      }

      clonedDocument.results = clonedDocument.results.map((record, resultIndex) => {
        if (!isRecord(record) || typeof record.keyword !== 'string') {
          return record;
        }

        const keywordId = `${document.id}:${resultIndex}`;
        const classified = lookup.byId.get(keywordId) ?? lookup.byNormalized.get(normalizeArabic(record.keyword));
        return addBranchFields(
          record,
          classified?.primaryBranch ?? UNKNOWN_BRANCH_ID,
          classified?.branches ?? [UNKNOWN_BRANCH_ID],
          classified?.matchedAliases ?? [],
        );
      });

      return clonedDocument;
    }

    return document.items.map((item) => {
      const classified = lookup.byId.get(item.id) ?? lookup.byNormalized.get(normalizeArabic(item.keyword));
      return addBranchFields(
        cloneJson(item.record),
        classified?.primaryBranch ?? UNKNOWN_BRANCH_ID,
        classified?.branches ?? [UNKNOWN_BRANCH_ID],
        classified?.matchedAliases ?? [],
      );
    });
  });
};

export const exportAugmentedJson = (
  documents: ParsedKeywordDocument[],
  result: ClassificationResult,
  filename = 'arabic-keyword-classified-data.json',
) => {
  const augmentedDocuments = buildAugmentedDocuments(documents, result);
  const payload = augmentedDocuments.length === 1 ? augmentedDocuments[0] : augmentedDocuments;
  downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json');
};

const stringifyCell = (value: JsonValue | undefined): string => {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

export const exportAugmentedCsv = (
  documents: ParsedKeywordDocument[],
  result: ClassificationResult,
  filename = 'arabic-keyword-classified-data.csv',
) => {
  const augmentedDocuments = buildAugmentedDocuments(documents, result);
  const records = augmentedDocuments.flatMap((document) => {
    if (isRecord(document) && Array.isArray(document.results)) {
      return document.results.filter(isRecord);
    }

    if (Array.isArray(document)) {
      return document.filter(isRecord);
    }

    return isRecord(document) ? [document] : [];
  });

  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  const rows = [headers.map(quoteCsv).join(',')];

  for (const record of records) {
    rows.push(headers.map((header) => quoteCsv(stringifyCell(record[header]))).join(','));
  }

  downloadTextFile(filename, `\uFEFF${rows.join('\n')}`, 'text/csv');
};

export const exportClassificationCsv = (buckets: ClassificationBuckets, filename = 'arabic-keyword-branches.csv') => {
  const rows = ['branch,keyword,matched_aliases,primary_branch'];

  for (const [branch, keywords] of Object.entries(buckets)) {
    for (const keyword of keywords) {
      rows.push([
        quoteCsv(branch),
        quoteCsv(keyword.original),
        quoteCsv(keyword.matchedAliases.join('|')),
        quoteCsv(keyword.primaryBranch),
      ].join(','));
    }
  }

  downloadTextFile(filename, `\uFEFF${rows.join('\n')}`, 'text/csv');
};

export const exportBranchesJson = (branches: BranchDefinition[], filename = 'arabic-keyword-branch-config.json') => {
  downloadTextFile(filename, JSON.stringify(branches, null, 2), 'application/json');
};

export const copyKeywords = async (keywords: string[]) => navigator.clipboard.writeText(keywords.join('\n'));

export const branchIdsForExport = (branches: BranchDefinition[]): string[] => [
  ...branches.map((branch) => branch.id),
  UNKNOWN_BRANCH_ID,
];
