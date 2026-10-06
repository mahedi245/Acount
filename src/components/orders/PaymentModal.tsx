'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { Order, PaymentRecord } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { getTodayIsoDate } from '@/utils/dateUtils';
import { DollarSign, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ order, isOpen, onClose }: PaymentModalProps) {
  const { language, showToast } = useApp();
  const { addPaymentToOrder } = useData();

  const [amount, setAmount] = useState<number>(order?.dueAmount || 0);
  const [method, setMethod] = useState<PaymentRecord['method']>('Cash');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('Manager');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (order && isOpen) {
      setAmount(order.dueAmount > 0 ? order.dueAmount : 0);
      setMethod('Cash');
      setReferenceNo('');
      setReceivedBy('Manager');
      setNote('');
    }
  }, [order, isOpen]);

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন।' : 'Please enter valid amount.');
      return;
    }

    addPaymentToOrder(order.id, {
      date: getTodayIsoDate(),
      amount,
      method,
      referenceNo,
      receivedBy,
      note,
    });

    showToast(
      language === 'bn'
        ? `${formatCurrency(amount, language)} পেমেন্ট সফলভাবে জমা হয়েছে।`
        : `Payment of ${formatCurrency(amount, language)} recorded successfully.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'bn' ? 'পেমেন্ট ও বকেয়া জমা নিন' : 'Record Order Payment'}
      subtitle={`${order.orderNumber} • ${order.customerName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Order Due Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{language === 'bn' ? 'মোট অর্ডার মূল্য:' : 'Grand Total:'}</span>
            <span className="font-bold text-slate-800">{formatCurrency(order.grandTotal, language)}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>{language === 'bn' ? 'ইতিমধ্যে জমা হয়েছে:' : 'Already Paid:'}</span>
            <span className="font-bold">{formatCurrency(order.totalPaid, language)}</span>
          </div>
          <div className="flex justify-between text-rose-600 font-extrabold text-sm pt-2 border-t border-slate-200">
            <span>{language === 'bn' ? 'বর্তমান বকেয়া:' : 'Current Due:'}</span>
            <span>{formatCurrency(order.dueAmount, language)}</span>
          </div>
        </div>

        {/* Payment Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'জমা নেওয়ার পরিমাণ (টাকা) *' : 'Payment Amount (BDT) *'}
          </label>
          <input
            type="number"
            min="1"
            max={order.dueAmount}
            required
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentRecord['method'])}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Cash">{language === 'bn' ? 'নগদ ক্যাশ' : 'Cash'}</option>
            <option value="Bank Transfer">{language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
            <option value="bKash">{language === 'bn' ? 'বিকাশ' : 'bKash'}</option>
            <option value="Nagad">{language === 'bn' ? 'নগদ (মোবাইল ওয়ালেট)' : 'Nagad'}</option>
            <option value="Cheque">{language === 'bn' ? 'ব্যাংক চেক' : 'Cheque'}</option>
          </select>
        </div>

        {/* Ref / Cheque No */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'রেফারেন্স / ট্রানজেকশন / চেক নং' : 'Reference / TXN / Cheque #'}
          </label>
          <input
            type="text"
            placeholder="TXN-998242 / EBL-CHQ-123456"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Received by & Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'গ্রহণকারী' : 'Received By'}
          </label>
          <input
            type="text"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'নোট' : 'Note'}
          </label>
          <input
            type="text"
            placeholder={language === 'bn' ? '২য় কিস্তি বাবদ গ্রহণ...' : 'e.g. 2nd installment payment...'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
          >
            {language === 'bn' ? 'পেমেন্ট জমা করুন' : 'Confirm Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
