'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { FinancialAccount } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { ArrowRightLeft, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { getTodayIsoDate } from '@/utils/dateUtils';

interface FundTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromAccountId?: string;
}

export default function FundTransferModal({
  isOpen,
  onClose,
  defaultFromAccountId,
}: FundTransferModalProps) {
  const { language, showToast } = useApp();
  const { financialAccounts, addAccountTransfer, getAccountLiveBalance } = useData();

  const activeAccounts = financialAccounts.filter((a) => a.isActive !== false);

  const [fromAccountId, setFromAccountId] = useState<string>(
    defaultFromAccountId || activeAccounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState<string>(
    activeAccounts.find((a) => a.id !== (defaultFromAccountId || activeAccounts[0]?.id))?.id || ''
  );
  const [amount, setAmount] = useState<number>(0);
  const [transferDate, setTransferDate] = useState<string>(getTodayIsoDate());
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [transferredBy, setTransferredBy] = useState<string>('Manager / Accounts');
  const [notes, setNotes] = useState<string>('');

  const fromAccount = financialAccounts.find((a) => a.id === fromAccountId);
  const toAccount = financialAccounts.find((a) => a.id === toAccountId);

  const fromLiveBalance = fromAccountId ? getAccountLiveBalance(fromAccountId).liveBalance : 0;
  const toLiveBalance = toAccountId ? getAccountLiveBalance(toAccountId).liveBalance : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId) {
      alert(language === 'bn' ? 'দয়া করে প্রেরক ও প্রাপক অ্যাকাউন্ট নির্বাচন করুন।' : 'Please select from and to accounts.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert(
        language === 'bn'
          ? 'একই অ্যাকাউন্টের মাঝে ফান্ড ট্রান্সফার সম্ভব নয়। ভিন্ন অ্যাকাউন্ট সিলেক্ট করুন।'
          : 'From and To accounts cannot be the same.'
      );
      return;
    }
    if (amount <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন।' : 'Please enter a valid amount.');
      return;
    }
    if (amount > fromLiveBalance) {
      if (
        !confirm(
          language === 'bn'
            ? `সতর্কতা: প্রেরক অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই (বর্তমান ব্যালেন্স: ${formatCurrency(fromLiveBalance, language)})। আপনি কি তবুও ওভারড্রাফট ট্রান্সফার করতে চান?`
            : `Warning: Insufficient balance. Proceed anyway?`
        )
      ) {
        return;
      }
    }

    addAccountTransfer({
      fromAccountId,
      fromAccountName: fromAccount?.accountName || 'Unknown',
      toAccountId,
      toAccountName: toAccount?.accountName || 'Unknown',
      amount: Number(amount),
      transferDate,
      referenceNo: referenceNo.trim() || undefined,
      transferredBy,
      notes: notes.trim() || undefined,
    });

    showToast(
      language === 'bn'
        ? `${formatCurrency(amount, language)} সফলভাবে ট্রান্সফার সম্পন্ন হয়েছে।`
        : `Transfer of ${formatCurrency(amount, language)} recorded successfully.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === 'bn'
          ? 'ইন্টার-অ্যাকাউন্ট ফান্ড ট্রান্সফার'
          : 'Inter-Account Fund Transfer'
      }
      subtitle={
        language === 'bn'
          ? 'ক্যাশ টু ব্যাংক জমা, ব্যাংক উত্তোলন অথবা ওয়ালেট ট্রান্সফার'
          : 'Cash Deposit, Bank Withdrawal, or Account Transfers'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Transfer Visual Direction Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900 text-white">
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
              {language === 'bn' ? 'উৎস / টাকা কর্তন অ্যাকাউন্ট (From)' : 'From Account (Debit)'}
            </span>
            <p className="font-bold text-xs text-white truncate">{fromAccount?.accountName || 'Select Account'}</p>
            <p className="text-[11px] text-slate-400">
              বর্তমান ব্যালেন্স: <strong className="text-emerald-400 font-mono">{formatCurrency(fromLiveBalance, language)}</strong>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              {language === 'bn' ? 'গন্তব্য / টাকা জমা অ্যাকাউন্ট (To)' : 'To Account (Credit)'}
            </span>
            <p className="font-bold text-xs text-white truncate">{toAccount?.accountName || 'Select Account'}</p>
            <p className="text-[11px] text-slate-400">
              বর্তমান ব্যালেন্স: <strong className="text-emerald-400 font-mono">{formatCurrency(toLiveBalance, language)}</strong>
            </p>
          </div>
        </div>

        {/* Form Selection Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'টাকা কোথা থেকে যাবে (From Account) *' : 'From Account *'}
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} (ব্যালেন্স: ৳{getAccountLiveBalance(acc.id).liveBalance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'টাকা কোথায় জমা হবে (To Account) *' : 'To Account *'}
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                  {acc.accountName} (ব্যালেন্স: ৳{getAccountLiveBalance(acc.id).liveBalance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'bn' ? 'ট্রান্সফারের পরিমাণ (টাকা) *' : 'Transfer Amount (BDT) *'}</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="50000"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'bn' ? 'ট্রান্সফারের তারিখ' : 'Transfer Date'}</span>
            </label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'রেফারেন্স / ব্যাংক ডিপোজিট স্লিপ নং' : 'Reference / Deposit Slip #'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'DEP-449102 / Cheque #8812' : 'Deposit Slip / Cheque #'}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'ট্রান্সফারকারী / দায়িত্বপ্রাপ্ত' : 'Authorized By'}
            </label>
            <input
              type="text"
              value={transferredBy}
              onChange={(e) => setTransferredBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'bn' ? 'মন্তব্য ও নোট' : 'Notes & Remarks'}</span>
          </label>
          <input
            type="text"
            placeholder={language === 'bn' ? 'শোরুমের ক্যাশ ব্যাংকে জমা / ফ্যাক্টরি খরচের জন্য ব্যাংক উত্তোলন...' : 'Transfer reason...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'ট্রান্সফার নিশ্চিত করুন' : 'Confirm Transfer'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
