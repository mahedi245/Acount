'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Hammer,
  Trees,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
  Layers,
  Building2,
  Calendar,
  Scale,
  Printer,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatCft } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { translateWoodSpecies } from '@/translations/dict';
import StatusBadge from '@/components/common/Badge';
import SawmillModal from '@/components/production/SawmillModal';
import PrintHeader from '@/components/common/PrintHeader';

export default function ProductionPage() {
  const { language, showToast, t } = useApp();
  const { orders, sawmillLogs, updateOrderProductionStatus } = useData();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'sawmill'>('pipeline');
  const [isSawmillModalOpen, setIsSawmillModalOpen] = useState(false);

  const stages: { key: OrderStatus; bn: string; en: string; color: string }[] = [
    { key: 'confirmed', bn: '১. নিশ্চিত অর্ডার', en: '1. Confirmed', color: 'border-emerald-400 bg-emerald-50/40' },
    { key: 'wood_sizing', bn: '২. কাঠ চেরাই চলছে', en: '2. Wood Sizing', color: 'border-amber-400 bg-amber-50/40' },
    { key: 'carpentry', bn: '৩. কারিগর বানাচ্ছে', en: '3. Carpentry', color: 'border-orange-400 bg-orange-50/40' },
    { key: 'polish', bn: '৪. পলিশ ও ফিনিশিং', en: '4. Polishing', color: 'border-purple-400 bg-purple-50/40' },
    { key: 'ready_for_delivery', bn: '৫. ডেলিভারির জন্য প্রস্তুত', en: '5. Ready', color: 'border-red-400 bg-red-50/40' },
    { key: 'delivered', bn: '৬. সম্পূর্ণ ডেলিভারি সম্পন্ন', en: '6. Delivered', color: 'border-slate-400 bg-slate-100/60' },
  ];

  const getNextStage = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'confirmed':
        return 'wood_sizing';
      case 'wood_sizing':
        return 'carpentry';
      case 'carpentry':
        return 'polish';
      case 'polish':
        return 'ready_for_delivery';
      case 'ready_for_delivery':
        return 'delivered';
      default:
        return null;
    }
  };

  const handleAdvanceStage = (orderId: string, currentStatus: OrderStatus) => {
    const next = getNextStage(currentStatus);
    if (next) {
      updateOrderProductionStatus(orderId, next);
      showToast(
        language === 'bn' ? 'অর্ডারটি পরবর্তী প্রোডাকশন ধাপে স্থানান্তর করা হয়েছে।' : 'Advanced to next stage.',
        'success'
      );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Hammer className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'কারখানা প্রোডাকশন ও স-মিল ম্যানেজমেন্ট' : 'Production & Sawmill Tracker'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'কাঠ চেরাই, ফ্রেম-পাল্লা তৈরির ওয়ার্কফ্লো পাইপলাইন এবং স-মিল কাঠের অপচয় হিসাব।'
              : 'Live workshop progress board, artisan tasks, and sawmill sizing log tracker.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/production/interior"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-sm transition-all"
          >
            <Building2 className="w-4 h-4 text-red-600" />
            <span>{language === 'bn' ? 'ইন্টেরিয়র সাইট প্রজেক্ট' : 'Interior Projects'}</span>
          </Link>

          <button
            onClick={() => setIsSawmillModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
          >
            <Trees className="w-4 h-4 text-white" />
            <span>{language === 'bn' ? 'স-মিল লগ এন্ট্রি' : 'New Sawmill Log'}</span>
          </button>
        </div>
      </div>

      {/* Quick Production Sub-Modules Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <Link
          href="/production/kanban"
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            📋
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{language === 'bn' ? 'কানবান বোর্ড' : 'Kanban Board'}</p>
            <p className="text-[10px] text-slate-500">{language === 'bn' ? 'ফ্যাক্টরি ফ্লোর ভিউ' : 'Live Pipeline'}</p>
          </div>
        </Link>

        <Link
          href="/production/terminal"
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            🖥️
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{language === 'bn' ? 'ফ্লোর টার্মিনাল' : 'Floor Terminal'}</p>
            <p className="text-[10px] text-slate-500">{language === 'bn' ? 'কারখানা ওয়ার্কস্টেশন' : 'Worker Station'}</p>
          </div>
        </Link>

        <Link
          href="/production/dispatch"
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            🚚
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{language === 'bn' ? 'ডিসপ্যাচ ম্যানেজার' : 'Dispatch'}</p>
            <p className="text-[10px] text-slate-500">{language === 'bn' ? 'চালান ও ডেলিভারি' : 'Logistics'}</p>
          </div>
        </Link>

        <Link
          href="/production/analytics"
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            📊
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics'}</p>
            <p className="text-[10px] text-slate-500">{language === 'bn' ? 'রিপোর্ট ও মেট্রিক্স' : 'Performance'}</p>
          </div>
        </Link>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit no-print">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pipeline'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>{language === 'bn' ? 'ওয়ার্কশপ কানবান পাইপলাইন' : 'Production Kanban Board'}</span>
        </button>

        <button
          onClick={() => setActiveTab('sawmill')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sawmill'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trees className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'স-মিল চেরাই লগ ও অপচয়' : 'Sawmill Sizing Logs'}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px]">
            {sawmillLogs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Workshop Production Kanban Board */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4 no-print">
          {stages.map((st) => {
            const stageOrders = orders.filter((o) => {
              if (st.key === 'ready_for_delivery') {
                return o.status === 'ready_for_delivery' || o.status === 'partial_delivered';
              }
              return o.status === st.key;
            });

            return (
              <div
                key={st.key}
                className={`rounded-3xl border ${st.color} p-3.5 space-y-3 min-w-[240px] flex-1`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    {language === 'bn' ? st.bn : st.en}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white font-bold text-xs text-slate-800 border border-slate-200 shadow-xs">
                    {stageOrders.length}
                  </span>
                </div>

                {/* Orders in this stage */}
                <div className="space-y-3">
                  {stageOrders.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 font-medium italic">
                      {language === 'bn' ? 'এই ধাপে কোনো অর্ডার নেই' : 'No orders in this stage'}
                    </div>
                  ) : (
                    stageOrders.map((order) => {
                      const nextStage = getNextStage(order.status);

                      return (
                        <div
                          key={order.id}
                          className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2.5"
                        >
                          <div className="flex justify-between items-start">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-xs font-bold text-slate-900 hover:text-red-700 hover:underline"
                            >
                              {order.orderNumber}
                            </Link>
                            <span className="text-[10px] font-bold text-red-700">
                              {order.productionProgressPercent}%
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {order.customerName}
                          </p>

                          {/* Items summary */}
                          <div className="text-[10px] text-slate-500 space-y-0.5">
                            {order.items.slice(0, 2).map((it, i) => (
                              <p key={i} className="truncate">
                                • {it.quantity}x {it.description}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-slate-400 italic">
                                +{order.items.length - 2} {language === 'bn' ? 'টি অতিরিক্ত আইটেম' : 'more items'}
                              </p>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                            <span>{formatDate(order.expectedDeliveryDate, language)}</span>
                            <span className="font-bold text-slate-700">
                              {formatCurrency(order.grandTotal, language)}
                            </span>
                          </div>

                          {/* Advance button */}
                          {nextStage && (
                            <button
                              onClick={() => handleAdvanceStage(order.id, order.status)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold transition-colors shadow-sm"
                            >
                              <span>{language === 'bn' ? 'পরবর্তী ধাপে নিন' : 'Move Next'}</span>
                              <ArrowRight className="w-3 h-3 text-red-400" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Sawmill Sizing Logs Table */}
      {activeTab === 'sawmill' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5 printable-sheet print:p-0 print:border-none print:shadow-none print:space-y-2">
          {/* Header shown only on print */}
          <div className="hidden print:block mb-4">
            <PrintHeader
              documentTitleBn="স-মিল গোল কাঠ চেরাই ও অপচয় লগ বিবরণী"
              documentTitleEn="SAWMILL SIZING & TIMBER RECOVERY STATEMENT"
              docDate={new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 no-print">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {language === 'bn' ? 'স-মিল গোল কাঠ চেরাই হিসাব ও অপচয় লগ' : 'Sawmill Wood Sizing & Wastage Registry'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'প্রতিটি কাঠের লগের সাইজ কাঠ উৎপাদন, গুঁড়া অপচয় এবং স-মিল মিস্ত্রির মজুরি'
                  : 'Track Hoppus log volume, sawn wood recovery, and sawing labor costs'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="no-print flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Printer className="w-4 h-4 text-red-500" />
                <span>{language === 'bn' ? 'রিপোর্ট প্রিন্ট করুন (A4)' : 'Print Report (A4 PDF)'}</span>
              </button>

              <button
                onClick={() => setIsSawmillModalOpen(true)}
                className="no-print flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন চেরাই এন্ট্রি' : 'Add Sizing Log'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto print:mb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                <tr>
                  <th className="p-3">{language === 'bn' ? 'লগ ব্যাচ নং' : 'Batch #'}</th>
                  <th className="p-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="p-3">{language === 'bn' ? 'কাঠের প্রজাতি' : 'Wood Species'}</th>
                  <th className="p-3">{language === 'bn' ? 'লগের মাপ (L x Ber)' : 'Log Size (L×Girth)'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'গোল কাঠ CFT' : 'Round Log CFT'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'প্রাপ্ত সাইজ কাঠ' : 'Sawn Output'}</th>
                  <th className="p-3 text-center">{language === 'bn' ? 'অপচয় %' : 'Wastage %'}</th>
                  <th className="p-3">{language === 'bn' ? 'অপারেটর' : 'Sawyer'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'চেরাই খরচ' : 'Sawing Cost'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                {sawmillLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 print:text-black">{log.logBatchNo}</td>
                    <td className="p-3 text-slate-600 print:text-slate-800">{formatDate(log.entryDate, language)}</td>
                    <td className="p-3 font-semibold text-slate-800 print:text-black">{translateWoodSpecies(log.woodSpecies, language)}</td>
                    <td className="p-3 font-mono text-slate-600 print:text-slate-800">
                      {log.logLengthFt}' × {log.logGirthInches}"
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 print:text-black">{formatCft(log.roundLogCft, language)}</td>
                    <td className="p-3 text-right font-extrabold text-red-700 print:text-black">{formatCft(log.outputSawnCft, language)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200 print:text-black print:border">
                        {log.wastagePercent}% ({log.wastageCft} CFT)
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 print:text-black">{log.sawyerName}</td>
                    <td className="p-3 text-right font-bold text-slate-900 print:text-black">
                      {formatCurrency(log.totalSawingCost, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-black text-slate-900 print:bg-slate-200 border-t-2 border-slate-900">
                <tr>
                  <td colSpan={4} className="p-3 text-right uppercase">
                    {language === 'bn' ? 'সর্বমোট যোগফল:' : 'Total Output & Costs:'}
                  </td>
                  <td className="p-3 text-right">
                    {formatCft(sawmillLogs.reduce((sum, l) => sum + l.roundLogCft, 0), language)}
                  </td>
                  <td className="p-3 text-right text-red-700 font-black">
                    {formatCft(sawmillLogs.reduce((sum, l) => sum + l.outputSawnCft, 0), language)}
                  </td>
                  <td className="p-3 text-center text-slate-600">
                    {sawmillLogs.reduce((sum, l) => sum + l.roundLogCft, 0) > 0
                      ? `${Math.round(
                          (sawmillLogs.reduce((sum, l) => sum + l.wastageCft, 0) /
                            sawmillLogs.reduce((sum, l) => sum + l.roundLogCft, 0)) *
                            100
                        )}%`
                      : '0%'}
                  </td>
                  <td></td>
                  <td className="p-3 text-right text-slate-900">
                    {formatCurrency(sawmillLogs.reduce((sum, l) => sum + l.totalSawingCost, 0), language)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures on print */}
          <div className="hidden print:grid grid-cols-3 gap-6 pt-8 text-center text-xs signature-section print:pt-4 print:gap-3 print:text-[8pt]">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'স-মিল ইন-চার্জ' : 'Sawmill In-Charge'}
              </div>
              <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'স্টক অডিটর' : 'Stock Auditor'}
              </div>
              <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 print:text-black">
                {language === 'bn' ? 'কারখানা কর্তৃপক্ষ' : 'Factory Authority'}
              </div>
              <p className="text-[10px] text-red-700 font-semibold print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
            </div>
          </div>
        </div>
      )}

      {/* Sawmill Modal */}
      <SawmillModal
        isOpen={isSawmillModalOpen}
        onClose={() => setIsSawmillModalOpen(false)}
      />
    </div>
  );
}
