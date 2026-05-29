const EASTERN_ARABIC_DIGITS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

export const normalizeArabic = (value: string): string => value
  .toLowerCase()
  .replace(/[٠-٩۰-۹]/g, (digit) => EASTERN_ARABIC_DIGITS[digit] ?? digit)
  .replace(/[أإآٱ]/g, 'ا')
  .replace(/ؤ/g, 'و')
  .replace(/ئ/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/ى/g, 'ي')
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/ـ/g, '')
  .replace(/[،؛؟]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const normalizeKeywordList = (keywords: string[]): string[] => keywords
  .map((keyword) => keyword.trim())
  .filter(Boolean);
