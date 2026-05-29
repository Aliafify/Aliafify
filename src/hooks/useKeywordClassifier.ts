import { useMemo } from 'react';
import { DEFAULT_BRANCHES } from '@/constants/branches';
import { classifyKeywords } from '@/services/classificationEngine';
import type { BranchAnalytics, BranchDefinition, ClassificationOptions } from '@/types/keyword';

export const useKeywordClassifier = (
  keywordBatches: string[][],
  options: ClassificationOptions,
  branches: BranchDefinition[] = DEFAULT_BRANCHES,
) => {
  const result = useMemo(
    () => classifyKeywords(keywordBatches, branches, options),
    [branches, keywordBatches, options],
  );

  const analytics = useMemo<BranchAnalytics[]>(() => branches.map((branch) => {
    const count = result.buckets[branch.id]?.length ?? 0;
    return {
      branchId: branch.id,
      label: branch.label,
      count,
      percentage: result.stats.totalProcessed ? Math.round((count / result.stats.totalProcessed) * 100) : 0,
    };
  }), [branches, result.buckets, result.stats.totalProcessed]);

  return { result, analytics, branches };
};
