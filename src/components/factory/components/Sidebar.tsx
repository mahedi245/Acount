import React from 'react';
import { useFactory } from '../context/FactoryContext';
import {
  LayoutDashboard,
  KanbanSquare,
  PlusCircle,
  QrCode,
  UserCheck,
  Truck,
  BarChart3,
  Flame,
  FileText,
  Send
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, lang, orders, setIsReportModalOpen } = useFactory();

  let reworkCount = 0;
  let urgentCount = 0;
  orders.forEach(ord => {
    ord.items.forEach(it => {
      if (it.qcStatus === 'REWORK_REQUIRED') reworkCount++;
      if (it.priority === 'CRITICAL' || it.priority === 'URGENT') urgentCount++;
    });
  });

  const menuItems = [
    {
      id: 'dashboard',
      labelBn: 'ওভারভিউ ড্যাশবোর্ড',
      labelEn: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'kanban',
      labelBn: 'ফ্যাক্টরি কানবান পাইপলাইন',
      labelEn: 'Live Kanban Pipeline',
      icon: KanbanSquare,
      badge: urgentCount > 0 ? `${urgentCount} Urgent` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'order-new',
      labelBn: 'নতুন অর্ডার ও ডোর কনফিগারেশন',
      labelEn: 'New Order Configurator',
      icon: PlusCircle,
      badge: null
    },
    {
      id: 'floor-terminal',
      labelBn: 'ফ্লোর টার্মিনাল ও QR স্ক্যানার',
      labelEn: 'Floor Terminal & QR',
      icon: QrCode,
      badge: 'Touch UI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'customer-tracking',
      labelBn: 'কাস্টমার ট্র্যাকিং ও সাপোর্ট',
      labelEn: 'Customer Live Tracker',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'dispatch',
      labelBn: 'ডেলিভারি চালান ও গেটপাস',
      labelEn: 'Dispatch & Gatepass',
      icon: Truck,
      badge: null
    },
    {
      id: 'analytics',
      labelBn: 'কাঠ ও প্রোডাকশন অ্যানালিটিক্স',
      labelEn: 'Wood & Production Stats',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-[#070D22] border-r border-slate-800/80 flex flex-col justify-between p-3 shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div className="space-y-5">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'bn' ? 'ফ্যাক্টরি অপারেশনস' : 'Factory Operations'}
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-transparent text-cyan-200 border-l-4 border-cyan-400 font-semibold shadow-lg shadow-cyan-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-[#0B1432]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="text-left font-display">
                      {lang === 'bn' ? item.labelBn : item.labelEn}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dedicated CEO / MD Shift Report Button */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#0B1432] to-[#040817] border border-emerald-500/30 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'bn' ? 'সিইও / এমডি দৈনিক রিপোর্ট' : 'Daily Executive Report'}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {lang === 'bn'
              ? 'শিফট শেষে ১-ক্লিকে হোয়াটসঅ্যাপ ও প্রিন্ট সামারি পাঠান।'
              : 'Send shift & output health summary directly to MD Sir.'}
          </p>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/30 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'রিপোর্ট প্রস্তুত করুন' : 'Generate Shift Report'}</span>
          </button>
        </div>

        {/* Factory Status Widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#101E46]/60 to-[#0B1432]/80 border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              {lang === 'bn' ? 'ফ্যাক্টরি লাইন হেলথ' : 'Factory Health'}
            </span>
            <span className="text-emerald-400 text-[11px] font-semibold">98.4% On-Time</span>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-1.5 rounded-full w-[88%]" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/40 text-[10px] text-slate-300">
            <div>
              <span className="text-slate-400 block">{lang === 'bn' ? 'সিজনিং স্টোরেজ' : 'Kiln Temp'}</span>
              <span className="font-mono text-cyan-300 font-semibold">54°C / 10.5% MC</span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'bn' ? 'সিএনসি রাউটার' : 'CNC Active'}</span>
              <span className="font-mono text-emerald-300 font-semibold">3 of 4 Running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mini Profile / Help Card */}
      <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] text-slate-300 font-medium">
              {lang === 'bn' ? 'ফ্যাক্টরি ক্লাউড লাইভ' : 'Factory Cloud Connected'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Dhaka Plant</span>
        </div>
      </div>
    </aside>
  );
};
