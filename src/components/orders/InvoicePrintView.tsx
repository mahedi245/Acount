'use client';

import React, { useState } from 'react';
import { Printer, ArrowLeft, CheckCircle2, DollarSign, FileText, Receipt, MessageSquare, ExternalLink } from 'lucide-react';
import { Order, PaymentRecord } from '@/types';
import { formatCurrency, formatCft } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import PrintHeader from '@/components/common/PrintHeader';
import StatusBadge from '@/components/common/Badge';
import { translateWoodSpecies, translateDoorDesign, translatePolishType } from '@/translations/dict';
import MoneyReceiptPrintModal from '@/components/orders/MoneyReceiptPrintModal';
import ShareMessageModal from '@/components/common/ShareMessageModal';
import { generateOrderStatusMessage } from '@/utils/messageTemplates';

interface InvoicePrintViewProps {
  order: Order;
  onBack?: () => void;
}

export default function InvoicePrintView({ order, onBack }: InvoicePrintViewProps) {
  const { language } = useApp();
  const { settings } = useData();
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentRecord | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Controls (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to Orders'}</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            {language === 'bn' ? 'অর্ডার:' : 'Order:'} <strong className="text-slate-900">{order.orderNumber}</strong>
          </span>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'bn' ? 'WhatsApp / SMS পাঠান' : 'Send WhatsApp / SMS'}</span>
          </button>

          <a
            href={`/track/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>{language === 'bn' ? 'লাইভ ট্র্যাকিং পেজ' : 'Live Tracking'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>{language === 'bn' ? 'ইনভয়েস প্রিন্ট / PDF সংরক্ষণ' : 'Print Invoice (A4 PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="printable-sheet bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        <PrintHeader
          documentTitleBn="কাজের অর্ডার ও ইনভয়েস বিল"
          documentTitleEn="WORK ORDER & INVOICE"
          docNumber={order.orderNumber}
          docDate={formatDate(order.orderDate, language)}
        />

        {/* Customer & Order Information Grid with QR Code */}
        <div className="grid grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-6 print:bg-white print:border-slate-300 print:mb-2 print:p-2.5 print:gap-2 print:text-[8pt] items-center">
          <div className="col-span-6 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
              {language === 'bn' ? 'গ্রাহকের তথ্য (Customer Details)' : 'Customer Info'}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 print:text-black print:text-xs">
              {order.customerName}
            </h3>
            <p className="text-slate-700 font-medium mt-0.5 print:text-black">{order.customerPhone}</p>
            <p className="text-slate-600 mt-0.5 print:text-black">{order.customerAddress}</p>
            {order.siteLocation && (
              <p className="text-red-700 font-bold mt-1 print:text-black print:mt-0.5">
                {language === 'bn' ? 'সাইট / ডেলিভারি ঠিকানা:' : 'Site Location:'} {order.siteLocation}
              </p>
            )}
          </div>

          <div className="col-span-6 text-right space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
              {language === 'bn' ? 'অর্ডারের বিবরণ (Order Meta)' : 'Order Details'}
            </span>
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'অর্ডার নং:' : 'Order #:'}</span>{' '}
              <strong className="font-mono text-slate-900 text-xs print:text-black">{order.orderNumber}</strong>
            </p>
            {order.quotationNumber && (
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'কোটেশন নং:' : 'Quotation #:'}</span>{' '}
                <strong className="font-mono">{order.quotationNumber}</strong>
              </p>
            )}
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'অর্ডার তারিখ:' : 'Order Date:'}</span>{' '}
              <strong>{formatDate(order.orderDate, language)}</strong>
            </p>
            <p className="text-red-700 font-bold print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'ডেলিভারি তারিখ:' : 'Expected Delivery:'} </span>
              <strong>{formatDate(order.expectedDeliveryDate, language)}</strong>
            </p>
            {order.marketingAgentName && (
              <p className="text-slate-700 text-[11px] print:text-black print:text-[7.5pt]">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'রেফারেন্স / অফিসার:' : 'Marketing Rep:'} </span>
                <strong className="text-slate-800 print:text-black">{order.marketingAgentName}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto print:overflow-hidden print:w-full mb-6 print:mb-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                <th className="p-2.5 rounded-l-lg text-center w-8">#</th>
                <th className="p-2.5">{language === 'bn' ? 'আইটেম ও কাজের বিবরণ' : 'Item Description'}</th>
                <th className="p-2.5">{language === 'bn' ? 'কাঠের প্রজাতি' : 'Wood Species'}</th>
                <th className="p-2.5">{language === 'bn' ? 'সাইজ ও স্পেক্স' : 'Size (L×W×T)'}</th>
                <th className="p-2.5 text-center">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                <th className="p-2.5 text-center">{language === 'bn' ? 'সরবরাহ' : 'Delivered'}</th>
                <th className="p-2.5 text-right">{language === 'bn' ? 'দর (৳)' : 'Rate'}</th>
                <th className="p-2.5 text-right rounded-r-lg">{language === 'bn' ? 'মোট টাকা' : 'Total BDT'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-300">
              {order.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="p-2.5 text-center font-bold text-slate-400 print:text-black">{idx + 1}</td>
                  <td className="p-2.5">
                    <p className="font-bold text-slate-900 print:text-black">{item.description}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-0.5 print:text-slate-700">
                      {item.design && <span>• {translateDoorDesign(item.design, language)}</span>}
                      {item.polishType && <span>• {translatePolishType(item.polishType, language)}</span>}
                    </div>
                  </td>
                  <td className="p-2.5 font-medium text-slate-700 print:text-black">
                    {translateWoodSpecies(item.woodSpecies, language)}
                  </td>
                  <td className="p-2.5 font-mono text-slate-700 print:text-black">
                    {item.lengthFt}' × {item.widthIn}" × {item.thicknessIn}"
                    {item.totalCft ? (
                      <span className="block text-[10px] text-red-700 font-bold print:text-black">
                        ({formatCft(item.totalCft, language)})
                      </span>
                    ) : null}
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-900 print:text-black">{item.quantity}</td>
                  <td className="p-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] print:border print:border-slate-400 ${
                        item.deliveredQuantity >= item.quantity
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.deliveredQuantity > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.deliveredQuantity} / {item.quantity}
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-slate-700 font-semibold print:text-black">
                    {formatCurrency(item.unitRate, language)}
                  </td>
                  <td className="p-2.5 text-right font-black text-slate-900 print:text-black">
                    {formatCurrency(item.totalAmount, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary & Payment Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6 print:grid-cols-2 print:gap-3 print:mb-2">
          {/* Payment History Records */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 print:bg-white print:border-slate-300 print:p-2.5 print:space-y-1.5 print:rounded-lg">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between pb-2 border-b border-slate-200 print:pb-1">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-600 print:w-3 print:h-3" />
                <span>{language === 'bn' ? 'জমা ও পেমেন্ট হিস্ট্রি' : 'Payment History'}</span>
              </span>
              <span className="text-emerald-700 font-extrabold print:text-black">{formatCurrency(order.totalPaid, language)}</span>
            </h4>

            {order.paymentRecords.length === 0 ? (
              <p className="text-slate-500 italic text-[11px] print:text-[8pt]">
                {language === 'bn' ? 'কোনো পেমেন্ট এন্ট্রি নেই।' : 'No payments recorded yet.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-200 print:divide-slate-200">
                {order.paymentRecords.map((pay, i) => (
                  <div key={pay.id} className="py-2 flex justify-between items-center text-[11px] print:py-1 print:text-[8pt]">
                    <div>
                      <p className="font-bold text-slate-800 print:text-black">
                        {pay.method} {pay.referenceNo ? `(${pay.referenceNo})` : ''}
                      </p>
                      <p className="text-[10px] text-slate-500 print:text-slate-600 print:text-[7pt]">
                        {formatDate(pay.date, language)} • {pay.receivedBy || 'Dhaka Timber Complex'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-700 print:text-black">
                        {formatCurrency(pay.amount, language)}
                      </span>
                      <button
                        onClick={() => setSelectedPaymentForReceipt(pay)}
                        className="no-print p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300"
                        title={language === 'bn' ? 'মানি রিসিট প্রিন্ট' : 'Print Money Receipt'}
                      >
                        <Printer className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* In Words for Total Paid */}
            {order.totalPaid > 0 && (
              <div className="pt-2 border-t border-slate-200 text-[10.5px] print:pt-1 print:text-[7.5pt]">
                <span className="text-slate-500 font-bold block">{language === 'bn' ? 'পরিশোধিত টাকা কথায়:' : 'Paid in words:'}</span>
                <p className="font-semibold text-slate-900 italic print:text-black">{amountInWords(order.totalPaid, language)}</p>
              </div>
            )}
          </div>

          {/* Pricing Totals Box */}
          <div className="space-y-2 text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50/50 print:bg-white print:border-slate-300 print:p-2.5 print:space-y-1 print:rounded-lg">
            <div className="flex justify-between py-1 px-2 text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
              <span>{language === 'bn' ? 'আইটেম মোট:' : 'Subtotal:'}</span>
              <span className="font-bold text-slate-900 print:text-black">{formatCurrency(order.subTotal, language)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between py-1 px-2 text-amber-800 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'ছাড়:' : 'Discount:'}</span>
                <span className="font-bold">- {formatCurrency(order.discount, language)}</span>
              </div>
            )}

            {order.transportCost > 0 && (
              <div className="flex justify-between py-1 px-2 text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'পরিবহন খরচ:' : 'Transport:'}</span>
                <span className="font-bold text-slate-900 print:text-black">+ {formatCurrency(order.transportCost, language)}</span>
              </div>
            )}

            {order.fittingCost > 0 && (
              <div className="flex justify-between py-1 px-2 text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'ফিটিং ও ইনস্টলেশন:' : 'Fitting & Installation:'}</span>
                <span className="font-bold text-slate-900 print:text-black">+ {formatCurrency(order.fittingCost, language)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 px-3 bg-slate-200 rounded-xl font-bold text-slate-900 print:bg-slate-100 print:border print:border-slate-300 print:py-1 print:px-2 print:text-[8.5pt]">
              <span>{language === 'bn' ? 'সর্বমোট অর্ডার মূল্য:' : 'Grand Total:'}</span>
              <span className="font-black text-sm print:text-[9pt]">{formatCurrency(order.grandTotal, language)}</span>
            </div>

            <div className="flex justify-between py-1.5 px-3 text-emerald-800 font-bold border-b border-slate-200 print:text-black print:py-0.5 print:px-2 print:text-[8pt]">
              <span>{language === 'bn' ? 'মোট নগদ গ্রহণ (Total Paid):' : 'Total Paid:'}</span>
              <span className="font-black">{formatCurrency(order.totalPaid, language)}</span>
            </div>

            <div className="flex justify-between py-2.5 px-4 rounded-xl bg-slate-900 text-white font-extrabold text-sm print:bg-black print:text-white print:border print:border-black print:py-1 print:px-2 print:text-[9pt] print:rounded-md">
              <span>{language === 'bn' ? 'অবশিষ্ট বকেয়া (Due Balance):' : 'Due Balance:'}</span>
              <span className="text-amber-400 font-black text-base print:text-white print:text-[9.5pt]">{formatCurrency(order.dueAmount, language)}</span>
            </div>

            {/* In Words for Grand Total */}
            <div className="pt-2 text-[10.5px] print:pt-1 print:text-[7.5pt]">
              <span className="text-slate-500 font-bold block">{language === 'bn' ? 'সর্বমোট বিল কথায়:' : 'Total in words:'}</span>
              <p className="font-semibold text-slate-900 italic print:text-black">{amountInWords(order.grandTotal, language)}</p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-6 space-y-1 print:bg-white print:border-slate-300 print:p-2 print:mb-2 print:rounded-lg print:text-[7.5pt]">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] print:text-[7.5pt]">
            {language === 'bn' ? 'শর্তাবলী:' : 'Terms & Conditions:'}
          </h4>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px] print:text-black print:text-[7pt] print:space-y-0">
            {settings.invoiceTerms.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-300 text-xs signature-section print:pt-4 print:gap-4 print:text-[8pt]">
          <div className="text-center">
            <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-700 print:text-black print:w-40">
              {language === 'bn' ? 'গ্রাহকের স্বাক্ষর ও প্রাপ্তি স্বীকার' : 'Customer Received Signature'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 print:text-slate-600 print:text-[7pt]">{language === 'bn' ? 'সিল ও তারিখসহ' : 'With Date'}</p>
          </div>

          <div className="text-center">
            <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-900 print:text-black print:w-40">
              {language === 'bn' ? 'কর্তৃপক্ষের স্বাক্ষর' : 'Authorized Signature'}
            </div>
            <p className="text-[10px] text-red-700 font-semibold mt-0.5 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
          </div>
        </div>
      </div>

      {/* Money Receipt Modal */}
      {selectedPaymentForReceipt && (
        <MoneyReceiptPrintModal
          order={order}
          payment={selectedPaymentForReceipt}
          onClose={() => setSelectedPaymentForReceipt(null)}
        />
      )}

      {/* Share Message Modal */}
      {isShareModalOpen && (
        <ShareMessageModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={language === 'bn' ? 'অর্ডার স্ট্যাটাস বার্তা পাঠান' : 'Send Order Update'}
          customerName={order.customerName}
          customerPhone={order.customerPhone}
          type="order_status"
          orderNumber={order.orderNumber}
          amount={order.grandTotal}
          initialMessageBn={generateOrderStatusMessage(order, settings, 'bn')}
          initialMessageEn={generateOrderStatusMessage(order, settings, 'en')}
        />
      )}
    </div>
  );
}
