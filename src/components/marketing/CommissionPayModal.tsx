'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { MarketingAgent, PaymentRecord } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { useApp } from '@/context/AppContext';
import { DollarSign, FileCheck, CreditCard, User, Building, CheckCircle2 } from 'lucide-react';
import { getTodayIsoDate } from '@/utils/dateUtils';

interface CommissionPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: MarketingAgent | null;
  monthYear: string;
  totalCollection: number;
  grossCommission: number;
  paidCommission: number;
  balanceDue: number;
  onDisburse: (payoutData: {
    agentId: string;
    agentName: string;
    month: string;
    totalCollectionInMonth: number;
    commissionRatePerLakh: number;
    grossCommissionAmount: number;
    deductionAmount: number;
    netPaidAmount: number;
    paymentMethod: PaymentRecord['method'];
    paymentDate: string;
    referenceNo?: string;
    paidBy: string;
    notes?: string;
    syncToAccounts: boolean;
  }) => void;
}

export default function CommissionPayModal({
  isOpen,
  onClose,
  agent,
  monthYear,
  totalCollection,
  grossCommission,
  paidCommission,
  balanceDue,
  onDisburse,
}: CommissionPayModalProps) {
  const { language } = useApp();

  const [payoutAmount, setPayoutAmount] = useState<number>(balanceDue || grossCommission || 0);
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('bKash');
  const [paymentDate, setPaymentDate] = useState(getTodayIsoDate());
  const [referenceNo, setReferenceNo] = useState('');
  const [paidBy, setPaidBy] = useState('Managing Director / Accounts');
  const [notes, setNotes] = useState('');
  const [syncToAccounts, setSyncToAccounts] = useState(true);

  useEffect(() => {
    setPayoutAmount(balanceDue > 0 ? balanceDue : grossCommission);
    setDeductionAmount(0);
    setPaymentDate(getTodayIsoDate());
    setReferenceNo('');
    setNotes(`${monthYear} মাসিক কালেকশন কমিশন নিষ্পত্তি`);
  }, [balanceDue, grossCommission, monthYear, isOpen]);

  if (!agent) return null;

  const netPayable = Math.max(0, payoutAmount - deductionAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (netPayable <= 0) {
      alert(language === 'bn' ? 'পরিশোধের পরিমাণ ০ টাকার বেশি হতে হবে।' : 'Payout amount must be greater than 0.');
      return;
    }

    onDisburse({
      agentId: agent.id,
      agentName: agent.name,
      month: monthYear,
      totalCollectionInMonth: totalCollection,
      commissionRatePerLakh: agent.commissionRatePerLakh || 1000,
      grossCommissionAmount: grossCommission,
      deductionAmount,
      netPaidAmount: netPayable,
      paymentMethod,
      paymentDate,
      referenceNo: referenceNo.trim() || undefined,
      paidBy,
      notes: notes.trim() || undefined,
      syncToAccounts,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === 'bn'
          ? 'মাসিক কমিশন পরিশোধ ও ভাউচার ছাড়'
          : 'Disburse Monthly Commission Voucher'
      }
      subtitle={
        language === 'bn'
          ? `${agent.name} • মাস: ${monthYear}`
          : `${agent.name} • Month: ${monthYear}`
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Calculation Summary Card */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400">
              {language === 'bn' ? 'মার্কেটিং প্রতিনিধি:' : 'Representative:'}
            </span>
            <span className="font-bold text-white">{agent.name} ({agent.designation})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                {language === 'bn' ? 'মোট কালেকশন' : 'Total Collection'}
              </span>
              <p className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">
                {formatCurrency(totalCollection, language)}
              </p>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                {language === 'bn' ? 'কমিশন রেট' : 'Rate (Per Lakh)'}
              </span>
              <p className="text-xs sm:text-sm font-black text-amber-400 mt-0.5">
                ৳{agent.commissionRatePerLakh || 1000} (১%)
              </p>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                {language === 'bn' ? 'মোট কমিশন' : 'Gross Commission'}
              </span>
              <p className="text-xs sm:text-sm font-black text-white mt-0.5">
                {formatCurrency(grossCommission, language)}
              </p>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                {language === 'bn' ? 'বকেয়া পাওনা' : 'Balance Due'}
              </span>
              <p className="text-xs sm:text-sm font-black text-rose-400 mt-0.5">
                {formatCurrency(balanceDue, language)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'পরিশোধের পরিমাণ (টাকা) *' : 'Disbursement Amount (BDT) *'}
            </label>
            <input
              type="number"
              required
              min="1"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'অ্যাডভান্স / ট্যাক্স কর্তন (টাকা)' : 'Deductions / Advances (BDT)'}
            </label>
            <input
              type="number"
              min="0"
              value={deductionAmount}
              onChange={(e) => setDeductionAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'পেমেন্ট মাধ্যম *' : 'Payment Method *'}
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentRecord['method'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="bKash">bKash (বিকাশ)</option>
              <option value="Cash">Cash (নগদ ক্যাশ)</option>
              <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
              <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
              <option value="Cheque">Cheque (ব্যাংক চেক)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'পরিশোধের তারিখ' : 'Payment Date'}
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'রেফারেন্স / ট্রানজেকশন নং' : 'Reference / TXN #'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'Trx ID / Cheque #449102' : 'Trx ID / Cheque No'}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'অনুমোদনকারী / প্রদানকারী' : 'Disbursed By'}
            </label>
            <input
              type="text"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {language === 'bn' ? 'মন্তব্য ও নোট' : 'Notes & Remarks'}
          </label>
          <input
            type="text"
            placeholder={language === 'bn' ? 'মাসিক কালেকশন কমিশন পরিশোধ...' : 'Commission remarks...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Auto Sync into Accounts */}
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="sync-accounts-checkbox"
            checked={syncToAccounts}
            onChange={(e) => setSyncToAccounts(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer"
          />
          <label htmlFor="sync-accounts-checkbox" className="text-xs text-amber-950 font-bold cursor-pointer">
            {language === 'bn'
              ? 'স্বয়ংক্রিয়ভাবে আয়-ব্যয় লেজারে খরচ (Marketing Expense) হিসেবে এন্ট্রি করুন'
              : 'Automatically post into Accounts Expense ledger under Marketing Commission'}
            <p className="text-[10px] text-amber-700 font-normal mt-0.5">
              {language === 'bn'
                ? 'এতে কোম্পানির লাভ-ক্ষতি ও ক্যাশ ব্যালেন্সে সঠিক হিসাব বজায় থাকবে।'
                : 'Ensures real-time cash flow and P&L ledger synchronization.'}
            </p>
          </label>
        </div>

        {/* Net Amount Box */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
          <span className="text-xs font-bold text-red-900">
            {language === 'bn' ? 'প্রকৃত প্রদেয় নিট টাকা:' : 'Net Payable Amount:'}
          </span>
          <span className="text-base sm:text-lg font-black text-red-700">
            {formatCurrency(netPayable, language)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
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
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'কমিশন ছাড় নিশ্চিত করুন' : 'Confirm Payout'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
