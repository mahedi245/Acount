'use client';

import React from 'react';
import { OrderStatus, QuotationStatus } from '@/types';
import { useApp } from '@/context/AppContext';

interface BadgeProps {
  status: OrderStatus | QuotationStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: BadgeProps) {
  const { language, t } = useApp();

  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          labelBn: 'খসড়া',
          labelEn: 'Draft',
        };
      case 'sent':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          labelBn: 'পাঠানো হয়েছে',
          labelEn: 'Sent',
        };
      case 'approved':
      case 'confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          labelBn: 'অর্ডার নিশ্চিত',
          labelEn: 'Confirmed',
        };
      case 'wood_sizing':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          labelBn: 'কাঠ চেরাই চলছে',
          labelEn: 'Wood Sizing',
        };
      case 'carpentry':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
          labelBn: 'কারিগর কাজ করছে',
          labelEn: 'Carpentry',
        };
      case 'polish':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          labelBn: 'পলিশ ও ফিনিশিং',
          labelEn: 'Polish & Finish',
        };
      case 'ready_for_delivery':
        return {
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          dot: 'bg-cyan-500',
          labelBn: 'ডেলিভারির জন্য রেডি',
          labelEn: 'Ready for Delivery',
        };
      case 'partial_delivered':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          labelBn: 'আংশিক ডেলিভারি সম্পন্ন',
          labelEn: 'Partial Delivered',
        };
      case 'delivered':
      case 'converted':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          labelBn: 'সম্পূর্ণ ডেলিভারি সম্পন্ন',
          labelEn: 'Delivered',
        };
      case 'rejected':
      case 'cancelled':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          labelBn: 'বাতিল',
          labelEn: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          labelBn: status,
          labelEn: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {language === 'bn' ? config.labelBn : config.labelEn}
    </span>
  );
}
