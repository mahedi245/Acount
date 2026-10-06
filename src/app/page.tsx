'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  FileSpreadsheet,
  Hammer,
  Truck,
  CalendarCheck,
  Trees,
  Calculator,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Layers,
  ChevronRight,
  UserCheck,
  BarChart3,
  Landmark,
  Building2,
  Coins,
  Smartphone,
  ArrowRightLeft,
  BookOpen,
  Target,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { formatCurrency, formatCft } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/Badge';
import {
  translateWoodSpecies,
  translateLocation,
  translateItemType,
} from '@/translations/dict';

export default function Dashboard() {
  const { language, openCftModal, t } = useApp();
  const {
    orders,
    quotations,
    craftsmen,
    inventory,
    expenses,
    sawmillLogs,
    interiorProjects,
    deliveryChallans,
    attendanceRecords,
    financialAccounts,
    getAccountLiveBalance,
    getAllAccountsSummary,
  } = useData();

  // Financial Accounts live summary
  const accountsSummary = getAllAccountsSummary();

  // Financial KPI calculations
  const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalReceived = orders.reduce((sum, o) => sum + o.totalPaid, 0);
  const totalDue = orders.reduce((sum, o) => sum + o.dueAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = totalReceived - totalExpenses;

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const readyOrders = orders.filter((o) => o.status === 'ready_for_delivery');

  const pendingQuotations = quotations.filter(
    (q) => q.status === 'draft' || q.status === 'sent'
  );

  // Today's attendance count
  const presentCraftsmenCount = attendanceRecords.filter((a) => a.status === 'present').length;

  // Pipeline counts
  const pipelineCounts = {
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    wood_sizing: orders.filter((o) => o.status === 'wood_sizing').length,
    carpentry: orders.filter((o) => o.status === 'carpentry').length,
    polish: orders.filter((o) => o.status === 'polish').length,
    ready_for_delivery: orders.filter((o) => o.status === 'ready_for_delivery').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-black via-zinc-950 to-red-950/90 p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 backdrop-blur-md text-red-300 text-xs font-semibold border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {language === 'bn' ? 'স-মিল ও ওয়ার্কশপ অপারেশন লাইভ' : 'Workshop Active & Live'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans flex items-center gap-2.5">
              <span>{language === 'bn' ? 'ঢাকা টিম্বার কমপ্লেক্স' : 'DHAKA TIMBER COMPLEX'}</span>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-red-600 text-white shadow">DTC</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              {language === 'bn'
                ? 'কাঠ চেরাই, সিজনড ডোর-চৌকাঠ, ফার্নিচার ও আর্কিটেকচারাল ইন্টেরিয়র প্রজেক্ট ম্যানেজমেন্ট।'
                : 'Door, Door Frame, Furniture, Timber Merchant & Suppliers ERP.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quotations"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/40 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন কোটেশন' : 'New Quotation'}</span>
            </Link>

            <button
              onClick={openCftModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <Calculator className="w-4 h-4 text-red-400" />
              <span>{language === 'bn' ? 'CFT মাপুন' : 'CFT Tool'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-72 h-72 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Live Financial & Multi-Bank Liquidity Hub */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 uppercase tracking-wider mb-1">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'লাইভ ব্যাংক ও ক্যাশ অ্যাকাউন্টস ড্যাশবোর্ড' : 'Live Accounts & Banking Hub'}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {language === 'bn' ? 'কোম্পানির আর্থিক ব্যালেন্স ও লিকুইড ফান্ড' : 'Live Company Liquidity & Bank Balances'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/accounts"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'পূর্ণাঙ্গ লেজার ও ব্যাংকিং' : 'Full Banking Ledger'}</span>
            </Link>
          </div>
        </div>

        {/* 4 Multi-Account Liquid Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Liquid */}
          <div className="bg-slate-950 text-white p-4 rounded-2xl space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              {language === 'bn' ? 'সর্বমোট লিকুইড ব্যালেন্স' : 'Total Liquid Balance'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(accountsSummary.totalLiveBalance, language)}
            </p>
            <span className="text-[10px] text-slate-300 font-medium block">
              {financialAccounts.filter((a) => a.isActive).length} টি সক্রিয় অ্যাকাউন্টে
            </span>
          </div>

          {/* Factory Petty Cash */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                {language === 'bn' ? 'কারখানা পেটি ক্যাশ' : 'Factory Petty Cash'}
              </span>
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-900 font-mono">
              {formatCurrency(getAccountLiveBalance('acc-1').liveBalance, language)}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold block">বাড্ডা ফ্যাক্টরি ও স-মিল ক্যাশ</span>
          </div>

          {/* Bank Balances */}
          <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
                {language === 'bn' ? 'ব্যাংক ব্যালেন্স' : 'In Banks'}
              </span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-blue-900 font-mono">
              {formatCurrency(accountsSummary.totalBank, language)}
            </p>
            <span className="text-[10px] text-blue-700 font-semibold block">ইসলামী ও ইস্টার্ন ব্যাংক</span>
          </div>

          {/* MFS (bKash/Nagad) */}
          <div className="bg-pink-50/70 border border-pink-200/80 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-pink-800 uppercase tracking-wider block">
                {language === 'bn' ? 'বিকাশ মার্চেন্ট' : 'bKash Wallet'}
              </span>
              <Smartphone className="w-4 h-4 text-pink-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-pink-900 font-mono">
              {formatCurrency(accountsSummary.totalMfs, language)}
            </p>
            <span className="text-[10px] text-pink-700 font-semibold block">মার্চেন্ট কিউআর ওয়ালেট</span>
          </div>
        </div>

        {/* Live Accounts Quick Strip */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-slate-500" />
            <span>অ্যাকাউন্ট রিয়েল-টাইম ব্যালেন্স:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {financialAccounts.slice(0, 4).map((acc) => {
              const live = getAccountLiveBalance(acc.id).liveBalance;
              return (
                <div
                  key={acc.id}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-medium flex items-center gap-2 shadow-2xs"
                >
                  <span className="text-slate-600 truncate max-w-[130px] font-semibold">{acc.accountName.split('(')[0]}</span>
                  <strong className="font-mono text-slate-900 font-black">৳{live.toLocaleString('en-IN')}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title={language === 'bn' ? 'মোট বিক্রয় / অর্ডার মূল্য' : 'Total Order Value'}
          value={formatCurrency(totalSales, language)}
          subtitle={`${orders.length} ${language === 'bn' ? 'টি মোট অর্ডার' : 'Total Orders'}`}
          icon={TrendingUp}
          colorTheme="wood"
        />

        <StatCard
          title={language === 'bn' ? 'মোট পাওনা / বকেয়া' : 'Total Due / Receivables'}
          value={formatCurrency(totalDue, language)}
          subtitle={`${language === 'bn' ? 'নগদ জমা:' : 'Collected:'} ${formatCurrency(totalReceived, language)}`}
          icon={DollarSign}
          colorTheme="amber"
        />

        <StatCard
          title={language === 'bn' ? 'চলমান কারখানা অর্ডার' : 'Active Workshop Orders'}
          value={`${activeOrders.length} ${language === 'bn' ? 'টি' : 'Orders'}`}
          subtitle={`${readyOrders.length} ${language === 'bn' ? 'টি ডেলিভারির জন্য প্রস্তুত' : 'Ready to Dispatch'}`}
          icon={Hammer}
          colorTheme="forest"
        />

        <StatCard
          title={language === 'bn' ? 'উপস্থিত কারিগর ও কর্মী' : 'Craftsmen on Duty'}
          value={`${presentCraftsmenCount} / ${craftsmen.length}`}
          subtitle={`${language === 'bn' ? 'আজকের উপস্থিতি সক্রিয়' : 'Attended Today'}`}
          icon={CalendarCheck}
          colorTheme="blue"
        />
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            {language === 'bn' ? 'কুইক অ্যাকশন মেনু' : 'Quick Actions Hub'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'bn' ? 'এক ক্লিকে কাজের প্রক্রিয়া শুরু করুন' : 'Instant operational shortcuts'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          <Link
            href="/quotations"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50/60 hover:bg-red-100/80 border border-red-200/60 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-red-600 text-white mb-2 shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'কোটেশন তৈরি' : 'New Quote'}
            </span>
            <span className="text-[10px] text-red-700 font-semibold mt-0.5">
              {pendingQuotations.length} {language === 'bn' ? 'টি পেন্ডিং' : 'Pending'}
            </span>
          </Link>

          <Link
            href="/orders"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 hover:bg-black border border-zinc-800 text-center group transition-all text-white"
          >
            <div className="p-2.5 rounded-xl bg-red-600 text-white mb-2 shadow-md shadow-red-600/30 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">
              {language === 'bn' ? 'অর্ডার ও ইনভয়েস' : 'Work Orders'}
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              {activeOrders.length} {language === 'bn' ? 'টি রানিং' : 'Running'}
            </span>
          </Link>

          <Link
            href="/accounts"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200/60 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-emerald-700 text-white mb-2 shadow-md shadow-emerald-700/20 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'আয়-ব্যয় ও ব্যাংক' : 'Accounts'}
            </span>
            <span className="text-[10px] text-emerald-800 font-bold mt-0.5 font-mono">
              ৳{(accountsSummary.totalLiveBalance / 1000).toFixed(0)}k
            </span>
          </Link>

          <Link
            href="/marketing"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200/60 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-amber-600 text-white mb-2 shadow-md shadow-amber-600/20 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'মার্কেটিং কমিশন' : 'Marketing'}
            </span>
            <span className="text-[10px] text-amber-800 font-semibold mt-0.5">
              ১% কালেকশন
            </span>
          </Link>

          <Link
            href="/rules-book"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50/60 hover:bg-red-100/80 border border-red-200/60 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-red-600 text-white mb-2 shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'রুলস বুক SOP' : 'Rules Book'}
            </span>
            <span className="text-[10px] text-red-700 font-semibold mt-0.5">
              সূত্র ও গাইড
            </span>
          </Link>

          <Link
            href="/customers"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-zinc-900 text-white mb-2 shadow-md shadow-zinc-900/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'গ্রাহক খতিয়ান' : 'Clients'}
            </span>
            <span className="text-[10px] text-slate-600 font-medium mt-0.5">
              {language === 'bn' ? 'বকেয়া পাওনা' : 'Receivables'}
            </span>
          </Link>

          <Link
            href="/delivery"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-slate-900 text-white mb-2 shadow-md shadow-slate-900/20 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'ডেলিভারি চালান' : 'Challan'}
            </span>
            <span className="text-[10px] text-slate-600 font-medium mt-0.5">
              {deliveryChallans.length} {language === 'bn' ? 'টি চালান' : 'Generated'}
            </span>
          </Link>

          <button
            onClick={openCftModal}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50/60 hover:bg-red-100/80 border border-red-200/60 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-red-600 text-white mb-2 shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'CFT পরিমাপ' : 'CFT Calc'}
            </span>
            <span className="text-[10px] text-red-700 font-semibold mt-0.5">
              {language === 'bn' ? 'সাইজ ও গোল কাঠ' : 'Sawn & Round'}
            </span>
          </button>

          <Link
            href="/production"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-zinc-800 text-white mb-2 shadow-md shadow-zinc-800/20 group-hover:scale-110 transition-transform">
              <Hammer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'স-মিল ও চেরাই' : 'Sawmill Log'}
            </span>
            <span className="text-[10px] text-slate-600 font-medium mt-0.5">
              {sawmillLogs.length} {language === 'bn' ? 'টি লগ' : 'Logs'}
            </span>
          </Link>

          <Link
            href="/attendance"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-white mb-2 shadow-md shadow-slate-800/20 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {language === 'bn' ? 'হাজিরা ও খোরাকি' : 'Attendance'}
            </span>
            <span className="text-[10px] text-slate-600 font-medium mt-0.5">
              {language === 'bn' ? 'বেতন ও মজুরি' : 'Payroll Sheet'}
            </span>
          </Link>
        </div>
      </div>

      {/* Workshop Production Pipeline Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {language === 'bn' ? 'কারখানার লাইভ প্রোডাকশন পাইপলাইন' : 'Live Production Pipeline'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn'
                ? 'অর্ডার গ্রহণ থেকে ডেলিভারি পর্যন্ত কারখানার প্রতিটি ধাপের বর্তমান অগ্রগতি'
                : 'Order progress across sizing, carpentry, polishing and dispatch stages'}
            </p>
          </div>
          <Link
            href="/production"
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <span>{language === 'bn' ? 'বিস্তারিত বোর্ড' : 'Kanban Board'}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pipeline Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              {language === 'bn' ? '১. নিশ্চিত অর্ডার' : '1. Confirmed'}
            </span>
            <p className="text-2xl font-black text-emerald-900 mt-1">
              {pipelineCounts.confirmed}
            </p>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              {language === 'bn' ? 'অর্ডার প্রসেসিংয়ে' : 'In queue'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              {language === 'bn' ? '২. কাঠ চেরাই' : '2. Wood Sizing'}
            </span>
            <p className="text-2xl font-black text-amber-900 mt-1">
              {pipelineCounts.wood_sizing}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              {language === 'bn' ? 'স-মিলে সাইজিং' : 'Sawmill cutting'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">
              {language === 'bn' ? '৩. কারিগর বানাচ্ছে' : '3. Carpentry'}
            </span>
            <p className="text-2xl font-black text-orange-900 mt-1">
              {pipelineCounts.carpentry}
            </p>
            <p className="text-[10px] text-orange-700 mt-0.5">
              {language === 'bn' ? 'ফ্রেম ও পাল্লা তৈরি' : 'Joinery & Assembly'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              {language === 'bn' ? '৪. পলিশ ও ফিনিশিং' : '4. Polishing'}
            </span>
            <p className="text-2xl font-black text-purple-900 mt-1">
              {pipelineCounts.polish}
            </p>
            <p className="text-[10px] text-purple-700 mt-0.5">
              {language === 'bn' ? 'ফিনিশিং' : 'Lacquer / Finish'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200">
            <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
              {language === 'bn' ? '৫. প্রস্তুত' : '5. Ready'}
            </span>
            <p className="text-2xl font-black text-red-700 mt-1">
              {pipelineCounts.ready_for_delivery}
            </p>
            <p className="text-[10px] text-red-600 mt-0.5">
              {language === 'bn' ? 'চালান ছাড়ার জন্য' : 'QC passed'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {language === 'bn' ? '৬. ডেলিভারি সম্পন্ন' : '6. Delivered'}
            </span>
            <p className="text-2xl font-black text-white mt-1">
              {pipelineCounts.delivered}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'bn' ? 'সাইটে পৌঁছানো হয়েছে' : 'At Client site'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Stock Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Active Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {language === 'bn' ? 'সাম্প্রতিক কাজের অর্ডার' : 'Recent Work Orders'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'সর্বশেষ অনুমোদিত অর্ডার ও ডেলিভারি অগ্রগতি'
                  : 'Latest confirmed orders & delivery progress'}
              </p>
            </div>

            <Link
              href="/orders"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'সকল অর্ডার' : 'View All'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto print:overflow-hidden print:w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">{language === 'bn' ? 'অর্ডার নং' : 'Order #'}</th>
                  <th className="p-3">{language === 'bn' ? 'গ্রাহকের নাম' : 'Customer'}</th>
                  <th className="p-3">{language === 'bn' ? 'ডেলিভারি তারিখ' : 'Delivery Date'}</th>
                  <th className="p-3">{language === 'bn' ? 'মোট টাকা' : 'Grand Total'}</th>
                  <th className="p-3">{language === 'bn' ? 'বকেয়া' : 'Due'}</th>
                  <th className="p-3">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-red-600">
                      <Link href={`/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-500">{order.customerPhone}</p>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {formatDate(order.expectedDeliveryDate, language)}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {formatCurrency(order.grandTotal, language)}
                    </td>
                    <td className="p-3 font-extrabold text-rose-600">
                      {formatCurrency(order.dueAmount, language)}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Timber Stock Status */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Trees className="w-4 h-4 text-red-600" />
              <span>{language === 'bn' ? 'টিম্বার ও কাঠের স্টক' : 'Wood Stock Overview'}</span>
            </h2>
            <Link
              href="/inventory"
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              {language === 'bn' ? 'গোডাউন' : 'Godown'}
            </Link>
          </div>

          <div className="space-y-3">
            {inventory.slice(0, 5).map((item) => {
              const isLow = item.currentStock <= item.minAlertStock;
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isLow
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {translateWoodSpecies(item.species, language)}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {translateLocation(item.location, language)} • {translateItemType(item.type, language)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-red-600">
                        {formatCft(item.currentStock, language, 1)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        @ {formatCurrency(item.sellingRate, language)}
                      </p>
                    </div>
                  </div>

                  {isLow && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-700">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{language === 'bn' ? 'স্টক কমে গেছে! নতুন কাঠ প্রয়োজন' : 'Low Stock Alert'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/cft-calculator"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Calculator className="w-4 h-4 text-red-400" />
              <span>{language === 'bn' ? 'সম্পূর্ণ CFT ক্যালকুলেটর টুল' : 'Open Full CFT Tool'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
