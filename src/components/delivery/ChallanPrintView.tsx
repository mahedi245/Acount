'use client';

import React, { useState } from 'react';
import { Printer, ArrowLeft, Truck, Phone, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';
import { DeliveryChallan, Order } from '@/types';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/utils/dateUtils';
import PrintHeader from '@/components/common/PrintHeader';
import { translateWoodSpecies } from '@/translations/dict';
import ShareMessageModal from '@/components/common/ShareMessageModal';
import { generateChallanMessage } from '@/utils/messageTemplates';

interface ChallanPrintViewProps {
  challan: DeliveryChallan;
  order?: Order;
  onBack?: () => void;
}

export default function ChallanPrintView({ challan, order, onBack }: ChallanPrintViewProps) {
  const { language } = useApp();
  const { settings } = useData();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Top action bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'চালান তালিকায় ফিরে যান' : 'Back to Deliveries'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">
            {language === 'bn' ? 'চালান নং:' : 'Challan #'} <strong className="text-slate-900">{challan.challanNumber}</strong>
          </span>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'bn' ? 'WhatsApp চালান পাঠান' : 'WhatsApp Challan'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'চালান প্রিন্ট করুন' : 'Print Challan (A4 PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 page format) */}
      <div className="printable-sheet bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Company Header */}
        <PrintHeader
          documentTitleBn="পণ্য সরবরাহ চালান"
          documentTitleEn="DELIVERY CHALLAN"
          docNumber={challan.challanNumber}
          docDate={formatDate(challan.deliveryDate, language)}
        />

        {/* Challan Info & Customer Meta with QR Code */}
        <div className="grid grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs print:bg-white print:border-slate-300 print:mb-2 print:p-2.5 print:gap-2 print:text-[8pt] items-center">
          <div className="col-span-6 space-y-1">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] print:text-black print:text-[8pt]">
              {language === 'bn' ? 'গ্রাহকের তথ্য ও ডেলিভারি সাইট:' : 'Customer & Delivery Site:'}
            </h3>
            <p className="text-sm font-extrabold text-slate-900 print:text-black print:text-xs">{challan.customerName}</p>
            <p className="text-slate-700 font-medium flex items-center gap-1.5 print:text-black">
              <Phone className="w-3.5 h-3.5 text-slate-400 print:w-2.5 print:h-2.5 print:text-black" />
              <span>{challan.customerPhone}</span>
            </p>
            <p className="text-slate-600 flex items-start gap-1.5 print:text-black">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0 print:w-2.5 print:h-2.5 print:text-black" />
              <span>{challan.deliveryAddress}</span>
            </p>
          </div>

          <div className="col-span-6 space-y-1 text-right">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] print:text-black print:text-[8pt]">
              {language === 'bn' ? 'চালানের বিবরণ:' : 'Challan Details:'}
            </h3>
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'চালান নম্বর:' : 'Challan No:'} </span>
              <strong className="text-slate-900 font-mono text-xs print:text-black">{challan.challanNumber}</strong>
            </p>
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'ডেলিভারি তারিখ:' : 'Date:'} </span>
              <strong>{formatDate(challan.deliveryDate, language)}</strong>
            </p>
            <p className="text-slate-800 print:text-black">
              <span className="text-slate-500 print:text-black">{language === 'bn' ? 'অর্ডার নম্বর:' : 'Order Ref:'} </span>
              <strong className="text-red-700 font-mono print:text-black">{challan.orderNumber}</strong>
            </p>
          </div>
        </div>

        {/* Transport & Vehicle Details Box */}
        {(challan.vehicleNumber || challan.driverName) && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-4 print:bg-white print:border-slate-300 print:p-2 print:mb-2 print:rounded-lg print:text-[7.5pt]">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-600 print:w-3.5 print:h-3.5 print:text-black" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block print:text-black print:text-[7pt]">
                  {language === 'bn' ? 'পরিবহন ও গাড়ির তথ্য' : 'Logistics / Transport'}
                </span>
                <p className="font-bold text-slate-900 print:text-black">
                  {challan.vehicleNumber || (language === 'bn' ? 'পিকআপ / ভ্যান' : 'Pickup / Van')}
                </p>
              </div>
            </div>

            {challan.driverName && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block print:text-black print:text-[7pt]">
                  {language === 'bn' ? 'ড্রাইভারের নাম ও মোবাইল' : 'Driver Info'}
                </span>
                <p className="font-bold text-slate-900 print:text-black">
                  {challan.driverName} {challan.driverPhone && `(${challan.driverPhone})`}
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block print:text-black print:text-[7pt]">
                {language === 'bn' ? 'চালান অবস্থা' : 'Delivery Status'}
              </span>
              <p className="font-bold text-emerald-700 flex items-center gap-1 print:text-black">
                <CheckCircle2 className="w-3.5 h-3.5 print:w-3 print:h-3" />
                <span>
                  {challan.status === 'delivered'
                    ? language === 'bn'
                      ? 'ডেলিভারি সম্পন্ন'
                      : 'Delivered'
                    : language === 'bn'
                    ? 'পথে রয়েছে'
                    : 'Dispatched'}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto print:overflow-hidden print:w-full print:mb-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                <th className="p-2.5 w-10 text-center rounded-l-lg">#</th>
                <th className="p-2.5">{language === 'bn' ? 'মালের বিবরণ ও স্পেসিফিকেশন' : 'Item Description & Specs'}</th>
                <th className="p-2.5 w-28 text-center">{language === 'bn' ? 'কাঠের প্রজাতি' : 'Wood Species'}</th>
                <th className="p-2.5 w-28 text-center">{language === 'bn' ? 'সরবরাহ পরিমাণ' : 'Quantity Sent'}</th>
                <th className="p-2.5 w-48 rounded-r-lg">{language === 'bn' ? 'মন্তব্য' : 'Remarks / Note'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-300">
              {challan.deliveredItems.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="p-2.5 text-center font-bold text-slate-400 print:text-black">{idx + 1}</td>
                  <td className="p-2.5">
                    <p className="font-bold text-slate-900 print:text-black">{it.itemDescription}</p>
                    <p className="text-[10.5px] text-slate-600 font-mono print:text-slate-800">{it.sizeSpecs}</p>
                  </td>
                  <td className="p-2.5 text-center font-medium text-slate-700 print:text-black">
                    {translateWoodSpecies(it.woodSpecies, language)}
                  </td>
                  <td className="p-2.5 text-center font-black text-slate-900 text-sm print:text-black">
                    {it.quantity} {language === 'bn' ? 'টি' : 'Pcs'}
                  </td>
                  <td className="p-2.5 text-slate-600 text-[11px] italic print:text-black">
                    {challan.notes ||
                      (language === 'bn'
                        ? 'সঠিক মাপে ও নিখুঁত কন্ডিশনে সরবরাহ করা হয়েছে'
                        : 'Delivered in exact specs and undamaged condition')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes & Receiving Declaration */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700 print:bg-white print:border-slate-300 print:p-2 print:mb-2 print:rounded-lg print:text-[7.5pt]">
          <p className="font-bold text-slate-900 print:text-black">
            {language === 'bn' ? 'পণ্য গ্রহণকারী গ্রাহকের অঙ্গীকারনামা:' : 'Receiving Declaration:'}
          </p>
          <p className="text-[11px] print:text-black print:text-[7pt]">
            {language === 'bn'
              ? 'উপরোল্লিখিত কাঠের দরজা / চৌকাঠ / মালামাল সম্পূর্ণ অক্ষত, সঠিক সাইজ ও ভালো কন্ডিশনে বুঝে পেলাম।'
              : 'Received the above mentioned timber products in good condition and exact specifications without any damage.'}
          </p>
        </div>

        {/* Signature Blocks */}
        <div className="grid grid-cols-3 gap-8 pt-12 text-center text-xs text-slate-800 signature-section print:grid-cols-3 print:gap-3 print:pt-4 print:text-[8pt]">
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold print:text-black print:w-32 print:mx-auto">
              {language === 'bn' ? 'মালামাল প্রস্তুতকারী' : 'Prepared / Loaded By'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 print:text-slate-600 print:text-[7pt]">
              {language === 'bn' ? 'ঢাকা টিম্বার কমপ্লেক্স' : 'Dhaka Timber Complex'}
            </p>
          </div>

          <div>
            <div className="border-t border-slate-400 pt-1 font-bold print:text-black print:w-32 print:mx-auto">
              {language === 'bn' ? 'গাড়ি চালক / ডেলিভারিম্যান' : 'Delivered By (Driver)'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 print:text-slate-600 print:text-[7pt]">
              {language === 'bn' ? 'স্বাক্ষর ও মোবাইল নং' : 'Signature & Phone'}
            </p>
          </div>

          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 print:text-black print:w-32 print:mx-auto">
              {language === 'bn' ? 'গ্রহীতার স্বাক্ষর ও সিল' : 'Receiver Signature & Seal'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 print:text-slate-600 print:text-[7pt]">
              {language === 'bn' ? 'তারিখসহ' : 'With Date'}
            </p>
          </div>
        </div>
      </div>

      {/* Share Challan Modal */}
      {isShareModalOpen && (
        <ShareMessageModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={language === 'bn' ? 'ডেলিভারি চালান বার্তা পাঠান' : 'Send Delivery Challan Alert'}
          customerName={challan.customerName}
          customerPhone={challan.customerPhone}
          type="challan"
          orderNumber={challan.orderNumber}
          initialMessageBn={generateChallanMessage(challan, order, settings, 'bn')}
          initialMessageEn={generateChallanMessage(challan, order, settings, 'en')}
        />
      )}
    </div>
  );
}
