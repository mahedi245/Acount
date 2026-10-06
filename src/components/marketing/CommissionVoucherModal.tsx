'use client';

import React from 'react';
import { Printer, X, Award, CheckCircle2, DollarSign, Target } from 'lucide-react';
import { MarketingCommissionPayout, MarketingAgent } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import PrintHeader from '@/components/common/PrintHeader';

interface CommissionVoucherModalProps {
  payout: MarketingCommissionPayout;
  agent?: MarketingAgent;
  collectionRecords?: Array<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    siteLocation?: string;
    paymentDate: string;
    paymentMethod: string;
    amount: number;
    commission: number;
  }>;
  onClose: () => void;
}

export default function CommissionVoucherModal({
  payout,
  agent,
  collectionRecords = [],
  onClose,
}: CommissionVoucherModalProps) {
  const { language } = useApp();
  const { settings } = useData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto printable-modal-overlay">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 printable-modal print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white no-print print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold tracking-wide uppercase">
              {language === 'bn'
                ? 'মার্কেটিং কমিশন ভাউচার প্রিভিউ ও প্রিন্ট'
                : 'Commission Payment Voucher Preview & Print'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>{language === 'bn' ? 'ভাউচার প্রিন্ট / PDF' : 'Print Voucher'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-8 sm:p-10 text-slate-900 printable-sheet print:p-2 text-xs font-sans">
          {/* Header */}
          <PrintHeader
            documentTitleBn="মার্কেটিং সেলস কমিশন ভাউচার"
            documentTitleEn="MARKETING SALES COMMISSION VOUCHER"
          />

          {/* Voucher Title & QR Grid */}
          <div className="grid grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 print:bg-white print:border-slate-300 print:mb-2 print:p-2.5 print:gap-2 print:text-[8pt] items-center">
            <div className="col-span-6 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
                {language === 'bn' ? 'প্রতিনিধির তথ্য (Agent Details)' : 'Agent Info'}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 print:text-black print:text-xs">
                {payout.agentName}
              </h3>
              <p className="text-slate-700 font-medium print:text-black">
                {agent?.designation || 'Sales Representative'}
              </p>
              <p className="text-slate-600 font-mono print:text-black">
                {agent?.phone || ''} {agent?.email ? `• ${agent.email}` : ''}
              </p>
            </div>

            <div className="col-span-6 text-right space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
                {language === 'bn' ? 'ভাউচার মেটা (Voucher Meta)' : 'Voucher Meta'}
              </span>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'ভাউচার নং:' : 'Voucher #:'}</span>{' '}
                <strong className="font-mono text-slate-900 text-xs print:text-black">{payout.payoutNumber}</strong>
              </p>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'মাস/বছর:' : 'Month:'}</span>{' '}
                <strong className="font-mono">{payout.month}</strong>
              </p>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'তারিখ:' : 'Payment Date:'}</span>{' '}
                <strong>{formatDate(payout.paymentDate, language)}</strong>
              </p>
              <p className="text-red-700 font-bold print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Method:'} </span>
                <strong>{payout.paymentMethod} {payout.referenceNo ? `(${payout.referenceNo})` : ''}</strong>
              </p>
            </div>
          </div>

          {/* Collection Records Table */}
          {collectionRecords && collectionRecords.length > 0 && (
            <div className="overflow-x-auto print:overflow-hidden print:w-full mb-6 print:mb-2">
              <h4 className="text-xs font-black text-slate-900 mb-2 uppercase tracking-wide print:text-black print:mb-1 print:text-[8pt]">
                {language === 'bn' ? 'চলতি মাসে আদায়কৃত কালেকশন ও অর্ডার বিবরণী' : 'Attributed Collections for Month'}
              </h4>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                    <th className="p-2 text-center w-8 rounded-l-lg">#</th>
                    <th className="p-2">{language === 'bn' ? 'অর্ডার নং' : 'Order #'}</th>
                    <th className="p-2">{language === 'bn' ? 'গ্রাহকের নাম ও সাইট' : 'Customer & Site'}</th>
                    <th className="p-2">{language === 'bn' ? 'জমা তারিখ' : 'Date'}</th>
                    <th className="p-2">{language === 'bn' ? 'মাধ্যম' : 'Method'}</th>
                    <th className="p-2 text-right">{language === 'bn' ? 'আদায়কৃত টাকা (৳)' : 'Collected (BDT)'}</th>
                    <th className="p-2 text-right rounded-r-lg">{language === 'bn' ? 'কমিশন ১% (৳)' : 'Comm. 1% (BDT)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                  {collectionRecords.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-2 text-center font-bold text-slate-400 print:text-black">{idx + 1}</td>
                      <td className="p-2 font-mono font-bold text-slate-900 print:text-black">{rec.orderNumber}</td>
                      <td className="p-2">
                        <span className="font-bold text-slate-900 print:text-black">{rec.customerName}</span>
                        {rec.siteLocation && <span className="text-slate-500 text-[10px] block print:text-slate-700">• {rec.siteLocation}</span>}
                      </td>
                      <td className="p-2 font-mono text-slate-700 print:text-black">{formatDate(rec.paymentDate, language)}</td>
                      <td className="p-2 text-slate-700 print:text-black">{rec.paymentMethod}</td>
                      <td className="p-2 text-right font-black text-slate-900 print:text-black">
                        {formatCurrency(rec.amount, language)}
                      </td>
                      <td className="p-2 text-right font-black text-emerald-700 print:text-black">
                        {formatCurrency(rec.commission, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Calculation Summary Table */}
          <div className="grid grid-cols-12 gap-4 mb-6 print:mb-2 print:gap-2">
            <div className="col-span-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 print:bg-white print:border-slate-300 print:p-2.5 print:rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 print:text-black">
                  {language === 'bn' ? 'কমিশন পলিসি ও বিবরণ' : 'Commission Policy'}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed print:text-black print:text-[7.5pt]">
                  • ঢাকা টিম্বার কমপ্লেক্স (DTC) এর সেলস পলিসি অনুযায়ী প্রতি <strong>১,০০,০০০ (এক লাখ) টাকা প্রকৃত কালেকশনে ১,০০০ টাকা (১.০০%)</strong> কমিশন প্রদান করা হয়।
                </p>
                {payout.notes && (
                  <p className="text-xs text-slate-600 mt-2 italic print:text-black print:mt-1 print:text-[7.5pt]">
                    নোট: {payout.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 print:mt-2 print:pt-1.5 print:border-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
                  {language === 'bn' ? 'কথায় (Amount in Words):' : 'Amount in Words:'}
                </span>
                <p className="text-xs font-bold text-slate-900 italic mt-0.5 print:text-black print:text-[8pt]">
                  {amountInWords(payout.netPaidAmount, language)}
                </p>
              </div>
            </div>

            <div className="col-span-6 space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 print:bg-white print:border-slate-300 print:p-2.5 print:space-y-1 print:rounded-lg">
              <div className="flex justify-between py-1 text-xs text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'মোট আদায়কৃত কালেকশন:' : 'Total Collection:'}</span>
                <strong className="font-mono text-slate-900 print:text-black">{formatCurrency(payout.totalCollectionInMonth, language)}</strong>
              </div>
              <div className="flex justify-between py-1 text-xs text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'কমিশন রেট (প্রতি লাখে ১,০০০/-):' : 'Rate (1,000 / 1 Lakh):'}</span>
                <strong className="font-mono print:text-black">৳{payout.commissionRatePerLakh || 1000} (১.০%)</strong>
              </div>
              <div className="flex justify-between py-1 text-xs text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'অর্জিত মোট কমিশন:' : 'Gross Commission:'}</span>
                <strong className="font-mono text-slate-900 print:text-black">{formatCurrency(payout.grossCommissionAmount, language)}</strong>
              </div>
              {payout.deductionAmount > 0 && (
                <div className="flex justify-between py-1 text-xs text-rose-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                  <span>{language === 'bn' ? 'অগ্রিম / কর্তন:' : 'Deductions / Advances:'}</span>
                  <strong className="font-mono print:text-black">- {formatCurrency(payout.deductionAmount, language)}</strong>
                </div>
              )}
              <div className="flex justify-between py-2 text-sm font-black text-red-700 bg-red-50/70 p-2 rounded-xl print:bg-white print:text-black print:border-t-2 print:border-black print:py-1 print:px-2 print:text-[9pt] print:rounded-none">
                <span>{language === 'bn' ? 'পরিশোধিত নিট কমিশন:' : 'Net Paid Commission:'}</span>
                <span className="text-base print:text-[9.5pt]">{formatCurrency(payout.netPaidAmount, language)}</span>
              </div>
            </div>
          </div>

          {/* Authorization Signature Blocks */}
          <div className="grid grid-cols-3 gap-8 pt-10 mt-6 border-t border-slate-200 signature-section print:pt-4 print:mt-3 print:gap-3 print:border-black text-center text-xs print:text-[8pt]">
            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 font-bold text-slate-800 print:text-black print:pt-1">
                {language === 'bn' ? 'প্রাপকের স্বাক্ষর (এজেন্ট)' : 'Recipient Agent'}
              </div>
              <span className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">{payout.agentName}</span>
            </div>

            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 font-bold text-slate-800 print:text-black print:pt-1">
                {language === 'bn' ? 'অ্যাকাউন্টস / প্রস্তুতকারী' : 'Prepared by Accounts'}
              </div>
              <span className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">{payout.paidBy || 'Manager'}</span>
            </div>

            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 font-bold text-slate-800 print:text-black print:pt-1">
                {language === 'bn' ? 'ম্যানেজিং ডিরেক্টর / প্রোপাইটর' : 'Managing Director / Proprietor'}
              </div>
              <span className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Dhaka Timber Complex</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
