import { UNKNOWN_BRANCH_ID } from '@/constants/branches';
import type { BranchDefinition, ClassificationBuckets } from '@/types/keyword';

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
