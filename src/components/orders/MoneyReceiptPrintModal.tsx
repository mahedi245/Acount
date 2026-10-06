'use client';

import React, { useState } from 'react';
import { Printer, X, CheckCircle2, DollarSign, MessageSquare } from 'lucide-react';
import { Order, PaymentRecord } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import PrintHeader from '@/components/common/PrintHeader';
import ShareMessageModal from '@/components/common/ShareMessageModal';
import { generateMoneyReceiptMessage } from '@/utils/messageTemplates';

interface MoneyReceiptPrintModalProps {
  order: Order;
  payment: PaymentRecord;
  receiptNumber?: string;
  onClose: () => void;
}

export default function MoneyReceiptPrintModal({
  order,
  payment,
  receiptNumber,
  onClose,
}: MoneyReceiptPrintModalProps) {
  const { language } = useApp();
  const { settings } = useData();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const receiptNo =
    receiptNumber ||
    `MR-${order.orderNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-4)}-${payment.id.slice(-3)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto printable-modal-overlay">
      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 printable-modal print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Modal Bar (hidden during print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white no-print print:hidden">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wide uppercase">
              {language === 'bn' ? 'মানি রিসিট প্রিভিউ ও প্রিন্ট' : 'Money Receipt Preview & Print'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{language === 'bn' ? 'WhatsApp রসিদ' : 'WhatsApp Receipt'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>{language === 'bn' ? 'রিসিট প্রিন্ট / PDF' : 'Print Receipt'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-10 text-slate-900 printable-sheet print:p-2">
          <PrintHeader
            documentTitleBn="টাকা প্রাপ্তি রশীদ"
            documentTitleEn="MONEY RECEIPT"
            docNumber={receiptNo}
            docDate={formatDate(payment.date, language)}
          />

          {/* Receipt Info Box */}
          <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50/50 mb-6 space-y-4 print:bg-white print:border-slate-300 print:p-3 print:space-y-2 print:mb-3 print:rounded-lg">
            {/* Row 1: Receipt No & Date */}
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200 print:pb-1.5 print:text-[8pt]">
              <div>
                <span className="text-slate-500 font-semibold">{language === 'bn' ? 'মানি রিসিট নং:' : 'Receipt No:'} </span>
                <strong className="font-mono text-slate-900 text-sm font-black print:text-xs">{receiptNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">{language === 'bn' ? 'অর্ডার রেফারেন্স:' : 'Order Ref:'} </span>
                <strong className="font-mono text-red-700 font-bold print:text-black">{order.orderNumber}</strong>
              </div>
            </div>

            {/* Row 2: Customer Name, Phone & QR Code */}
            <div className="grid grid-cols-12 gap-3 text-xs items-center print:text-[8pt] print:gap-2">
              <div className="col-span-6">
                <span className="text-[11px] text-slate-500 font-semibold block print:text-[7pt]">
                  {language === 'bn' ? 'টাকা প্রদানকারীর নাম (Customer Name):' : 'Received With Thanks From:'}
                </span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5 print:text-xs">{order.customerName}</p>
                <p className="text-slate-600 font-medium">{order.customerPhone}</p>
              </div>

              <div className="col-span-6">
                <span className="text-[11px] text-slate-500 font-semibold block print:text-[7pt]">
                  {language === 'bn' ? 'ঠিকানা ও সাইট লোকেশন:' : 'Address & Site Location:'}
                </span>
                <p className="text-slate-800 mt-0.5">{order.customerAddress}</p>
                {order.siteLocation && (
                  <p className="text-red-700 font-semibold mt-0.5 print:text-black">{order.siteLocation}</p>
                )}
              </div>
            </div>

            {/* Row 3: Amount In Figure & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 print:grid-cols-2 print:gap-2 print:pt-2">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl print:bg-white print:border-slate-300 print:p-2 print:rounded-lg">
                <span className="text-[10.5px] uppercase font-bold text-emerald-900 block print:text-black print:text-[7pt]">
                  {language === 'bn' ? 'প্রাপ্ত টাকার পরিমাণ (Amount Received):' : 'Amount Received:'}
                </span>
                <p className="text-2xl font-black text-emerald-700 mt-1 print:text-black print:text-lg">
                  {formatCurrency(payment.amount, language)}
                </p>
              </div>

              <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1 print:bg-white print:border-slate-300 print:p-2 print:space-y-0.5 print:rounded-lg print:text-[8pt]">
                <span className="text-[10.5px] uppercase font-bold text-slate-600 block print:text-black print:text-[7pt]">
                  {language === 'bn' ? 'পরিশোধের মাধ্যম (Payment Mode):' : 'Payment Method:'}
                </span>
                <p className="font-extrabold text-slate-900">
                  {payment.method} {payment.referenceNo ? `(${payment.referenceNo})` : ''}
                </p>
                <p className="text-[11px] text-slate-500 print:text-[7pt]">
                  {language === 'bn' ? 'গ্রহীতা:' : 'Received By:'} {payment.receivedBy || 'Dhaka Timber Complex'}
                </p>
              </div>
            </div>

            {/* Row 4: Amount in Words */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs print:border-slate-300 print:p-2 print:rounded-lg print:text-[8pt]">
              <span className="font-bold text-slate-700 block text-[11px] print:text-[7.5pt]">
                {language === 'bn' ? 'টাকা কথায়:' : 'Amount in Words:'}
              </span>
              <p className="font-extrabold text-slate-900 italic text-xs mt-0.5 print:text-[8pt]">
                {amountInWords(payment.amount, language)}
              </p>
            </div>
          </div>

          {/* Account Ledger Summary Box */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100 rounded-xl text-center text-xs mb-8 border border-slate-200 print:bg-white print:border-slate-300 print:p-2 print:mb-3 print:rounded-lg print:text-[8pt]">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold print:text-[7pt]">{language === 'bn' ? 'মোট বিল' : 'Total Bill'}</span>
              <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(order.grandTotal, language)}</p>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 uppercase font-bold print:text-black print:text-[7pt]">{language === 'bn' ? 'মোট জমা' : 'Total Paid'}</span>
              <p className="font-black text-emerald-700 mt-0.5 print:text-black">{formatCurrency(order.totalPaid, language)}</p>
            </div>
            <div>
              <span className="text-[10px] text-red-700 uppercase font-bold print:text-black print:text-[7pt]">{language === 'bn' ? 'অবশিষ্ট বকেয়া' : 'Balance Due'}</span>
              <p className="font-black text-red-700 mt-0.5 print:text-black">{formatCurrency(order.dueAmount, language)}</p>
            </div>
          </div>

          {/* Terms Note */}
          <p className="text-[10.5px] text-slate-500 italic mb-8 print:mb-3 print:text-[7.5pt]">
            * {language === 'bn' ? 'চেক বা পে-অর্ডার ক্যাশ হওয়ার সাপেক্ষে এই রসিদ চূড়ান্তভাবে কার্যকর হবে।' : 'Subject to realization of Cheque / Pay Order.'}
          </p>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-300 text-xs signature-section print:pt-4 print:gap-4 print:text-[8pt]">
            <div className="text-center">
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-700 print:w-36 print:text-black">
                {language === 'bn' ? 'টাকা প্রদানকারীর স্বাক্ষর' : 'Customer Signature'}
              </div>
            </div>

            <div className="text-center">
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-900 print:w-36 print:text-black">
                {language === 'bn' ? 'আদায়কারীর স্বাক্ষর ও সিল' : 'Authorized Signature & Seal'}
              </div>
              <p className="text-[10px] text-red-700 font-bold mt-0.5 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareMessageModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={language === 'bn' ? 'মানি রিসিট বার্তা পাঠান' : 'Send Payment Receipt'}
          customerName={order.customerName}
          customerPhone={order.customerPhone}
          type="money_receipt"
          orderNumber={order.orderNumber}
          amount={payment.amount}
          initialMessageBn={generateMoneyReceiptMessage(order, payment, settings, 'bn')}
          initialMessageEn={generateMoneyReceiptMessage(order, payment, settings, 'en')}
        />
      )}
    </div>
  );
}

