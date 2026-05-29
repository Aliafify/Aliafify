const flattenUnknown = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(flattenUnknown);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const keyword = String(value).trim();
    return keyword ? [keyword] : [];
  }

  return [];
};

export const parseKeywordInput = (rawInput: string): string[] => {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    try {
      return flattenUnknown(JSON.parse(trimmed));
    } catch {
      // Fall back to plain-text tokenization so pasted JS-like arrays still produce useful keywords.
    }
  }

  return trimmed
    .split(/\r?\n|,/)
    .map((keyword) => keyword.replace(/^['"`\s]+|['"`\s;]+$/g, '').trim())
    .filter(Boolean);
};

export const sampleKeywordJson = JSON.stringify([
  ['غرف نوم مودرن', 'ركنه مودرن', 'انتريه حديث'],
  ['غرف اطفال دورين', 'سفرة ٨ كراسي', 'دريسنج روم'],
  ['مكتب خشب', 'كنبة ليفنج', 'دولاب جرار ٢٠٢٦'],
], null, 2);
