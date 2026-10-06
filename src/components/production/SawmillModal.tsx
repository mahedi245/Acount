'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { WoodSpecies, SawmillLogEntry } from '@/types';
import { calculateRoundLogCft, calculateSawingWastage } from '@/utils/cftCalculations';
import { formatCurrency, formatCft } from '@/utils/currency';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { getTodayIsoDate } from '@/utils/dateUtils';
import { translateWoodSpecies } from '@/translations/dict';
import { Trees, Scale, Plus } from 'lucide-react';

interface SawmillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WOOD_SPECIES_OPTIONS: WoodSpecies[] = [
  'Chittagong Teak (চিটাগাং সেগুন)',
  'Burma Teak (বার্মা সেগুন)',
  'Gamari (গামারি)',
  'Mahogany (মেহগনি)',
  'Shil Karoi (শীল কড়ই)',
  'Garjan (গর্জন)',
  'Chapalish (চাপালিশ)',
  'Akashmoni (আকাশমণি)',
  'Pine Wood (পাইন কাঠ)',
];

export default function SawmillModal({ isOpen, onClose }: SawmillModalProps) {
  const { language, showToast } = useApp();
  const { addSawmillLog, sawmillLogs } = useData();

  const [woodSpecies, setWoodSpecies] = useState<WoodSpecies>('Chittagong Teak (চিটাগাং সেগুন)');
  const [logLengthFt, setLogLengthFt] = useState<number>(14);
  const [logGirthInches, setLogGirthInches] = useState<number>(48);
  const [outputSawnCft, setOutputSawnCft] = useState<number>(9.5);
  const [sawyerName, setSawyerName] = useState<string>('আব্দুস সালাম');
  const [sawingCostPerCft, setSawingCostPerCft] = useState<number>(75);
  const [notes, setNotes] = useState<string>('');

  const logResult = calculateRoundLogCft({
    lengthFt: logLengthFt,
    girthInches: logGirthInches,
    quantity: 1,
  });

  const wastage = calculateSawingWastage(logResult.totalCft, outputSawnCft);
  const totalSawingCost = Math.round(logResult.totalCft * sawingCostPerCft);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const logBatchNo = `LOG-${new Date().getFullYear()}-${String(sawmillLogs.length + 15).padStart(3, '0')}`;

    addSawmillLog({
      entryDate: getTodayIsoDate(),
      woodSpecies,
      logBatchNo,
      logLengthFt,
      logGirthInches,
      roundLogCft: logResult.totalCft,
      outputSawnCft,
      wastageCft: wastage.wastageCft,
      wastagePercent: wastage.wastagePercentage,
      sawyerName,
      sawingCostPerCft,
      totalSawingCost,
      notes,
    });

    showToast(
      language === 'bn'
        ? `স-মিল চেরাই লগ (${logBatchNo}) সফলভাবে যুক্ত হয়েছে এবং গোডাউন স্টকে ${outputSawnCft} CFT সাইজ কাঠ যোগ হয়েছে!`
        : `Sawmill log created & ${outputSawnCft} CFT added to stock!`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'bn' ? 'স-মিল গোল কাঠ চেরাই ও লগ এন্ট্রি' : 'Record Sawmill Sizing Entry'}
      subtitle={language === 'bn' ? 'গোল কাঠ থেকে সাইজ কাঠ উৎপাদন ও চেরাই লস হিসাব' : 'Hoppus round log volume to sawn wood production'}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Wood species & Sawyer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাঠের প্রজাতি *' : 'Wood Species *'}
            </label>
            <select
              value={woodSpecies}
              onChange={(e) => setWoodSpecies(e.target.value as WoodSpecies)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {WOOD_SPECIES_OPTIONS.map((sp) => (
                <option key={sp} value={sp}>
                  {translateWoodSpecies(sp, language)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'স-মিল মিস্ত্রি / অপারেটর' : 'Sawyer / Operator Name'}
            </label>
            <input
              type="text"
              value={sawyerName}
              onChange={(e) => setSawyerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Round Log Dimensions */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
          <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
            {language === 'bn' ? 'কাঁচা গোল কাঠের মাপ' : 'Round Log Specs'}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'লগের দৈর্ঘ্য (ফুট)' : 'Length (Ft)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={logLengthFt}
                onChange={(e) => setLogLengthFt(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'লগের বেড় / পরিধি (ইঞ্চি)' : 'Girth / Ber (In)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={logGirthInches}
                onChange={(e) => setLogGirthInches(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'হপাস গোল কাঠ CFT' : 'Hoppus Volume'}
              </label>
              <div className="p-2 rounded-xl bg-zinc-200 text-zinc-950 font-black text-xs">
                {formatCft(logResult.totalCft, language)}
              </div>
            </div>
          </div>
        </div>

        {/* Sawn Timber Output & Wastage */}
        <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/80 space-y-3">
          <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider">
            {language === 'bn' ? 'চেরাই শেষে প্রাপ্ত সাইজ কাঠ ও অপচয়' : 'Sawn Output & Wastage'}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'প্রাপ্ত সাইজ কাঠ (CFT) *' : 'Sawn Output (CFT) *'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max={logResult.totalCft}
                required
                value={outputSawnCft}
                onChange={(e) => setOutputSawnCft(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-black text-red-700"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-red-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {language === 'bn' ? 'গুঁড়া অপচয় %' : 'Wastage %'}
              </span>
              <p className="text-sm font-black text-rose-600 mt-0.5">
                {wastage.wastagePercentage}%
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-300">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {language === 'bn' ? 'প্রাপ্তি হার %' : 'Recovery %'}
              </span>
              <p className="text-sm font-black text-emerald-700 mt-0.5">
                {wastage.recoveryPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Labor Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'চেরাই মজুরি রেট (প্রতি CFT ৳)' : 'Sawing Rate / CFT (৳)'}
            </label>
            <input
              type="number"
              min="0"
              value={sawingCostPerCft}
              onChange={(e) => setSawingCostPerCft(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {language === 'bn' ? 'মোট চেরাই খরচ:' : 'Total Sawing Cost:'}
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatCurrency(totalSawingCost, language)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'চেরাই সংক্রান্ত নোট' : 'Notes'}
          </label>
          <input
            type="text"
            placeholder={
              language === 'bn'
                ? 'কোন প্রজেক্টের জন্য কাঠ সাইজিং করা হলো...'
                : 'Purpose of wood sizing or customer reference...'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20"
          >
            {language === 'bn' ? 'লগ এন্ট্রি ও স্টক আপডেট করুন' : 'Save Log & Update Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
