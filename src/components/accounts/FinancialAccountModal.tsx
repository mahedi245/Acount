'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { FinancialAccount, FinancialAccountType } from '@/types';
import { useApp } from '@/context/AppContext';
import { Building2, DollarSign, Calendar, CreditCard, FileText, CheckCircle2, Landmark } from 'lucide-react';
import { getTodayIsoDate } from '@/utils/dateUtils';

interface FinancialAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Omit<FinancialAccount, 'id'>) => void;
  editingAccount?: FinancialAccount | null;
}

export default function FinancialAccountModal({
  isOpen,
  onClose,
  onSave,
  editingAccount,
}: FinancialAccountModalProps) {
  const { language } = useApp();

  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<FinancialAccountType>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchName, setBranchName] = useState('');
  const [routingNo, setRoutingNo] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [openingDate, setOpeningDate] = useState(getTodayIsoDate());
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingAccount) {
      setAccountName(editingAccount.accountName || '');
      setAccountType(editingAccount.accountType || 'bank');
      setBankName(editingAccount.bankName || '');
      setAccountNumber(editingAccount.accountNumber || '');
      setBranchName(editingAccount.branchName || '');
      setRoutingNo(editingAccount.routingNo || '');
      setOpeningBalance(editingAccount.openingBalance || 0);
      setOpeningDate(editingAccount.openingDate || getTodayIsoDate());
      setIsActive(editingAccount.isActive !== false);
      setNotes(editingAccount.notes || '');
    } else {
      setAccountName('');
      setAccountType('bank');
      setBankName('');
      setAccountNumber('');
      setBranchName('');
      setRoutingNo('');
      setOpeningBalance(0);
      setOpeningDate(getTodayIsoDate());
      setIsActive(true);
      setNotes('');
    }
  }, [editingAccount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      alert(language === 'bn' ? 'দয়া করে অ্যাকাউন্টের নাম লিখুন।' : 'Please enter account name.');
      return;
    }

    onSave({
      accountName: accountName.trim(),
      accountType,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      branchName: branchName.trim() || undefined,
      routingNo: routingNo.trim() || undefined,
      openingBalance: Number(openingBalance) || 0,
      openingDate,
      isActive,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingAccount
          ? language === 'bn'
            ? 'অ্যাকাউন্ট / ব্যাংক তথ্য সম্পাদনা'
            : 'Edit Financial Account'
          : language === 'bn'
          ? 'নতুন ব্যাংক / ক্যাশ অ্যাকাউন্ট যুক্ত করুন'
          : 'Add New Bank / Cash Account'
      }
      subtitle={
        language === 'bn'
          ? 'প্রারম্ভিক উদ্বৃত্ত (Opening Balance) ও ব্যাংক বিবরণী'
          : 'Opening Balance & Banking Details'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Account Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'অ্যাকাউন্টের ধরন *' : 'Account Type *'}
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as FinancialAccountType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="cash">নগদ ক্যাশ বক্স (Cash in Hand)</option>
              <option value="bank">বাণিজ্যিক ব্যাংক অ্যাকাউন্ট (Bank Account)</option>
              <option value="mfs">মোবাইল ব্যাংকিং (bKash / Nagad / Rocket)</option>
              <option value="petty_cash">কারখানা পেটি ক্যাশ (Petty Cash)</option>
            </select>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'অ্যাকাউন্টের নাম / শিরোনাম *' : 'Account Display Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                accountType === 'cash'
                  ? 'প্রধান শোরুম ক্যাশ ড্রয়ার'
                  : accountType === 'bank'
                  ? 'Islami Bank Bangladesh Ltd. (Badda Branch)'
                  : 'bKash Merchant Account'
              }
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Bank specific fields */}
          {accountType === 'bank' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'ব্যাংকের নাম' : 'Bank Name'}
                </label>
                <input
                  type="text"
                  placeholder="Islami Bank / Eastern Bank / City Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
                </label>
                <input
                  type="text"
                  placeholder="2050 1840 2004 8910"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'শাখা / ব্রাঞ্চ' : 'Branch Name'}
                </label>
                <input
                  type="text"
                  placeholder="Badda Branch / Mirpur Branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'রাউটিং নম্বর (ঐচ্ছিক)' : 'Routing Number (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="125271890"
                  value={routingNo}
                  onChange={(e) => setRoutingNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}

          {accountType === 'mfs' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'মোবাইল নম্বর / ওয়ালেট নং' : 'Mobile / Wallet Number'}
              </label>
              <input
                type="text"
                placeholder="01733-743384"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* Opening Balance */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 text-emerald-800">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'প্রারম্ভিক উদ্বৃত্ত (Opening Balance ৳) *' : 'Opening Balance (BDT) *'}</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="100"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              {language === 'bn' ? 'সিস্টেম শুরুর দিনে অ্যাকাউন্টে থাকা মূল ব্যালেন্স।' : 'Initial ledger starting balance.'}
            </p>
          </div>

          {/* Opening Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'bn' ? 'প্রারম্ভিক তারিখ (Opening Date)' : 'Opening Date'}</span>
            </label>
            <input
              type="date"
              value={openingDate}
              onChange={(e) => setOpeningDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'bn' ? 'মন্তব্য ও নোট' : 'Notes & Remarks'}</span>
          </label>
          <textarea
            rows={2}
            placeholder={language === 'bn' ? 'অ্যাকাউন্টের ব্যবহার ও বিস্তারিত...' : 'Account remarks...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="acc-active-toggle"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
          />
          <label htmlFor="acc-active-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
            {language === 'bn' ? 'সক্রিয় অ্যাকাউন্ট (Active Account)' : 'Active Account'}
          </label>
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
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'অ্যাকাউন্ট সংরক্ষণ করুন' : 'Save Account'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
