import { Language } from '@/types';
import { toBengaliNumerals } from './currency';

/**
 * Formats standard ISO or date string to readable format
 */
export function formatDate(dateString?: string, lang: Language = 'bn'): string {
  if (!dateString) return '-';

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const day = d.getDate();
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

  const month = d.getMonth();
  const year = d.getFullYear();

  if (lang === 'bn') {
    return `${toBengaliNumerals(day)} ${monthNamesBn[month]}, ${toBengaliNumerals(year)}`;
  }

  return `${day} ${monthNamesEn[month]} ${year}`;
}

export function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDaysToDate(dateString: string, days: number): string {
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function isOverdue(targetDateString: string): boolean {
  if (!targetDateString) return false;
  const target = new Date(targetDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target < today;
}
