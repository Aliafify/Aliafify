export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type KeywordRecord = Record<string, JsonValue>;

export interface BranchDefinition {
  id: string;
  label: string;
  description: string;
  priority: number;
  aliases: string[];
}

export interface KeywordInputItem {
  id: string;
  keyword: string;
  documentId: string;
  documentIndex: number;
  resultIndex: number;
  record: KeywordRecord;
}

export interface ParsedKeywordDocument {
  id: string;
  variableName?: string;
  sourceType: 'batch_object' | 'array' | 'plain_text';
  data: JsonValue;
  items: KeywordInputItem[];
}

export interface ParsedKeywordInput {
  documents: ParsedKeywordDocument[];
  items: KeywordInputItem[];
  parseWarnings: string[];
}

export interface ClassifiedKeyword {
  id: string;
  original: string;
  normalized: string;
  matchedAliases: string[];
  primaryBranch: string;
  branches: string[];
  source: KeywordInputItem;
}

export type ClassificationBuckets = Record<string, ClassifiedKeyword[]>;

export interface ClassificationOptions {
  deduplicate: boolean;
  allowMultipleMatches: boolean;
}

export interface ClassificationStats {
  totalInput: number;
  totalProcessed: number;
  duplicatesRemoved: number;
  matched: number;
  unknown: number;
  overlaps: number;
}

export interface ClassificationResult {
  buckets: ClassificationBuckets;
  allKeywords: ClassifiedKeyword[];
  unknown: ClassifiedKeyword[];
  stats: ClassificationStats;
}

export interface BranchAnalytics {
  branchId: string;
  label: string;
  count: number;
  percentage: number;
}
