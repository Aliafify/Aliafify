const diacritics = /[\u0617-\u061A\u064B-\u0652]/g;
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

export const normalizeArabic = (text: string): string =>
  text
    .replace(diacritics, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)))
    .trim()
    .toLowerCase();
