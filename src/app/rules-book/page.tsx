'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Target,
  FileSpreadsheet,
  Hammer,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Printer,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trees,
  Info,
  Layers,
  Wrench,
  Percent,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Database,
  Landmark,
  Coins,
  Building2,
  Smartphone,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { formatCurrency, formatCft } from '@/utils/currency';
import PrintHeader from '@/components/common/PrintHeader';

export default function RulesBookPage() {
  const { language } = useApp();
  const { settings } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cft: true,
    marketing: true,
    quotation: true,
    production: true,
    craftsmen: true,
    troubleshooting: true,
    banking: true,
  });

  // Interactive Live Formula Testers State
  // 1. Sawn CFT Simulator
  const [testLengthFt, setTestLengthFt] = useState<number>(7);
  const [testLengthIn, setTestLengthIn] = useState<number>(0);
  const [testWidthIn, setTestWidthIn] = useState<number>(34);
  const [testWidthSuuta, setTestWidthSuuta] = useState<number>(0);
  const [testThicknessIn, setTestThicknessIn] = useState<number>(1.5);
  const [testThicknessSuuta, setTestThicknessSuuta] = useState<number>(0);
  const [testQty, setTestQty] = useState<number>(1);

  // 2. Round Log Hoppus Simulator
  const [testGirthIn, setTestGirthIn] = useState<number>(48);
  const [testLogLengthFt, setTestLogLengthFt] = useState<number>(12);
  const [testLogQty, setTestLogQty] = useState<number>(1);

  // 3. Marketing Commission Simulator
  const [testCollection, setTestCollection] = useState<number>(250000);
  const [testRatePerLakh, setTestRatePerLakh] = useState<number>(1000);

  // 4. Wastage Simulator
  const [testRoundCft, setTestRoundCft] = useState<number>(30);
  const [testSawnCft, setTestSawnCft] = useState<number>(21);

  // Computed Values for Simulators
  // Sawn CFT calculation
  const totalL_in = testLengthFt * 12 + testLengthIn;
  const totalW_in = testWidthIn + testWidthSuuta / 8;
  const totalT_in = testThicknessIn + testThicknessSuuta / 8;
  const calculatedSawnCftPerPcs = (totalL_in * totalW_in * totalT_in) / 1728;
  const calculatedTotalSawnCft = calculatedSawnCftPerPcs * testQty;

  // Hoppus Round Log calculation
  const quarterGirth = testGirthIn / 4;
  const calculatedHoppusCftPerPcs = (quarterGirth * quarterGirth * testLogLengthFt) / 144;
  const calculatedTotalHoppusCft = calculatedHoppusCftPerPcs * testLogQty;
  const calculatedTrueCylinderCft = ((Math.PI * Math.pow(testGirthIn / (2 * Math.PI), 2) * testLogLengthFt) / 144) * testLogQty;

  // Commission calculation
  const calculatedCommission = Math.round((testCollection / 100000) * testRatePerLakh);

  // Wastage calculation
  const calculatedWastageCft = Math.max(0, testRoundCft - testSawnCft);
  const calculatedWastagePct = testRoundCft > 0 ? ((calculatedWastageCft / testRoundCft) * 100) : 0;
  const calculatedRecoveryPct = testRoundCft > 0 ? ((testSawnCft / testRoundCft) * 100) : 0;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setExpandedSections({
      cft: true,
      marketing: true,
      quotation: true,
      production: true,
      craftsmen: true,
      troubleshooting: true,
      banking: true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      cft: false,
      marketing: false,
      quotation: false,
      production: false,
      craftsmen: false,
      troubleshooting: false,
      banking: false,
    });
  };

  const handlePrint = () => {
    expandAll();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner (No Print) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-zinc-900 to-red-950 text-white p-6 sm:p-8 shadow-xl border border-red-900/30 no-print">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold border border-red-500/30 tracking-wide uppercase">
              <BookOpen className="w-3.5 h-3.5 text-red-500" />
              <span>{language === 'bn' ? 'অফিসিয়াল নির্দেশিকা ও নিয়মাবলী' : 'Official Rules Book & SOP'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'bn'
                ? 'ঢাকা টিম্বার কমপ্লেক্স — স্ট্যান্ডার্ড রুলস বুক ও সূত্র নির্দেশিকা'
                : 'Dhaka Timber Complex — Operational Rules & Formula Manual'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'টিম্বার ও সিএফটি পরিমাপের গাণিতিক সূত্র, কালেকশন কমিশন পলিসি, কারখানা পাইপলাইন এবং ভুল সংশোধন ও ট্রাবলশুটিংয়ের পূর্ণাঙ্গ নির্দেশিকা।'
                : 'Complete mathematical formulas for CFT measurements, collection commission policies, manufacturing pipelines, and error resolution guides.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? 'রুলস বুক প্রিন্ট / PDF (A4)' : 'Print Manual (A4)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Header (Visible only on print) */}
      <div className="hidden print:block mb-4">
        <PrintHeader
          documentTitleBn="কারখানা ও ব্যবসায়িক স্ট্যান্ডার্ড রুলস বুক"
          documentTitleEn="STANDARD OPERATIONAL RULES & FORMULA MANUAL"
        />
      </div>

      {/* Quick Search and Filter Controls (No Print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'bn'
                ? 'সূত্র, কমিশন, সুতা, অপচয়, ভুল সংশোধন খুঁজুন...'
                : 'Search formulas, commission, wastage, error fix...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            {language === 'bn' ? 'সব খুলুন' : 'Expand All'}
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            {language === 'bn' ? 'সব বন্ধ করুন' : 'Collapse All'}
          </button>
        </div>
      </div>

      {/* SECTION 1: CFT & TIMBER MEASUREMENT FORMULAS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div
          onClick={() => toggleSection('cft')}
          className="p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-black">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>১. সিএফটি ও কাঠের পরিমাপের গাণিতিক সূত্র (CFT Formulas)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                  Core Math
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                সাইজ কাঠ, গোল কাঠ হপাস ফর্মুলা, সুতা রূপান্তর এবং চৌকাঠের রানিং ফুট হিসাব
              </p>
            </div>
          </div>
          {expandedSections.cft ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {expandedSections.cft && (
          <div className="p-6 space-y-6 text-xs text-slate-800 leading-relaxed">
            {/* 1.1 Sawn Timber Formula */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>১.১ সাইজ কাঠের সিএফটি পরিমাপের সূত্র (Sawn Wood CFT)</span>
              </h3>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-center text-sm font-bold shadow-inner">
                CFT = [ দৈর্ঘ্য (ফুট) × প্রস্থ (ইঞ্চি) × পুরুত্ব (ইঞ্চি) ÷ ১৪৪ ] × সংখ্যা (Quantity)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-red-700">📌 কেন ১৪৪ দিয়ে ভাগ হয়?</h4>
                  <p className="text-slate-600">
                    ১ সিএফটি (CFT) মানে ১ ঘনফুট = ১২ ইঞ্চি × ১২ ইঞ্চি × ১২ ইঞ্চি = ১৭২৮ ঘন ইঞ্চি।
                    যেহেতু কাঠের দৈর্ঘ্য ফুটে (১ ফুট = ১২ ইঞ্চি) নেওয়া হয় এবং প্রস্থ ও পুরুত্ব ইঞ্চিতে নেওয়া হয়:
                  </p>
                  <p className="font-mono text-slate-800 font-bold bg-slate-100 p-2 rounded-lg text-center">
                    ভলিউম = (দৈর্ঘ্য × ১২ × প্রস্থ × পুরুত্ব) ÷ ১৭২৮ = (দৈর্ঘ্য × প্রস্থ × পুরুত্ব) ÷ ১৪৪
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-red-700">📏 সুতা (১/৮") রূপান্তরের নিয়ম:</h4>
                  <p className="text-slate-600">
                    কাঠ মাপার টেপে ১ ইঞ্চি সমান ৮ সুতা। তাই সুতাকে ৮ দিয়ে ভাগ করে ইঞ্চিতে যোগ করা হয়:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-slate-700">
                    <li>১ সুতা = ১/৮" = ০.১২৫" | ২ সুতা = ২/৮" (১/৪") = ০.২৫"</li>
                    <li>৩ সুতা = ৩/৮" = ০.৩৭৫" | ৪ সুতা = ৪/৮" (১/২") = ০.৫০"</li>
                    <li>৬ সুতা = ৬/৮" (৩/৪") = ০.৭৫" | ৭ সুতা = ৭/৮" = ০.৮৭৫"</li>
                  </ul>
                </div>
              </div>

              {/* Interactive Sawn CFT Simulator */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3 no-print">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>সাইজ কাঠ CFT লাইভ সিমুলেটর (Live Formula Tester):</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold">মান পরিবর্তন করে পরীক্ষা করুন</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">দৈর্ঘ্য (ফুট)</label>
                    <input
                      type="number"
                      value={testLengthFt}
                      onChange={(e) => setTestLengthFt(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">প্রস্থ (ইঞ্চি)</label>
                    <input
                      type="number"
                      value={testWidthIn}
                      onChange={(e) => setTestWidthIn(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">পুরুত্ব / থিকনেস (ইঞ্চি)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={testThicknessIn}
                      onChange={(e) => setTestThicknessIn(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">পরিমাণ (সংখ্যা)</label>
                    <input
                      type="number"
                      value={testQty}
                      onChange={(e) => setTestQty(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-100/80 flex items-center justify-between font-mono text-xs">
                  <span>
                    {`হিসাব: (${testLengthFt}' × ${testWidthIn}" × ${testThicknessIn}") ÷ ১৪৪ × ${testQty} টি =`}
                  </span>
                  <span className="text-sm font-black text-amber-950">
                    {calculatedTotalSawnCft.toFixed(3)} CFT
                  </span>
                </div>
              </div>
            </div>

            {/* 1.2 Round Log Hoppus Formula */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>১.২ গোল কাঠের হপাস সূত্র (Hoppus Quarter-Girth Formula)</span>
              </h3>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-center text-sm font-bold shadow-inner">
                Hoppus CFT = [ (বেড় বা পরিধি ÷ ৪)² × দৈর্ঘ্য (ফুট) ] ÷ ১৪৪ = [ বেড়² × দৈর্ঘ্য ] ÷ ২৩MD (২৩০৪)
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-red-700">🪵 হপাস সূত্রের ভিত্তি ও তাৎপর্য:</h4>
                <p className="text-slate-600">
                  গোলাকার গাছের গুঁড়ির চারপাশের বেড় (Circumference) ফিতা দিয়ে মেপে ৪ দিয়ে ভাগ করে বর্গ করা হয়।
                  এতে গোল কাঠ থেকে চারকোণা সাইজ কাঠ বের করতে যে ২১.৪৬% অপচয় (Bark & Squaring Loss) হয়, তা স্বয়ংক্রিয়ভাবে বাদ পড়ে।
                  তাই বিশ্বজুড়ে টিম্বার বাণিজ্যে এটিই প্রমিত পরিমাপ।
                </p>
              </div>

              {/* Interactive Hoppus Tester */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3 no-print">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-emerald-600" />
                    <span>গোল কাঠ Hoppus CFT লাইভ সিমুলেটর:</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold">লগ টেস্ট</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">বেড় / পরিধি (ইঞ্চি)</label>
                    <input
                      type="number"
                      value={testGirthIn}
                      onChange={(e) => setTestGirthIn(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">লগের দৈর্ঘ্য (ফুট)</label>
                    <input
                      type="number"
                      value={testLogLengthFt}
                      onChange={(e) => setTestLogLengthFt(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">লগের সংখ্যা</label>
                    <input
                      type="number"
                      value={testLogQty}
                      onChange={(e) => setTestLogQty(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-100/80 flex items-center justify-between font-mono text-xs">
                  <span>
                    {`হপাস CFT: [ (${testGirthIn}/4)² × ${testLogLengthFt} ] ÷ ১৪৪ =`}
                  </span>
                  <span className="text-sm font-black text-emerald-950">
                    {calculatedTotalHoppusCft.toFixed(3)} CFT
                  </span>
                </div>
              </div>
            </div>

            {/* 1.3 Choukhat Frame Dimensions */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>১.৩ চৌকাঠের রানিং ফুট ও সিএফটি স্ট্যান্ডার্ড (Choukhat Sizing)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900">🚪 ৩-বাহু চৌকাঠের রানিং ফুট হিসাব:</h4>
                  <p className="text-slate-600">
                    একটি স্ট্যান্ডার্ড ৭ ফুট উচ্চতা এবং ৩.২৫ ফুট (৩৯ ইঞ্চি) প্রস্থের দরজার ফ্রেম বানাতে মোট ৩টি টুকরো লাগে:
                  </p>
                  <p className="font-mono text-red-700 font-bold">
                    রানিং ফুট (RFT) = ৭' (বাম) + ৭' (ডান) + ৩.২৫' (টপ) = ১৭.২৫ ফুট কাঠ
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900">🧱 প্রচলিত চৌকাঠ সাইজ ও সিএফটি:</h4>
                  <ul className="space-y-1 text-slate-700">
                    <li>• <strong>৫.৫" × ২.২৫" ফ্রেম (ওয়াল ৫"):</strong> ১৭.২৫' × ৫.৫" × ২.২৫" ÷ ১৪৪ = <strong>১.৪৮২ CFT</strong></li>
                    <li>• <strong>৬" × ২.৫" ভারী ফ্রেম:</strong> ১৭.২৫' × ৬" × ২.৫" ÷ ১৪৪ = <strong>১.৭৯৭ CFT</strong></li>
                    <li>• <strong>১০" × ২.৫" ডাবল ওয়াল ফ্রেম:</strong> ১৭.২৫' × ১০" × ২.৫" ÷ ১৪৪ = <strong>২.৯৯৫ CFT</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MARKETING & COMMISSION RULES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div
          onClick={() => toggleSection('marketing')}
          className="p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>২. মার্কেটিং ও ১% কালেকশন কমিশন পলিসি (Marketing Rules)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  ৳১,০০০ / লাখ
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                প্রকৃত কালেকশনের উপর মাসিক কমিশন নির্ধারণ, কালেকশন এডিট পদ্ধতি ও খরচ সিঙ্ক
              </p>
            </div>
          </div>
          {expandedSections.marketing ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {expandedSections.marketing && (
          <div className="p-6 space-y-6 text-xs text-slate-800 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-center text-sm font-bold shadow-inner">
              মাসিক কমিশন = [ চলতি মাসের প্রকৃত নগদ ও ব্যাংক কালেকশন ÷ ১,০০,০০০ ] × ১,০০০ টাকা = ১.০০%
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-red-700 text-sm">📌 কমিশনের মূল নীতিমালা:</h4>
                <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                  <li><strong>শুধুমাত্র আদায়ের উপর কমিশন:</strong> অর্ডার বুকিং বা বকেয়ার উপর কোনো কমিশন দেওয়া হবে না। ক্লায়েন্ট থেকে ক্যাশ/ব্যাংকে টাকা আসলেই সেই মাসের শিটে কমিশন উঠবে।</li>
                  <li><strong>মাসিক হিসাব (Monthly Settlement):</strong> ক্যালেন্ডার মাসের (যেমন ২০২৬-১০) ১ তারিখ থেকে শেষ তারিখ পর্যন্ত জমা হওয়া পেমেন্টের যোগফল হবে ওই মাসের কালেকশন বেস।</li>
                  <li><strong>খরচে অটো সিঙ্ক:</strong> কমিশন ভাউচার ছাড় করার সাথে সাথে এটি অ্যাকাউন্টস মডিউলে <em>"Marketing & Sales Commission"</em> ক্যাটাগরিতে খরচ হিসেবে এন্ট্রি হয়ে যাবে।</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-red-700 text-sm">🛠️ কালেকশন ও কমিশন এডিট করার নিয়ম:</h4>
                <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                  <li><strong>ভুল তারিখে পেমেন্ট এন্ট্রি হলে:</strong> <em>মার্কেটিং ➔ কালেকশন লগ ➔ এডিট বাটন</em> চেপে তারিখ পরিবর্তন করলে তা সাথে সাথে সঠিক মাসের কমিশন শিটে চলে যাবে।</li>
                  <li><strong>ভুল এজেন্টের নামে অর্ডার হলে:</strong> কালেকশন এডিট মোডাল থেকে অন্য এজেন্টকে সিলেক্ট করে দিলে ওই অর্ডারের পুরো কালেকশন নতুন এজেন্টের অ্যাকাউন্টে রি-অ্যাসাইন হবে।</li>
                  <li><strong>টাকার পরিমাণ ভুল হলে:</strong> এডিট মোডালে টাকার পরিমাণ সংশোধন করলে ১% কমিশন স্বয়ংক্রিয়ভাবে লাইভ রিক্যালকুলেট হবে।</li>
                </ul>
              </div>
            </div>

            {/* Interactive Commission Tester */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3 no-print">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-600" />
                  <span>মার্কেটিং কমিশন লাইভ টেস্ট (Commission Tester):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">চলতি মাসের কালেকশন (টাকা)</label>
                  <input
                    type="number"
                    step="5000"
                    value={testCollection}
                    onChange={(e) => setTestCollection(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">কমিশন রেট (প্রতি লাখে টাকা)</label>
                  <input
                    type="number"
                    value={testRatePerLakh}
                    onChange={(e) => setTestRatePerLakh(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-100/80 flex items-center justify-between font-mono text-xs">
                <span>
                  {`৳${testCollection.toLocaleString('en-IN')} এর ১% কমিশন =`}
                </span>
                <span className="text-sm font-black text-amber-950">
                  {formatCurrency(calculatedCommission, language)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: QUOTATION TO ORDER SOP */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div
          onClick={() => toggleSection('quotation')}
          className="p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>৩. কোটেশন তৈরি ও কাজের অর্ডার রূপান্তর গাইড (Quotation & Order SOP)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  Sales Pipeline
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                গ্রাহকের মাপ এন্ট্রি, রেট নির্ধারণ, ৫০% অগ্রিম বুকিং ও কাজের অর্ডার রূপান্তর
              </p>
            </div>
          </div>
          {expandedSections.quotation ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {expandedSections.quotation && (
          <div className="p-6 space-y-6 text-xs text-slate-800 leading-relaxed">
            {/* Direct Order vs Quotation Conversion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-200 space-y-2">
                <span className="text-[10px] font-black text-red-700 uppercase tracking-wider block">
                  পদ্ধতি ১: সরাসরি কাজের অর্ডার তৈরি (Direct Work Order SOP)
                </span>
                <h4 className="font-bold text-slate-900 text-sm">শোরুম ও কারখানায় তাৎক্ষণিক অর্ডার গ্রহণ</h4>
                <p className="text-slate-600">
                  ক্লায়েন্ট যদি সরাসরি শোরুমে এসে অর্ডার নিশ্চিত করে অগ্রিম টাকা দিতে চান:
                </p>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  <li><strong>ধাপ ১:</strong> <em>কাজের অর্ডার</em> পেজে গিয়ে <strong>"+ সরাসরি নতুন অর্ডার"</strong> বাটনে চাপুন।</li>
                  <li><strong>ধাপ ২:</strong> গ্রাহকের নাম, ফোন, সাইট ও মার্কেটিং এজেন্ট নির্বাচন করুন।</li>
                  <li><strong>ধাপ ৩:</strong> আইটেমের সাইজ (দৈর্ঘ্য, প্রস্থ, থিকনেস ও সুতা) এবং দর বসান। CFT ও মোট টাকা স্বয়ংক্রিয়ভাবে হিসাব হবে।</li>
                  <li><strong>ধাপ ৪:</strong> অগ্রিম টাকা, পেমেন্ট মাধ্যম এবং কোন ব্যাংক/ক্যাশ অ্যাকাউন্টে টাকা জমা হলো তা সিলেক্ট করুন (এতে ওই অ্যাকাউন্টের লাইভ ব্যালেন্স স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে)।</li>
                  <li><strong>ধাপ ৫:</strong> <em>"অর্ডার নিশ্চিত করুন"</em> এ চাপলেই সরাসরি ওয়ার্ক অর্ডার (`DTC-WO-YYYY-XXX`) তৈরি হয়ে ইনভয়েস ও রিসিট স্ক্রিনে আসবে।</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">
                  পদ্ধতি ২: কোটেশন থেকে অর্ডার রূপান্তর (Quotation Conversion SOP)
                </span>
                <h4 className="font-bold text-slate-900 text-sm">প্রস্তাবনা যাচাই ও অনুমোদনের পর অর্ডার</h4>
                <p className="text-slate-600">
                  যেসব গ্রাহক বা আর্কিটেক্ট আগে কোটেশন যাচাই করে পরে অনুমোদন দেন:
                </p>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  <li><strong>ধাপ ১:</strong> <em>কোটেশন ও বিলিং</em> পেজে ড্রাফট কোটেশন তৈরি করুন ও প্রিন্ট/পিডিএফ পাঠান।</li>
                  <li><strong>ধাপ ২:</strong> ক্লায়েন্ট ফোনে বা সাইটে সম্মতি দিলে কোটেশনের পাশে <strong>"কাজের অর্ডারে রূপান্তর করুন"</strong> এ ক্লিক করুন।</li>
                  <li><strong>ধাপ ৩:</strong> মিনিমাম ৫০% অগ্রিম বুকিং গ্রহণ করে নগদ/ব্যাংক রিসিট এন্ট্রি দিন।</li>
                  <li><strong>ধাপ ৪:</strong> সাথে সাথে অর্ডারটি কনভার্ট হয়ে সক্রিয় প্রোডাকশন পাইপলাইনে চলে যাবে।</li>
                </ul>
              </div>
            </div>

            {/* Customization & Deletion SOP */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>মুক্তভাবে টাইপিং, নতুন আইটেম যোগ ও ডিলিট করার নিয়ম (Customization SOP):</span>
              </h4>
              <ul className="space-y-1 list-disc pl-4 text-slate-700 text-xs">
                <li><strong>কারখানা ও কাস্টম মার্কেটিং রেফারেন্স:</strong> অর্ডারে <em>"কারখানা সরাসরি"</em> নির্বাচন করা যায়। এছাড়া <em>"+ নতুন রেফারেন্স লিখুন"</em> এ ক্লিক করে যেকোনো নতুন রেফারেন্সের নাম মুক্তভাবে টাইপ করা যায়।</li>
                <li><strong>কাস্টম আইটেম যোগ:</strong> <em>"+ কাস্টম আইটেম"</em> বাটনে চাপলে একটি নতুন রো তৈরি হবে যেখানে সম্পূর্ণ নিজের মতো বিবরণী টাইপ করা যাবে।</li>
                <li><strong>কাস্টম কাঠের প্রজাতি ও ডিজাইন টাইপিং:</strong> তালিকার ফিক্সড নামের বাইরে কোনো কাঠ, ডিজাইন বা পলিশ লিখতে চাইলে পাশে থাকা <strong>"✏️ নতুন"</strong> বাটনে ক্লিক করে সরাসরি নাম টাইপ করা যাবে (যেমন: গর্জন প্লাস, ময়ূর খোদাই, ম্যাট পিইউ ফিনিশ)।</li>
                <li><strong>আইটেম ডিলিট:</strong> প্রতিটি আইটেমের ডানে লাল রঙের <strong>"মুছুন"</strong> বাটনে চাপলেই তা তাৎক্ষণিকভাবে লিস্ট থেকে বাদ হয়ে যাবে এবং সর্বমোট টাকা রিক্যালকুলেট হবে।</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: SAWMILL & PRODUCTION STAGES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div
          onClick={() => toggleSection('production')}
          className="p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>৪. স-মিল চেরাই, অপচয় (Wastage) ও ৬টি কারখানা ধাপ</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Factory SOP
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                গোল কাঠের চেরাই অপচয় রেঞ্জ (২৫%-৩৫%) ও কারখানার ৬ ধাপের পাইপলাইন
              </p>
            </div>
          </div>
          {expandedSections.production ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {expandedSections.production && (
          <div className="p-6 space-y-6 text-xs text-slate-800 leading-relaxed">
            {/* Wastage Formula */}
            <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-center text-sm font-bold shadow-inner">
              চেরাই অপচয় (Wastage %) = [ (গোল কাঠ CFT - প্রাপ্ত সাইজ কাঠ CFT) ÷ গোল কাঠ CFT ] × ১০০
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">🪵 সাধারণ স-মিল স্ট্যান্ডার্ড:</h4>
                <ul className="space-y-1 text-slate-700">
                  <li>• <strong>স্বাভাবিক অপচয় (Sawdust/Wastage):</strong> ২৫% থেকে ৩৫%।</li>
                  <li>• <strong>সাইজ কাঠ রিকভারি (Recovery):</strong> ৬৫% থেকে ৭৫%।</li>
                  <li>• অপচয় ৩৫% এর বেশি হলে স-মিল ব্লেড বা চেরাই কাটিং পরিদর্শনে পাঠাতে হবে।</li>
                </ul>
              </div>

              {/* Wastage Calculator */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 no-print">
                <span className="font-bold text-emerald-950 block">অপচয় সিমুলেটর (Wastage Calculator):</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">গোল কাঠ CFT</label>
                    <input
                      type="number"
                      value={testRoundCft}
                      onChange={(e) => setTestRoundCft(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-white border border-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">প্রাপ্ত সাইজ কাঠ CFT</label>
                    <input
                      type="number"
                      value={testSawnCft}
                      onChange={(e) => setTestSawnCft(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-white border border-emerald-300 font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-between font-mono font-bold text-emerald-950 pt-1 text-xs">
                  <span>অপচয়: {calculatedWastagePct.toFixed(1)}%</span>
                  <span>রিকভারি: {calculatedRecoveryPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 6 Stages Timeline */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900">🏭 কারখানার ৬টি ধারাবাহিক ধাপ (Workflow Stages):</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-red-600 block">১</span>
                  <strong className="text-slate-900 block">নিশ্চিত অর্ডার</strong>
                  <span className="text-[10px] text-slate-500">বুকিং অগ্রিম গ্রহণ</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-amber-600 block">২</span>
                  <strong className="text-slate-900 block">কাঠ চেরাই</strong>
                  <span className="text-[10px] text-slate-500">স-মিলে সাইজিং</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-blue-600 block">৩</span>
                  <strong className="text-slate-900 block">কারিগর বানাচ্ছে</strong>
                  <span className="text-[10px] text-slate-500">ফ্রেম ও পাল্লা তৈরি</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-purple-600 block">৪</span>
                  <strong className="text-slate-900 block">পলিশ ও ফিনিশিং</strong>
                  <span className="text-[10px] text-slate-500">PU/হ্যান্ড পলিশ</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-emerald-600 block">৫</span>
                  <strong className="text-slate-900 block">প্রস্তুত</strong>
                  <span className="text-[10px] text-slate-500">চালান ছাড়ার জন্য</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-slate-900 block">৬</span>
                  <strong className="text-slate-900 block">ডেলিভারি সম্পন্ন</strong>
                  <span className="text-[10px] text-slate-500">সাইটে পৌঁছানো হয়েছে</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: CRAFTSMEN & PAYROLL */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div
          onClick={() => toggleSection('craftsmen')}
          className="p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>৫. কারিগর মজুরি, দৈনিক হাজিরা ও খোরাকি হিসাব (Craftsmen & Payroll)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  Wages & Payroll
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                পিস-রেট চুক্তি, দৈনিক হাজিরা ও উত্তোলিত অগ্রিম (খোরাকি) স্বয়ংক্রিয় কর্তন
              </p>
            </div>
          </div>
          {expandedSections.craftsmen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {expandedSections.craftsmen && (
          <div className="p-6 space-y-4 text-xs text-slate-800 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">👷 মজুরির ৩টি ধরন:</h4>
                <ul className="space-y-1 text-slate-700">
                  <li>• <strong>পিস-রেট (চুক্তি):</strong> প্রতি পাল্লা তৈরিতে ৩,৫০০ টাকা বা চৌকাঠে ৬০০ টাকা রেট। কাজ সম্পূর্ণ (Completed) মার্ক করলে স্বয়ংক্রিয়ভাবে তার মোট উপার্জনে যোগ হয়।</li>
                  <li>• <strong>দৈনিক হাজিরা:</strong> দিন হাজিরার ভিত্তিতে দৈনিক ৮০০–১২০০ টাকা মজুরি।</li>
                  <li>• <strong>মাসিক বেতন:</strong> স্থায়ী স্টাফ ও ফোরম্যানের জন্য নির্দিষ্ট মাসিক বেতন।</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">💸 খোরাকি ও ব্যালেন্স সমন্বয়:</h4>
                <p className="text-slate-600">
                  সপ্তাহের মাঝে কারিগরকে অগ্রিম (খোরাকি) দিলে তা এন্ট্রি করা হয়।
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono font-bold text-red-700">
                  অবশিষ্ট প্রদেয় মজুরি = মোট অর্জিত মজুরি - উত্তোলিত খোরাকি
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: TROUBLESHOOTING & ERROR RESOLUTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div
          onClick={() => toggleSection('troubleshooting')}
          className="p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-black">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>৬. ভুল হলে কী করবেন? (Troubleshooting & Quick Error Fixes)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                  Problem Solving
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ভুল তারিখে পেমেন্ট এন্ট্রি, ভুল সাইজ, এজেন্ট বদল এবং ডাটাবেজ ব্যাকআপ নির্দেশিকা
              </p>
            </div>
          </div>
          {expandedSections.troubleshooting ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {expandedSections.troubleshooting && (
          <div className="p-6 space-y-4 text-xs text-slate-800 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Problem 1 */}
              <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ভুল ১: পেমেন্ট ভুল তারিখে বা ভুল মাসে এন্ট্রি হয়েছে</span>
                </div>
                <p className="text-slate-700">
                  <strong>সমাধান:</strong> <em>মার্কেটিং ➔ কালেকশন লগ</em> ট্যাবে যান। সংশ্লিষ্ট পেমেন্ট রেকর্ডের ডানে <strong>[এডিট]</strong> বাটনে ক্লিক করে সঠিক তারিখ সিলেক্ট করে সেভ করুন। সাথে সাথে কালেকশনটি সঠিক মাসের শিটে স্থানান্তর হবে।
                </p>
              </div>

              {/* Problem 2 */}
              <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ভুল ২: অর্ডারে ভুল এজেন্টের নাম ট্যাগ হয়েছে</span>
                </div>
                <p className="text-slate-700">
                  <strong>সমাধান:</strong> <em>মার্কেটিং ➔ কালেকশন লগ ➔ এডিট</em> থেকে ড্রপডাউনে সঠিক এজেন্টের নাম সিলেক্ট করুন। অর্ডারের আগের ও পরের সব কালেকশন নতুন এজেন্টের লেজারে চলে যাবে।
                </p>
              </div>

              {/* Problem 3 */}
              <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ভুল ৩: কোটেশন বা অর্ডারে সাইজ/দর ভুল হয়েছে</span>
                </div>
                <p className="text-slate-700">
                  <strong>সমাধান:</strong> কোটেশন পেইজে গিয়ে আইটেমের সাইজ বা দর আপডেট করুন। সাথে সাথে সিএফটি ও মোট টাকা স্বয়ংক্রিয়ভাবে রিক্যালকুলেট হয়ে যাবে।
                </p>
              </div>

              {/* Problem 4 */}
              <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <Database className="w-4 h-4 text-rose-600" />
                  <span>নিয়মিত ব্যাকআপ SOP (Database Safety)</span>
                </div>
                <p className="text-slate-700">
                  <strong>নিয়ম:</strong> প্রতি দিন বা প্রতি সপ্তাহের শেষে <em>সেটিংস ও ব্যাকআপ</em> পেজে গিয়ে <strong>"ব্যাকআপ ফাইল ডাউনলোড (JSON)"</strong> এ ক্লিক করে ফাইলটি কম্পিউটার বা গুগল ড্রাইভে সেভ করে রাখুন।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7: FULL ACCOUNTING, OPENING BALANCE & MULTI-BANK SOP */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div
          onClick={() => toggleSection('banking')}
          className="p-5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-200 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>৭. মাল্টি-অ্যাকাউন্ট ব্যাংকিং, প্রারম্ভিক উদ্বৃত্ত ও ফান্ড ট্রান্সফার SOP</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Accounting Core
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ক্যাশ ইন হ্যান্ড, ব্যাংক ও বিকাশ অ্যাকাউন্টের প্রারম্ভিক ব্যালেন্স, লাইভ রানিং ব্যালেন্স ও ট্রান্সফার নিয়ম
              </p>
            </div>
          </div>
          {expandedSections.banking ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>

        {expandedSections.banking && (
          <div className="p-6 space-y-6 text-xs text-slate-800 leading-relaxed">
            {/* Balance Formula */}
            <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-center text-sm font-bold shadow-inner">
              বর্তমান লাইভ ব্যালেন্স = প্রারম্ভিক ব্যালেন্স (Opening) + মোট জমা (Inflows) - মোট খরচ (Outflows) ± ফান্ড ট্রান্সফার
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>১. প্রারম্ভিক ব্যালেন্স (Opening Balance)</span>
                </h4>
                <p className="text-slate-600">
                  সফটওয়্যার চালু করার শুরুতে প্রতিটি নগদ ক্যাশ ড্রয়ার, ব্যাংক অ্যাকাউন্ট বা বিকাশ মার্চেন্টে যে মূল ব্যালেন্স ছিল, তা একাউন্ট তৈরি/এডিটের সময় <strong>Opening Balance</strong> ঘরে বসাতে হয়।
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-amber-900 font-bold">
                  শুরুর মোট ক্যাশ = সকল অ্যাকাউন্টের প্রারম্ভিক যোগফল
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                  <span>২. ইন্টার-অ্যাকাউন্ট ট্রান্সফার সূত্র</span>
                </h4>
                <p className="text-slate-600">
                  শোরুমের অতিরিক্ত ক্যাশ ব্যাংকে জমা দিলে (Cash to Bank) বা কারখানা খরচের জন্য ব্যাংক থেকে ক্যাশ তুললে (Bank to Cash):
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-emerald-900 font-bold space-y-0.5">
                  <p>উৎস অ্যাকাউন্ট (From) = ব্যালেন্স - টাকা</p>
                  <p>গন্তব্য অ্যাকাউন্ট (To) = ব্যালেন্স + টাকা</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>৩. ডে-বুক ও রানিং ব্যালেন্স</span>
                </h4>
                <p className="text-slate-600">
                  প্রতিটি ট্রানজেকশনে জমা (Debit) হলে ব্যালেন্স বৃদ্ধি পায় এবং খরচ (Credit) হলে হ্রাস পায়:
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-blue-900 font-bold">
                  রানিং ব্যালেন্স = পূর্বের ব্যালেন্স + জমা - খরচ
                </div>
              </div>
            </div>

            {/* P&L Math & Rules */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">📊 লাভ-ক্ষতি ও নিট পরিচালন মুনাফা সূত্র (P&L Math):</h4>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900 text-center">
                নিট পরিচালন মুনাফা (Net Profit) = মোট বিক্রয় কালেকশন (Revenue) - (প্রত্যক্ষ কাঠ/মজুরি খরচ + পরিচালন ব্যয়)
              </div>
              <ul className="space-y-1 text-slate-700 list-disc pl-4 text-xs">
                <li><strong>রাজস্ব (Revenue Inflow):</strong> অর্ডার ডেলিভারি ও অগ্রিম বাবদ গ্রাহকদের থেকে ক্যাশ, ব্যাংক বা বিকাশে প্রাপ্ত প্রকৃত জমা।</li>
                <li><strong>প্রত্যক্ষ উৎপাদন ব্যয় (Direct Costs):</strong> গোল কাঠ ক্রয়, স-মিল চেরাই বিল, হার্ডওয়্যার ক্রয় এবং কারিগর মজুরি।</li>
                <li><strong>পরিচালন ব্যয় (Operating Overhead):</strong> শোরুম ও ফ্যাক্টরি ভাড়া, বিদ্যুৎ বিল, মার্কেটিং কালেকশন কমিশন, স্টাফ বেতন ও পরিবহন।</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
