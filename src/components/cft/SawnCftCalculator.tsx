'use client';

import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Copy, Check } from 'lucide-react';
import { calculateSawnWoodCft } from '@/utils/cftCalculations';
import { formatCurrency, formatCft } from '@/utils/currency';
import { useApp } from '@/context/AppContext';

interface SawnRow {
  id: string;
  name: string;
  lengthFt: number;
  lengthIn: number;
  widthIn: number;
  widthSuuta: number;
  thicknessIn: number;
  thicknessSuuta: number;
  quantity: number;
  ratePerCft: number;
}

export default function SawnCftCalculator() {
  const { language, t } = useApp();

  // Quick single calculation state
  const [lengthFt, setLengthFt] = useState<number>(7);
  const [lengthIn, setLengthIn] = useState<number>(0);
  const [widthIn, setWidthIn] = useState<number>(3.5);
  const [widthSuuta, setWidthSuuta] = useState<number>(0);
  const [thicknessIn, setThicknessIn] = useState<number>(1.5);
  const [thicknessSuuta, setThicknessSuuta] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(10);
  const [ratePerCft, setRatePerCft] = useState<number>(4500);

  // Batch calculation list
  const [batchRows, setBatchRows] = useState<SawnRow[]>([
    {
      id: '1',
      name: language === 'bn' ? 'পাল্লার ফ্রেম সাইড' : 'Door Shutter Frame Side',
      lengthFt: 7,
      lengthIn: 0,
      widthIn: 4.5,
      widthSuuta: 0,
      thicknessIn: 1.5,
      thicknessSuuta: 0,
      quantity: 12,
      ratePerCft: 5000,
    },
    {
      id: '2',
      name: language === 'bn' ? 'পাল্লার টপ ও বটম রেল' : 'Door Top & Bottom Rail',
      lengthFt: 3,
      lengthIn: 6,
      widthIn: 5,
      widthSuuta: 0,
      thicknessIn: 1.5,
      thicknessSuuta: 0,
      quantity: 18,
      ratePerCft: 5000,
    },
  ]);

  const singleResult = calculateSawnWoodCft({
    lengthFt,
    lengthIn,
    widthIn,
    widthSuuta,
    thicknessIn,
    thicknessSuuta,
    quantity,
  });

  const singleTotalPrice = singleResult.totalCft * ratePerCft;

  // Add to batch
  const addToBatch = () => {
    const newRow: SawnRow = {
      id: String(Date.now()),
      name: language === 'bn' ? `সাইজ কাঠ #${batchRows.length + 1}` : `Sawn Timber #${batchRows.length + 1}`,
      lengthFt,
      lengthIn,
      widthIn,
      widthSuuta,
      thicknessIn,
      thicknessSuuta,
      quantity,
      ratePerCft,
    };
    setBatchRows([...batchRows, newRow]);
  };

  const removeRow = (id: string) => {
    setBatchRows(batchRows.filter((r) => r.id !== id));
  };

  // Batch summary
  const batchSummary = batchRows.reduce(
    (acc, row) => {
      const res = calculateSawnWoodCft({
        lengthFt: row.lengthFt,
        lengthIn: row.lengthIn,
        widthIn: row.widthIn,
        widthSuuta: row.widthSuuta,
        thicknessIn: row.thicknessIn,
        thicknessSuuta: row.thicknessSuuta,
        quantity: row.quantity,
      });
      const price = res.totalCft * row.ratePerCft;
      return {
        totalPieces: acc.totalPieces + row.quantity,
        totalCft: acc.totalCft + res.totalCft,
        totalPrice: acc.totalPrice + price,
      };
    },
    { totalPieces: 0, totalCft: 0, totalPrice: 0 }
  );

  return (
    <div className="space-y-6 text-left">
      {/* Quick Calculator Box */}
      <div className="bg-gradient-to-br from-slate-50 to-red-50/30 rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Calculator className="w-4 h-4 text-red-600" />
            <span>{language === 'bn' ? 'সাইজ কাঠের সিএফটি হিসাব' : 'Sawn Timber CFT Formula'}</span>
          </div>
          <span className="text-[11px] font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            {language === 'bn' ? 'দৈর্ঘ্য (ফুট) × প্রস্থ (ইঞ্চি) × পুরুত্ব (ইঞ্চি) / ১৪৪' : 'Length (Ft) × Width (In) × Thickness (In) / 144'}
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Length */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'দৈর্ঘ্য (ফুট)' : 'Length (Ft)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={lengthFt}
              onChange={(e) => setLengthFt(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'অতিরিক্ত ইঞ্চি' : 'Extra In'}
            </label>
            <input
              type="number"
              min="0"
              max="11"
              value={lengthIn}
              onChange={(e) => setLengthIn(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Width */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রস্থ (ইঞ্চি)' : 'Width (In)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={widthIn}
              onChange={(e) => setWidthIn(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রস্থের সুতা' : 'Width Suuta'}
            </label>
            <select
              value={widthSuuta}
              onChange={(e) => setWidthSuuta(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={0}>{language === 'bn' ? '০ সুতা' : '0 Suuta'}</option>
              <option value={1}>{language === 'bn' ? '১ সুতা' : '1 Suuta'}</option>
              <option value={2}>{language === 'bn' ? '২ সুতা' : '2 Suuta'}</option>
              <option value={3}>{language === 'bn' ? '৩ সুতা' : '3 Suuta'}</option>
              <option value={4}>{language === 'bn' ? '৪ সুতা' : '4 Suuta'}</option>
              <option value={5}>{language === 'bn' ? '৫ সুতা' : '5 Suuta'}</option>
              <option value={6}>{language === 'bn' ? '৬ সুতা' : '6 Suuta'}</option>
              <option value={7}>{language === 'bn' ? '৭ সুতা' : '7 Suuta'}</option>
            </select>
          </div>

          {/* Thickness */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'পুরুত্ব (ইঞ্চি)' : 'Thickness (In)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={thicknessIn}
              onChange={(e) => setThicknessIn(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'পুরুত্বের সুতা' : 'Thick Suuta'}
            </label>
            <select
              value={thicknessSuuta}
              onChange={(e) => setThicknessSuuta(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={0}>{language === 'bn' ? '০ সুতা' : '0 Suuta'}</option>
              <option value={1}>{language === 'bn' ? '১ সুতা' : '1 Suuta'}</option>
              <option value={2}>{language === 'bn' ? '২ সুতা' : '2 Suuta'}</option>
              <option value={3}>{language === 'bn' ? '৩ সুতা' : '3 Suuta'}</option>
              <option value={4}>{language === 'bn' ? '৪ সুতা' : '4 Suuta'}</option>
              <option value={5}>{language === 'bn' ? '৫ সুতা' : '5 Suuta'}</option>
              <option value={6}>{language === 'bn' ? '৬ সুতা' : '6 Suuta'}</option>
              <option value={7}>{language === 'bn' ? '৭ সুতা' : '7 Suuta'}</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'পরিমাণ (পিস)' : 'Quantity (Pcs)'}
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Rate per CFT */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রতি CFT দর (৳)' : 'Rate / CFT (৳)'}
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={ratePerCft}
              onChange={(e) => setRatePerCft(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Realtime Result Banner */}
        <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'হিসাবের বিবরণ' : 'Calculation Trace'}
            </span>
            <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
              {singleResult.formulaDescription}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {language === 'bn' ? 'মোট সিএফটি' : 'Total CFT'}
              </span>
              <p className="text-lg font-extrabold text-red-600">
                {formatCft(singleResult.totalCft, language)}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {language === 'bn' ? 'সর্বমোট মূল্য' : 'Total Price'}
              </span>
              <p className="text-lg font-extrabold text-slate-900">
                {formatCurrency(singleTotalPrice, language)}
              </p>
            </div>

            <button
              onClick={addToBatch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'তালিকায় যোগ' : 'Add to List'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Table */}
      {batchRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {language === 'bn' ? 'সাইজ কাঠের ব্যাচ তালিকা' : 'Multiple Timber Sizing List'}
            </h4>
            <span className="text-xs text-slate-500 font-semibold">
              {batchRows.length} {language === 'bn' ? 'টি আইটেম' : 'Items'}
            </span>
          </div>

          <div className="overflow-x-auto print:overflow-hidden print:w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{language === 'bn' ? 'বিবরণ' : 'Item'}</th>
                  <th className="p-3">{language === 'bn' ? 'সাইজ (L×W×T)' : 'Size'}</th>
                  <th className="p-3">{language === 'bn' ? 'পিস' : 'Pcs'}</th>
                  <th className="p-3">{language === 'bn' ? 'মোট CFT' : 'Total CFT'}</th>
                  <th className="p-3">{language === 'bn' ? 'রেট / CFT' : 'Rate/CFT'}</th>
                  <th className="p-3">{language === 'bn' ? 'মোট টাকা' : 'Total BDT'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchRows.map((row, idx) => {
                  const res = calculateSawnWoodCft({
                    lengthFt: row.lengthFt,
                    lengthIn: row.lengthIn,
                    widthIn: row.widthIn,
                    widthSuuta: row.widthSuuta,
                    thicknessIn: row.thicknessIn,
                    thicknessSuuta: row.thicknessSuuta,
                    quantity: row.quantity,
                  });
                  const totalPrice = res.totalCft * row.ratePerCft;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                      <td className="p-3 font-mono text-slate-600">
                        {row.lengthFt}'{row.lengthIn > 0 ? `${row.lengthIn}"` : ''} × {row.widthIn}"{row.widthSuuta > 0 ? ` (${row.widthSuuta} সুতা)` : ''} × {row.thicknessIn}"{row.thicknessSuuta > 0 ? ` (${row.thicknessSuuta} সুতা)` : ''}
                      </td>
                      <td className="p-3 font-bold text-slate-700">{row.quantity}</td>
                      <td className="p-3 font-bold text-red-600">{formatCft(res.totalCft, language)}</td>
                      <td className="p-3 text-slate-600">{formatCurrency(row.ratePerCft, language)}</td>
                      <td className="p-3 font-extrabold text-slate-900">{formatCurrency(totalPrice, language)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                <tr>
                  <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-xs">
                    {language === 'bn' ? 'সর্বমোট সারসংক্ষেপ:' : 'Grand Total:'}
                  </td>
                  <td className="p-3 text-slate-800">
                    {batchSummary.totalPieces} {language === 'bn' ? 'টি' : 'pcs'}
                  </td>
                  <td className="p-3 text-red-600 text-sm font-extrabold">
                    {formatCft(batchSummary.totalCft, language)}
                  </td>
                  <td className="p-3">-</td>
                  <td className="p-3 text-slate-950 text-sm font-black">
                    {formatCurrency(batchSummary.totalPrice, language)}
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
