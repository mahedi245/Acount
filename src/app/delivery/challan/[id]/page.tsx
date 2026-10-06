'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import ChallanPrintView from '@/components/delivery/ChallanPrintView';
import { Truck } from 'lucide-react';
import Link from 'next/link';

export default function ChallanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { deliveryChallans, orders } = useData();
  const { language } = useApp();

  const challanId = params?.id as string;
  const challan = deliveryChallans.find((c) => c.id === challanId);
  const order = challan ? orders.find((o) => o.id === challan.orderId) : undefined;

  if (!challan) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">
          {language === 'bn' ? 'চালানটি পাওয়া যায়নি' : 'Challan not found'}
        </h2>
        <Link
          href="/delivery"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
        >
          {language === 'bn' ? 'চালান তালিকায় ফিরে যান' : 'Back to Deliveries'}
        </Link>
      </div>
    );
  }

  return (
    <ChallanPrintView
      challan={challan}
      order={order}
      onBack={() => router.push('/delivery')}
    />
  );
}
