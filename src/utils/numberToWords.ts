import { Language } from '@/types';

const bnOnes = [
  '',
  'এক',
  'দুই',
  'তিন',
  'চার',
  'পাঁচ',
  'ছয়',
  'সাত',
  'আট',
  'নয়',
  'দশ',
  'এগারো',
  'বারো',
  'তেরো',
  'চৌদ্দ',
  'পনেরো',
  'ষোল',
  'সতেরো',
  'আঠারো',
  'উনিশ',
  'বিশ',
  'একুশ',
  'বাইশ',
  'তেইশ',
  'চব্বিশ',
  'পঁচিশ',
  'ছাব্বিশ',
  'সাতাশ',
  'আঠাশ',
  'উনত্রিশ',
  'ত্রিশ',
  'একত্রিশ',
  'বত্রিশ',
  'তেত্রিশ',
  'চৌত্রিশ',
  'পঁয়ত্রিশ',
  'ছত্রিশ',
  'সাঁইত্রিশ',
  'আটত্রিশ',
  'উনচল্লিশ',
  'চল্লিশ',
  'একচল্লিশ',
  'বিয়াল্লিশ',
  'তেতাল্লিশ',
  'চুয়াল্লিশ',
  'পঁয়তাল্লিশ',
  'ছেচল্লিশ',
  'সাতচল্লিশ',
  'আটচল্লিশ',
  'উনপঞ্চাশ',
  'পঞ্চাশ',
  'একান্ন',
  'বায়ান্ন',
  'তিপ্পান্ন',
  'চুয়ান্ন',
  'পঞ্চান্ন',
  'ছাপ্পান্ন',
  'সাতান্ন',
  'আটান্ন',
  'উনষাট',
  'ষাট',
  'একষট্টি',
  'বাষট্টি',
  'তেষট্টি',
  'চৌষট্টি',
  'পঁয়ষট্টি',
  'ছেষট্টি',
  'সাতষট্টি',
  'আটষট্টি',
  'উনসত্তর',
  'সত্তর',
  'একাত্তর',
  'বাহাত্তর',
  'তিয়াত্তর',
  'চুয়াত্তর',
  'পঁচাত্তর',
  'ছিয়াত্তর',
  'সাতাত্তর',
  'আটাত্তর',
  'উনাশি',
  'আশি',
  'একাশি',
  'বিরাশি',
  'তিরাশি',
  'চুরাশি',
  'পঁচাশি',
  'ছিয়াশি',
  'সাতাশি',
  'অষ্টআশি',
  'উননব্বই',
  'নব্বই',
  'একানব্বই',
  'বানব্বই',
  'তিরানব্বই',
  'চুরানব্বই',
  'পঁচানব্বই',
  'ছিয়ানব্বই',
  'সাতানব্বই',
  'আটানব্বই',
  'নিরানব্বই',
];

const enOnes = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const enTens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousandBn(n: number): string {
  let result = '';
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    result += `${bnOnes[hundreds]} শত `;
    n %= 100;
  }
  if (n > 0) {
    result += bnOnes[n];
  }
  return result.trim();
}

function convertBelowThousandEn(n: number): string {
  let result = '';
  if (n >= 100) {
    result += `${enOnes[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    result += `${enTens[Math.floor(n / 10)]} `;
    n %= 10;
  }
  if (n > 0) {
    result += `${enOnes[n]} `;
  }
  return result.trim();
}

/**
 * Convert number to Bengali words (কথায়)
 * Uses Indian numbering system: কোটি (crore), লাখ (lakh), হাজার (thousand), শত (hundred)
 */
export function numberToWordsBn(num: number): string {
  let n = Math.round(Math.abs(num));
  if (n === 0) return 'শূন্য টাকা মাত্র';

  let parts: string[] = [];

  // Crores (কোটি)
  if (n >= 10000000) {
    const crores = Math.floor(n / 10000000);
    parts.push(`${numberToWordsBnHelper(crores)} কোটি`);
    n %= 10000000;
  }

  // Lakhs (লাখ)
  if (n >= 100000) {
    const lakhs = Math.floor(n / 100000);
    parts.push(`${bnOnes[lakhs]} লাখ`);
    n %= 100000;
  }

  // Thousands (হাজার)
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    parts.push(`${bnOnes[thousands]} হাজার`);
    n %= 1000;
  }

  // Hundreds and remainder
  if (n > 0) {
    parts.push(convertBelowThousandBn(n));
  }

  return `${parts.filter(Boolean).join(' ')} টাকা মাত্র`;
}

function numberToWordsBnHelper(n: number): string {
  let parts: string[] = [];
  if (n >= 10000000) {
    parts.push(`${numberToWordsBnHelper(Math.floor(n / 10000000))} কোটি`);
    n %= 10000000;
  }
  if (n >= 100000) {
    parts.push(`${bnOnes[Math.floor(n / 100000)]} লাখ`);
    n %= 100000;
  }
  if (n >= 1000) {
    parts.push(`${bnOnes[Math.floor(n / 1000)]} হাজার`);
    n %= 1000;
  }
  if (n > 0) {
    parts.push(convertBelowThousandBn(n));
  }
  return parts.filter(Boolean).join(' ');
}

/**
 * Convert number to English words
 */
export function numberToWordsEn(num: number): string {
  let n = Math.round(Math.abs(num));
  if (n === 0) return 'Zero Taka Only';

  let parts: string[] = [];

  if (n >= 10000000) {
    const crores = Math.floor(n / 10000000);
    parts.push(`${numberToWordsEnHelper(crores)} Crore`);
    n %= 10000000;
  }

  if (n >= 100000) {
    const lakhs = Math.floor(n / 100000);
    parts.push(`${convertBelowThousandEn(lakhs)} Lakh`);
    n %= 100000;
  }

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    parts.push(`${convertBelowThousandEn(thousands)} Thousand`);
    n %= 1000;
  }

  if (n > 0) {
    parts.push(convertBelowThousandEn(n));
  }

  return `${parts.filter(Boolean).join(' ')} Taka Only`;
}

function numberToWordsEnHelper(n: number): string {
  let parts: string[] = [];
  if (n >= 10000000) {
    parts.push(`${numberToWordsEnHelper(Math.floor(n / 10000000))} Crore`);
    n %= 10000000;
  }
  if (n >= 100000) {
    parts.push(`${convertBelowThousandEn(Math.floor(n / 100000))} Lakh`);
    n %= 100000;
  }
  if (n >= 1000) {
    parts.push(`${convertBelowThousandEn(Math.floor(n / 1000))} Thousand`);
    n %= 1000;
  }
  if (n > 0) {
    parts.push(convertBelowThousandEn(n));
  }
  return parts.filter(Boolean).join(' ');
}

export function amountInWords(amount: number, lang: Language = 'bn'): string {
  return lang === 'bn' ? numberToWordsBn(amount) : numberToWordsEn(amount);
}
