import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels, priorityLabels } from '../utils/translations';
import { ProductionStage, WoodType } from '../types';
import {
  Send,
  Printer,
  Copy,
  CheckCircle2,
  X,
  FileText,
  Building2,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Truck,
  AlertTriangle,
  Check,
  User,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';

export const ExecutiveReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, orders, lang } = useFactory();

  const [shiftType, setShiftType] = useState<'FULL_DAY' | 'DAY_SHIFT' | 'NIGHT_SHIFT'>('FULL_DAY');
  const [supervisorName, setSupervisorName] = useState<string>('মোর্শেদ আলম (প্রোডাকশন ম্যানেজার)');
  const [specialRemarks, setSpecialRemarks] = useState<string>(
    'আজকের দিনে ৩টি সিএনসি রয়্যাল ডোরের খোদাই সফলভাবে সম্পন্ন হয়েছে। সিজনিং চেম্বারে আর্দ্রতা ১০.২% এ নিয়ন্ত্রিত। গুলশান-২ প্রজেক্টের মেগা ডাবল ডোর ফাইনাল কিউসি পাস করে লোডিংয়ের জন্য প্রস্তুত।'
  );
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  if (!isReportModalOpen) return null;

  const todayStr = new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate stats
  let totalActiveUnits = 0;
  let readyDispatchUnits = 0;
  let qcReworkCount = 0;
  let deliveredUnitsToday = 0;
  let totalFloorItems = 0;

  const stageCounts: Record<ProductionStage, number> = {
    SEASONING: 0,
    SIZING: 0,
    JOINERY: 0,
    CNC_CARVING: 0,
    SANDING: 0,
    POLISHING: 0,
    QC_PACKING: 0,
    READY_DISPATCH: 0,
    DELIVERED: 0
  };

  const urgentItems: Array<{
    itemName: string;
    customerName: string;
    stage: ProductionStage;
    promisedDate: string;
    dimensions: string;
    priority: string;
  }> = [];

  const qcAlerts: Array<{
    itemName: string;
    customerName: string;
    reason: string;
    stage: ProductionStage;
  }> = [];

  orders.forEach(ord => {
    ord.items.forEach(it => {
      totalFloorItems += it.quantity;
      if (it.stage !== 'DELIVERED') {
        totalActiveUnits += it.quantity;
      } else {
        deliveredUnitsToday += it.quantity;
      }

      stageCounts[it.stage] = (stageCounts[it.stage] || 0) + it.quantity;

      if (it.stage === 'READY_DISPATCH') {
        readyDispatchUnits += it.quantity;
      }

      if (it.qcStatus === 'REWORK_REQUIRED') {
        qcReworkCount += it.quantity;
        qcAlerts.push({
          itemName: it.itemName,
          customerName: ord.customerName,
          reason: it.qcNotes || 'সংশোধন আবশ্যক',
          stage: it.stage
        });
      }

      if ((it.priority === 'CRITICAL' || it.priority === 'URGENT') && it.stage !== 'DELIVERED') {
        urgentItems.push({
          itemName: it.itemName,
          customerName: ord.customerName,
          stage: it.stage,
          promisedDate: ord.promisedDeliveryDate,
          dimensions: `${it.dimensions.height}"×${it.dimensions.width}"×${it.dimensions.thickness}"`,
          priority: it.priority
        });
      }
    });
  });

  // Generate WhatsApp message text for CEO / MD Sir
  const generateWhatsAppMessage = () => {
    let text = `🏭 *KATHA & KABAT WOODWORKS*\n`;
    text += `📋 *দৈনিক কারখানা উৎপাদন ও সার্বিক পরিস্থিতি রিপোর্ট*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *প্রতিবেদক:* ${supervisorName}\n`;
    text += `📅 *তারিখ:* ${todayStr}\n`;
    text += `⏰ *শিফট:* ${shiftType === 'FULL_DAY' ? 'সারাদিনের সারসংক্ষেপ' : shiftType === 'DAY_SHIFT' ? 'ডে শিফট' : 'নাইট শিফট'}\n`;
    text += `📍 *প্ল্যান্ট:* ঢাকা ফ্যাক্টরি (তেজগাঁও ইন্ডাস্ট্রিয়াল শেড)\n\n`;

    text += `📊 *আজকের সার্বিক কারখানার চিত্র:*\n`;
    text += `• ফ্লোরে মোট চলমান কাজ: *${totalActiveUnits} টি ডোর ও ফ্রেম*\n`;
    text += `• পলিশ ও ল্যাকার বে-তে: *${stageCounts.POLISHING + stageCounts.SANDING} টি*\n`;
    text += `• সিএনসি নকশায় রানিং: *${stageCounts.CNC_CARVING} টি*\n`;
    text += `• লোডিং ও ডেলিভারির জন্য প্রস্তুত: *${readyDispatchUnits} টি*\n`;
    text += `• QC রিওয়ার্ক/সংশোধন: *${qcReworkCount > 0 ? qcReworkCount + ' টি (মনোযোগ আবশ্যক)' : '০ টি (ক্লিয়ার)'}*\n\n`;

    text += `⚙️ *স্টেজ অনুযায়ী বর্তমান কাজের ব্রেকডাউন:*\n`;
    text += `১. সিজনিং চেম্বার: ${stageCounts.SEASONING} টি\n`;
    text += `২. সাইজিং ও প্ল্যানিং: ${stageCounts.SIZING} টি\n`;
    text += `৩. জয়েনারি ও খাঁজ ফ্রেম: ${stageCounts.JOINERY} টি\n`;
    text += `৪. সিএনসি খোদাই নকশা: ${stageCounts.CNC_CARVING} টি\n`;
    text += `৫. স্যান্ডিং ও পুটিং: ${stageCounts.SANDING} টি\n`;
    text += `৬. পলিশ ও ল্যাকার স্প্রে: ${stageCounts.POLISHING} টি\n`;
    text += `৭. কিউসি ও বাবল প্যাকিং: ${stageCounts.QC_PACKING} টি\n`;
    text += `৮. ডেলিভারি রেডি: ${stageCounts.READY_DISPATCH} টি\n\n`;

    if (urgentItems.length > 0) {
      text += `🚨 *জরুরি ও ভিআইপি প্রজেক্ট অগ্রগতি:*\n`;
      urgentItems.slice(0, 5).forEach((urg, idx) => {
        const s = stageMeta[urg.stage];
        text += `${idx + 1}. *${urg.customerName}* (${urg.itemName})\n`;
        text += `   ↳ ধাপ: ${s.bn} | ডেডলাইন: ${urg.promisedDate}\n`;
      });
      text += `\n`;
    }

    if (specialRemarks.trim()) {
      text += `📝 *কারখানা ইনচার্জের বিশেষ নোট:*\n${specialRemarks.trim()}\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_শ্রদ্ধেয় এমডি ও সিইও স্যারের সদয় অবগতির জন্য প্রেরিত।_`;

    return text;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  const handleSendToWhatsAppApp = () => {
    const text = generateWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-[#070D22] border border-cyan-500/40 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-cyan-500/30 bg-gradient-to-r from-[#0B1432] via-[#101E46] to-[#0B1432] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  {lang === 'bn'
                    ? 'সিইও ও এমডি স্যারের দৈনিক ফ্যাক্টরি রিপোর্ট'
                    : 'Daily Executive Production Report for CEO / MD'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                  EXECUTIVE SUMMARY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'দিনের শেষে কারখানার সার্বিক অগ্রগতি ১-ক্লিকে হোয়াটসঅ্যাপ বা প্রিন্ট করে পাঠান'
                  : 'End of Day production health summary ready for direct executive dispatch'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-2 rounded-xl bg-[#070D22] text-slate-400 hover:text-white border border-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Report Preview Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Shift & Supervisor Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#040817] border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">রিপোর্ট প্রস্তুতকারক / ইনচার্জ:</label>
              <input
                type="text"
                value={supervisorName}
                onChange={e => setSupervisorName(e.target.value)}
                className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2 text-white font-medium outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">শিফট নির্বাচন:</label>
              <select
                value={shiftType}
                onChange={e => setShiftType(e.target.value as any)}
                className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2 text-white font-medium outline-none focus:border-cyan-400"
              >
                <option value="FULL_DAY">সারাদিনের সার্বিক সারসংক্ষেপ (Full Day)</option>
                <option value="DAY_SHIFT">সকাল-সন্ধ্যা ডে শিফট (Day Shift)</option>
                <option value="NIGHT_SHIFT">নাইট শিফট রিপোর্ট (Night Shift)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">প্ল্যান্ট ও লোকেশন:</label>
              <div className="bg-[#0B1432] border border-slate-700 rounded-xl p-2 text-cyan-300 font-medium">
                ঢাকা প্ল্যান্ট ১ (তেজগাঁও)
              </div>
            </div>
          </div>

          {/* Printable Styled Executive Letterhead */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#080E24] to-[#040817] border border-cyan-500/20 shadow-inner space-y-6">
            {/* Letterhead Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black tracking-tight text-white font-display">
                  KATHA & KABAT WOODWORKS
                </h3>
                <p className="text-xs text-cyan-400 font-medium mt-0.5">
                  কারখানা দৈনিক উৎপাদন ও স্টেজ মনিটরিং প্রতিবেদন
                </p>
                <p className="text-[11px] text-slate-400">
                  প্ল্যান্ট ১: তেজগাঁও ইন্ডাস্ট্রিয়াল এরিয়া, ঢাকা
                </p>
              </div>

              <div className="text-left sm:text-right text-xs">
                <span className="inline-block px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30">
                  {shiftType === 'FULL_DAY' ? 'সারাদিনের রিপোর্ট' : shiftType === 'DAY_SHIFT' ? 'ডে শিফট' : 'নাইট শিফট'}
                </span>
                <div className="font-mono text-slate-300 mt-1">{todayStr}</div>
              </div>
            </div>

            {/* 4 Big Executive Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0B1432] border border-cyan-500/30 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">ফ্লোরে মোট রানিং</span>
                <div className="text-2xl font-black text-cyan-300 font-mono mt-0.5">{totalActiveUnits}</div>
                <span className="text-[10px] text-slate-500">দরজা ও ফ্রেম</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1432] border border-amber-500/30 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">পলিশ ও ল্যাকার কিউ</span>
                <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">
                  {stageCounts.POLISHING + stageCounts.SANDING}
                </div>
                <span className="text-[10px] text-slate-500">ফিনিশিং সেকশনে</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1432] border border-emerald-500/30 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">ডেলিভারি প্রস্তুত</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{readyDispatchUnits}</div>
                <span className="text-[10px] text-emerald-500">লোডিংয়ের জন্য রেডি</span>
              </div>

              <div className={`p-3.5 rounded-xl bg-[#0B1432] text-center border ${
                qcReworkCount > 0 ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
              }`}>
                <span className="text-[10px] text-slate-400 font-medium block">QC রিওয়ার্ক এলার্ট</span>
                <div className={`text-2xl font-black font-mono mt-0.5 ${qcReworkCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {qcReworkCount}
                </div>
                <span className="text-[10px] text-slate-500">
                  {qcReworkCount > 0 ? 'সংশোধনাধীন' : 'জিরো ডিফেক্ট'}
                </span>
              </div>
            </div>

            {/* 8-Stage Production Funnel Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>স্টেজ অনুযায়ী কারখানার লাইভ লোড</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    'SEASONING',
                    'SIZING',
                    'JOINERY',
                    'CNC_CARVING',
                    'SANDING',
                    'POLISHING',
                    'QC_PACKING',
                    'READY_DISPATCH'
                  ] as ProductionStage[]
                ).map(stg => {
                  const s = stageMeta[stg];
                  const cnt = stageCounts[stg] || 0;
                  return (
                    <div
                      key={stg}
                      className="p-2.5 rounded-xl bg-[#0B1432]/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-xs font-medium text-slate-200">{s.shortBn}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-cyan-300">{cnt} টি</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Urgent & VIP Orders Progress */}
            {urgentItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>জরুরি ও ভিআইপি ডেলিভারি শিডিউল স্ট্যাটাস</span>
                </h4>

                <div className="space-y-2">
                  {urgentItems.map((urg, uIdx) => {
                    const sm = stageMeta[urg.stage];
                    return (
                      <div
                        key={uIdx}
                        className="p-2.5 rounded-xl bg-[#0B1432] border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-white">{urg.customerName}</span>
                          <span className="text-slate-400 ml-2">({urg.itemName})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                            style={{
                              color: sm.color,
                              borderColor: `${sm.color}40`,
                              backgroundColor: `${sm.color}15`
                            }}
                          >
                            বর্তমান ধাপ: {sm.shortBn}
                          </span>
                          <span className="text-amber-300 font-mono font-bold text-[11px]">
                            ডেডলাইন: {urg.promisedDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Supervisor Remarks Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                কারখানা ইনচার্জের মন্তব্য ও পর্যবেক্ষণ (সিইও / এমডি স্যারের দৃষ্টি আকর্ষণ):
              </label>
              <textarea
                rows={3}
                value={specialRemarks}
                onChange={e => setSpecialRemarks(e.target.value)}
                placeholder="মেশিনারি হেলথ, কাঁচামাল বা আজকের শিফটের বিশেষ অর্জন..."
                className="w-full bg-[#0B1432] border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 border-t border-cyan-500/30 bg-[#0B1432] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>রিপোর্ট সম্পূর্ণ জেনারেট হয়েছে</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click WhatsApp Direct */}
            <button
              onClick={handleSendToWhatsAppApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp-এ সরাসরি পাঠান</span>
            </button>

            {/* Copy WhatsApp Text */}
            <button
              onClick={handleCopyWhatsApp}
              className="px-3.5 py-2.5 rounded-xl bg-[#101E46] hover:bg-[#172D62] text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center gap-1.5 transition-all"
            >
              {copiedWhatsApp ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>টেক্সট কপি</span>
                </>
              )}
            </button>

            {/* Print / PDF */}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
