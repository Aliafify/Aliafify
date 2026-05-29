import { UNKNOWN_BRANCH_ID } from '@/constants/branches';
import type { BranchDefinition, ClassificationOptions, ClassificationResult, ClassifiedKeyword } from '@/types/keyword';
import { normalizeArabic, normalizeKeywordList } from '@/utils/arabicNormalizer';

interface CompiledAlias {
  branchId: string;
  branchPriority: number;
  alias: string;
  normalizedAlias: string;
}

const compileAliases = (branches: BranchDefinition[]): CompiledAlias[] => branches
  .flatMap((branch) => branch.aliases.map((alias) => ({
    branchId: branch.id,
    branchPriority: branch.priority,
    alias,
    normalizedAlias: normalizeArabic(alias),
  })))
  .filter((alias) => alias.normalizedAlias.length > 0)
  .sort((a, b) => a.branchPriority - b.branchPriority || b.normalizedAlias.length - a.normalizedAlias.length);

const createEmptyBuckets = (branches: BranchDefinition[]) => Object.fromEntries([
  ...branches.map((branch) => [branch.id, [] as ClassifiedKeyword[]]),
  [UNKNOWN_BRANCH_ID, [] as ClassifiedKeyword[]],
]);

export const classifyKeywords = (
  keywordBatches: string[][],
  branches: BranchDefinition[],
  options: ClassificationOptions,
): ClassificationResult => {
  const allInputKeywords = keywordBatches.flatMap((batch) => batch);
  const cleanedKeywords = normalizeKeywordList(allInputKeywords);
  const aliases = compileAliases(branches);
  const buckets = createEmptyBuckets(branches);
  const seen = new Set<string>();
  const allKeywords: ClassifiedKeyword[] = [];
  let duplicatesRemoved = 0;
  let overlaps = 0;

  for (const original of cleanedKeywords) {
    const normalized = normalizeArabic(original);

    if (options.deduplicate) {
      if (seen.has(normalized)) {
        duplicatesRemoved += 1;
        continue;
      }
      seen.add(normalized);
    }

    const branchIds = new Set<string>();
    const matchedAliases: string[] = [];

    for (const alias of aliases) {
      if (!normalized.includes(alias.normalizedAlias)) {
        continue;
      }

      branchIds.add(alias.branchId);
      matchedAliases.push(alias.alias);

      if (!options.allowMultipleMatches) {
        break;
      }
    }

    const branchesForKeyword = [...branchIds];
    if (branchesForKeyword.length > 1) {
      overlaps += 1;
    }

    const primaryBranch = branchesForKeyword[0] ?? UNKNOWN_BRANCH_ID;
    const classifiedKeyword: ClassifiedKeyword = {
      original,
      normalized,
      matchedAliases,
      primaryBranch,
      branches: branchesForKeyword.length ? branchesForKeyword : [UNKNOWN_BRANCH_ID],
    };

    allKeywords.push(classifiedKeyword);

    if (branchesForKeyword.length === 0) {
      buckets[UNKNOWN_BRANCH_ID].push(classifiedKeyword);
      continue;
    }

    for (const branchId of branchesForKeyword) {
      buckets[branchId].push(classifiedKeyword);
    }
  }

  const unknown = buckets[UNKNOWN_BRANCH_ID];

  return {
    buckets,
    allKeywords,
    unknown,
    stats: {
      totalInput: allInputKeywords.length,
      totalProcessed: allKeywords.length,
      duplicatesRemoved,
      matched: allKeywords.length - unknown.length,
      unknown: unknown.length,
      overlaps,
    },
  };
};
