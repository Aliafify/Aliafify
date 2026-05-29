export interface BranchDefinition {
  id: string;
  label: string;
  description: string;
  priority: number;
  aliases: string[];
}

export interface ClassifiedKeyword {
  original: string;
  normalized: string;
  matchedAliases: string[];
  primaryBranch: string;
  branches: string[];
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
