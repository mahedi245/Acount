import { Language } from '@/types';

/**
 * Converts English digits to Bengali digits
 */
export function toBengaliNumerals(num: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

/**
 * Formats a number to Bangladeshi Taka (BDT / ৳) string
 */
export function formatCurrency(amount: number = 0, lang: Language = 'bn', showSymbol: boolean = true): string {
  const num = Math.round(Number(amount || 0));

  // Format with South Asian comma separator (e.g. 1,50,000)
  const formattedEn = num.toLocaleString('en-IN');

  if (lang === 'bn') {
    const bnFormatted = toBengaliNumerals(formattedEn);
    return showSymbol ? `৳ ${bnFormatted}` : bnFormatted;
  }

  return showSymbol ? `৳ ${formattedEn}` : formattedEn;
}

/**
 * Formats CFT with decimal representation and language choice
 */
export function formatCft(cft: number = 0, lang: Language = 'bn', decimals: number = 3): string {
  const val = Number(cft || 0).toFixed(decimals);
  if (lang === 'bn') {
    return `${toBengaliNumerals(val)} সিএফটি`;
  }
  return `${val} CFT`;
}

/**
 * Formats any number to Bengali if lang is 'bn'
 */
export function formatNumber(num: number | string, lang: Language = 'bn'): string {
  if (lang === 'bn') {
    return toBengaliNumerals(num);
  }
  return String(num);
}
