import React, { useState, useEffect } from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels } from '../utils/translations';
import { ProductionStage } from '../types';
import {
  Tv,
  X,
  Flame,
  Clock,
  Layers,
  Sparkles,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Maximize,
  Minimize
} from 'lucide-react';

export const FactoryTvHUD: React.FC = () => {
  const { isTvMode, setIsTvMode, orders, lang } = useFactory();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setDateStr(
        now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  if (!isTvMode) return null;

  let totalActiveUnits = 0;
  let readyUnits = 0;
  let qcAlerts = 0;

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

  const urgentList: Array<{
    item: (typeof orders)[0]['items'][0];
    customer: string;
    promisedDate: string;
  }> = [];

  orders.forEach(ord => {
    ord.items.forEach(it => {
      if (it.stage !== 'DELIVERED') {
        totalActiveUnits += it.quantity;
        stageCounts[it.stage] = (stageCounts[it.stage] || 0) + it.quantity;
      }
      if (it.stage === 'READY_DISPATCH') readyUnits += it.quantity;
      if (it.qcStatus === 'REWORK_REQUIRED') qcAlerts += it.quantity;
      if ((it.priority === 'CRITICAL' || it.priority === 'URGENT') && it.stage !== 'DELIVERED') {
        urgentList.push({ item: it, customer: ord.customerName, promisedDate: ord.promisedDeliveryDate });
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#040817] text-white p-6 flex flex-col justify-between overflow-hidden animate-in fade-in">
      {/* TV Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/30">
            KK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight font-display bg-gradient-to-r from-white via-cyan-200 to-amber-300 bg-clip-text text-transparent">
                KATHA & KABAT FACTORY LIVE SCREEN
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-bold border border-cyan-500/40 animate-pulse">
                ● LIVE FLOOR HUD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              প্ল্যান্ট ১ • তেজগাঁও ইন্ডাস্ট্রিয়াল শেড • লাইভ প্রোডাকশন ট্র্যাকিং
            </p>
          </div>
        </div>

        {/* Live Clock & Exit */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-3xl font-black font-mono text-cyan-300 tracking-wider">
              {time}
            </div>
            <div className="text-xs text-slate-400">{dateStr}</div>
          </div>

          <button
            onClick={() => setIsTvMode(false)}
            className="p-3 rounded-2xl bg-[#0B1432] hover:bg-[#101E46] border border-cyan-500/40 text-cyan-300 hover:text-white transition-all shadow"
            title="Exit TV Mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center 8-Stage Huge Pipeline Display */}
      <div className="my-6 space-y-6">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
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
          ).map((stg, idx) => {
            const meta = stageMeta[stg];
            const count = stageCounts[stg] || 0;

            return (
              <div
                key={stg}
                className="p-4 rounded-2xl bg-[#070D22] border border-slate-800 flex flex-col justify-between h-44 shadow-lg relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: meta.color }}
                />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    STEP {idx + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                </div>

                <div className="my-2">
                  <div
                    className="text-4xl font-black font-mono tracking-tight"
                    style={{ color: meta.color }}
                  >
                    {count}
                  </div>
                  <span className="text-xs text-slate-400">আইটেম রানিং</span>
                </div>

                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {lang === 'bn' ? meta.shortBn : meta.en}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {lang === 'bn' ? meta.bn : meta.en}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Telemetry: Total Floor Units, QC Alerts, Urgent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 border-t border-slate-800/80 pt-4">
        {/* Left 4 Cols: Quick Big Metric Tiles */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#070D22] border border-cyan-500/30 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">ফ্লোরে চলমান</span>
            <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
              {totalActiveUnits}
            </div>
            <span className="text-[9px] text-slate-500">দরজা ও ফ্রেম</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070D22] border border-emerald-500/30 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">ডেলিভারি প্রস্তুত</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {readyUnits}
            </div>
            <span className="text-[9px] text-emerald-500">লোডিংয়ের জন্য</span>
          </div>

          <div className={`p-3.5 rounded-2xl bg-[#070D22] text-center border ${
            qcAlerts > 0 ? 'border-rose-500/60 bg-rose-950/20 animate-pulse' : 'border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 block font-medium">QC রিওয়ার্ক</span>
            <div className={`text-2xl font-black font-mono mt-1 ${qcAlerts > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {qcAlerts}
            </div>
            <span className="text-[9px] text-slate-500">সংশোধন আবশ্যক</span>
          </div>
        </div>

        {/* Right 8 Cols: Urgent Attention Live Ticker */}
        <div className="lg:col-span-8 bg-[#070D22] border border-amber-500/30 rounded-2xl p-3 flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs shrink-0 pl-2">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            <span>জরুরি ডেলিভারি এলার্ট:</span>
          </div>

          <div className="flex-1 overflow-x-auto whitespace-nowrap flex gap-3 pr-2">
            {urgentList.map((urg, uIdx) => (
              <div
                key={uIdx}
                className="inline-flex items-center gap-2 bg-[#0B1432] px-3 py-1.5 rounded-xl border border-slate-700 text-xs shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span className="font-bold text-white">{urg.item.itemName}</span>
                <span className="text-slate-400">({urg.customer})</span>
                <span className="font-mono font-bold text-amber-300">
                  ডেডলাইন: {urg.promisedDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
