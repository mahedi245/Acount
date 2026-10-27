'use client';

import React, { useState } from 'react';
import { Printer, ArrowLeft, CheckCircle2, FileText, MessageSquare } from 'lucide-react';
import { Quotation } from '@/types';
import { formatCurrency, formatCft } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import PrintHeader from '@/components/common/PrintHeader';
import { translateWoodSpecies, translateDoorDesign, translatePolishType } from '@/translations/dict';
import ShareMessageModal from '@/components/common/ShareMessageModal';
import { generateQuotationMessage } from '@/utils/messageTemplates';

interface QuotationPrintViewProps {
  quotation: Quotation;
  onBack?: () => void;
}

export default function QuotationPrintView({ quotation, onBack }: QuotationPrintViewProps) {
  const { language } = useApp();
  const { settings } = useData();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Action Controls (hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to Quotations'}</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            {language === 'bn' ? 'কোটেশন:' : 'Quote:'} <strong className="text-slate-900">{quotation.quotationNumber}</strong>
          </span>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'bn' ? 'WhatsApp কোটেশন পাঠান' : 'WhatsApp Quote'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>{language === 'bn' ? 'কোটেশন প্রিন্ট / PDF সংরক্ষণ' : 'Print Quotation (A4 PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="printable-sheet bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Print Header */}
        <PrintHeader
          documentTitleBn="আনুষ্ঠানিক কোটেশন বিল"
          documentTitleEn="OFFICIAL QUOTATION"
          docNumber={quotation.quotationNumber}
          docDate={formatDate(quotation.date, language)}
        />

        {/* Customer & Quotation Info Grid with QR Code */}
        <div className="grid grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-6 print:bg-white print:border-slate-300 print:mb-2 print:p-2.5 print:gap-2 print:text-[8pt] items-center">
          <div className="col-span-6 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
              {language === 'bn' ? 'গ্রাহকের বিবরণ (Customer Info)' : 'Customer Info'}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1 print:text-black print:text-xs">
              {quotation.customerName}
            </h3>
            <p className="text-slate-700 font-medium mt-0.5 print:text-black">{quotation.customerPhone}</p>
            <p className="text-slate-600 mt-0.5 print:text-black">{quotation.customerAddress}</p>
            {quotation.siteLocation && (
              <p className="text-red-700 font-bold mt-1 print:text-black print:mt-0.5">
                {language === 'bn' ? 'সাইট / প্রজেক্ট লোকেশন:' : 'Site Location:'} {quotation.siteLocation}
              </p>
            )}
          </div>

          <div className="col-span-6 text-right space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
              {language === 'bn' ? 'কোটেশন সংক্রান্ত তথ্য' : 'Quotation Info'}
            </span>
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'কোটেশন নং:' : 'Quotation #:'}</span>{' '}
              <strong className="font-mono text-slate-900 text-xs print:text-black">{quotation.quotationNumber}</strong>
            </p>
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'ইস্যু তারিখ:' : 'Issue Date:'}</span>{' '}
              <strong>{formatDate(quotation.date, language)}</strong>
            </p>
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'মেয়াদ:' : 'Valid Until:'}</span>{' '}
              <strong className="text-red-700 print:text-black">{formatDate(quotation.validUntil, language)}</strong>
            </p>
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
                <th className="p-2.5 text-right">{language === 'bn' ? 'দর (৳)' : 'Rate'}</th>
                <th className="p-2.5 text-right rounded-r-lg">{language === 'bn' ? 'মোট টাকা' : 'Total BDT'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-300">
              {quotation.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="p-2.5 text-center font-bold text-slate-400 print:text-black">{idx + 1}</td>
                  <td className="p-2.5">
                    <p className="font-bold text-slate-900 print:text-black">{item.description}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-0.5 print:text-slate-700">
                      {item.design && <span>• {translateDoorDesign(item.design, language)}</span>}
                      {item.polishType && <span>• {translatePolishType(item.polishType, language)}</span>}
                      {item.fittingIncluded && (
                        <span className="text-emerald-700 font-bold print:text-black">
                          • {language === 'bn' ? 'ফিটিং সহ' : 'Fitting Included'}
                        </span>
                      )}
                    </div>
                    {item.notes && <p className="text-[10px] text-red-700 italic mt-0.5 print:text-slate-600">{item.notes}</p>}
                  </td>
                  <td className="p-2.5 font-medium text-slate-700 print:text-black">
                    {translateWoodSpecies(item.woodSpecies, language)}
                  </td>
                  <td className="p-2.5 font-mono text-slate-700 print:text-black">
                    {item.itemType === 'door' ? (
                      `${item.widthIn}" × ${item.heightIn || (item.lengthFt ? Math.round(item.lengthFt * 12) : 0)}" × ${item.thicknessIn}"`
                    ) : item.itemType === 'choukhat' ? (
                      `${item.widthIn}" × ${item.thicknessIn}" × ${item.doorWidthIn || item.lengthIn || 30}" × ${item.heightIn || (item.lengthFt > 0 ? Math.round(((item.lengthFt * 12) - (item.doorWidthIn || item.lengthIn || 30)) / 2) : 84)}"`
                    ) : (
                      `${item.lengthFt}' × ${item.widthIn}" × ${item.thicknessIn}"`
                    )}
                    {item.totalCft ? (
                      <span className="block text-[10px] text-red-700 font-bold print:text-black">
                        ({formatCft(item.totalCft, language)})
                      </span>
                    ) : null}
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-900 print:text-black">{item.quantity}</td>
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

        {/* Calculation & Terms Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6 print:grid-cols-2 print:gap-3 print:mb-2">
          {/* Terms & Conditions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 print:bg-white print:border-slate-300 print:p-2.5 print:rounded-lg print:text-[7.5pt]">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] print:text-black print:text-[7.5pt]">
              {language === 'bn' ? 'শর্তাবলী:' : 'Terms & Conditions:'}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed print:text-black print:text-[7pt] print:space-y-0.5">
              {quotation.termsAndConditions?.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>

          {/* Pricing Totals Box */}
          <div className="space-y-2 text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50/50 print:bg-white print:border-slate-300 print:p-2.5 print:space-y-1 print:rounded-lg">
            <div className="flex justify-between py-1 px-2 text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
              <span>{language === 'bn' ? 'আইটেম মোট:' : 'Subtotal:'}</span>
              <span className="font-bold text-slate-900 print:text-black">{formatCurrency(quotation.subTotal, language)}</span>
            </div>

            {quotation.discount > 0 && (
              <div className="flex justify-between py-1 px-2 text-amber-800 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'ছাড়:' : 'Discount:'}</span>
                <span className="font-bold">- {formatCurrency(quotation.discount, language)}</span>
              </div>
            )}

            {quotation.transportCost > 0 && (
              <div className="flex justify-between py-1 px-2 text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'পরিবহন খরচ:' : 'Transport:'}</span>
                <span className="font-bold text-slate-900 print:text-black">+ {formatCurrency(quotation.transportCost, language)}</span>
              </div>
            )}

            {quotation.fittingCost > 0 && (
              <div className="flex justify-between py-1 px-2 text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'ইনস্টলেশন ও ফিটিং:' : 'Fitting & Installation:'}</span>
                <span className="font-bold text-slate-900 print:text-black">+ {formatCurrency(quotation.fittingCost, language)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between py-2.5 px-4 rounded-xl bg-slate-900 text-white font-extrabold text-sm print:bg-black print:text-white print:border print:border-black print:py-1 print:px-2 print:text-[9pt] print:rounded-md">
              <span>{language === 'bn' ? 'সর্বমোট কোটেশন মূল্য:' : 'Grand Total:'}</span>
              <span className="text-amber-400 font-black text-base print:text-white print:text-[9.5pt]">{formatCurrency(quotation.grandTotal, language)}</span>
            </div>

            {/* In words */}
            <div className="pt-2 text-[10.5px] print:pt-1 print:text-[7.5pt]">
              <span className="text-slate-500 font-bold block">{language === 'bn' ? 'সর্বমোট কোটেশন মূল্য কথায়:' : 'Total in words:'}</span>
              <p className="font-semibold text-slate-900 italic print:text-black">{amountInWords(quotation.grandTotal, language)}</p>
            </div>
          </div>
        </div>

        {/* Bank & Payment Information */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-900 flex flex-wrap items-center justify-between gap-3 mb-8 print:bg-white print:border-slate-300 print:p-2 print:mb-2 print:rounded-lg print:text-[7.5pt]">
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] text-red-700 block print:text-black print:text-[7pt]">
              {language === 'bn' ? 'ব্যাংক হিসাব নম্বর:' : 'Bank Account:'}
            </span>
            <p className="font-bold print:text-black">
              {settings.bankDetails.bankName} • A/C: {settings.bankDetails.accountNumber} ({settings.bankDetails.accountName})
            </p>
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] text-red-700 block print:text-black print:text-[7pt]">
              {language === 'bn' ? 'বিকাশ / নগদ পেমেন্ট:' : 'bKash / Nagad:'}
            </span>
            <p className="font-bold print:text-black">{settings.mobileBanking.bKashMerchant || settings.mobileBanking.bKashPersonal}</p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-300 text-xs signature-section print:pt-4 print:gap-4 print:text-[8pt]">
          <div className="text-center">
            <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-700 print:text-black print:w-40">
              {language === 'bn' ? 'গ্রাহকের স্বাক্ষর ও সম্মতি' : 'Customer Acceptance Signature'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 print:text-slate-600 print:text-[7pt]">{language === 'bn' ? 'তারিখসহ' : 'With Date'}</p>
          </div>

          <div className="text-center">
            <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-900 print:text-black print:w-40">
              {language === 'bn' ? 'কর্তৃপক্ষের স্বাক্ষর' : 'Authorized Signature'}
            </div>
            <p className="text-[10px] text-red-700 font-semibold mt-0.5 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareMessageModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={language === 'bn' ? 'কোটেশন বার্তা পাঠান' : 'Send Quotation Message'}
          customerName={quotation.customerName}
          customerPhone={quotation.customerPhone}
          type="quotation"
          quotationNumber={quotation.quotationNumber}
          amount={quotation.grandTotal}
          initialMessageBn={generateQuotationMessage(quotation, settings, 'bn')}
          initialMessageEn={generateQuotationMessage(quotation, settings, 'en')}
        />
      )}
    </div>
  );
}
