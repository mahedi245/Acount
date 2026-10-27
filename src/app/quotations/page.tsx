'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { Quotation, QuotationStatus, PaymentRecord } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getTodayIsoDate, addDaysToDate } from '@/utils/dateUtils';
import { translateWoodSpecies } from '@/translations/dict';
import StatusBadge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import QuotationForm from '@/components/quotations/QuotationForm';

function QuotationsContent() {
  const searchParams = useSearchParams();
  const { language, showToast, t } = useApp();
  const {
    quotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToOrder,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [prefillFromCatalog, setPrefillFromCatalog] = useState<{
    description: string;
    woodSpecies: string;
    rate: number;
  } | undefined>(undefined);

  useEffect(() => {
    const prefillItem = searchParams.get('prefillItem');
    const wood = searchParams.get('wood');
    const rate = searchParams.get('rate');

    if (prefillItem) {
      setPrefillFromCatalog({
        description: prefillItem,
        woodSpecies: wood || 'Chittagong Teak (চিটাগাং সেগুন)',
        rate: Number(rate) || 35000,
      });
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  // Convert to Order Modal
  const [convertingQuotation, setConvertingQuotation] = useState<Quotation | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('Cash');
  const [deliveryDate, setDeliveryDate] = useState<string>(addDaysToDate(getTodayIsoDate(), 14));
  const [convertNotes, setConvertNotes] = useState<string>('');

  // Filtered Quotations
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerPhone.includes(searchTerm) ||
      (q.siteLocation && q.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveQuotation = (quotationData: Omit<Quotation, 'id' | 'createdAt'>) => {
    if (editingQuotation) {
      updateQuotation(editingQuotation.id, quotationData);
      showToast(language === 'bn' ? 'কোটেশন সফলভাবে আপডেট করা হয়েছে।' : 'Quotation updated successfully.', 'success');
      setEditingQuotation(null);
    } else {
      addQuotation(quotationData);
      showToast(language === 'bn' ? 'নতুন কোটেশন সফলভাবে তৈরি হয়েছে।' : 'New quotation created successfully.', 'success');
      setIsCreateModalOpen(false);
    }
  };

  const handleOpenConvert = (quotation: Quotation) => {
    setConvertingQuotation(quotation);
    // default 50% advance
    setAdvanceAmount(Math.round(quotation.grandTotal * 0.5));
    setDeliveryDate(addDaysToDate(getTodayIsoDate(), 14));
  };

  const handleConfirmConvert = () => {
    if (!convertingQuotation) return;

    try {
      const newOrder = convertQuotationToOrder(
        convertingQuotation.id,
        advanceAmount,
        paymentMethod,
        deliveryDate,
        convertNotes
      );

      showToast(
        language === 'bn'
          ? `কোটেশনটি সফলভাবে কাজের অর্ডারে (${newOrder.orderNumber}) রূপান্তরিত হয়েছে!`
          : `Converted to Work Order ${newOrder.orderNumber}!`,
        'success'
      );
      setConvertingQuotation(null);
    } catch (e) {
      showToast('Error converting quotation', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'কোটেশন ও বিলিং মডিউল' : 'Quotations & Billing'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'পাল্লা, চৌকাঠ, সাইজ কাঠ ও ইন্টেরিয়র কাজের বিস্তারিত কোটেশন তৈরি ও অর্ডারে রূপান্তর।'
              : 'Generate custom wood quotes, calculate CFT/piece rates, and convert to active orders.'}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingQuotation(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন কোটেশন তৈরি করুন' : 'Create New Quotation'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'কোটেশন নং, গ্রাহকের নাম, ফোন...' : 'Search by quote #, name, phone...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', 'draft', 'sent', 'approved', 'converted'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all'
                ? language === 'bn'
                  ? 'সকল কোটেশন'
                  : 'All'
                : st === 'draft'
                ? (language === 'bn' ? 'খসড়া' : 'Draft')
                : st === 'sent'
                ? (language === 'bn' ? 'পাঠানো হয়েছে' : 'Sent')
                : st === 'approved'
                ? (language === 'bn' ? 'অনুমোদিত' : 'Approved')
                : (language === 'bn' ? 'অর্ডারে রূপান্তরিত' : 'Converted')}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations List */}
      <div className="space-y-4">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {language === 'bn' ? 'কোনো কোটেশন পাওয়া যায়নি' : 'No quotations found'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn' ? 'নতুন একটি কোটেশন তৈরি করতে উপরের বাটনে ক্লিক করুন।' : 'Click above to create a new quotation.'}
            </p>
          </div>
        ) : (
          filteredQuotations.map((quotation) => (
            <div
              key={quotation.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-xs border border-red-200">
                    QT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {quotation.quotationNumber}
                      </h3>
                      <StatusBadge status={quotation.status} />
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {quotation.customerName} • {quotation.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {language === 'bn' ? 'মোট মূল্য' : 'Grand Total'}
                  </span>
                  <p className="text-lg font-black text-slate-900">
                    {formatCurrency(quotation.grandTotal, language)}
                  </p>
                </div>
              </div>

              {/* Items Preview Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                {quotation.items.map((it, idx) => {
                  let sizeStr = '';
                  if (it.itemType === 'door') {
                    const h = it.heightIn || (it.lengthFt ? Math.round(it.lengthFt * 12) : 0);
                    sizeStr = `${it.widthIn}"×${h}"×${it.thicknessIn}"`;
                  } else if (it.itemType === 'choukhat') {
                    const dw = it.doorWidthIn || it.lengthIn || 30;
                    const h = it.heightIn || (it.lengthFt > 0 ? Math.round(((it.lengthFt * 12) - dw) / 2) : 84);
                    sizeStr = `${it.widthIn}"×${it.thicknessIn}"×${dw}"×${h}"`;
                  } else if (it.lengthFt > 0 || it.widthIn > 0) {
                    sizeStr = `${it.lengthFt}ft×${it.widthIn}"×${it.thicknessIn}"`;
                  }
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <strong>{it.quantity}x</strong> {it.description} ({translateWoodSpecies(it.woodSpecies, language)})
                      {sizeStr && (
                        <span className="text-[10px] font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200">
                          {sizeStr}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Footer info & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="text-slate-500 text-[11px]">
                  {language === 'bn' ? 'ইস্যু:' : 'Issued:'} {formatDate(quotation.date, language)} •{' '}
                  {language === 'bn' ? 'মেয়াদ:' : 'Valid:'} {formatDate(quotation.validUntil, language)}
                  {quotation.siteLocation && ` • ${language === 'bn' ? 'সাইট:' : 'Site:'} ${quotation.siteLocation}`}
                </div>

                <div className="flex items-center gap-2">
                  {/* Convert to Order Button if not converted */}
                  {quotation.status !== 'converted' ? (
                    <button
                      onClick={() => handleOpenConvert(quotation)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'অর্ডারে রূপান্তর' : 'Convert to Order'}</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'অর্ডার চালু আছে' : 'Active Order'}</span>
                    </span>
                  )}

                  {/* Print Link */}
                  <Link
                    href={`/quotations/${quotation.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-red-700" />
                    <span>{language === 'bn' ? 'প্রিন্ট ভিউ' : 'Print View'}</span>
                  </Link>

                  {/* Edit */}
                  <button
                    onClick={() => setEditingQuotation(quotation)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত এই কোটেশনটি মুছে ফেলতে চান?' : 'Delete this quotation?')) {
                        deleteQuotation(quotation.id);
                        showToast(language === 'bn' ? 'কোটেশন মুছে ফেলা হয়েছে।' : 'Quotation deleted.', 'info');
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Quotation Modal */}
      <Modal
        isOpen={isCreateModalOpen || editingQuotation !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingQuotation(null);
        }}
        title={
          editingQuotation
            ? `${language === 'bn' ? 'কোটেশন সম্পাদনা:' : 'Edit Quotation:'} ${editingQuotation.quotationNumber}`
            : language === 'bn'
            ? 'নতুন প্রফেশনাল কোটেশন তৈরি করুন'
            : 'Create New Quotation'
        }
        subtitle={language === 'bn' ? 'কাঠের প্রজাতি, সাইজ, ডিজাইন ও পলিশ অনুযায়ী স্বয়ংক্রিয় দর হিসাব' : 'Automatic CFT and piece-rate calculation builder'}
        maxWidth="5xl"
      >
        <QuotationForm
          initialData={editingQuotation || undefined}
          prefillItem={prefillFromCatalog}
          onSave={handleSaveQuotation}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setEditingQuotation(null);
            setPrefillFromCatalog(undefined);
          }}
        />
      </Modal>

      {/* Convert to Work Order Modal */}
      <Modal
        isOpen={convertingQuotation !== null}
        onClose={() => setConvertingQuotation(null)}
        title={language === 'bn' ? 'কোটেশন থেকে কাজের অর্ডারে রূপান্তর' : 'Convert Quotation to Work Order'}
        subtitle={
          convertingQuotation
            ? `${convertingQuotation.quotationNumber} • ${convertingQuotation.customerName}`
            : ''
        }
        maxWidth="lg"
      >
        {convertingQuotation && (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-red-950">
                  {language === 'bn' ? 'মোট কোটেশন মূল্য:' : 'Quotation Grand Total:'}
                </span>
                <span className="font-black text-sm text-red-950">
                  {formatCurrency(convertingQuotation.grandTotal, language)}
                </span>
              </div>
            </div>

            {/* Advance payment input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'বুকিং বাবদ অগ্রিম জমা (টাকা) *' : 'Advance Payment Received (BDT) *'}
              </label>
              <input
                type="number"
                min="0"
                max={convertingQuotation.grandTotal}
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {language === 'bn' ? 'বাকি বকেয়া থাকবে:' : 'Remaining Due:'}{' '}
                <strong>
                  {formatCurrency(convertingQuotation.grandTotal - advanceAmount, language)}
                </strong>
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'অগ্রিম পেমেন্ট মাধ্যম' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentRecord['method'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Cash">{language === 'bn' ? 'নগদ ক্যাশ' : 'Cash'}</option>
                <option value="Bank Transfer">{language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                <option value="bKash">{language === 'bn' ? 'বিকাশ' : 'bKash'}</option>
                <option value="Nagad">{language === 'bn' ? 'নগদ (মোবাইল ওয়ালেট)' : 'Nagad'}</option>
                <option value="Cheque">{language === 'bn' ? 'ব্যাংক চেক' : 'Cheque'}</option>
              </select>
            </div>

            {/* Target Delivery Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'প্রতিশ্রুত ডেলিভারি তারিখ' : 'Target Delivery Date'}
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'অর্ডার তৈরির নোট' : 'Order Notes'}
              </label>
              <textarea
                rows={2}
                value={convertNotes}
                onChange={(e) => setConvertNotes(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'কারখানার মিস্ত্রিদের জন্য বিশেষ নির্দেশনা...'
                    : 'Special instructions for workshop artisans...'
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setConvertingQuotation(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
              >
                {language === 'bn' ? 'কনফার্ম করুন ও অর্ডার বানান' : 'Confirm & Create Order'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Quotations...</div>}>
      <QuotationsContent />
    </Suspense>
  );
}
