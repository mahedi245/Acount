import React, { useState, useEffect } from 'react';
import { useFactory } from '../context/FactoryContext';
import { roleLabels } from '../utils/translations';
import { UserRole } from '../types';
import {
  DoorOpen,
  Clock,
  Tv,
  Search,
  Layers,
  Truck,
  AlertTriangle,
  Globe,
  ChevronDown,
  FileText
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    lang,
    setLang,
    orders,
    isTvMode,
    setIsTvMode,
    searchQuery,
    setSearchQuery,
    setIsReportModalOpen
  } = useFactory();

  const [timeStr, setTimeStr] = useState<string>('');
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Aggregate telemetry
  let totalActiveItems = 0;
  let readyCount = 0;
  let qcReworkCount = 0;

  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.stage !== 'DELIVERED') {
        totalActiveItems++;
      }
      if (item.stage === 'READY_DISPATCH') {
        readyCount++;
      }
      if (item.qcStatus === 'REWORK_REQUIRED') {
        qcReworkCount++;
      }
    });
  });

  const availableRoles: UserRole[] = [
    'PRODUCTION_MANAGER',
    'FACTORY_SUPERVISOR',
    'LOGISTICS_MANAGER',
    'EXECUTIVE_ADMIN'
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070D22]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-6 py-2.5 transition-all shadow-xl">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-900 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#070D22] rounded-[10px] flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-amber-200 bg-clip-text text-transparent font-display">
                KATHA & KABAT
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 rounded-full tracking-wider">
                MES v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {lang === 'bn' ? 'ফ্যাক্টরি ডোর, ফ্রেম ও ফার্নিচার ট্র্যাকার' : 'Door, Frame & Furniture Factory Tracker'}
            </p>
          </div>
        </div>

        {/* Middle: Search & Quick Floor Telemetry */}
        <div className="flex-1 max-w-xl mx-2 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                lang === 'bn'
                  ? 'কাস্টমারের নাম, ফোন (যেমন 01712...), বা অর্ডার/আইটেম ID দিয়ে খুঁজুন...'
                  : 'Search by Customer, Phone, or Door UID...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1432]/90 border border-slate-700/80 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 text-xs text-slate-200 rounded-xl pl-10 pr-4 py-2 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Metrics Badges */}
          <div className="hidden xl:flex items-center gap-2 bg-[#0B1432]/80 border border-slate-700/50 rounded-xl px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-semibold">{totalActiveItems}</span>
              <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'ফ্লোরে রানিং' : 'Active'}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-700 mx-1" />
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{readyCount}</span>
              <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'রেডি' : 'Ready'}</span>
            </div>
            {qcReworkCount > 0 && (
              <>
                <div className="w-px h-3.5 bg-slate-700 mx-1" />
                <div className="flex items-center gap-1.5 text-rose-300 animate-bounce">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold">{qcReworkCount}</span>
                  <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'রিওয়ার্ক' : 'Rework'}</span>
                </div>
              </>
            )}
          </div>

          {/* Clock */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#0B1432]/60 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeStr}</span>
          </div>

          {/* Daily Shift CEO/MD Report Trigger */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            title={lang === 'bn' ? 'সিইও ও এমডি স্যারের দৈনিক রিপোর্ট' : 'Executive Daily Shift Report for CEO / MD'}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-700/30 border border-emerald-400/40 active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">
              {lang === 'bn' ? 'সিইও রিপোর্ট' : 'CEO Report'}
            </span>
          </button>

          {/* TV HUD Toggle */}
          <button
            onClick={() => setIsTvMode(!isTvMode)}
            title={lang === 'bn' ? 'ফ্যাক্টরি টিভি মোড' : 'Factory TV HUD Mode'}
            className="p-2 rounded-xl bg-[#0B1432] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 transition-all shadow-sm hover:shadow-cyan-500/20 active:scale-95"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1 rounded-xl bg-[#0B1432] border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#101E46] to-[#0B1432] border border-cyan-500/30 hover:border-cyan-400 text-xs font-medium text-slate-200 transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'ইউজার মোড' : 'Active Role'}</div>
                <div className="font-semibold text-cyan-300">{roleLabels[role][lang]}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#070D22] border border-cyan-500/30 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  {lang === 'bn' ? 'ইউজার ভূমিকা পরিবর্তন করুন' : 'Select User Mode'}
                </div>
                <div className="py-1 space-y-1">
                  {availableRoles.map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        role === r
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{roleLabels[r][lang]}</span>
                      {role === r && <span className="text-cyan-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
