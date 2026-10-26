import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels, priorityLabels, productCategoryLabels } from '../utils/translations';
import { ProductionStage, WoodType, ProductCategory, PriorityLevel, OrderItem } from '../types';
import {
  KanbanSquare,
  ArrowRight,
  QrCode,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  User,
  SlidersHorizontal,
  Flame,
  Search,
  Sparkles,
  Layers
} from 'lucide-react';

const KANBAN_STAGES: ProductionStage[] = [
  'SEASONING',
  'SIZING',
  'JOINERY',
  'CNC_CARVING',
  'SANDING',
  'POLISHING',
  'QC_PACKING',
  'READY_DISPATCH'
];

export const KanbanBoard: React.FC = () => {
  const {
    orders,
    lang,
    advanceItemStage,
    reworkQCItem,
    setSelectedItemForTicket
  } = useFactory();

  const [selectedWood, setSelectedWood] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [reworkModalItem, setReworkModalItem] = useState<OrderItem | null>(null);
  const [reworkReason, setReworkReason] = useState<string>('');
  const [reworkTargetStage, setReworkTargetStage] = useState<ProductionStage>('SANDING');
  const [stageNote, setStageNote] = useState<string>('');

  // Collect all items across orders with customer & order context
  const allItems: Array<{
    item: OrderItem;
    customerName: string;
    orderNumber: string;
    promisedDate: string;
  }> = [];

  orders.forEach(order => {
    order.items.forEach(item => {
      // Filter out completed/delivered from standard floor board if desired, or keep
      if (item.stage !== 'DELIVERED') {
        allItems.push({
          item,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          promisedDate: order.promisedDeliveryDate
        });
      }
    });
  });

  // Apply active filters
  const filteredItems = allItems.filter(({ item }) => {
    if (selectedWood !== 'ALL' && item.woodType !== selectedWood) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) return false;
    return true;
  });

  const handleReworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reworkModalItem || !reworkReason.trim()) return;
    reworkQCItem(reworkModalItem.id, reworkTargetStage, reworkReason);
    setReworkModalItem(null);
    setReworkReason('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-full overflow-hidden flex flex-col h-[calc(100vh-70px)]">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0B1432]/90 border border-slate-700/80 rounded-2xl p-3.5 shrink-0 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <span>{lang === 'bn' ? 'ফ্যাক্টরি লাইভ কানবান পাইপলাইন' : 'Live Factory Production Pipeline'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono">
                {filteredItems.length} {lang === 'bn' ? 'আইটেম ফ্লোরে' : 'Units'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? '৮টি ধারাবাহিক স্টেজে কাঠ প্রসেসিং ও ফিনিশিং কাজের রিয়েল-টাইম অগ্রগতি'
                : 'Real-time multi-stage wood manufacturing pipeline tracker'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Wood Filter */}
          <div className="flex items-center gap-1 bg-[#070D22] px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">{lang === 'bn' ? 'কাঠ:' : 'Wood:'}</span>
            <select
              value={selectedWood}
              onChange={e => setSelectedWood(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold text-xs outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#070D22] text-slate-200">সব কাঠ (All)</option>
              {Object.entries(woodTypeLabels).map(([k, v]) => (
                <option key={k} value={k} className="bg-[#070D22] text-slate-200">
                  {lang === 'bn' ? v.bn : v.en}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#070D22] px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">{lang === 'bn' ? 'ধরণ:' : 'Type:'}</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold text-xs outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#070D22] text-slate-200">সব ক্যাটাগরি</option>
              {Object.entries(productCategoryLabels).map(([k, v]) => (
                <option key={k} value={k} className="bg-[#070D22] text-slate-200">
                  {lang === 'bn' ? v.bn : v.en}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-[#070D22] px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">{lang === 'bn' ? 'প্রায়োরিটি:' : 'Priority:'}</span>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold text-xs outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#070D22] text-slate-200">সব প্রায়োরিটি</option>
              <option value="CRITICAL" className="bg-[#070D22] text-rose-400">VIP / Critical</option>
              <option value="URGENT" className="bg-[#070D22] text-amber-400">Urgent</option>
              <option value="NORMAL" className="bg-[#070D22] text-slate-300">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8-Stage Horizontal Scrollable Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-3 h-full min-w-max">
          {KANBAN_STAGES.map((stageKey, idx) => {
            const meta = stageMeta[stageKey];
            const stageItems = filteredItems.filter(({ item }) => item.stage === stageKey);

            return (
              <div
                key={stageKey}
                className="w-72 sm:w-80 bg-[#070D22]/90 border border-slate-800/80 rounded-2xl flex flex-col h-full shadow-lg"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-800 bg-[#0B1432]/60 rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-slate-950"
                      style={{ backgroundColor: meta.color }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white font-display">
                        {lang === 'bn' ? meta.shortBn : meta.en}
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                        {lang === 'bn' ? meta.bn : meta.en}
                      </p>
                    </div>
                  </div>

                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: meta.color,
                      borderColor: `${meta.color}40`,
                      backgroundColor: `${meta.color}15`
                    }}
                  >
                    {stageItems.length}
                  </span>
                </div>

                {/* Column Body Cards Scrollable */}
                <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto pr-1">
                  {stageItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-600 text-xs border-2 border-dashed border-slate-800/60 rounded-xl p-4 text-center">
                      <span className="text-[11px]">
                        {lang === 'bn' ? 'এই ধাপে কোনো আইটেম নেই' : 'No items in this stage'}
                      </span>
                    </div>
                  ) : (
                    stageItems.map(({ item, customerName, orderNumber, promisedDate }) => {
                      const wood = woodTypeLabels[item.woodType];
                      const isReady = stageKey === 'READY_DISPATCH';
                      const isQCStage = stageKey === 'QC_PACKING';

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl bg-gradient-to-b from-[#0B1432] to-[#080E24] border transition-all duration-200 shadow-md group relative space-y-2.5 ${
                            item.qcStatus === 'REWORK_REQUIRED'
                              ? 'border-rose-500/70 bg-rose-950/20'
                              : item.priority === 'CRITICAL'
                              ? 'border-rose-500/50 hover:border-rose-400'
                              : item.priority === 'URGENT'
                              ? 'border-amber-500/40 hover:border-amber-400'
                              : 'border-slate-800 hover:border-cyan-500/40'
                          }`}
                        >
                          {/* Item Top Bar: UID, Priority, Wood Badge */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-[10px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                {item.id}
                              </span>

                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                                style={{
                                  color: wood.color,
                                  borderColor: `${wood.color}40`,
                                  backgroundColor: `${wood.color}15`
                                }}
                              >
                                {wood.code}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                priorityLabels[item.priority].badge
                              }`}
                            >
                              {priorityLabels[item.priority][lang]}
                            </span>
                          </div>

                          {/* Item Title & Customer */}
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                              {item.itemName}
                            </h4>
                            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                              <span className="truncate">{customerName}</span>
                              <span className="font-mono text-slate-500 text-[10px]">{orderNumber}</span>
                            </div>
                          </div>

                          {/* Measurement / CNC Spec Box */}
                          <div className="p-2 rounded-lg bg-[#040817] border border-slate-800/80 space-y-1 text-[11px]">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-slate-400 text-[10px]">পরিমাপ (H×W×T):</span>
                              <span className="font-mono font-bold text-cyan-300">
                                {item.dimensions.height}" × {item.dimensions.width}" × {item.dimensions.thickness}"
                              </span>
                            </div>

                            {item.designCode && (
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400 text-[10px]">নকশা কোড:</span>
                                <span className="font-mono text-amber-300 truncate max-w-[130px]">
                                  {item.designCode}
                                </span>
                              </div>
                            )}

                            {item.assignedWorker && (
                              <div className="flex items-center justify-between text-slate-400 text-[10px] pt-0.5 border-t border-slate-800/50">
                                <span>কারিগর:</span>
                                <span className="text-slate-300 truncate">{item.assignedWorker}</span>
                              </div>
                            )}
                          </div>

                          {/* QC Rework Alert Message if any */}
                          {item.qcStatus === 'REWORK_REQUIRED' && (
                            <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-[10px] text-rose-300 flex items-start gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">রিওয়ার্ক নোট:</span> {item.qcNotes}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons: 1-Click Advance, QC Rework, Print Ticket */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                            {/* Advance Button */}
                            <button
                              onClick={() => advanceItemStage(item.id)}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow transition-all active:scale-95 ${
                                isReady
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                  : isQCStage
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950'
                              }`}
                            >
                              <span>
                                {isReady
                                  ? lang === 'bn' ? 'ডেলিভারি কনফার্ম' : 'Dispatch'
                                  : isQCStage
                                  ? lang === 'bn' ? 'QC পাস ও প্যাকিং' : 'Pass QC'
                                  : lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Stage'}
                              </span>
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            {/* QC Fail / Rework Trigger */}
                            <button
                              onClick={() => setReworkModalItem(item)}
                              title="QC Rework (Send back)"
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Job Ticket */}
                            <button
                              onClick={() => setSelectedItemForTicket(item)}
                              title="Print Job Ticket"
                              className="p-1.5 rounded-lg bg-[#070D22] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
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
            );
          })}
        </div>
      </div>

      {/* QC Rework Modal */}
      {reworkModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070D22] border border-rose-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{lang === 'bn' ? 'কোয়ালিটি রিজেক্ট ও রিওয়ার্ক পাঠানো' : 'QC Fail & Return for Rework'}</span>
              </div>
              <button
                onClick={() => setReworkModalItem(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#0B1432] rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white">{reworkModalItem.itemName}</div>
              <div className="text-cyan-300 font-mono text-[11px]">ID: {reworkModalItem.id}</div>
              <div className="text-slate-400 text-[10px]">
                বর্তমান স্টেজ: {stageMeta[reworkModalItem.stage][lang]}
              </div>
            </div>

            <form onSubmit={handleReworkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? 'কোন স্টেজে ফেরত পাঠাবেন?' : 'Target Stage to return to:'}
                </label>
                <select
                  value={reworkTargetStage}
                  onChange={e => setReworkTargetStage(e.target.value as ProductionStage)}
                  className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none focus:border-rose-400"
                >
                  <option value="SIZING">সাইজিং ও প্ল্যানিং (Sizing & Planing)</option>
                  <option value="JOINERY">কাঠামো ও অ্যাসেম্বলিং (Joinery)</option>
                  <option value="CNC_CARVING">সিএনসি / খোদাই নকশা (CNC Carving)</option>
                  <option value="SANDING">স্যান্ডিং ও পুটিং ফিনিশ (Sanding & Prep)</option>
                  <option value="POLISHING">পলিশ ও কালার কোটিং (Polishing & Lacquer)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? 'ত্রুটি বা রিজেকশনের সুনির্দিষ্ট কারণ:' : 'Specific QC Defect Reason:'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reworkReason}
                  onChange={e => setReworkReason(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: স্যান্ডিং ফিনিশে দাগ রয়ে গেছে, অথবা পলিশে এয়ার বাবল উঠেছে...'
                      : 'e.g., Uneven sanding finish, lacquer bubble detected...'
                  }
                  className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none focus:border-rose-400 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReworkModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30"
                >
                  {lang === 'bn' ? 'রিওয়ার্কে ফেরত পাঠান' : 'Send to Rework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
