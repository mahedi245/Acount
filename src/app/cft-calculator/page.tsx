'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Trees,
  Layers,
  Plus,
  Trash2,
  Printer,
  Copy,
  Info,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calculateSawnWoodCft, calculateRoundLogCft, calculateSawingWastage } from '@/utils/cftCalculations';
import { formatCurrency, formatCft } from '@/utils/currency';
import { amountInWords } from '@/utils/numberToWords';
import PrintHeader from '@/components/common/PrintHeader';

interface BatchItem {
  id: string;
  label: string;
  lengthFt: number;
  lengthIn: number;
  widthIn: number;
  widthSuuta: number;
  thicknessIn: number;
  thicknessSuuta: number;
  quantity: number;
  ratePerCft: number;
  cftPerPiece: number;
  totalCft: number;
  totalAmount: number;
}

export default function CftCalculatorPage() {
  const { language, showToast } = useApp();
  const [calcMode, setCalcMode] = useState<'sawn' | 'log'>('sawn');

  // Single Sawn State
  const [sLengthFt, setSLengthFt] = useState<number>(7);
  const [sLengthIn, setSLengthIn] = useState<number>(0);
  const [sWidthIn, setSWidthIn] = useState<number>(4);
  const [sWidthSuuta, setSWidthSuuta] = useState<number>(0);
  const [sThicknessIn, setSThicknessIn] = useState<number>(1.5);
  const [sThicknessSuuta, setSThicknessSuuta] = useState<number>(0);
  const [sQuantity, setSQuantity] = useState<number>(10);
  const [sRatePerCft, setSRatePerCft] = useState<number>(4200);

  // Single Log State
  const [lLengthFt, setLLengthFt] = useState<number>(12);
  const [lGirthIn, setLGirthIn] = useState<number>(48);
  const [lQuantity, setLQuantity] = useState<number>(1);
  const [lRatePerCft, setLRatePerCft] = useState<number>(2800);
  const [lEstSawnCft, setLEstSawnCft] = useState<number>(8.5);

  // Batch Sawn List
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    {
      id: '1',
      label: language === 'bn' ? 'চৌকাঠ বাতা' : 'Door Frame Section',
      lengthFt: 7,
      lengthIn: 0,
      widthIn: 4,
      widthSuuta: 0,
      thicknessIn: 2.5,
      thicknessSuuta: 0,
      quantity: 12,
      ratePerCft: 4200,
      cftPerPiece: 0.3038,
      totalCft: 3.646,
      totalAmount: 15313,
    },
    {
      id: '2',
      label: language === 'bn' ? 'পাল্লার খাড়া স্টাইল' : 'Door Shutter Stile',
      lengthFt: 6.83,
      lengthIn: 0,
      widthIn: 4.5,
      widthSuuta: 0,
      thicknessIn: 1.5,
      thicknessSuuta: 0,
      quantity: 8,
      ratePerCft: 4200,
      cftPerPiece: 0.3202,
      totalCft: 2.561,
      totalAmount: 10756,
    },
  ]);

  // Single Calculations
  const singleSawn = calculateSawnWoodCft({
    lengthFt: sLengthFt,
    lengthIn: sLengthIn,
    widthIn: sWidthIn,
    widthSuuta: sWidthSuuta,
    thicknessIn: sThicknessIn,
    thicknessSuuta: sThicknessSuuta,
    quantity: sQuantity,
  });
  const singleSawnAmount = Math.round(singleSawn.totalCft * sRatePerCft);

  const singleLog = calculateRoundLogCft({
    lengthFt: lLengthFt,
    girthInches: lGirthIn,
    quantity: lQuantity,
  });
  const singleLogAmount = Math.round(singleLog.totalCft * lRatePerCft);
  const logWastage = calculateSawingWastage(singleLog.totalCft, lEstSawnCft);

  // Add to Batch
  const handleAddToBatch = () => {
    const newItem: BatchItem = {
      id: String(Date.now()),
      label: `সাইজ কাঠ ${sLengthFt}' × ${sWidthIn}" × ${sThicknessIn}"`,
      lengthFt: sLengthFt,
      lengthIn: sLengthIn,
      widthIn: sWidthIn,
      widthSuuta: sWidthSuuta,
      thicknessIn: sThicknessIn,
      thicknessSuuta: sThicknessSuuta,
      quantity: sQuantity,
      ratePerCft: sRatePerCft,
      cftPerPiece: singleSawn.cftPerPiece,
      totalCft: singleSawn.totalCft,
      totalAmount: singleSawnAmount,
    };

    setBatchItems([...batchItems, newItem]);
    showToast(
      language === 'bn' ? 'তালিকায় যুক্ত হয়েছে!' : 'Added to batch list!',
      'success'
    );
  };

  const handleRemoveBatchItem = (id: string) => {
    setBatchItems(batchItems.filter((it) => it.id !== id));
  };

  const batchTotalCft = batchItems.reduce((sum, it) => sum + it.totalCft, 0);
  const batchTotalQty = batchItems.reduce((sum, it) => sum + it.quantity, 0);
  const batchTotalAmount = batchItems.reduce((sum, it) => sum + it.totalAmount, 0);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'টিম্বার ও কাঠের মাস্টার CFT ক্যালকুলেটর' : 'Master Timber CFT Calculator'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'সাইজ কাঠ ও গোল কাঠের নির্ভুল CFT হিসাব, সুতা (১/৮") ফ্র্যাকশন এবং ব্যাচ কাঠের মাপ তালিকা।'
              : 'Precision formula calculation for Sawn timber and Round Log Hoppus rule with suuta fractions.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setCalcMode('sawn')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              calcMode === 'sawn'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-white" />
            <span>{language === 'bn' ? 'সাইজ কাঠ' : 'Sawn Timber CFT'}</span>
          </button>

          <button
            onClick={() => setCalcMode('log')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              calcMode === 'log'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trees className="w-4 h-4 text-red-400" />
            <span>{language === 'bn' ? 'গোল কাঠ' : 'Round Log CFT'}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Sawn Wood Calculator */}
      {calcMode === 'sawn' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
            {/* Input Form Box */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-600" />
                  <span>{language === 'bn' ? 'সাইজ কাঠের পরিমাপ ইনপুট' : 'Sawn Wood Dimensions'}</span>
                </h3>
                <span className="text-[11px] text-red-800 font-bold bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
                  {language === 'bn' ? 'সূত্র: (L × W × T) ÷ ১৪৪' : 'Formula: (L × W × T) / 144'}
                </span>
              </div>

              {/* Length */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'দৈর্ঘ্য (ফুট) *' : 'Length (Feet) *'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={sLengthFt}
                    onChange={(e) => setSLengthFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'অতিরিক্ত ইঞ্চি' : 'Extra Inches'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="11"
                    value={sLengthIn}
                    onChange={(e) => setSLengthIn(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Width & Thickness */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'প্রস্থ (ইঞ্চি) *' : 'Width (In) *'}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={sWidthIn}
                    onChange={(e) => setSWidthIn(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'প্রস্থ সুতা (1/8")' : 'Width Suuta'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={sWidthSuuta}
                    onChange={(e) => setSWidthSuuta(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'পুরুত্ব (ইঞ্চি) *' : 'Thickness (In) *'}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={sThicknessIn}
                    onChange={(e) => setSThicknessIn(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'পুরুত্ব সুতা (1/8")' : 'Thick Suuta'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={sThicknessSuuta}
                    onChange={(e) => setSThicknessSuuta(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Quantity & Rate */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'পরিমাণ (পিস) *' : 'Quantity (Pcs) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sQuantity}
                    onChange={(e) => setSQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'দর / রেট (প্রতি CFT ৳)' : 'Rate / CFT (BDT)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sRatePerCft}
                    onChange={(e) => setSRatePerCft(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleAddToBatch}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>{language === 'bn' ? 'ব্যাচ তালিকায় কাঠ যোগ করুন' : 'Add to Batch Calculation List'}</span>
                </button>
              </div>
            </div>

            {/* Real-time Calculation Result Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {language === 'bn' ? 'তাৎক্ষণিক সিএফটি হিসাব' : 'Instant Result'}
                </span>
                <h3 className="text-2xl font-black text-red-400 mt-1">
                  {formatCft(singleSawn.totalCft, language)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'bn' ? 'প্রতি পিস সিএফটি:' : 'Per piece:'} {singleSawn.cftPerPiece} CFT
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{language === 'bn' ? 'মোট পিস:' : 'Pieces:'}</span>
                  <span className="font-bold text-white">
                    {sQuantity} {language === 'bn' ? 'পিস' : 'Pcs'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{language === 'bn' ? 'CFT দর:' : 'Rate/CFT:'}</span>
                  <span className="font-bold text-white">{formatCurrency(sRatePerCft, language)}</span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">{language === 'bn' ? 'মোট মূল্য:' : 'Total:'}</span>
                  <span className="text-lg font-black text-emerald-400">
                    {formatCurrency(singleSawnAmount, language)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                {language === 'bn'
                  ? 'টিপস: ১ ঘনফুট (CFT) = ১২" × ১২" × ১২" = ১,৭২৮ ঘন ইঞ্চি = ১৪৪ ঘনফুট বেস।'
                  : 'Formula: Length(ft) × Width(in) × Thickness(in) / 144'}
              </div>
            </div>
          </div>

          {/* Batch Sawn Table */}
          <div className="printable-sheet bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-8 space-y-4 print:border-none print:shadow-none print:p-0 print:space-y-2">
            {/* Header shown only on print */}
            <div className="hidden print:block mb-4">
              <PrintHeader
                documentTitleBn="কাঠের পরিমাপ ও সিএফটি হিসাব স্লিপ"
                documentTitleEn="TIMBER MEASUREMENT & CFT SLIP"
                docDate={new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {language === 'bn' ? 'কাঠের মেজারমেন্ট তালিকা' : 'Batch Timber List'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'bn'
                    ? 'একাধিক সাইজের কাঠের সম্মিলিত মোট সিএফটি ও টাকার হিসাব'
                    : 'Consolidated volume and pricing summary for project orders'}
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>{language === 'bn' ? 'তালিকা প্রিন্ট / PDF' : 'Print Timber Slip'}</span>
              </button>
            </div>

            <div className="overflow-x-auto print:overflow-hidden print:w-full print:mb-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                  <tr>
                    <th className="p-2.5 w-8 text-center rounded-l-lg">#</th>
                    <th className="p-2.5">{language === 'bn' ? 'বিবরণ' : 'Description'}</th>
                    <th className="p-2.5">{language === 'bn' ? 'মাপ (L × W × T)' : 'Specs'}</th>
                    <th className="p-2.5 text-center">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                    <th className="p-2.5">{language === 'bn' ? 'পিস CFT' : 'Unit CFT'}</th>
                    <th className="p-2.5 font-bold">{language === 'bn' ? 'মোট CFT' : 'Total CFT'}</th>
                    <th className="p-2.5">{language === 'bn' ? 'দর / CFT' : 'Rate'}</th>
                    <th className="p-2.5 font-bold">{language === 'bn' ? 'মোট টাকা' : 'Total (BDT)'}</th>
                    <th className="p-2.5 text-right rounded-r-lg no-print">{language === 'bn' ? 'মুছুন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                  {batchItems.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 text-center font-bold text-slate-400 print:text-black">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900 print:text-black">{it.label}</td>
                      <td className="p-2.5 font-mono text-slate-700 print:text-black">
                        {it.lengthFt}' × {it.widthIn}" × {it.thicknessIn}"
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-800 print:text-black">{it.quantity}</td>
                      <td className="p-2.5 text-slate-600 print:text-black">{it.cftPerPiece}</td>
                      <td className="p-2.5 font-extrabold text-red-700 print:text-black">{formatCft(it.totalCft, language)}</td>
                      <td className="p-2.5 text-slate-700 print:text-black">{formatCurrency(it.ratePerCft, language)}</td>
                      <td className="p-2.5 font-black text-emerald-700 print:text-black">
                        {formatCurrency(it.totalAmount, language)}
                      </td>
                      <td className="p-2.5 text-right no-print">
                        <button
                          onClick={() => handleRemoveBatchItem(it.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                  <tr>
                    <td colSpan={3} className="p-2.5 uppercase text-xs">
                      {language === 'bn' ? 'সম্মিলিত সর্বমোট:' : 'Grand Total:'}
                    </td>
                    <td className="p-2.5 text-center text-red-400 font-bold print:text-white">
                      {batchTotalQty} {language === 'bn' ? 'টি' : 'Pcs'}
                    </td>
                    <td></td>
                    <td className="p-2.5 text-red-400 font-black text-sm print:text-white">{formatCft(batchTotalCft, language)}</td>
                    <td></td>
                    <td colSpan={2} className="p-2.5 text-emerald-400 font-black text-base print:text-white">
                      {formatCurrency(batchTotalAmount, language)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* In Words on print */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs hidden print:block print:bg-white print:border-slate-300 print:text-[8pt] print:mb-2">
              <span className="font-bold text-slate-700 block print:text-black">
                {language === 'bn' ? 'মোট মূল্য কথায়:' : 'Total in Words:'}
              </span>
              <p className="font-extrabold text-slate-900 italic mt-0.5 print:text-black">
                {amountInWords(batchTotalAmount, language)}
              </p>
            </div>

            {/* Signatures on print */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-10 border-t border-slate-300 text-xs signature-section print:pt-4 print:gap-4 print:text-[8pt]">
              <div className="text-center">
                <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-700 print:w-36 print:text-black">
                  {language === 'bn' ? 'ক্রেতার স্বাক্ষর' : 'Customer Signature'}
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-slate-900 print:w-36 print:text-black">
                  {language === 'bn' ? 'হিসাবকারী / ম্যানেজারের স্বাক্ষর' : 'Measured By (DTC)'}
                </div>
                <p className="text-[10px] text-red-700 font-semibold mt-0.5 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Round Log Hoppus Calculator */}
      {calcMode === 'log' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Trees className="w-4 h-4 text-red-600" />
                <span>{language === 'bn' ? 'গোল কাঠের হপাস কোয়ার্টার-গার্থ মাপ' : 'Round Log Hoppus Spec'}</span>
              </h3>
              <span className="text-[11px] text-red-800 font-bold bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
                {language === 'bn' ? 'সূত্র: ((বেড় ÷ ৪)² × L) ÷ ১৪৪' : 'Hoppus: ((Girth/4)² × L) / 144'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'লগের দৈর্ঘ্য (ফুট) *' : 'Log Length (Feet) *'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={lLengthFt}
                  onChange={(e) => setLLengthFt(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'লগের বেড় / পরিধি (ইঞ্চি) *' : 'Log Girth / Ber (Inches) *'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={lGirthIn}
                  onChange={(e) => setLGirthIn(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'লগের সংখ্যা *' : 'Quantity (Logs) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={lQuantity}
                  onChange={(e) => setLQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'গোল কাঠের দর (প্রতি CFT ৳)' : 'Rate / CFT (BDT)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={lRatePerCft}
                  onChange={(e) => setLRatePerCft(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Sawmill Recovery Estimation */}
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                {language === 'bn' ? 'স-মিল চেরাই পরবর্তী সম্ভাব্য সাইজ কাঠ' : 'Estimated Sawn Recovery'}
              </h4>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'আনুমানিক সাইজ কাঠ (CFT)' : 'Estimated Sawn (CFT)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={lEstSawnCft}
                    onChange={(e) => setLEstSawnCft(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-red-200 text-xs">
                  <span className="text-slate-500 font-semibold">{language === 'bn' ? 'গুঁড়া অপচয় হার:' : 'Sawdust Wastage:'}</span>
                  <p className="text-sm font-black text-rose-600">
                    {logWastage.wastagePercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Log Calculation Output */}
          <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {language === 'bn' ? 'হপাস গোল কাঠ সিএফটি' : 'Hoppus Volume (Quarter Girth)'}
              </span>
              <h3 className="text-3xl font-black text-red-400 mt-1">
                {formatCft(singleLog.totalCft, language)}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' ? 'প্রতি লগের আয়তন:' : 'Per log:'} {singleLog.cftPerPiece} CFT
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{language === 'bn' ? 'লগ সংখ্যা:' : 'Log Count:'}</span>
                <span className="font-bold text-white">
                  {lQuantity} {language === 'bn' ? 'টি' : 'Logs'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{language === 'bn' ? 'সিএফটি দর:' : 'Rate/CFT:'}</span>
                <span className="font-bold text-white">{formatCurrency(lRatePerCft, language)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200">{language === 'bn' ? 'লগের মূল্য:' : 'Log Value:'}</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatCurrency(singleLogAmount, language)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-slate-200">{language === 'bn' ? 'হপাস রুল ব্যাখ্যা:' : 'Hoppus Rule Explanation:'}</p>
              <p>
                {language === 'bn'
                  ? 'বেড়কে ৪ দিয়ে ভাগ করে বর্গ করা হয় এবং লগের দৈর্ঘ্য দিয়ে গুণ করে ১৪৪ দিয়ে ভাগ করা হয়। এটি গোল কাঠের প্রকৃত চতুষ্কোণ সাইজ কাঠ ধারণক্ষমতা নির্ণয় করে।'
                  : 'Girth is divided by 4 and squared, multiplied by length in feet, then divided by 144 to estimate usable sawn timber volume.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reference Dimensions Chart */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-red-600" />
          <span>{language === 'bn' ? 'বাংলাদেশের টিম্বার ও কাঠ পরিমাপের মানক চার্ট' : 'Standard Timber Measurement Units (Bangladesh)'}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-800">{language === 'bn' ? '১ গজ' : '1 Yard'}</p>
            <p className="text-slate-500 font-semibold">{language === 'bn' ? '৩ ফুট / ৩৬ ইঞ্চি' : '3 Feet / 36 Inches'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-800">{language === 'bn' ? '১ ফুট' : '1 Foot'}</p>
            <p className="text-slate-500 font-semibold">{language === 'bn' ? '১২ ইঞ্চি' : '12 Inches'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-800">{language === 'bn' ? '১ ইঞ্চি' : '1 Inch'}</p>
            <p className="text-slate-500 font-semibold">{language === 'bn' ? '৮ সুতা (1/8")' : '8 Suuta (1/8")'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-800">{language === 'bn' ? '১ CFT' : '1 CFT'}</p>
            <p className="text-slate-500 font-semibold">{language === 'bn' ? '১,৭২৮ ঘন ইঞ্চি' : '1,728 Cubic Inches'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
