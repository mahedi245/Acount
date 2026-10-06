'use client';

import React from 'react';
import { Printer, X, Hammer, User, Calendar, CheckCircle2, Award } from 'lucide-react';
import { CraftsmanTask, Craftsman } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import { useApp } from '@/context/AppContext';
import PrintHeader from '@/components/common/PrintHeader';

interface CraftsmanTaskSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CraftsmanTask | null;
  craftsman?: Craftsman;
}

export default function CraftsmanTaskSlipModal({
  isOpen,
  onClose,
  task,
  craftsman,
}: CraftsmanTaskSlipModalProps) {
  const { language } = useApp();

  if (!isOpen || !task) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto printable-modal-overlay">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 printable-modal print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {language === 'bn' ? 'কারিগর জব স্লিপ / ওয়ার্ক অর্ডার' : 'Craftsman Job Slip / Work Order'}
              </h2>
              <p className="text-[11px] text-slate-500">{task.orderNumber} • {task.craftsmanName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? 'জব স্লিপ প্রিন্ট করুন (A4)' : 'Print Job Card (A4)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 sm:p-10 space-y-6 printable-sheet text-left print:p-2 print:space-y-3">
          {/* Header */}
          <PrintHeader
            documentTitleBn="কারিগর জব কার্ড ও কাজের চুক্তি স্লিপ"
            documentTitleEn="ARTISAN JOB CARD & WORK ORDER"
            docNumber={`JOB-${task.orderNumber.replace(/[^0-9]/g, '') || '01'}`}
            docDate={formatDate(task.assignedDate, language)}
          />

          {/* Craftsman & Order Assignment Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs print:bg-white print:border-slate-300 print:mb-2 print:p-2.5 print:gap-2 print:text-[8pt]">
            <div className="space-y-1.5 print:space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black print:text-[7pt]">
                {language === 'bn' ? 'কারিগর ও মিস্ত্রির তথ্য' : 'Artisan Details'}
              </span>
              <p className="text-sm font-black text-slate-900 print:text-black print:text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-red-600 print:w-3 print:h-3 print:text-black" />
                <span>{task.craftsmanName}</span>
              </p>
              {craftsman && (
                <>
                  <p className="text-slate-700 font-medium print:text-black">
                    {language === 'bn' ? 'দক্ষতা / বিভাগ:' : 'Specialty:'} <strong>{craftsman.specialty}</strong>
                  </p>
                  <p className="text-slate-600 print:text-black">
                    {language === 'bn' ? 'মোবাইল নং:' : 'Phone:'} {craftsman.phone}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-1.5 text-right print:space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black print:text-[7pt]">
                {language === 'bn' ? 'অর্ডার ও ফ্যাক্টরি রেফারেন্স' : 'Order & Factory Ref'}
              </span>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'অর্ডার নম্বর:' : 'Order No:'} </span>
                <strong className="text-slate-900 font-mono text-xs print:text-black">{task.orderNumber}</strong>
              </p>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'গ্রাহক:' : 'Customer:'} </span>
                <strong>{task.customerName}</strong>
              </p>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'কাজের ডেডলাইন:' : 'Deadline:'} </span>
                <strong className="text-red-700 print:text-black">{formatDate(task.deadlineDate, language)}</strong>
              </p>
            </div>
          </div>

          {/* Job Item Specifications Table */}
          <div className="overflow-x-auto print:overflow-hidden print:w-full print:mb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                  <th className="p-2.5 w-10 text-center rounded-l-lg">#</th>
                  <th className="p-2.5">{language === 'bn' ? 'কাজের বিবরণ ও স্পেসিফিকেশন' : 'Assigned Task Description'}</th>
                  <th className="p-2.5 text-center w-28">{language === 'bn' ? 'পরিমাণ' : 'Assigned Qty'}</th>
                  <th className="p-2.5 text-right w-36">{language === 'bn' ? 'পিস-রেট মজুরি' : 'Piece Rate'}</th>
                  <th className="p-2.5 text-right w-36 rounded-r-lg">{language === 'bn' ? 'মোট প্রাপ্য মজুরি' : 'Total Wage'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                <tr className="hover:bg-slate-50/70">
                  <td className="p-3 text-center font-bold text-slate-400 print:text-black">১</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900 text-sm print:text-black print:text-xs">{task.itemDescription}</p>
                    <p className="text-[11px] text-slate-600 mt-1 print:text-slate-800 print:text-[7.5pt] print:mt-0.5">
                      {language === 'bn'
                        ? 'সিজনিং ও কেমিক্যাল ট্রিটেড কাঠ দিয়ে নিখুঁত ফিনিশিং, প্রপার মাপ ও জয়েন্টিং সম্পন্ন করতে হবে।'
                        : 'Manufacture using seasoned timber with precision mortise-tenon joinery and smooth sanding.'}
                    </p>
                  </td>
                  <td className="p-3 text-center font-black text-slate-900 text-sm print:text-black">
                    {task.quantity} {language === 'bn' ? 'টি' : 'Pcs'}
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-800 print:text-black">
                    {formatCurrency(task.wageRatePerUnit, language)} / {language === 'bn' ? 'পিস' : 'Pc'}
                  </td>
                  <td className="p-3 text-right font-black text-slate-900 text-sm print:text-black">
                    {formatCurrency(task.totalWageAmount, language)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount In Words & Wage Terms */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs print:bg-white print:border-slate-300 print:p-2 print:rounded-lg print:text-[8pt] print:mb-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 print:text-black">
                {language === 'bn' ? 'মোট মজুরি কথায়:' : 'Total Wage in Words:'}
              </span>
              <span className="font-extrabold text-slate-900 text-sm italic print:text-black print:text-xs">
                {amountInWords(task.totalWageAmount, language)}
              </span>
            </div>
          </div>

          {/* Quality Standards & Workshop Guidelines */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 print:bg-white print:border-slate-300 print:p-2 print:rounded-lg print:text-[7.5pt] print:space-y-0.5 print:mb-2">
            <h4 className="font-bold text-slate-900 uppercase text-[10.5px] print:text-black print:text-[7.5pt]">
              {language === 'bn' ? 'ওয়ার্কশপ কোয়ালিটি রুলস ও কারিগরের নির্দেশিকা:' : 'Quality & Workshop Instructions:'}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 print:text-black print:text-[7pt] print:space-y-0.5">
              <li>{language === 'bn' ? 'কাঠ কাটার সময় নকশা অনুযায়ী সঠিক সাইজ ও গ্রুভ বজায় রাখতে হবে।' : 'Maintain exact size tolerances and grooves as per design specifications.'}</li>
              <li>{language === 'bn' ? 'কোনো প্রকার কাঠের ফাঁক বা বাঁকা অংশ রাখা যাবে না।' : 'Ensure zero warping and tight seamless joints across all door stiles & rails.'}</li>
              <li>{language === 'bn' ? 'কাজ শেষে ফ্যাক্টরি সুপারভাইজার থেকে কোয়ালিটি চেক সিল ও স্বাক্ষর নিতে হবে।' : 'Get inspection seal and supervisor approval before receiving final payment.'}</li>
            </ul>
          </div>

          {/* Signature Block */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs signature-section print:grid-cols-3 print:gap-3 print:pt-4 print:text-[8pt]">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'কারিগরের স্বাক্ষর' : 'Artisan Signature'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 print:text-slate-600 print:text-[7pt]">
                {task.craftsmanName}
              </p>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'ওয়ার্কশপ সুপারভাইজার' : 'Workshop Supervisor'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 print:text-slate-600 print:text-[7pt]">
                {language === 'bn' ? 'কোয়ালিটি পরীক্ষিত' : 'Quality Verified'}
              </p>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 print:text-black">
                {language === 'bn' ? 'ফ্যাক্টরি ইন-চার্জ / কর্তৃপক্ষ' : 'Factory Manager / Authority'}
              </div>
              <p className="text-[10px] text-red-700 font-semibold mt-0.5 print:text-black print:text-[7pt]">
                Dhaka Timber Complex
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
