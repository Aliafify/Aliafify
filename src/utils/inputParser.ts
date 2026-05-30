import type { JsonValue, KeywordInputItem, KeywordRecord, ParsedKeywordDocument, ParsedKeywordInput } from '@/types/keyword';

interface JsonBlock {
  variableName?: string;
  json: string;
}

const isRecord = (value: unknown): value is KeywordRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toJsonValue = (value: unknown): JsonValue => {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }

  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, toJsonValue(nestedValue)]));
  }

  return String(value);
};

const createItem = (
  keyword: string,
  record: KeywordRecord,
  documentId: string,
  documentIndex: number,
  resultIndex: number,
): KeywordInputItem => ({
  id: `${documentId}:${resultIndex}`,
  keyword,
  documentId,
  documentIndex,
  resultIndex,
  record,
});

const matchingClose = (open: string) => (open === '{' ? '}' : ']');

const findMatchingBracket = (value: string, startIndex: number): number => {
  const stack: string[] = [matchingClose(value[startIndex])];
  let inString = false;
  let escaped = false;

  for (let index = startIndex + 1; index < value.length; index += 1) {
    const char = value[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(matchingClose(char));
      continue;
    }

    if (char === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) {
        return index;
      }
    }
  }

  return -1;
};

const extractAssignedJsonBlocks = (rawInput: string): JsonBlock[] => {
  const blocks: JsonBlock[] = [];
  const assignmentPattern = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([{[])/g;
  let match: RegExpExecArray | null;

  while ((match = assignmentPattern.exec(rawInput)) !== null) {
    const startIndex = assignmentPattern.lastIndex - 1;
    const endIndex = findMatchingBracket(rawInput, startIndex);

    if (endIndex === -1) {
      continue;
    }

    blocks.push({ variableName: match[1], json: rawInput.slice(startIndex, endIndex + 1) });
    assignmentPattern.lastIndex = endIndex + 1;
  }

  return blocks;
};

const collectKeywordsFromArray = (
  value: JsonValue,
  documentId: string,
  documentIndex: number,
): KeywordInputItem[] => {
  const items: KeywordInputItem[] = [];

  const visit = (nestedValue: JsonValue) => {
    if (Array.isArray(nestedValue)) {
      nestedValue.forEach(visit);
      return;
    }

    if (isRecord(nestedValue)) {
      const keyword = typeof nestedValue.keyword === 'string' ? nestedValue.keyword.trim() : '';
      if (keyword) {
        items.push(createItem(keyword, nestedValue, documentId, documentIndex, items.length));
      }
      return;
    }

    if (typeof nestedValue === 'string' || typeof nestedValue === 'number') {
      const keyword = String(nestedValue).trim();
      if (keyword) {
        items.push(createItem(keyword, { keyword }, documentId, documentIndex, items.length));
      }
    }
  };

  visit(value);
  return items;
};

const documentFromJsonValue = (
  value: JsonValue,
  documentIndex: number,
  variableName?: string,
): ParsedKeywordDocument => {
  const documentId = variableName ?? `input_${documentIndex + 1}`;

  if (isRecord(value) && Array.isArray(value.results)) {
    const items = value.results.flatMap((record, resultIndex) => {
      if (!isRecord(record) || typeof record.keyword !== 'string' || !record.keyword.trim()) {
        return [];
      }

      return [createItem(record.keyword.trim(), record, documentId, documentIndex, resultIndex)];
    });

    return { id: documentId, variableName, sourceType: 'batch_object', data: value, items };
  }

  const items = collectKeywordsFromArray(value, documentId, documentIndex);
  return { id: documentId, variableName, sourceType: Array.isArray(value) ? 'array' : 'plain_text', data: value, items };
};

const parseJsonDocuments = (rawInput: string): ParsedKeywordDocument[] | null => {
  const trimmed = rawInput.trim();
  const assignedBlocks = extractAssignedJsonBlocks(trimmed);

  if (assignedBlocks.length > 0) {
    return assignedBlocks.map((block, index) => documentFromJsonValue(toJsonValue(JSON.parse(block.json)), index, block.variableName));
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = toJsonValue(JSON.parse(trimmed));
    if (Array.isArray(parsed) && parsed.every((item) => isRecord(item) && Array.isArray(item.results))) {
      return parsed.map((item, index) => documentFromJsonValue(item, index));
    }
    return [documentFromJsonValue(parsed, 0)];
  }

  return null;
};

export const parseKeywordInput = (rawInput: string): ParsedKeywordInput => {
  const trimmed = rawInput.trim();
  const parseWarnings: string[] = [];

  if (!trimmed) {
    return { documents: [], items: [], parseWarnings };
  }

  try {
    const documents = parseJsonDocuments(trimmed);
    if (documents) {
      return { documents, items: documents.flatMap((document) => document.items), parseWarnings };
    }
  } catch (error) {
    parseWarnings.push(error instanceof Error ? error.message : 'تعذر تحليل JSON، سيتم التعامل مع الإدخال كنص عادي.');
  }

  const keywords = trimmed
    .split(/\r?\n|,/)
    .map((keyword) => keyword.replace(/^['"`\s]+|['"`\s;]+$/g, '').trim())
    .filter(Boolean);

  const documentId = 'plain_text_1';
  const items = keywords.map((keyword, index) => createItem(keyword, { keyword }, documentId, 0, index));
  const documents: ParsedKeywordDocument[] = [{ id: documentId, sourceType: 'plain_text', data: keywords, items }];

  return { documents, items, parseWarnings };
};

export const sampleKeywordJson = `const data1 = ${JSON.stringify({
  batch_number: 1,
  keywords_processed: 6,
  results: [
    {
      keyword: 'انتريهات مودرن 2026',
      dominant_intent: 'Inspirational',
      intent_ratios: { informational: 5, commercial: 30, transactional: 15, navigational: 0, local: 0, inspirational: 50 },
      funnel_stage: 'MOFU',
      recommended_page_type: ['Ecommerce Category', 'Gallery Page'],
      serp_prediction: ['Image Gallery', 'Ecommerce Products'],
      reasoning: 'Users are looking for the latest trends and visual inspiration.',
    },
    {
      keyword: 'ركنه مودرن 2026',
      dominant_intent: 'Commercial',
      intent_ratios: { informational: 5, commercial: 40, transactional: 20, navigational: 0, local: 0, inspirational: 35 },
      funnel_stage: 'MOFU',
      recommended_page_type: ['Ecommerce Category', 'Product Page'],
      serp_prediction: ['Ecommerce Listings', 'Image Gallery'],
      reasoning: 'Users compare modern corner sofa models and prices.',
    },
    { keyword: 'غرف نوم للعرسان 2026', dominant_intent: 'Inspirational', funnel_stage: 'TOFU' },
    { keyword: 'غرف اطفال مودرن 2026', dominant_intent: 'Inspirational', funnel_stage: 'MOFU' },
    { keyword: 'دريسنج روم', dominant_intent: 'Commercial', funnel_stage: 'MOFU' },
    { keyword: 'مكتب خشب', dominant_intent: 'Informational', funnel_stage: 'TOFU' },
  ],
}, null, 2)}`;
