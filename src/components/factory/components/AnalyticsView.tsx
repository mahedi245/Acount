import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { woodTypeLabels } from '../utils/translations';
import { WoodType, ProductionStage } from '../types';
import {
  TreeDeciduous,
  Clock,
  CheckCircle2,
  Award,
  Zap,
  Layers,
  ArrowUpRight,
  Send
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { orders, lang, setIsReportModalOpen } = useFactory();

  let totalItems = 0;
  let activeItems = 0;
  let readyItems = 0;
  let qcReworkCount = 0;

  const woodCounts: Record<WoodType, number> = {
    CTG_TEAK: 0,
    BURMA_TEAK: 0,
    GAMARI: 0,
    MAHOGANY: 0,
    GORJON: 0,
    RED_OAK: 0,
    FLUSH_BOARD: 0,
    MALAYSIAN_PROCESSED: 0
  };

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

  orders.forEach(order => {
    order.items.forEach(item => {
      totalItems += item.quantity;
      if (item.stage !== 'DELIVERED') {
        activeItems += item.quantity;
      }
      if (item.stage === 'READY_DISPATCH') readyItems += item.quantity;
      if (item.qcStatus === 'REWORK_REQUIRED') qcReworkCount += item.quantity;

      woodCounts[item.woodType] = (woodCounts[item.woodType] || 0) + item.quantity;
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + item.quantity;
    });
  });

  const onTimeDeliveryRate = 96.8;
  const qcFirstPassYield = 98.2;

  const topWorkers = [
    { name: 'ওস্তাদ সেলিম', role: 'চিফ পলিশ মাস্টার', completed: 48, rating: '5.0 ★', avatar: '🎨' },
    { name: 'আরিফ হোসেন', role: 'সিএনসি ও রাউটার স্পেশালিস্ট', completed: 62, rating: '4.9 ★', avatar: '⚙️' },
    { name: 'জামাল মিস্ত্রি', role: 'সিনিয়র জয়েনারি ও চৌকাঠ মাস্টার', completed: 74, rating: '4.9 ★', avatar: '🪚' },
    { name: 'আলমগীর হোসেন', role: 'কিউসি ও বাবল প্যাকিং ইনচার্জ', completed: 85, rating: '5.0 ★', avatar: '📦' },
    { name: 'রফিক মিয়া', role: 'সিজনিং ও কেলন বয়লার অপারেটর', completed: 110, rating: '4.8 ★', avatar: '🪵' }
  ];

  const stageAvgDays = [
    { stage: 'সিজনিং ও ট্রিটমেন্ট', days: '৫-৭ দিন', load: `${stageCounts.SEASONING} টি` },
    { stage: 'সাইজিং ও প্ল্যানিং', days: '১-২ দিন', load: `${stageCounts.SIZING} টি` },
    { stage: 'জয়েনারি ও খাঁজ ফ্রেম', days: '২-৩ দিন', load: `${stageCounts.JOINERY} টি` },
    { stage: 'সিএনসি খোদাই নকশা', days: '১ দিন', load: `${stageCounts.CNC_CARVING} টি` },
    { stage: 'স্যান্ডিং ও পুটিং', days: '২ দিন', load: `${stageCounts.SANDING} টি` },
    { stage: 'পলিশ ও ল্যাকার স্প্রে', days: '৩-৪ দিন', load: `${stageCounts.POLISHING} টি` },
    { stage: 'QC ও বাবল প্যাকিং', days: '১ দিন', load: `${stageCounts.QC_PACKING} টি` },
    { stage: 'ডেলিভারি লোডিং', days: 'তাত্ক্ষণিক', load: `${stageCounts.READY_DISPATCH} টি` }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#070D22] via-[#0B1432] to-[#070D22] border border-cyan-500/20 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-bold tracking-wider border border-cyan-500/30">
            BUSINESS INTELLIGENCE & PRODUCTION ANALYTICS
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1">
            {lang === 'bn'
              ? 'কাঠের স্টক ও প্রোডাকশন অ্যানালিটিক্স'
              : 'Wood Inventory & Production Efficiency Analytics'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'bn'
              ? 'উৎপাদন দক্ষতা, কাঠের প্রজাতি শেয়ার, সময়ানুবর্তিতা এবং স্টেজ লিড টাইম অ্যানালাইসিস'
              : 'Throughput metrics, wood species volume, on-time rates and stage lead times'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'CEO/MD দৈনিক রিপোর্ট পাঠান' : 'Send CEO/MD Report'}</span>
          </button>
        </div>
      </div>

      {/* 4 Pure Production & Operational KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-navy-card rounded-2xl p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'মোট ডোর ও ফ্রেম ভলিউম' : 'Total Items Volume'}</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {totalItems} টি
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{orders.length} টি বড় গ্রাহক প্রজেক্ট</span>
          </div>
        </div>

        <div className="glass-navy-card rounded-2xl p-4 border border-sky-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'ফ্যাক্টরি ফ্লোরে চলমান' : 'Active On Floor'}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-300 font-mono">
            {activeItems} টি
          </div>
          <div className="text-[11px] text-sky-400 mt-1">
            {readyItems} টি লোডিংয়ের জন্য প্রস্তুত
          </div>
        </div>

        <div className="glass-navy-card rounded-2xl p-4 border border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'অন-টাইম ডেলিভারি রেট' : 'On-Time Delivery'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {onTimeDeliveryRate}%
          </div>
          <div className="text-[11px] text-emerald-300 mt-1">স্ট্যান্ডার্ড শিডিউল বজায় আছে</div>
        </div>

        <div className="glass-navy-card rounded-2xl p-4 border border-indigo-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'কোয়ালিটি ফার্স্ট পাস (QC)' : 'QC First Pass Yield'}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{qcFirstPassYield}%</div>
          <div className="text-[11px] text-indigo-300 mt-1">
            {qcReworkCount > 0 ? `${qcReworkCount} টি রিওয়ার্ক সংশোধনাধীন` : 'শূন্য ডিফেক্ট স্কোর'}
          </div>
        </div>
      </div>

      {/* Middle Split: Wood Species Distribution + Stage Lead Times */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Wood Species Demand */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <TreeDeciduous className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'কাঠের প্রজাতি অনুযায়ী কারখানার চাহিদা' : 'Wood Species Demand & Share'}</span>
            </h3>

            <div className="space-y-3">
              {(Object.keys(woodTypeLabels) as WoodType[]).map(woodKey => {
                const info = woodTypeLabels[woodKey];
                const count = woodCounts[woodKey] || 0;
                const pct = totalItems > 0 ? ((count / totalItems) * 100).toFixed(1) : '0';

                return (
                  <div key={woodKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                        <span className="font-semibold text-slate-200">
                          {lang === 'bn' ? info.bn : info.en}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">({info.code})</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-white">{count} টি</span>
                        <span className="text-slate-400 text-[11px] w-12 text-right">{pct}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#040817] rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(Number(pct), count > 0 ? 4 : 0)}%`,
                          backgroundColor: info.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Lead Time & Average Duration */}
          <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/80 space-y-3">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? 'প্রতিটি স্টেজের গড় সময় ও রানিং লোড' : 'Stage Cycle Lead Times'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {stageAvgDays.map((stg, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#040817] border border-slate-800 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-300 truncate">{stg.stage}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="text-cyan-400 font-bold">{stg.days}</span>
                    <span className="bg-[#0B1432] px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">{stg.load}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Factory Crew Leaderboard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'দক্ষ কারিগর ও সুপারভাইজার পারফরম্যান্স' : 'Top Factory Craftsmen'}</span>
            </h3>

            <div className="space-y-3">
              {topWorkers.map((worker, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#040817] border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{worker.avatar}</div>
                    <div>
                      <div className="font-bold text-white text-xs">{worker.name}</div>
                      <div className="text-[10px] text-slate-400">{worker.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-cyan-300 text-xs">
                      {worker.completed} টি আইটেম
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold">{worker.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
