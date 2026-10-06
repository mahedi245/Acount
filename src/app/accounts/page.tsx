'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Printer,
  Calendar,
  CreditCard,
  Building,
  Building2,
  Zap,
  Truck,
  Wrench,
  Coffee,
  Paintbrush,
  Trees,
  CheckCircle2,
  Trash2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Target,
  Landmark,
  Smartphone,
  Coins,
  ArrowRightLeft,
  Eye,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  PieChart,
  Layers,
  ShieldCheck,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { ExpenseCategory, ExpenseRecord, FinancialAccount, AccountTransfer } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getTodayIsoDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import Modal from '@/components/common/Modal';
import PrintHeader from '@/components/common/PrintHeader';
import FinancialAccountModal from '@/components/accounts/FinancialAccountModal';
import FundTransferModal from '@/components/accounts/FundTransferModal';
import AccountStatementPrintModal from '@/components/accounts/AccountStatementPrintModal';

export default function AccountsPage() {
  const { language, showToast } = useApp();
  const {
    expenses,
    orders,
    addExpense,
    deleteExpense,
    customExpenseCategories,
    addCustomExpenseCategory,
    deleteCustomExpenseCategory,
    commissionPayouts,
    financialAccounts,
    addFinancialAccount,
    updateFinancialAccount,
    deleteFinancialAccount,
    accountTransfers,
    deleteAccountTransfer,
    getAccountLiveBalance,
    getAllAccountsSummary,
    getAccountLedgerTransactions,
  } = useData();

  const [activeTab, setActiveTab] = useState<'accounts' | 'daybook' | 'expenses' | 'transfers' | 'pnl'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferDefaultFromId, setTransferDefaultFromId] = useState<string | undefined>(undefined);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isStatementPrintOpen, setIsStatementPrintOpen] = useState(false);

  // New Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<string>('Electricity & Utility');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [newCustomCategoryName, setNewCustomCategoryName] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState<string>(getTodayIsoDate());
  const [expMethod, setExpMethod] = useState<ExpenseRecord['paymentMethod']>('Cash');
  const [expAccountId, setExpAccountId] = useState<string>('acc-1');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('Manager / Accounts');
  const [expNotes, setExpNotes] = useState('');

  // Summaries
  const accountsSummary = getAllAccountsSummary();

  const totalIncomeCollected = orders.reduce((sum, o) => sum + o.totalPaid, 0);
  const totalOrderBooked = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOutstandingDue = orders.reduce((sum, o) => sum + o.dueAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCommissions = commissionPayouts.reduce((sum, c) => sum + c.netPaidAmount, 0);
  const netCashFlow = totalIncomeCollected - totalExpenses;

  const baseCategories: { key: string; bn: string; en: string; icon: any }[] = [
    { key: 'Showroom Rent', bn: 'মিরপুর শোরুম ভাড়া', en: 'Showroom Rent', icon: Building },
    { key: 'Factory & Sawmill Rent', bn: 'বাড্ডা ফ্যাক্টরি ভাড়া', en: 'Factory Rent', icon: Building },
    { key: 'Electricity & Utility', bn: 'বিদ্যুৎ ও ইউটিলিটি', en: 'Electricity Bill', icon: Zap },
    { key: 'Raw Timber Procurement', bn: 'কাঁচা গোল কাঠ ক্রয়', en: 'Timber Log Purchase', icon: Trees },
    { key: 'Sawmill Blades & Machine Parts', bn: 'স-মিল ব্লেড ও মেশিন', en: 'Sawmill Blades/Parts', icon: Wrench },
    { key: 'Polish Chemicals & Varnish', bn: 'পলিশ কেমিক্যাল ও বার্নিশ', en: 'Polish Chemicals', icon: Paintbrush },
    { key: 'Transport, Truck & Fuel', bn: 'পরিবহন, ট্রাক ও তেল', en: 'Transport & Truck', icon: Truck },
    { key: 'Office, Tea & Entertainment', bn: 'অফিস ও নাস্তা/আপ্যায়ন', en: 'Office & Refreshments', icon: Coffee },
    { key: 'Staff Salary & Allowance', bn: 'স্টাফ ও সহকারী বেতন', en: 'Staff Salary', icon: DollarSign },
    { key: 'Marketing & Sales Commission', bn: 'মার্কেটিং ও কালেকশন কমিশন', en: 'Sales Commission', icon: Target },
    { key: 'Other Operational Expense', bn: 'অন্যান্য পরিচালন ব্যয়', en: 'Other Expenses', icon: Receipt },
  ];

  // Merge default categories with custom categories created by user
  const allCategories = useMemo(() => {
    const list = [...baseCategories];
    (customExpenseCategories || []).forEach((customCat) => {
      if (!list.some((existing) => existing.key === customCat)) {
        list.push({
          key: customCat,
          bn: customCat,
          en: customCat,
          icon: Tag,
        });
      }
    });
    // Also include any categories present on existing expense records
    expenses.forEach((exp) => {
      if (exp.category && !list.some((existing) => existing.key === exp.category)) {
        list.push({
          key: exp.category,
          bn: exp.category,
          en: exp.category,
          icon: Tag,
        });
      }
    });
    return list;
  }, [customExpenseCategories, expenses]);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Ledger transactions
  const ledgerTransactions = useMemo(() => {
    return getAccountLedgerTransactions(
      selectedAccountId === 'all' ? undefined : selectedAccountId,
      fromDate || undefined,
      toDate || undefined
    );
  }, [selectedAccountId, fromDate, toDate, getAccountLedgerTransactions, expenses, orders, accountTransfers, commissionPayouts]);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) {
      alert(language === 'bn' ? 'দয়া করে সঠিক বিবরণ ও টাকার পরিমাণ লিখুন।' : 'Please enter valid title and amount.');
      return;
    }

    const finalCategory =
      isCustomCategoryMode && newCustomCategoryName.trim()
        ? newCustomCategoryName.trim()
        : expCategory;

    const selectedAcc = financialAccounts.find((a) => a.id === expAccountId);

    addExpense({
      title: expTitle.trim(),
      category: finalCategory,
      amount: Number(expAmount),
      date: expDate,
      paymentMethod: expMethod,
      paidTo: expPaidTo.trim() || 'General Expense',
      paidBy: expPaidBy.trim(),
      accountId: expAccountId || undefined,
      accountName: selectedAcc?.accountName || undefined,
      notes: expNotes.trim() || undefined,
    });

    showToast(
      language === 'bn'
        ? `৳${expAmount.toLocaleString('en-IN')} খরচ ভাউচার (${finalCategory}) সফলভাবে সংরক্ষণ হয়েছে।`
        : `Expense voucher added under ${finalCategory}.`,
      'success'
    );

    setExpTitle('');
    setExpAmount(0);
    setExpPaidTo('');
    setExpNotes('');
    setIsCustomCategoryMode(false);
    setNewCustomCategoryName('');
    setIsAddExpenseOpen(false);
  };

  const handleOpenTransferFor = (accId: string) => {
    setTransferDefaultFromId(accId);
    setIsTransferModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner (No Print) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-zinc-900 to-red-950 text-white p-6 sm:p-8 shadow-xl border border-red-900/30 no-print">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold border border-red-500/30 tracking-wide uppercase">
              <Landmark className="w-3.5 h-3.5 text-red-500" />
              <span>{language === 'bn' ? 'পূর্ণাঙ্গ অ্যাকাউন্টিং ও ব্যাংকিং' : 'Full Accounting & Banking'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'bn'
                ? 'আয়-ব্যয় হিসাব, ব্যাংক অ্যাকাউন্ট ও ক্যাশ লেজার'
                : 'Accounts, Multi-Bank & Cash Ledger'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'নগদ ক্যাশ, ব্যাংক অ্যাকাউন্ট, বিকাশ/নগদ, প্রারম্ভিক উদ্বৃত্ত (Opening Balance), ফান্ড ট্রান্সফার ও রিয়েল-টাইম ব্যালেন্স খতিয়ান।'
                : 'Multi-account live balances, opening balances, inter-account transfers, and unified daybook ledger.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 shadow-md transition-all active:scale-95"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? '+ নতুন ব্যাংক/ক্যাশ' : '+ New Account'}</span>
            </button>

            <button
              onClick={() => {
                setTransferDefaultFromId(undefined);
                setIsTransferModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 shadow-md transition-all active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'ফান্ড ট্রান্সফার' : 'Fund Transfer'}</span>
            </button>

            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন খরচ ভাউচার' : '+ Add Expense'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Multi-Account Liquid Summary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Liquid Cash & Bank */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'মোট লিকুইড ব্যালেন্স' : 'Total Liquid Fund'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 font-mono">
            {formatCurrency(accountsSummary.totalLiveBalance, language)}
          </p>
          <span className="text-[10px] text-emerald-700 font-bold block">
            {financialAccounts.filter((a) => a.isActive).length} টি সক্রিয় অ্যাকাউন্টে
          </span>
        </div>

        {/* Factory Petty Cash */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'কারখানা পেটি ক্যাশ' : 'Factory Petty Cash'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-700 font-mono">
            {formatCurrency(getAccountLiveBalance('acc-1').liveBalance, language)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block">বাড্ডা ফ্যাক্টরি ও স-মিল</span>
        </div>

        {/* In Banks */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'ব্যাংক ব্যালেন্স' : 'In Banks'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-blue-700 font-mono">
            {formatCurrency(accountsSummary.totalBank, language)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block">ইসলামী ও ইস্টার্ন ব্যাংক</span>
        </div>

        {/* MFS (bKash/Nagad) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'বিকাশ / নগদ' : 'MFS Wallet'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-pink-600 font-mono">
            {formatCurrency(accountsSummary.totalMfs, language)}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block">মার্চেন্ট ওয়ালেট</span>
        </div>

        {/* Total Collections & Expenses */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'মোট আয় বনাম ব্যয়' : 'Inflow vs Outflow'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between text-xs pt-1">
            <span className="text-emerald-700 font-black font-mono">+{formatCurrency(totalIncomeCollected, language)}</span>
            <span className="text-rose-700 font-black font-mono">-{formatCurrency(totalExpenses, language)}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">অর্ডার কালেকশন ও খরচ</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'accounts', labelBn: 'ব্যাংক ও ক্যাশ অ্যাকাউন্ট তালিকা', labelEn: 'Accounts & Banks', icon: Landmark },
            { id: 'daybook', labelBn: 'দৈনিক ক্যাশ বুক ও লেজার', labelEn: 'Daybook & Ledger', icon: FileSpreadsheet },
            { id: 'expenses', labelBn: 'ব্যয় ভাউচার খতিয়ান', labelEn: 'Expense Vouchers', icon: Receipt },
            { id: 'transfers', labelBn: 'ফান্ড ট্রান্সফার হিস্ট্রি', labelEn: 'Fund Transfers', icon: ArrowRightLeft },
            { id: 'pnl', labelBn: 'লাভ-ক্ষতি ও আর্থিক অডিট', labelEn: 'P&L Audit', icon: PieChart },
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

        {activeTab === 'daybook' && (
          <button
            onClick={() => setIsStatementPrintOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লেজার স্টেটমেন্ট প্রিন্ট (A4)' : 'Print Ledger Statement'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: ACCOUNTS & BANK DIRECTORY */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financialAccounts.map((account) => {
              const stats = getAccountLiveBalance(account.id);
              const isCash = account.accountType === 'cash' || account.accountType === 'petty_cash';
              const isMfs = account.accountType === 'mfs';

              return (
                <div
                  key={account.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black ${
                            isCash
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isMfs
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isCash ? (
                            <Coins className="w-5 h-5" />
                          ) : isMfs ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Building2 className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{account.accountName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                            {account.accountType === 'cash'
                              ? 'নগদ ক্যাশ'
                              : account.accountType === 'bank'
                              ? 'ব্যাংক অ্যাকাউন্ট'
                              : account.accountType === 'mfs'
                              ? 'মোবাইল ব্যাংকিং'
                              : 'পেটি ক্যাশ'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          account.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {account.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>

                    {/* Account Meta */}
                    <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      {account.accountNumber && (
                        <p className="flex justify-between font-mono">
                          <span className="text-slate-400">হিসাব নং:</span>
                          <strong className="text-slate-800">{account.accountNumber}</strong>
                        </p>
                      )}
                      {account.bankName && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">ব্যাংক:</span>
                          <span className="font-semibold text-slate-800">{account.bankName}</span>
                        </p>
                      )}
                      {account.branchName && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">ব্রাঞ্চ:</span>
                          <span className="font-semibold text-slate-800">{account.branchName}</span>
                        </p>
                      )}
                    </div>

                    {/* Financial Numbers Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">প্রারম্ভিক</span>
                        <span className="font-mono font-bold text-slate-700">
                          {formatCurrency(stats.openingBalance, language)}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-emerald-600 font-bold block">মোট জমা (+)</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {formatCurrency(stats.totalInflow, language)}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-rose-600 font-bold block">মোট খরচ (-)</span>
                        <span className="font-mono font-bold text-rose-700">
                          {formatCurrency(stats.totalOutflow, language)}
                        </span>
                      </div>
                    </div>

                    {/* Big Live Balance */}
                    <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">বর্তমান ব্যালেন্স:</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {formatCurrency(stats.liveBalance, language)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenTransferFor(account.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ট্রান্সফার</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedAccountId(account.id);
                          setActiveTab('daybook');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                      >
                        লেজার
                      </button>

                      <button
                        onClick={() => {
                          setEditingAccount(account);
                          setIsAccountModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                      >
                        এডিট
                      </button>

                      {account.id !== 'acc-1' && account.id !== 'acc-2' && (
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি নিশ্চিতভাবে "${account.accountName}" অ্যাকাউন্ট মুছে ফেলতে চান?`)) {
                              deleteFinancialAccount(account.id);
                            }
                          }}
                          className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DAYBOOK & ACCOUNT LEDGER */}
      {activeTab === 'daybook' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'দৈনিক ক্যাশ বুক ও একাউন্ট খতিয়ান স্টেটমেন্ট' : 'Daybook & Account Ledger'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                অর্ডার জমা, ব্যয় ভাউচার, কমিশন ও ফান্ড ট্রান্সফারের রানিং ব্যালেন্স খতিয়ান
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">সকল অ্যাকাউন্ট (All Accounts)</option>
                {financialAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountName}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 text-xs">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
                />
                <span className="text-slate-400">থেকে</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-hidden print:w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="p-3 text-center w-8">#</th>
                  <th className="p-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="p-3">{language === 'bn' ? 'লেনদেনের বিবরণ ও ভাউচার' : 'Particulars / Voucher'}</th>
                  <th className="p-3">{language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}</th>
                  <th className="p-3 text-right text-emerald-700">{language === 'bn' ? 'জমা / Inflow (+)' : 'Debit (+)'}</th>
                  <th className="p-3 text-right text-rose-700">{language === 'bn' ? 'খরচ / Outflow (-)' : 'Credit (-)'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'ব্যালেন্স (৳)' : 'Balance (BDT)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400 font-bold">
                      {language === 'bn' ? 'এই সময়কালের কোনো লেনদেন পাওয়া যায়নি।' : 'No transactions found.'}
                    </td>
                  </tr>
                ) : (
                  ledgerTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-700">{formatDate(tx.date, language)}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{tx.title}</p>
                        {tx.notes && <p className="text-[10px] text-slate-500 italic">{tx.notes}</p>}
                      </td>
                      <td className="p-3 font-medium text-slate-700">{tx.accountName}</td>
                      <td className="p-3 text-right font-black text-emerald-700 font-mono text-sm">
                        {tx.debit > 0 ? formatCurrency(tx.debit, language) : '-'}
                      </td>
                      <td className="p-3 text-right font-black text-rose-700 font-mono text-sm">
                        {tx.credit > 0 ? formatCurrency(tx.credit, language) : '-'}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900 font-mono text-sm">
                        {formatCurrency(tx.balance, language)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSE VOUCHERS */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'ভাউচার নং, শিরোনাম, প্রাপক দিয়ে খুঁজুন...' : 'Search vouchers...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সকল খরচ ({expenses.length})
              </button>
              {allCategories.map((c) => {
                const count = expenses.filter((e) => e.category === c.key).length;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategoryFilter(c.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      categoryFilter === c.key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{language === 'bn' ? c.bn : c.en}</span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="p-3 text-center w-8">#</th>
                  <th className="p-3">ভাউচার নং</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">ক্যাটাগরি</th>
                  <th className="p-3">বিবরণ ও গ্রহীতা</th>
                  <th className="p-3">উৎস অ্যাকাউন্ট</th>
                  <th className="p-3 text-right">টাকার পরিমাণ (৳)</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400 font-bold">
                      কোনো খরচ ভাউচার পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp, idx) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{exp.voucherNo}</td>
                      <td className="p-3 font-mono text-slate-700">{formatDate(exp.date, language)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{exp.title}</p>
                        <p className="text-[10px] text-slate-500">প্রাপক: {exp.paidTo} • প্রদানকারী: {exp.paidBy}</p>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {exp.accountName || exp.paymentMethod}
                      </td>
                      <td className="p-3 text-right font-black text-rose-700 font-mono text-sm">
                        {formatCurrency(exp.amount, language)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি নিশ্চিতভাবে ভাউচার #${exp.voucherNo} মুছে ফেলতে চান?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                        >
                          মুছুন
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

      {/* TAB 4: FUND TRANSFERS LOG */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'ইন্টার-অ্যাকাউন্ট ফান্ড ট্রান্সফার ইতিহাস' : 'Fund Transfers History'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ক্যাশ টু ব্যাংক ডিপোজিট, ব্যাংক থেকে ক্যাশ উত্তোলন ও ওয়ালেট ট্রান্সফার
              </p>
            </div>
            <button
              onClick={() => {
                setTransferDefaultFromId(undefined);
                setIsTransferModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন ট্রান্সফার</span>
            </button>
          </div>

          <div className="overflow-x-auto print:overflow-hidden print:w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="p-3 text-center w-8">#</th>
                  <th className="p-3">ট্রান্সফার নং</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">উৎস অ্যাকাউন্ট (From)</th>
                  <th className="p-3">গন্তব্য অ্যাকাউন্ট (To)</th>
                  <th className="p-3 text-right">পরিমাণ (৳)</th>
                  <th className="p-3">রেফারেন্স / নোট</th>
                  <th className="p-3">অনুমোদনকারী</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400 font-bold">
                      কোনো ফান্ড ট্রান্সফার রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  accountTransfers.map((trf, idx) => (
                    <tr key={trf.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{trf.transferNumber}</td>
                      <td className="p-3 font-mono text-slate-700">{formatDate(trf.transferDate, language)}</td>
                      <td className="p-3 font-bold text-rose-700">{trf.fromAccountName}</td>
                      <td className="p-3 font-bold text-emerald-700">{trf.toAccountName}</td>
                      <td className="p-3 text-right font-black text-slate-900 font-mono text-sm">
                        {formatCurrency(trf.amount, language)}
                      </td>
                      <td className="p-3 text-slate-600">
                        {trf.referenceNo && <span className="font-mono font-semibold block">{trf.referenceNo}</span>}
                        {trf.notes && <span className="text-[10px] text-slate-500 italic block">{trf.notes}</span>}
                      </td>
                      <td className="p-3 text-slate-700">{trf.transferredBy}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি নিশ্চিতভাবে এই ট্রান্সফার এন্ট্রি #${trf.transferNumber} মুছে ফেলতে চান?`)) {
                              deleteAccountTransfer(trf.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                        >
                          মুছুন
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

      {/* TAB 5: P&L AUDIT SUMMARY */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'bn' ? 'ব্যবসায়িক লাভ-ক্ষতি ও আর্থিক অডিট সামারি' : 'Profit & Loss Audit Summary'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              মোট বিক্রয় আয়, প্রত্যক্ষ কারখানা ব্যয় ও পরিচালন খরচ শেষে নিট লাভ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                ১. মোট রাজস্ব / কালেকশন আয় (Revenue)
              </span>
              <p className="text-2xl font-black text-emerald-900 font-mono">
                {formatCurrency(totalIncomeCollected, language)}
              </p>
              <p className="text-[11px] text-emerald-700">অর্ডার বাবদ গ্রাহকদের থেকে প্রাপ্ত নগদ ও ব্যাংক জমা</p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                ২. মোট কারখানা ও পরিচালন ব্যয় (Expenses)
              </span>
              <p className="text-2xl font-black text-rose-900 font-mono">
                {formatCurrency(totalExpenses, language)}
              </p>
              <p className="text-[11px] text-rose-700">ভাড়া, কাঠ ক্রয়, বিদ্যুৎ, মজুরি ও মার্কেটিং কমিশন</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ৩. নিট পরিচালন মুনাফা (Net Operating Profit)
              </span>
              <p className={`text-2xl font-black font-mono ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netCashFlow, language)}
              </p>
              <p className="text-[11px] text-slate-400">কোম্পানির নিট অর্জিত ক্যাশ উদ্বৃত্ত</p>
            </div>
          </div>

          {/* Category-wise Expense Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden space-y-3 p-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-600" />
              <span>ক্যাটাগরি ভিত্তিক মোট ব্যয়ের বিবরণী (Expense Breakdown by Category):</span>
            </h4>

            <div className="overflow-x-auto print:overflow-hidden print:w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                    <th className="p-2.5 text-center w-8">#</th>
                    <th className="p-2.5">খরচের ক্যাটাগরি</th>
                    <th className="p-2.5 text-center">ভাউচার সংখ্যা</th>
                    <th className="p-2.5 text-right">মোট ব্যয় (৳)</th>
                    <th className="p-2.5 text-right">% অংশীদারিত্ব</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allCategories
                    .map((c) => {
                      const catExpenses = expenses.filter((e) => e.category === c.key);
                      const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
                      const pct = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0;
                      return { ...c, count: catExpenses.length, total: catTotal, pct };
                    })
                    .filter((c) => c.total > 0 || c.count > 0)
                    .map((row, idx) => (
                      <tr key={row.key} className="hover:bg-slate-50/70">
                        <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{row.bn}</td>
                        <td className="p-2.5 text-center font-semibold text-slate-700">{row.count} টি</td>
                        <td className="p-2.5 text-right font-black text-rose-700 font-mono">
                          {formatCurrency(row.total, language)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-600 font-mono">
                          {row.pct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Financial Account Modal */}
      <FinancialAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        editingAccount={editingAccount}
        onSave={(accData) => {
          if (editingAccount) {
            updateFinancialAccount(editingAccount.id, accData);
          } else {
            addFinancialAccount(accData);
          }
        }}
      />

      {/* Fund Transfer Modal */}
      <FundTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        defaultFromAccountId={transferDefaultFromId}
      />

      {/* Add Expense Voucher Modal */}
      {isAddExpenseOpen && (
        <Modal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          title={language === 'bn' ? 'নতুন খরচ ভাউচার তৈরি করুন' : 'Add Expense Voucher'}
          subtitle={language === 'bn' ? 'উৎস অ্যাকাউন্ট ও ক্যাটাগরি নির্বাচন করুন' : 'Select Source Account'}
          maxWidth="xl"
        >
          <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  খরচের শিরোনাম / বিবরণ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="শোরুম ভাড়া / স-মিল ব্লেড ক্রয় / চা-নাস্তা"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Dynamic Category Selector / Creator */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    খরচের ক্যাটাগরি *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategoryMode(!isCustomCategoryMode);
                      if (!isCustomCategoryMode) {
                        setNewCustomCategoryName('');
                      }
                    }}
                    className="text-[11px] font-bold text-red-700 hover:text-red-800 underline"
                  >
                    {isCustomCategoryMode ? '← বিদ্যমান তালিকা থেকে বাছুন' : '+ নতুন কাস্টম ক্যাটাগরি তৈরি করুন'}
                  </button>
                </div>

                {isCustomCategoryMode ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="নতুন ক্যাটাগরির নাম লিখুন (যেমন: ব্যানার বিজ্ঞাপন / সাইট কনভেন্স)"
                      value={newCustomCategoryName}
                      onChange={(e) => setNewCustomCategoryName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-[10px] text-slate-500">
                      এই নতুন ক্যাটাগরি স্বয়ংক্রিয়ভাবে ডাটাবেজে সেভ হবে এবং ভবিষ্যতে সব ড্রপডাউনে পাওয়া যাবে।
                    </p>
                  </div>
                ) : (
                  <select
                    value={expCategory}
                    onChange={(e) => {
                      if (e.target.value === '__NEW_CUSTOM__') {
                        setIsCustomCategoryMode(true);
                        setNewCustomCategoryName('');
                      } else {
                        setExpCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {allCategories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {language === 'bn' ? c.bn : c.en}
                      </option>
                    ))}
                    <option value="__NEW_CUSTOM__">+ নতুন ক্যাটাগরি তৈরি করুন...</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  টাকার পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  টাকা কোন অ্যাকাউন্ট থেকে দেওয়া হলো? *
                </label>
                <select
                  value={expAccountId}
                  onChange={(e) => setExpAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {financialAccounts
                    .filter((a) => a.isActive !== false)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountName} (ব্যালেন্স: ৳{getAccountLiveBalance(acc.id).liveBalance.toLocaleString('en-IN')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  তারিখ
                </label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রাপকের নাম (Paid To)
                </label>
                <input
                  type="text"
                  placeholder="বাড্ডা বিদ্যুৎ অফিস / ক্যাটারিং"
                  value={expPaidTo}
                  onChange={(e) => setExpPaidTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                নোট ও মন্তব্য
              </label>
              <input
                type="text"
                placeholder="খরচের বিস্তারিত..."
                value={expNotes}
                onChange={(e) => setExpNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                ভাউচার সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Account Statement Print Modal */}
      {isStatementPrintOpen && (
        <AccountStatementPrintModal
          account={financialAccounts.find((a) => a.id === selectedAccountId)}
          transactions={ledgerTransactions}
          fromDate={fromDate}
          toDate={toDate}
          onClose={() => setIsStatementPrintOpen(false)}
        />
      )}
    </div>
  );
}
