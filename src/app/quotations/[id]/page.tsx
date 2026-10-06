'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import QuotationPrintView from '@/components/quotations/QuotationPrintView';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { quotations } = useData();
  const { language } = useApp();

  const quotationId = params?.id as string;
  const quotation = quotations.find((q) => q.id === quotationId);

  if (!quotation) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">
          {language === 'bn' ? 'কোটেশনটি পাওয়া যায়নি' : 'Quotation not found'}
        </h2>
        <Link
          href="/quotations"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
        >
          {language === 'bn' ? 'কোটেশন তালিকায় ফিরে যান' : 'Back to Quotations'}
        </Link>
      </div>
    );
  }

  return (
    <QuotationPrintView
      quotation={quotation}
      onBack={() => router.push('/quotations')}
    />
  );
}
