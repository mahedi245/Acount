'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { MarketingAgent, PaymentRecord } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { DollarSign, Calendar, Target, User, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface CollectionItemToEdit {
  orderId: string;
  orderNumber: string;
  customerName: string;
  siteLocation?: string;
  agentId?: string;
  agentName?: string;
  paymentId: string;
  paymentDate: string;
  paymentMethod: string;
  amount: number;
  commission: number;
  note?: string;
  referenceNo?: string;
}

interface EditCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionItem: CollectionItemToEdit | null;
}

export default function EditCollectionModal({
  isOpen,
  onClose,
  collectionItem,
}: EditCollectionModalProps) {
  const { language, showToast } = useApp();
  const {
    marketingAgents,
    orders,
    updatePaymentRecord,
    deletePaymentFromOrder,
    assignMarketingAgentToOrder,
  } = useData();

  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('Cash');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (collectionItem) {
      setSelectedAgentId(collectionItem.agentId || '');
      setPaymentDate(collectionItem.paymentDate || '');
      setAmount(collectionItem.amount || 0);
      setPaymentMethod((collectionItem.paymentMethod as PaymentRecord['method']) || 'Cash');
      setReferenceNo(collectionItem.referenceNo || '');
      setNote(collectionItem.note || '');
    }
  }, [collectionItem, isOpen]);

  if (!collectionItem) return null;

  const targetOrder = orders.find((o) => o.id === collectionItem.orderId);
  const selectedAgent = marketingAgents.find((a) => a.id === selectedAgentId);
  const ratePerLakh = selectedAgent?.commissionRatePerLakh || 1000;
  const calculatedCommission = Math.round((amount / 100000) * ratePerLakh);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert(language === 'bn' ? 'দয়া করে সঠিক কালেকশন অ্যামাউন্ট লিখুন।' : 'Please enter valid amount.');
      return;
    }
    if (!paymentDate) {
      alert(language === 'bn' ? 'দয়া করে তারিখ নির্বাচন করুন।' : 'Please select payment date.');
      return;
    }

    // 1. Update Payment Record
    updatePaymentRecord(collectionItem.orderId, collectionItem.paymentId, {
      date: paymentDate,
      amount: Number(amount),
      method: paymentMethod,
      referenceNo: referenceNo.trim() || undefined,
      note: note.trim() || undefined,
    });

    // 2. Update / Reassign Marketing Agent on the Order if changed
    if (selectedAgentId !== collectionItem.agentId) {
      assignMarketingAgentToOrder(
        collectionItem.orderId,
        selectedAgentId || undefined,
        selectedAgent?.name || undefined
      );
    }

    showToast(
      language === 'bn'
        ? 'কালেকশন ও কমিশন তথ্য সফলভাবে আপডেট হয়েছে।'
        : 'Collection details updated successfully.',
      'success'
    );
    onClose();
  };

  const handleDelete = () => {
    if (
      confirm(
        language === 'bn'
          ? `আপনি কি নিশ্চিতভাবে এই ${formatCurrency(amount, language)} কালেকশন এন্ট্রি মুছে ফেলতে চান? এতে অর্ডারের বকেয়া পুনরায় বৃদ্ধি পাবে।`
          : `Are you sure you want to delete this payment of ${formatCurrency(amount, language)}?`
      )
    ) {
      deletePaymentFromOrder(collectionItem.orderId, collectionItem.paymentId);
      showToast(
        language === 'bn' ? 'কালেকশন রেকর্ডটি মুছে ফেলা হয়েছে।' : 'Collection record deleted.',
        'info'
      );
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === 'bn'
          ? 'কালেকশন ও কমিশন এন্ট্রি সম্পাদনা'
          : 'Edit Collection & Commission'
      }
      subtitle={`${collectionItem.orderNumber} • ${collectionItem.customerName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4 text-left">
        {/* Order Meta Info Box */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === 'bn' ? 'কাজের অর্ডার নং' : 'Work Order #'}
              </span>
              <span className="font-mono font-bold text-white text-sm">{collectionItem.orderNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === 'bn' ? 'গ্রাহক ও সাইট' : 'Customer & Site'}
              </span>
              <span className="font-bold text-white">{collectionItem.customerName}</span>
            </div>
          </div>

          {targetOrder && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[10px] block">
                  {language === 'bn' ? 'মোট অর্ডার মূল্য' : 'Order Total'}
                </span>
                <span className="font-bold text-white font-mono">{formatCurrency(targetOrder.grandTotal, language)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">
                  {language === 'bn' ? 'মোট জমা' : 'Total Paid'}
                </span>
                <span className="font-bold text-emerald-400 font-mono">{formatCurrency(targetOrder.totalPaid, language)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">
                  {language === 'bn' ? 'বকেয়া' : 'Due Balance'}
                </span>
                <span className="font-bold text-rose-400 font-mono">{formatCurrency(targetOrder.dueAmount, language)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit Fields */}
        <div className="space-y-3 pt-1">
          {/* Reassign Marketing Agent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-red-600" />
              <span>{language === 'bn' ? 'মার্কেটিং প্রতিনিধি / কমিশন প্রাপক' : 'Assigned Marketing Agent'}</span>
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{language === 'bn' ? '-- কোনো এজেন্ট নেই / শোরুম ডিরেক্ট --' : '-- No Agent (Direct Showroom) --'}</option>
              {marketingAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.designation}) - ৳{agent.commissionRatePerLakh || 1000}/লাখ
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              {language === 'bn'
                ? 'প্রতিনিধি পরিবর্তন করলে এই অর্ডারের সমস্ত কালেকশন নতুন প্রতিনিধির মাসিক হিসাবে যুক্ত হবে।'
                : 'Reassigning updates collection attribution for this order.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payment Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'bn' ? 'কালেকশনের তারিখ *' : 'Collection Date *'}</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {language === 'bn' ? 'তারিখের মাসের উপর ভিত্তি করে মাসিক কমিশন নির্ধারিত হয়।' : 'Month of this date determines the commission sheet.'}
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'bn' ? 'কালেকশন / জমার পরিমাণ (৳) *' : 'Collection Amount (BDT) *'}</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম *' : 'Payment Method *'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentRecord['method'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Cash">Cash (নগদ টাকা)</option>
                <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Cheque">Cheque (চেক)</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'ট্রানজেকশন / রেফারেন্স নং' : 'Reference / TXN #'}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'বিকাশ TrxID / চেক নম্বর' : 'TrxID or Cheque Number'}
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'মন্তব্য ও নোট' : 'Notes & Remarks'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'অগ্রিম গ্রহণ / ২য় কিস্তি ইত্যাদি...' : 'Payment notes...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Live 1% Commission Calculation Preview */}
        {selectedAgentId && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-amber-950 block">
                {language === 'bn' ? 'পুনঃহিসাবকৃত কমিশন (১%):' : 'Recalculated Commission (1%):'}
              </span>
              <span className="text-[10px] text-amber-700">
                {selectedAgent?.name} (৳{ratePerLakh} / লাখ)
              </span>
            </div>
            <span className="text-sm font-black text-amber-900 font-mono">
              {formatCurrency(calculatedCommission, language)}
            </span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কালেকশন মুছুন' : 'Delete Entry'}</span>
          </button>

          <div className="flex items-center gap-2">
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
              <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
