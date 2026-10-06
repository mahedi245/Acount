'use client';

import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
  Building,
  Phone,
  ArrowUpRight,
  CreditCard,
  Percent,
  Pencil,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getTodayIsoDate } from '@/utils/dateUtils';
import { MarketingAgent, MarketingCommissionPayout } from '@/types';
import MarketingAgentModal from '@/components/marketing/MarketingAgentModal';
import CommissionPayModal from '@/components/marketing/CommissionPayModal';
import CommissionVoucherModal from '@/components/marketing/CommissionVoucherModal';
import EditCollectionModal, { CollectionItemToEdit } from '@/components/marketing/EditCollectionModal';
import Modal from '@/components/common/Modal';

export default function MarketingPage() {
  const { language } = useApp();
  const {
    marketingAgents,
    addMarketingAgent,
    updateMarketingAgent,
    deleteMarketingAgent,
    commissionPayouts,
    disburseCommissionPayout,
    deleteCommissionPayout,
    getAgentMonthlyStats,
    orders,
  } = useData();

  // Current selected month: default to current YYYY-MM
  const currentIso = getTodayIsoDate();
  const defaultMonth = currentIso.slice(0, 7); // e.g., '2026-10'

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [activeTab, setActiveTab] = useState<'sheet' | 'agents' | 'logs' | 'payouts'>('sheet');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<MarketingAgent | null>(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payTargetAgent, setPayTargetAgent] = useState<MarketingAgent | null>(null);

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [viewVoucherPayout, setViewVoucherPayout] = useState<MarketingCommissionPayout | null>(null);

  const [breakdownAgent, setBreakdownAgent] = useState<MarketingAgent | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const [isEditCollectionOpen, setIsEditCollectionOpen] = useState(false);
  const [editingCollectionItem, setEditingCollectionItem] = useState<CollectionItemToEdit | null>(null);

  // Open Edit Collection
  const handleOpenEditCollection = (item: CollectionItemToEdit) => {
    setEditingCollectionItem(item);
    setIsEditCollectionOpen(true);
  };

  // Month navigation helper
  const changeMonth = (offset: number) => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + offset;
    if (month > 12) {
      month = 1;
      year += 1;
    } else if (month < 1) {
      month = 12;
      year -= 1;
    }
    const newMonthStr = `${year}-${String(month).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  // Month summary metrics across all active agents
  const monthStatsSummary = useMemo(() => {
    let totalCollection = 0;
    let totalGrossCommission = 0;
    let totalPaidCommission = 0;
    let totalBalanceDue = 0;

    marketingAgents.forEach((agent) => {
      const stats = getAgentMonthlyStats(agent.id, selectedMonth);
      totalCollection += stats.totalCollection;
      totalGrossCommission += stats.grossCommission;
      totalPaidCommission += stats.paidCommission;
      totalBalanceDue += stats.balanceDue;
    });

    return {
      totalCollection,
      totalGrossCommission,
      totalPaidCommission,
      totalBalanceDue,
      activeAgentsCount: marketingAgents.filter((a) => a.isActive).length,
    };
  }, [marketingAgents, selectedMonth, getAgentMonthlyStats, commissionPayouts, orders]);

  // All payment logs for selected month tied to marketing agents
  const monthCollectionLogs = useMemo(() => {
    const logs: Array<{
      orderId: string;
      orderNumber: string;
      customerName: string;
      siteLocation?: string;
      agentId: string;
      agentName: string;
      paymentId: string;
      paymentDate: string;
      paymentMethod: string;
      amount: number;
      commission: number;
      note?: string;
    }> = [];

    marketingAgents.forEach((agent) => {
      const stats = getAgentMonthlyStats(agent.id, selectedMonth);
      stats.collectionRecords.forEach((rec) => {
        logs.push({
          ...rec,
          agentId: agent.id,
          agentName: agent.name,
        });
      });
    });

    // Sort newest date first
    return logs.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [marketingAgents, selectedMonth, getAgentMonthlyStats]);

  // Open Pay Modal
  const handleOpenPay = (agent: MarketingAgent) => {
    setPayTargetAgent(agent);
    setIsPayModalOpen(true);
  };

  // Open Breakdown
  const handleOpenBreakdown = (agent: MarketingAgent) => {
    setBreakdownAgent(agent);
    setIsBreakdownOpen(true);
  };

  // Open Voucher Print from Payout
  const handleViewVoucher = (payout: MarketingCommissionPayout) => {
    setViewVoucherPayout(payout);
    setIsVoucherModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-zinc-900 to-red-950 text-white p-6 sm:p-8 shadow-xl border border-red-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold border border-red-500/30 tracking-wide uppercase">
              <Target className="w-3.5 h-3.5 text-red-500" />
              <span>{language === 'bn' ? 'মার্কেটিং ও সেলস কমিশন' : 'Marketing & Sales Commission'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'bn' ? 'মাসিক কালেকশন ও ১% কমিশন খতিয়ান' : 'Monthly Collection & 1% Commission'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'মোট সংগৃহীত প্রকৃত নগদ ও ব্যাংক কালেকশনের উপর প্রতি লাখে ১,০০০ টাকা (১%) কমিশন নির্ধারণ, ভাউচার অনুমোদন ও অটো অ্যাকাউন্টস লেজার এন্ট্রি।'
                : '1,000 Tk commission per 1 Lakh Tk actual collected payments, automated disbursement vouchers, and real-time Accounts sync.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingAgent(null);
                setIsAgentModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন এজেন্ট যোগ করুন' : 'Add New Agent'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-5 h-5 text-red-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {language === 'bn' ? 'হিসাবের মাস:' : 'Accounting Month:'}
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title={language === 'bn' ? 'আগের মাস' : 'Previous Month'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-900 px-2 py-0.5 focus:outline-none"
            />
            <button
              onClick={() => changeMonth(1)}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title={language === 'bn' ? 'পরের মাস' : 'Next Month'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            {
              id: 'sheet',
              labelBn: 'মাসিক কমিশন শিট',
              labelEn: 'Commission Sheet',
              icon: FileSpreadsheet,
            },
            {
              id: 'agents',
              labelBn: 'মার্কেটিং প্রতিনিধি',
              labelEn: 'Agent Profiles',
              icon: Users,
            },
            {
              id: 'logs',
              labelBn: 'কালেকশন লগ',
              labelEn: 'Collection Logs',
              icon: TrendingUp,
            },
            {
              id: 'payouts',
              labelBn: 'পেমেন্ট ও ভাউচার হিস্ট্রি',
              labelEn: 'Payout History',
              icon: Award,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Month Collection */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'চলতি মাসের মোট কালেকশন' : 'Month Total Collection'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(monthStatsSummary.totalCollection, language)}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{language === 'bn' ? 'এজেন্টদের ট্যাগকৃত অর্ডার থেকে আদায়' : 'From tagged client orders'}</span>
          </p>
        </div>

        {/* Accrued Commission @ 1% */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'অর্জিত মোট কমিশন (১%)' : 'Earned Commission (1%)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600">
            {formatCurrency(monthStatsSummary.totalGrossCommission, language)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {language === 'bn' ? 'প্রতি লাখে ৳১,০০০/- হিসাবে নির্ধারিত' : '৳1,000 per 1 Lakh Tk'}
          </p>
        </div>

        {/* Total Paid Commission */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'পরিশোধিত কমিশন' : 'Disbursed Commission'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-600">
            {formatCurrency(monthStatsSummary.totalPaidCommission, language)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {language === 'bn' ? 'ভাউচার অনুমোদিত ও খরচ এন্ট্রি' : 'Voucher issued & accounts synced'}
          </p>
        </div>

        {/* Outstanding Balance Due */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'বকেয়া কমিশন পাওনা' : 'Outstanding Balance'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-600">
            {formatCurrency(monthStatsSummary.totalBalanceDue, language)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {language === 'bn' ? 'চলতি মাসের অবশিষ্ট প্রদেয়' : 'Remaining to disburse'}
          </p>
        </div>
      </div>

      {/* TAB 1: MONTHLY COMMISSION SHEET */}
      {activeTab === 'sheet' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn'
                  ? `${selectedMonth} মাসের মার্কেটিং কমিশন সেটেলমেন্ট শিট`
                  : `Monthly Commission Settlement Sheet (${selectedMonth})`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'প্রকৃত আদায়ের উপর ১% কমিশন হিসাব ও ছাড়ের তালিকা'
                  : 'Itemized commission calculation on actual collected money'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-hidden print:w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="p-3.5 text-center w-10">#</th>
                  <th className="p-3.5">{language === 'bn' ? 'মার্কেটিং প্রতিনিধি' : 'Marketing Agent'}</th>
                  <th className="p-3.5 text-center">{language === 'bn' ? 'অর্ডার সংখ্যা' : 'Orders'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'চলতি মাসের কালেকশন' : 'Month Collection'}</th>
                  <th className="p-3.5 text-center">{language === 'bn' ? 'কমিশন রেট' : 'Rate'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'মোট কমিশন (৳)' : 'Gross Comm. (BDT)'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'পরিশোধিত (৳)' : 'Paid (BDT)'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'বকেয়া পাওনা (৳)' : 'Balance Due (BDT)'}</th>
                  <th className="p-3.5 text-center">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marketingAgents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-slate-400 font-bold">
                      {language === 'bn' ? 'কোনো মার্কেটিং এজেন্ট পাওয়া যায়নি।' : 'No marketing agents found.'}
                    </td>
                  </tr>
                ) : (
                  marketingAgents.map((agent, idx) => {
                    const stats = getAgentMonthlyStats(agent.id, selectedMonth);
                    const isFullyPaid = stats.grossCommission > 0 && stats.balanceDue === 0;
                    const isPartiallyPaid = stats.paidCommission > 0 && stats.balanceDue > 0;
                    const hasActivity = stats.totalCollection > 0;

                    return (
                      <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black text-xs border border-red-200">
                              {agent.name.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{agent.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">{agent.designation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-700">
                          {stats.orderCount} টি
                        </td>
                        <td className="p-3.5 text-right font-black text-emerald-700 font-mono text-sm">
                          {formatCurrency(stats.totalCollection, language)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            ৳{agent.commissionRatePerLakh || 1000}/লাখ (১%)
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-900 font-mono">
                          {formatCurrency(stats.grossCommission, language)}
                        </td>
                        <td className="p-3.5 text-right font-black text-blue-700 font-mono">
                          {formatCurrency(stats.paidCommission, language)}
                        </td>
                        <td className="p-3.5 text-right font-black text-red-600 font-mono text-sm">
                          {formatCurrency(stats.balanceDue, language)}
                        </td>
                        <td className="p-3.5 text-center">
                          {isFullyPaid ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{language === 'bn' ? 'পরিশোধিত' : 'Paid'}</span>
                            </span>
                          ) : isPartiallyPaid ? (
                            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {language === 'bn' ? 'আংশিক পরিশোধ' : 'Partial'}
                            </span>
                          ) : hasActivity ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              {language === 'bn' ? 'অপেক্ষমান' : 'Pending'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                              {language === 'bn' ? 'কালেকশন নেই' : 'No Activity'}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasActivity && (
                              <button
                                onClick={() => handleOpenBreakdown(agent)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1"
                                title={language === 'bn' ? 'কালেকশন হিস্ট্রি দেখুন' : 'View Breakdown'}
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>{language === 'bn' ? 'বিবরণী' : 'Details'}</span>
                              </button>
                            )}

                            {stats.balanceDue > 0 && (
                              <button
                                onClick={() => handleOpenPay(agent)}
                                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-sm shadow-red-600/20 transition-all flex items-center gap-1 active:scale-95"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'কমিশন দিন' : 'Pay'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MARKETING AGENTS DIRECTORY */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'নাম, ফোন বা পদবী দিয়ে খুঁজুন...' : 'Search by name, phone...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={() => {
                setEditingAgent(null);
                setIsAgentModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন এজেন্ট যোগ করুন' : 'Add Marketing Agent'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketingAgents
              .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm))
              .map((agent) => {
                // Compute lifetime collection stats for this agent
                const allAgentOrders = orders.filter((o) => o.marketingAgentId === agent.id);
                const lifetimeCollection = allAgentOrders.reduce((sum, ord) => sum + ord.totalPaid, 0);
                const lifetimeEarnedCommission = Math.round(
                  (lifetimeCollection / 100000) * (agent.commissionRatePerLakh || 1000)
                );
                const lifetimePaidCommission = commissionPayouts
                  .filter((p) => p.agentId === agent.id)
                  .reduce((sum, p) => sum + p.netPaidAmount, 0);

                return (
                  <div
                    key={agent.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-black text-sm border border-red-200">
                            {agent.name.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{agent.name}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{agent.designation}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            agent.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {agent.isActive
                            ? language === 'bn'
                              ? 'সক্রিয়'
                              : 'Active'
                            : language === 'bn'
                            ? 'নিষ্ক্রিয়'
                            : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{agent.phone}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-bold text-amber-900">
                            কমিশন রেট: ৳{agent.commissionRatePerLakh || 1000} / ১ লাখ (১%)
                          </span>
                        </p>
                        {agent.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            {agent.notes}
                          </p>
                        )}
                      </div>

                      {/* Lifetime Statistics */}
                      <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            {language === 'bn' ? 'মোট কালেকশন' : 'Lifetime Col.'}
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            {formatCurrency(lifetimeCollection, language)}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            {language === 'bn' ? 'অর্জিত কমিশন' : 'Total Comm.'}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {formatCurrency(lifetimeEarnedCommission, language)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingAgent(agent);
                          setIsAgentModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                      >
                        {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      </button>

                      <button
                        onClick={() => {
                          if (
                            confirm(
                              language === 'bn'
                                ? `আপনি কি নিশ্চিতভাবে "${agent.name}" এজেন্টকে মুছে ফেলতে চান?`
                                : `Are you sure you want to delete ${agent.name}?`
                            )
                          ) {
                            deleteMarketingAgent(agent.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                      >
                        {language === 'bn' ? 'মুছুন' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: COLLECTION & ATTRIBUTION LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn'
                  ? `${selectedMonth} মাসের কালেকশন ও রিসিট বিবরণী`
                  : `Collection Receipts Log (${selectedMonth})`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'কোন ক্লায়েন্ট থেকে কত টাকা জমা হয়েছে এবং তার ১% কমিশন হিসাব'
                  : 'Customer collections and attributed 1% commission value'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-hidden print:w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="p-3 text-center w-8">#</th>
                  <th className="p-3">{language === 'bn' ? 'জমা তারিখ' : 'Date'}</th>
                  <th className="p-3">{language === 'bn' ? 'অর্ডার নং' : 'Order #'}</th>
                  <th className="p-3">{language === 'bn' ? 'গ্রাহকের নাম ও সাইট' : 'Customer & Site'}</th>
                  <th className="p-3">{language === 'bn' ? 'মার্কেটিং প্রতিনিধি' : 'Marketing Officer'}</th>
                  <th className="p-3">{language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Method'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'আদায়কৃত টাকা (৳)' : 'Collected (BDT)'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? '১% কমিশন (৳)' : '1% Comm. (BDT)'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthCollectionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400 font-bold">
                      {language === 'bn'
                        ? 'এই মাসে ট্যাগকৃত কোনো অর্ডারের পেমেন্ট কালেকশন হয়নি।'
                        : 'No payment collections recorded for tagged orders this month.'}
                    </td>
                  </tr>
                ) : (
                  monthCollectionLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-700">{formatDate(log.paymentDate, language)}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{log.orderNumber}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{log.customerName}</span>
                        {log.siteLocation && (
                          <span className="text-[10px] text-slate-500 block">• {log.siteLocation}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 font-bold border border-red-100 text-[10px]">
                          🎯 {log.agentName}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{log.paymentMethod}</td>
                      <td className="p-3 text-right font-black text-slate-900 font-mono text-sm">
                        {formatCurrency(log.amount, language)}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700 font-mono text-sm">
                        {formatCurrency(log.commission, language)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenEditCollection(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 active:scale-95"
                          title={language === 'bn' ? 'কালেকশন ও এজেন্ট পরিবর্তন করুন' : 'Edit Collection Entry'}
                        >
                          <Pencil className="w-3 h-3 text-slate-600" />
                          <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSION PAYOUTS & VOUCHER HISTORY */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'কমিশন পেমেন্ট ভাউচার হিস্ট্রি' : 'Commission Payment Vouchers History'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'সকল অনুমোদিত কমিশন ভাউচার ও রি-প্রিন্ট অপশন'
                  : 'All disbursed commission vouchers with A4 print slip'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-hidden print:w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="p-3.5 text-center w-8">#</th>
                  <th className="p-3.5">{language === 'bn' ? 'ভাউচার নং' : 'Voucher #'}</th>
                  <th className="p-3.5">{language === 'bn' ? 'প্রতিনিধির নাম' : 'Agent Name'}</th>
                  <th className="p-3.5">{language === 'bn' ? 'হিসাবের মাস' : 'Month'}</th>
                  <th className="p-3.5">{language === 'bn' ? 'পরিশোধের তারিখ' : 'Payment Date'}</th>
                  <th className="p-3.5">{language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Method'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'কালেকশন বেস' : 'Collection Base'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'পরিশোধিত কমিশন (৳)' : 'Paid Comm. (BDT)'}</th>
                  <th className="p-3.5 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissionPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400 font-bold">
                      {language === 'bn'
                        ? 'এখনো কোনো কমিশন ভাউচার ইস্যু করা হয়নি।'
                        : 'No commission vouchers disbursed yet.'}
                    </td>
                  </tr>
                ) : (
                  commissionPayouts.map((payout, idx) => (
                    <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">{payout.payoutNumber}</td>
                      <td className="p-3.5 font-bold text-slate-900">{payout.agentName}</td>
                      <td className="p-3.5 font-mono text-slate-700">{payout.month}</td>
                      <td className="p-3.5 font-mono text-slate-700">{formatDate(payout.paymentDate, language)}</td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {payout.paymentMethod} {payout.referenceNo ? `(${payout.referenceNo})` : ''}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-700 font-mono">
                        {formatCurrency(payout.totalCollectionInMonth, language)}
                      </td>
                      <td className="p-3.5 text-right font-black text-red-600 font-mono text-sm">
                        {formatCurrency(payout.netPaidAmount, language)}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewVoucher(payout)}
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'ভাউচার প্রিন্ট' : 'Print Voucher'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  language === 'bn'
                                    ? `আপনি কি নিশ্চিতভাবে ভাউচার #${payout.payoutNumber} বাতিল করতে চান?`
                                    : `Are you sure you want to delete voucher #${payout.payoutNumber}?`
                                )
                              ) {
                                deleteCommissionPayout(payout.id);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 text-xs font-bold transition-colors"
                          >
                            {language === 'bn' ? 'মুছুন' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Breakdown Drawer / Modal */}
      {isBreakdownOpen && breakdownAgent && (
        <Modal
          isOpen={isBreakdownOpen}
          onClose={() => setIsBreakdownOpen(false)}
          title={
            language === 'bn'
              ? `${breakdownAgent.name} - কালেকশন ও কমিশন বিবরণী`
              : `${breakdownAgent.name} - Collection Breakdown`
          }
          subtitle={
            language === 'bn'
              ? `হিসাবের মাস: ${selectedMonth} • পদবী: ${breakdownAgent.designation}`
              : `Month: ${selectedMonth} • ${breakdownAgent.designation}`
          }
          maxWidth="3xl"
        >
          {(() => {
            const stats = getAgentMonthlyStats(breakdownAgent.id, selectedMonth);
            return (
              <div className="space-y-4">
                {/* Summary Header */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900 text-white text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {language === 'bn' ? 'মোট কালেকশন' : 'Total Collected'}
                    </span>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">
                      {formatCurrency(stats.totalCollection, language)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {language === 'bn' ? 'কমিশন (১%)' : 'Commission (1%)'}
                    </span>
                    <p className="text-sm font-black text-amber-400 mt-0.5">
                      {formatCurrency(stats.grossCommission, language)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {language === 'bn' ? 'বকেয়া পাওনা' : 'Balance Due'}
                    </span>
                    <p className="text-sm font-black text-rose-400 mt-0.5">
                      {formatCurrency(stats.balanceDue, language)}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5 text-center w-8">#</th>
                        <th className="p-2.5">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                        <th className="p-2.5">{language === 'bn' ? 'অর্ডার নং' : 'Order #'}</th>
                        <th className="p-2.5">{language === 'bn' ? 'গ্রাহক ও সাইট' : 'Customer & Site'}</th>
                        <th className="p-2.5">{language === 'bn' ? 'পদ্ধতি' : 'Method'}</th>
                        <th className="p-2.5 text-right">{language === 'bn' ? 'কালেকশন (৳)' : 'Collection'}</th>
                        <th className="p-2.5 text-right">{language === 'bn' ? 'কমিশন ১% (৳)' : '1% Comm.'}</th>
                        <th className="p-2.5 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.collectionRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-slate-400 font-bold">
                            {language === 'bn' ? 'কোনো কালেকশন পাওয়া যায়নি।' : 'No collection found.'}
                          </td>
                        </tr>
                      ) : (
                        stats.collectionRecords.map((rec, i) => (
                          <tr key={i} className="hover:bg-slate-50/80">
                            <td className="p-2.5 text-center font-bold text-slate-400">{i + 1}</td>
                            <td className="p-2.5 font-mono text-slate-700">{formatDate(rec.paymentDate, language)}</td>
                            <td className="p-2.5 font-mono font-bold text-slate-900">{rec.orderNumber}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900">{rec.customerName}</span>
                              {rec.siteLocation && (
                                <span className="text-[10px] text-slate-500 block">• {rec.siteLocation}</span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-700">{rec.paymentMethod}</td>
                            <td className="p-2.5 text-right font-black text-slate-900 font-mono">
                              {formatCurrency(rec.amount, language)}
                            </td>
                            <td className="p-2.5 text-right font-black text-emerald-700 font-mono">
                              {formatCurrency(rec.commission, language)}
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => {
                                  setIsBreakdownOpen(false);
                                  handleOpenEditCollection({
                                    ...rec,
                                    agentId: breakdownAgent.id,
                                    agentName: breakdownAgent.name,
                                  });
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all inline-flex items-center gap-1 active:scale-95"
                                title={language === 'bn' ? 'কালেকশন এডিট করুন' : 'Edit Collection'}
                              >
                                <Pencil className="w-3 h-3 text-slate-600" />
                                <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {language === 'bn'
                      ? 'পলিসি: মোট ক্যাশ/ব্যাংক জমার ১.০০% (৳১,০০০ / লাখ)'
                      : 'Policy: 1.00% on total cash/bank receipts'}
                  </span>
                  <button
                    onClick={() => setIsBreakdownOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Agent Modal (Add / Edit) */}
      <MarketingAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        editingAgent={editingAgent}
        onSave={(agentData) => {
          if (editingAgent) {
            updateMarketingAgent(editingAgent.id, agentData);
          } else {
            addMarketingAgent(agentData);
          }
        }}
      />

      {/* Commission Pay Modal */}
      {isPayModalOpen && payTargetAgent && (
        <CommissionPayModal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          agent={payTargetAgent}
          monthYear={selectedMonth}
          totalCollection={getAgentMonthlyStats(payTargetAgent.id, selectedMonth).totalCollection}
          grossCommission={getAgentMonthlyStats(payTargetAgent.id, selectedMonth).grossCommission}
          paidCommission={getAgentMonthlyStats(payTargetAgent.id, selectedMonth).paidCommission}
          balanceDue={getAgentMonthlyStats(payTargetAgent.id, selectedMonth).balanceDue}
          onDisburse={(payoutData) => {
            const newPayout = disburseCommissionPayout(payoutData, payoutData.syncToAccounts);
            // Automatically open printable voucher
            setViewVoucherPayout(newPayout);
            setIsVoucherModalOpen(true);
          }}
        />
      )}

      {/* Commission Voucher Print Modal */}
      {isVoucherModalOpen && viewVoucherPayout && (
        <CommissionVoucherModal
          payout={viewVoucherPayout}
          agent={marketingAgents.find((a) => a.id === viewVoucherPayout.agentId)}
          collectionRecords={
            getAgentMonthlyStats(viewVoucherPayout.agentId, viewVoucherPayout.month).collectionRecords
          }
          onClose={() => setIsVoucherModalOpen(false)}
        />
      )}

      {/* Edit Collection Modal */}
      <EditCollectionModal
        isOpen={isEditCollectionOpen}
        onClose={() => setIsEditCollectionOpen(false)}
        collectionItem={editingCollectionItem}
      />
    </div>
  );
}
