'use client';

import React, { useState } from 'react';
import { Trees, Calculator, ArrowRight, Sparkles, Scale } from 'lucide-react';
import { calculateRoundLogCft, calculateSawingWastage } from '@/utils/cftCalculations';
import { formatCurrency, formatCft } from '@/utils/currency';
import { useApp } from '@/context/AppContext';

export default function LogCftCalculator() {
  const { language } = useApp();

  const [lengthFt, setLengthFt] = useState<number>(14);
  const [lengthIn, setLengthIn] = useState<number>(0);
  const [girthInches, setGirthInches] = useState<number>(48); // বেড় 48"
  const [quantity, setQuantity] = useState<number>(1);
  const [ratePerCft, setRatePerCft] = useState<number>(3200);

  // Sawing estimation
  const [expectedSawnCft, setExpectedSawnCft] = useState<number>(8.5);
  const [sawingCostPerCft, setSawingCostPerCft] = useState<number>(75);

  const logResult = calculateRoundLogCft({
    lengthFt,
    lengthIn,
    girthInches,
    quantity,
  });

  const totalPrice = logResult.totalCft * ratePerCft;

  const wastageResult = calculateSawingWastage(logResult.totalCft, expectedSawnCft);
  const totalSawingCost = logResult.totalCft * sawingCostPerCft;

  return (
    <div className="space-y-6 text-left">
      {/* Formula Info Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md flex items-start gap-3">
        <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm mt-0.5">
          <Trees className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wide">
            {language === 'bn' ? 'গোল কাঠের হপাস নিয়ম' : 'Hoppus Formula for Round Logs'}
          </h4>
          <p className="text-xs text-red-300 font-mono mt-1 font-bold">
            {language === 'bn'
              ? 'সিএফটি = ((বেড় / ৪)² × দৈর্ঘ্য ফুট) / ১৪৪'
              : 'CFT = ((Girth / 4)² × Length Ft) / 144'}
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
            {language === 'bn'
              ? 'বাংলাদেশ বন বিভাগ ও স-মিলগুলোর সার্বজনীন ফর্মুলা অনুযায়ী গোল কাঠের সিএফটি পরিমাপ।'
              : 'Universal standard formula used by Bangladesh Forest Dept & Sawmills for round log cubic feet.'}
          </p>
        </div>
      </div>

      {/* Main Calculator Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Length Feet */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'লগের দৈর্ঘ্য (ফুট)' : 'Log Length (Ft)'}
            </label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={lengthFt}
              onChange={(e) => setLengthFt(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Length extra inches */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'অতিরিক্ত ইঞ্চি' : 'Extra In'}
            </label>
            <input
              type="number"
              min="0"
              max="11"
              value={lengthIn}
              onChange={(e) => setLengthIn(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Girth in Inches */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'লগের বেড় / পরিধি (ইঞ্চি)' : 'Log Girth (In)'}
            </label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={girthInches}
              onChange={(e) => setGirthInches(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'সংখ্যা (পিস লগ)' : 'Log Quantity'}
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Rate Input Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'গোল কাঠের দর (প্রতি CFT ৳)' : 'Round Log Rate / CFT (৳)'}
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={ratePerCft}
              onChange={(e) => setRatePerCft(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'স-মিল চেরাই মজুরি (প্রতি CFT ৳)' : 'Sawing Labor Rate / CFT (৳)'}
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={sawingCostPerCft}
              onChange={(e) => setSawingCostPerCft(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Results Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-red-50/60 border border-red-200">
            <span className="text-[10px] font-bold text-red-700 uppercase">
              {language === 'bn' ? 'হপাস মোট সিএফটি' : 'Hoppus Volume'}
            </span>
            <h3 className="text-xl font-black text-red-600 mt-1">
              {formatCft(logResult.totalCft, language)}
            </h3>
            <p className="text-[10px] text-red-800 font-mono mt-1 font-semibold">
              {language === 'bn' ? 'চৌকা পরিধি:' : 'Quarter Girth:'} {logResult.quarterGirthInches}"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {language === 'bn' ? 'লগের ক্রয়মূল্য' : 'Log Total Price'}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {formatCurrency(totalPrice, language)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {language === 'bn' ? 'দর @' : 'Rate @'} {formatCurrency(ratePerCft, language)} / CFT
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {language === 'bn' ? 'মোট চেরাই খরচ' : 'Sawing Cost'}
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              {formatCurrency(totalSawingCost, language)}
            </h3>
            <p className="text-[10px] text-slate-300 mt-1">
              {language === 'bn' ? 'মজুরি @' : 'Labor @'} {formatCurrency(sawingCostPerCft, language)} / CFT
            </p>
          </div>
        </div>
      </div>

      {/* Wastage Analysis Section */}
      <div className="p-5 rounded-2xl bg-zinc-950 text-white shadow-md border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-red-500" />
            <h4 className="text-sm font-bold text-white">
              {language === 'bn' ? 'স-মিল চেরাই ও ওয়েস্টেজ সিমুলেটর' : 'Sawmill Sizing & Wastage Simulator'}
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-red-400 border border-zinc-700">
            {language === 'bn' ? 'লগ বনাম সাইজ কাঠ' : 'Log vs Sawn'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              {language === 'bn' ? 'চেরাই শেষে প্রাপ্ত সাইজ কাঠ (CFT)' : 'Obtained Sawn Output (CFT)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={expectedSawnCft}
              onChange={(e) => setExpectedSawnCft(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">
                {language === 'bn' ? 'অপচয় ও গুঁড়া' : 'Wastage Loss'}
              </span>
              <p className="text-base font-extrabold text-red-400 mt-0.5">
                {wastageResult.wastagePercentage}%
              </p>
              <p className="text-[10px] text-zinc-400">{wastageResult.wastageCft} CFT</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">
                {language === 'bn' ? 'প্রাপ্ত সাইজ কাঠ' : 'Recovery Rate'}
              </span>
              <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                {wastageResult.recoveryPercentage}%
              </p>
              <p className="text-[10px] text-zinc-400">{expectedSawnCft} CFT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
