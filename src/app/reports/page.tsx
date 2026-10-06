'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Trees,
  Hammer,
  Truck,
  Printer,
  Calendar,
  Layers,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { formatCurrency, formatCft } from '@/utils/currency';
import { formatDate, getTodayIsoDate } from '@/utils/dateUtils';
import { translateWoodSpecies } from '@/translations/dict';
import { amountInWords } from '@/utils/numberToWords';
import PrintHeader from '@/components/common/PrintHeader';

export default function ReportsPage() {
  const { language } = useApp();
  const { orders, expenses, sawmillLogs, inventory, craftsmen, quotations } = useData();

  // Financial Aggregations
  const totalSalesBooked = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalCashCollected = orders.reduce((sum, o) => sum + o.totalPaid, 0);
  const totalOutstandingDue = orders.reduce((sum, o) => sum + o.dueAmount, 0);
  const totalOperationalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Operating Profit
  const netOperatingProfit = totalCashCollected - totalOperationalExpenses;
  const grossProfitMargin = totalSalesBooked > 0 ? Math.round(((totalSalesBooked - totalOperationalExpenses) / totalSalesBooked) * 100) : 0;

  // Sawmill Production Metrics
  const totalRoundLogCft = sawmillLogs.reduce((sum, l) => sum + l.roundLogCft, 0);
  const totalSawnOutputCft = sawmillLogs.reduce((sum, l) => sum + l.outputSawnCft, 0);
  const totalWastageCft = sawmillLogs.reduce((sum, l) => sum + l.wastageCft, 0);
  const overallRecoveryRate = totalRoundLogCft > 0 ? Math.round((totalSawnOutputCft / totalRoundLogCft) * 100) : 0;

  // Wood Species Volume & Revenue Analysis
  const speciesMap = new Map<string, { cft: number; amount: number; orderCount: number }>();
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      const sp = item.woodSpecies || 'Other Wood';
      if (!speciesMap.has(sp)) {
        speciesMap.set(sp, { cft: 0, amount: 0, orderCount: 0 });
      }
      const entry = speciesMap.get(sp)!;
      entry.cft += item.totalCft || item.quantity * (item.cftPerPiece || 0);
      entry.amount += item.totalAmount;
      entry.orderCount += 1;
    });
  });

  const speciesStats = Array.from(speciesMap.entries()).sort((a, b) => b[1].amount - a[1].amount);

  // Product Type Distribution (Doors, Frames, CFT, Furniture)
  const productTypeMap = new Map<string, { count: number; amount: number }>();
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      const type = item.itemType || 'other';
      if (!productTypeMap.has(type)) {
        productTypeMap.set(type, { count: 0, amount: 0 });
      }
      const p = productTypeMap.get(type)!;
      p.count += item.quantity;
      p.amount += item.totalAmount;
    });
  });

  const getProductTypeName = (type: string) => {
    switch (type) {
      case 'door':
        return language === 'bn' ? 'দরজার পাল্লা (Solid & Carved Doors)' : 'Door Shutters';
      case 'choukhat':
        return language === 'bn' ? 'দরজার চৌকাঠ (Frames / Choukhat)' : 'Door Frames';
      case 'timber_cft':
        return language === 'bn' ? 'সাইজ চেরাই কাঠ (Sawn Timber CFT)' : 'Sawn Timber CFT';
      case 'furniture':
        return language === 'bn' ? 'কাস্টম ফার্নিচার (Furniture)' : 'Furniture';
      case 'interior_item':
        return language === 'bn' ? 'ইন্টেরিয়র কাঠের কাজ (Interior Works)' : 'Interior Works';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'ব্যবসায়িক অ্যানালিটিক্স ও অডিট রিপোর্ট' : 'Business Analytics & Audit'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'লাভ-ক্ষতি বিবরণী, কাঠের প্রজাতিভিত্তিক বিক্রয় অনুপাত ও কারখানা উৎপাদনশীলতা।'
              : 'Financial profit & loss summary, timber species revenue share, and workshop efficiency.'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>{language === 'bn' ? 'অডিট রিপোর্ট প্রিন্ট (A4)' : 'Print Audit Statement'}</span>
        </button>
      </div>

      {/* Primary KPI Grid (Screen only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'bn' ? 'সর্বমোট বিক্রয় রেভিনিউ' : 'Gross Sales Revenue'}
          </span>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalSalesBooked, language)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{orders.length} {language === 'bn' ? 'টি সফল অর্ডার' : 'Finalized orders'}</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {language === 'bn' ? 'সংগৃহীত ক্যাশ ফান্ড' : 'Cash Inflow'}
          </span>
          <p className="text-2xl font-black text-emerald-700">{formatCurrency(totalCashCollected, language)}</p>
          <p className="text-[11px] text-slate-500 font-semibold">
            {language === 'bn' ? 'বকেয়া পাওনা:' : 'Due:'} <strong>{formatCurrency(totalOutstandingDue, language)}</strong>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            {language === 'bn' ? 'মোট পরিচালন ব্যয়' : 'Operational Spend'}
          </span>
          <p className="text-2xl font-black text-rose-700">{formatCurrency(totalOperationalExpenses, language)}</p>
          <p className="text-[11px] text-rose-600 font-semibold">
            {expenses.length} {language === 'bn' ? 'টি পরিশোধিত ভাউচার' : 'Approved vouchers'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-black to-zinc-900 border border-zinc-800 shadow-xl text-white space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            {language === 'bn' ? 'নিট অপারেটিং মার্জিন' : 'Net Operating Flow'}
          </span>
          <p className={`text-2xl font-black ${netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(netOperatingProfit, language)}
          </p>
          <p className="text-[11px] text-slate-300 font-medium">
            {language === 'bn' ? `লাভের হার: প্রায় ${grossProfitMargin}%` : `Margin: ~${grossProfitMargin}%`}
          </p>
        </div>
      </div>

      {/* Main Printable Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 printable-sheet print:p-0 print:border-none print:shadow-none print:space-y-3">
        {/* Printable Header */}
        <div className="hidden print:block mb-4">
          <PrintHeader
            documentTitleBn="ব্যবসায়িক লাভ-ক্ষতি ও উৎপাদন রিপোর্ট"
            documentTitleEn="EXECUTIVE AUDIT & PERFORMANCE STATEMENT"
            docNumber={`AUD-${new Date().getFullYear()}`}
            docDate={formatDate(getTodayIsoDate(), language)}
          />
        </div>

        {/* Financial KPI Summary in Print */}
        <div className="space-y-3 print:space-y-1.5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300 print:text-[8pt] print:pb-1">
            <BarChart3 className="w-4 h-4 text-red-600 print:w-3 print:h-3" />
            <span>{language === 'bn' ? 'আর্থিক বিবরণী ও রেভিনিউ সারাংশ' : 'Financial Statement & Revenue Summary'}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'বিক্রয় রেভিনিউ' : 'Gross Sales'}</span>
              <p className="text-base font-black text-slate-900 print:text-black print:text-xs">{formatCurrency(totalSalesBooked, language)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-emerald-700 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'আদায়কৃত ক্যাশ' : 'Cash Inflow'}</span>
              <p className="text-base font-black text-emerald-700 print:text-black print:text-xs">{formatCurrency(totalCashCollected, language)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-rose-700 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'পরিচালন ব্যয়' : 'Expenses'}</span>
              <p className="text-base font-black text-rose-700 print:text-black print:text-xs">{formatCurrency(totalOperationalExpenses, language)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-slate-700 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'নিট মার্জিন' : 'Net Margin'}</span>
              <p className="text-base font-black text-slate-900 print:text-black print:text-xs">{formatCurrency(netOperatingProfit, language)}</p>
            </div>
          </div>
        </div>

        {/* Timber Production & Sawmill Efficiency Panel */}
        <div className="space-y-3 print:space-y-1.5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300 print:text-[8pt] print:pb-1">
            <Trees className="w-4 h-4 text-emerald-600 print:w-3 print:h-3" />
            <span>{language === 'bn' ? 'স-মিল গোল কাঠ চেরাই ও রিকভারি পারফরম্যান্স' : 'Sawmill Log Recovery & Efficiency'}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'ইনপুট গোল কাঠ' : 'Input Round Logs'}</span>
              <p className="text-base font-black text-slate-900 print:text-black print:text-xs">{formatCft(totalRoundLogCft, language)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-emerald-700 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'প্রাপ্ত সাইজ কাঠ' : 'Sawn Output'}</span>
              <p className="text-base font-black text-emerald-700 print:text-black print:text-xs">{formatCft(totalSawnOutputCft, language)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-rose-700 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'কাঠের গুঁড়া অপচয়' : 'Wastage (Sawdust)'}</span>
              <p className="text-base font-black text-rose-700 print:text-black print:text-xs">{formatCft(totalWastageCft, language)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
              <span className="text-[10px] font-bold text-blue-700 uppercase print:text-black print:text-[7pt]">{language === 'bn' ? 'কাঠের রিকভারি রেট' : 'Recovery Rate'}</span>
              <p className="text-base font-black text-blue-700 print:text-black print:text-xs">{overallRecoveryRate}%</p>
            </div>
          </div>
        </div>

        {/* Species Breakdown Table */}
        <div className="space-y-3 print:space-y-1.5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300 print:text-[8pt] print:pb-1">
            <PieChart className="w-4 h-4 text-red-600 print:w-3 print:h-3" />
            <span>{language === 'bn' ? 'কাঠের প্রজাতি অনুযায়ী বিক্রয় ও ভলিউম বিবরণী' : 'Wood Species Sales & Volume Breakdown'}</span>
          </h3>

          <div className="overflow-x-auto print:overflow-hidden print:w-full print:mb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                <tr>
                  <th className="p-3 rounded-l-xl">{language === 'bn' ? 'কাঠের প্রজাতি' : 'Wood Species'}</th>
                  <th className="p-3 text-center">{language === 'bn' ? 'আইটেম সংখ্যা' : 'Order Items'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'মোট পরিমাণ (CFT)' : 'Total Volume (CFT)'}</th>
                  <th className="p-3 text-right rounded-r-xl">{language === 'bn' ? 'মোট বিক্রয়মূল্য (৳)' : 'Revenue (BDT)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                {speciesStats.map(([species, stat], i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 print:text-black">
                      {translateWoodSpecies(species, language)}
                    </td>
                    <td className="p-3 text-center text-slate-600 print:text-black">{stat.orderCount}</td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-800 print:text-black">
                      {formatCft(stat.cft, language)}
                    </td>
                    <td className="p-3 text-right font-black text-red-700 print:text-black">
                      {formatCurrency(stat.amount, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Type Breakdown */}
        <div className="space-y-3 print:space-y-1.5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2 print:border-slate-300 print:text-[8pt] print:pb-1">
            <Layers className="w-4 h-4 text-amber-600 print:w-3 print:h-3" />
            <span>{language === 'bn' ? 'পণ্য ক্যাটাগরি ভিত্তিক বিক্রয়' : 'Product Category Share'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:gap-2">
            {Array.from(productTypeMap.entries()).map(([type, data], i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
                <span className="text-[11px] font-bold text-slate-600 print:text-black print:text-[7pt]">{getProductTypeName(type)}</span>
                <p className="text-base font-black text-slate-900 print:text-black print:text-xs">{formatCurrency(data.amount, language)}</p>
                <p className="text-[10px] text-slate-500 font-semibold print:text-slate-700 print:text-[6.5pt]">
                  {data.count} {language === 'bn' ? 'টি উৎপাদিত আইটেম' : 'units manufactured'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Section for Print */}
        <div className="hidden print:block pt-4 space-y-4">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs print:bg-white print:text-[8pt]">
            <span className="font-bold">{language === 'bn' ? 'সর্বমোট বিক্রয় কথায়:' : 'Total Sales in Words:'} </span>
            <span className="italic font-semibold">{amountInWords(totalSalesBooked, language)}</span>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center text-xs pt-6 signature-section print:pt-4 print:gap-3 print:text-[8pt]">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'অডিট অফিসার' : 'Auditor / Accountant'}
              </div>
              <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'চিফ অপারেটিং অফিসার' : 'Chief Operating Officer'}
              </div>
              <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">{language === 'bn' ? 'যাচাইকৃত ও অনুমোদিত' : 'Verified'}</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 print:text-black">
                {language === 'bn' ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
              </div>
              <p className="text-[10px] text-red-700 font-semibold print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
