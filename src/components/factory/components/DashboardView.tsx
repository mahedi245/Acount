import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels, priorityLabels } from '../utils/translations';
import { ProductionStage, WoodType, CustomerOrder } from '../types';
import {
  TrendingUp,
  Layers,
  Sparkles,
  Truck,
  AlertOctagon,
  ArrowRight,
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  FileText,
  TreeDeciduous,
  DoorOpen,
  Send
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    orders,
    lang,
    setActiveTab,
    setSelectedItemForTicket,
    setSelectedOrderForChallan,
    advanceItemStage,
    setIsReportModalOpen
  } = useFactory();

  const [orderFilter, setOrderFilter] = useState<string>('ALL');

  // Compute stats
  let totalDoorsAndFrames = 0;
  let activeDoorsAndFrames = 0;
  let readyForDispatchCount = 0;
  let qcReworkCount = 0;

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

  const urgentItems: Array<{
    order: CustomerOrder;
    item: (typeof orders)[0]['items'][0];
  }> = [];

  orders.forEach(order => {
    order.items.forEach(item => {
      totalDoorsAndFrames += item.quantity;
      if (item.stage !== 'DELIVERED') {
        activeDoorsAndFrames += item.quantity;
      }
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + item.quantity;
      woodCounts[item.woodType] = (woodCounts[item.woodType] || 0) + item.quantity;

      if (item.stage === 'READY_DISPATCH') {
        readyForDispatchCount += item.quantity;
      }
      if (item.qcStatus === 'REWORK_REQUIRED') {
        qcReworkCount += item.quantity;
      }
      if (item.priority === 'CRITICAL' || item.priority === 'URGENT') {
        if (item.stage !== 'DELIVERED') {
          urgentItems.push({ order, item });
        }
      }
    });
  });

  const filteredOrders = orders.filter(ord => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'IN_PRODUCTION') return ord.status === 'IN_PRODUCTION';
    if (orderFilter === 'READY') return ord.status === 'READY_FOR_DELIVERY' || ord.status === 'PARTIALLY_READY';
    if (orderFilter === 'COMPLETED') return ord.status === 'COMPLETED' || ord.status === 'DISPATCHED';
    return true;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B1432] via-[#101E46] to-[#0B1432] border border-cyan-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold tracking-wide border border-cyan-500/30">
              FACTORY EXECUTIVE VIEW
            </span>
            <span className="text-xs text-slate-400">| Live Plant Telemetry</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
            {lang === 'bn'
              ? 'কারখানা প্রোডাকশন ও ডেলিভারি ওভারভিউ'
              : 'Factory Production & Logistics Center'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {lang === 'bn'
              ? 'রিয়েল-টাইম কাঠের দরজা, ফ্রেম ও ফার্নিচারের স্টেজ ট্র্যাকিং এবং ডেলিভারি পর্যবেক্ষণ'
              : 'Real-time Wood Doors, Choukhat Frames, and Furniture Stages tracking'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 border border-emerald-400/40"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'CEO/MD স্যারের দৈনিক রিপোর্ট' : 'Send CEO/MD Report'}</span>
          </button>

          <button
            onClick={() => setActiveTab('order-new')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন অর্ডার তৈরি' : 'New Order'}</span>
          </button>

          <button
            onClick={() => setActiveTab('floor-terminal')}
            className="px-4 py-2.5 rounded-xl bg-[#0B1432] hover:bg-[#101E46] border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ফ্লোর QR' : 'Scanner'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: Total Active Orders */}
        <div className="glass-navy-card rounded-2xl p-4 relative overflow-hidden group hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'মোট রানিং প্রজেক্ট' : 'Active Projects'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 border border-blue-500/20">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{orders.length}</div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{orders.filter(o => o.status === 'IN_PRODUCTION').length} In Production</span>
          </div>
        </div>

        {/* Metric 2: Items in Factory Floor */}
        <div className="glass-navy-card rounded-2xl p-4 relative overflow-hidden group hover:border-sky-400/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'ফ্লোরে চলমান পাল্লা/চৌকাঠ' : 'Floor Units'}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeDoorsAndFrames}</div>
          <div className="text-[11px] text-sky-300 mt-1">
            {lang === 'bn' ? `মোট ${totalDoorsAndFrames} টির মধ্যে` : `Out of ${totalDoorsAndFrames} units`}
          </div>
        </div>

        {/* Metric 3: Polishing & Lacquer */}
        <div className="glass-navy-card rounded-2xl p-4 relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'পলিশ ও কালার ফিনিশিং' : 'Polishing Stage'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {stageCounts.POLISHING + stageCounts.SANDING}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            {stageCounts.POLISHING} Polish + {stageCounts.SANDING} Sanding
          </div>
        </div>

        {/* Metric 4: Ready For Dispatch */}
        <div className="glass-navy-card rounded-2xl p-4 relative overflow-hidden group hover:border-emerald-400/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'ডেলিভারি প্রস্তুত' : 'Ready Dispatch'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-300 font-mono">{readyForDispatchCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{lang === 'bn' ? 'প্যাকিং ও লোডিং রেডি' : 'QC & Packed'}</span>
          </div>
        </div>

        {/* Metric 5: QC Rework Alerts */}
        <div className={`glass-navy-card rounded-2xl p-4 relative overflow-hidden group transition-all ${
          qcReworkCount > 0 ? 'border-rose-500/50 bg-rose-950/20' : 'hover:border-slate-600'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'কোয়ালিটি রিওয়ার্ক' : 'QC Rework Alert'}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              qcReworkCount > 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${qcReworkCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {qcReworkCount}
          </div>
          <div className={`text-[11px] mt-1 ${qcReworkCount > 0 ? 'text-rose-300 font-semibold' : 'text-slate-400'}`}>
            {qcReworkCount > 0 ? (lang === 'bn' ? 'জরুরি সংশোধনে আছে' : 'Needs Correction') : (lang === 'bn' ? 'সবকিছু স্বাভাবিক' : 'All Clear')}
          </div>
        </div>

        {/* Metric 6: Executive Shift Report */}
        <div
          onClick={() => setIsReportModalOpen(true)}
          className="glass-navy-card rounded-2xl p-4 relative overflow-hidden group hover:border-emerald-400/60 cursor-pointer transition-all bg-gradient-to-br from-[#0B1432] to-[#0A2239]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-emerald-300">{lang === 'bn' ? 'দৈনিক এক্সিকিউটিভ রিপোর্ট' : 'Daily Shift Report'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/40 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lang === 'bn' ? 'MD/CEO রিপোর্ট রেডি' : 'MD/CEO Ready'}</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
            <Send className="w-3 h-3" />
            <span>{lang === 'bn' ? '১-ক্লিকে রিপোর্ট পাঠান' : 'Click to Send Report'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Funnel + Urgent Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Production Stage Funnel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  {lang === 'bn' ? 'কারখানা প্রোডাকশন পাইপলাইন (স্টেজ ব্রেকডাউন)' : 'Live Factory Stage Breakdown'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'কোন ধাপে কতগুলো দরজা ও চৌকাঠের কাজ চলছে'
                    : 'Distribution of doors & frames across 8 production stages'}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('kanban')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all hover:bg-cyan-900/60"
              >
                <span>{lang === 'bn' ? 'কানবান বোর্ড খুলুন' : 'Open Kanban'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stages Bar Progression */}
            <div className="space-y-3">
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
              ).map(stageKey => {
                const meta = stageMeta[stageKey];
                const count = stageCounts[stageKey] || 0;
                const percentage = activeDoorsAndFrames > 0 ? ((count / activeDoorsAndFrames) * 100).toFixed(1) : '0';

                return (
                  <div key={stageKey} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold bg-[#070D22] border border-slate-700 text-slate-300">
                          {meta.step}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {lang === 'bn' ? meta.bn : meta.en}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          ({lang === 'bn' ? meta.descriptionBn : meta.en})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white bg-[#070D22] px-2 py-0.5 rounded border border-slate-800 text-xs">
                          {count} {lang === 'bn' ? 'আইটেম' : 'items'}
                        </span>
                        <span className="text-[11px] text-slate-400 w-10 text-right font-mono">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#070D22] rounded-full h-2.5 overflow-hidden border border-slate-800/80">
                      <div
                        className="h-full rounded-full transition-all duration-500 group-hover:brightness-120"
                        style={{
                          width: `${Math.max(Number(percentage), count > 0 ? 5 : 0)}%`,
                          backgroundColor: meta.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wood Type Material Consumption Breakdown */}
          <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/60">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 mb-3">
              <TreeDeciduous className="w-4 h-4 text-amber-400" />
              {lang === 'bn' ? 'কাঠের ধরন ও মেটেরিয়াল শেয়ার' : 'Wood Species Distribution'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(woodTypeLabels) as WoodType[]).map(woodKey => {
                const info = woodTypeLabels[woodKey];
                const count = woodCounts[woodKey] || 0;
                return (
                  <div
                    key={woodKey}
                    className="p-3 rounded-xl bg-[#070D22]/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-slate-300">
                        {lang === 'bn' ? info.bn : info.en}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{info.code}</span>
                    </div>
                    <div
                      className="text-sm font-bold font-mono px-2 py-0.5 rounded border"
                      style={{
                        color: info.color,
                        borderColor: `${info.color}40`,
                        backgroundColor: `${info.color}15`
                      }}
                    >
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Urgent Queue */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-navy-card rounded-2xl p-5 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {lang === 'bn' ? 'জরুরি ও ভিআইপি আইটেম কিউ' : 'Urgent / VIP Attention Queue'}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                {urgentItems.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {urgentItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  {lang === 'bn' ? 'কোনো জরুরি আইটেম পেন্ডিং নেই' : 'No urgent items in queue'}
                </div>
              ) : (
                urgentItems.map(({ order, item }) => {
                  const meta = stageMeta[item.stage];
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#070D22] border border-slate-700/80 hover:border-amber-400/60 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                              priorityLabels[item.priority].badge
                            }`}
                          >
                            {priorityLabels[item.priority][lang]}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">
                            {item.itemName}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {order.customerName} | {order.orderNumber}
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}
                        >
                          {lang === 'bn' ? meta.shortBn : meta.en}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        <span className="font-mono text-cyan-300">
                          {item.dimensions.height}"×{item.dimensions.width}"×{item.dimensions.thickness}"
                        </span>
                        <span className="text-amber-400 font-medium">
                          ডেলিভারি: {order.promisedDeliveryDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => advanceItemStage(item.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <span>{lang === 'bn' ? 'পরবর্তী ধাপে পাঠান' : 'Advance'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => setSelectedItemForTicket(item)}
                          title="Print Ticket"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview Table */}
      <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-cyan-400" />
              {lang === 'bn' ? 'রিসেন্ট কাস্টমার অর্ডার তালিকা' : 'Active Customer Work Orders'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'কারখানায় বিভিন্ন কাস্টমারের মোট কাজের অগ্রগতি ও ডেলিভারি শিডিউল'
                : 'Summary of customer orders, item counts and manufacturing status'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#070D22] p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'ALL', labelBn: 'সকল অর্ডার', labelEn: 'All' },
              { id: 'IN_PRODUCTION', labelBn: 'প্রোডাকশনে', labelEn: 'In Prod' },
              { id: 'READY', labelBn: 'ডেলিভারি রেডি', labelEn: 'Ready' },
              { id: 'COMPLETED', labelBn: 'সম্পন্ন', labelEn: 'Done' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOrderFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  orderFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'bn' ? tab.labelBn : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070D22]/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">অর্ডার নং / কাস্টমার</th>
                <th className="py-3 px-3">সাইট লোকেশন</th>
                <th className="py-3 px-3">মোট আইটেম</th>
                <th className="py-3 px-3">স্টেজ অগ্রগতি</th>
                <th className="py-3 px-3">ডেলিভারি তারিখ</th>
                <th className="py-3 px-3">কারখানা স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map(order => {
                const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);
                const readyItems = order.items
                  .filter(i => i.stage === 'READY_DISPATCH')
                  .reduce((acc, i) => acc + i.quantity, 0);

                const progressPercent =
                  totalItems > 0
                    ? Math.round(
                        (order.items.reduce((acc, i) => {
                          const step = stageMeta[i.stage]?.step || 1;
                          return acc + (step / 9) * i.quantity;
                        }, 0) /
                          totalItems) *
                          100
                      )
                    : 0;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#0B1432]/60 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {order.orderNumber} • {order.customerPhone}
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-slate-300 truncate">{order.siteLocation}</div>
                      <div className="text-[10px] text-slate-500 truncate">{order.deliveryAddress}</div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="font-semibold text-cyan-300">{totalItems} টি</span>
                      <span className="text-[10px] text-slate-400 block">
                        ({order.items.length} ভিন্ন ডিজাইন/মডেল)
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{progressPercent}% অগ্রগতি</span>
                          {readyItems > 0 && <span className="text-emerald-400">{readyItems} রেডি</span>}
                        </div>
                        <div className="w-full bg-[#070D22] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 h-1.5 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-amber-300">
                      {order.promisedDeliveryDate}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : order.status === 'READY_FOR_DELIVERY'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                          : order.status === 'PARTIALLY_READY'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                      }`}>
                        {order.status === 'COMPLETED' ? 'সম্পূর্ণ ডেলিভার্ড' :
                         order.status === 'READY_FOR_DELIVERY' ? 'ডেলিভারি প্রস্তুত' :
                         order.status === 'PARTIALLY_READY' ? 'আংশিক প্রস্তুত' : 'প্রোডাকশনে চলমান'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('customer-tracking');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>ট্র্যাক</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForChallan(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>চালান</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
