/**
 * Persian Legal Text Normalizer
 * Standardizes Arabic/Persian characters, half-spaces (ZWNJs), numerals, and legal citation patterns.
 */

export function normalizePersian(text: string): string {
  if (!text) return "";

  let result = text;

  // 1. Character standardization
  result = result
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/ة/g, "ت")
    .replace(/ؤ/g, "و")
    .replace(/إ/g, "ا")
    .replace(/أ/g, "ا")
    .replace(/ء/g, "");

  // 2. Arabic/English numbers to Persian numbers or standard normalization
  const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const persianNums = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNums[i], "g"), persianNums[i]);
  }

  // 3. Half-space (ZWNJ \u200c) cleanup and normalization
  result = result
    .replace(/\u200c{2,}/g, "\u200c") // multiple ZWNJs to one
    .replace(/\s+\u200c/g, " ") // space + ZWNJ
    .replace(/\u200c\s+/g, " ") // ZWNJ + space
    // Standard legal prefixes & suffixes
    .replace(/\bمی\s+/g, "می‌")
    .replace(/\bنمی\s+/g, "نمی‌")
    .replace(/\s+ها\b/g, "‌ها")
    .replace(/\s+های\b/g, "‌های")
    .replace(/\s+تر\b/g, "‌تر")
    .replace(/\s+ترین\b/g, "‌ترین")
    .replace(/\s+ای\b/g, "‌ای");

  // 4. Multi-spaces & whitespace cleanup
  result = result.replace(/[ \t]+/g, " ").trim();

  return result;
}

export function extractLegalKeywords(query: string): string[] {
  const normalized = normalizePersian(query);
  const stopWords = new Set([
    "در", "از", "به", "با", "که", "این", "آن", "برای", "است", "شد", "می‌شود",
    "را", "و", "یا", "اگر", "چون", "تا", "بر", "یک", "باید", "آیا", "چگونه", "چیست"
  ]);

  return normalized
    .split(/[\s,،؛\.\(\)\[\]\-]+/)
    .filter(w => w.length > 1 && !stopWords.has(w));
}
