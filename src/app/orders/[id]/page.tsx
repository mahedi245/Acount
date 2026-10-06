'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import InvoicePrintView from '@/components/orders/InvoicePrintView';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders } = useData();
  const { language } = useApp();

  const orderId = params?.id as string;
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">
          {language === 'bn' ? 'অর্ডারটি পাওয়া যায়নি' : 'Order not found'}
        </h2>
        <Link
          href="/orders"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
        >
          {language === 'bn' ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to Orders'}
        </Link>
      </div>
    );
  }

  return (
    <InvoicePrintView
      order={order}
      onBack={() => router.push('/orders')}
    />
  );
}
