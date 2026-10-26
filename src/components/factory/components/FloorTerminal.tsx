import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels, finishTypeLabels, productCategoryLabels, priorityLabels } from '../utils/translations';
import { soundFx } from '../utils/audio';
import { OrderItem, ProductionStage } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Scan,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  Ruler,
  Maximize2,
  Printer,
  History,
  Tag,
  Key,
  Flame,
  Search,
  Check
} from 'lucide-react';

export const FloorTerminal: React.FC = () => {
  const {
    orders,
    lang,
    advanceItemStage,
    reworkQCItem,
    setSelectedItemForTicket,
    getItemById
  } = useFactory();

  const [scanInput, setScanInput] = useState<string>('');
  const [activeItem, setActiveItem] = useState<OrderItem | null>(() => {
    // Default to first active item for smooth demo
    for (const ord of orders) {
      if (ord.items.length > 0) return ord.items[0];
    }
    return null;
  });
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [operatorName, setOperatorName] = useState<string>('ওস্তাদ সেলিম (সুপারভাইজার)');
  const [stageNote, setStageNote] = useState<string>('');
  const [showReworkDialog, setShowReworkDialog] = useState<boolean>(false);
  const [reworkReason, setReworkReason] = useState<string>('');
  const [reworkStage, setReworkStage] = useState<ProductionStage>('SANDING');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Flatten active items for quick selection on the factory floor
  const activeItemsList: Array<{
    item: OrderItem;
    customerName: string;
    orderNo: string;
  }> = [];

  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.stage !== 'DELIVERED') {
        activeItemsList.push({
          item,
          customerName: order.customerName,
          orderNo: order.orderNumber
        });
      }
    });
  });

  const handleManualScan = (idToLookup?: string) => {
    const targetId = idToLookup || scanInput;
    if (!targetId.trim()) return;

    soundFx.playScanBeep();
    const result = getItemById(targetId.trim());

    if (result) {
      setActiveItem(result.item);
      setScanInput('');
      setFeedbackToast(lang === 'bn' ? '✓ কিউআর কোড স্ক্যান সফল!' : '✓ QR Code Scanned!');
      setTimeout(() => setFeedbackToast(null), 3000);
    } else {
      soundFx.playErrorBuzz();
      setFeedbackToast(lang === 'bn' ? '⚠ কোনো আইটেম পাওয়া যায়নি!' : '⚠ Item Not Found!');
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  const handleAdvance = () => {
    if (!activeItem) return;
    advanceItemStage(activeItem.id, stageNote);
    setStageNote('');
    setFeedbackToast(lang === 'bn' ? '✓ পরবর্তী ধাপে সফলভাবে আপডেট হয়েছে!' : '✓ Advanced to next stage!');
    setTimeout(() => setFeedbackToast(null), 3500);

    // Refresh active item from updated state
    setTimeout(() => {
      const refreshed = getItemById(activeItem.id);
      if (refreshed) {
        setActiveItem(refreshed.item);
      }
    }, 100);
  };

  const handleRework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !reworkReason.trim()) return;
    reworkQCItem(activeItem.id, reworkStage, reworkReason);
    setShowReworkDialog(false);
    setReworkReason('');
    setFeedbackToast(lang === 'bn' ? '⚠ রিওয়ার্কে ফেরত পাঠানো হয়েছে' : '⚠ Sent to rework');
    setTimeout(() => setFeedbackToast(null), 3500);

    setTimeout(() => {
      const refreshed = getItemById(activeItem.id);
      if (refreshed) {
        setActiveItem(refreshed.item);
      }
    }, 100);
  };

  // Find parent order of active item
  const activeOrder = activeItem
    ? orders.find(ord => ord.id === activeItem.orderId)
    : null;

  const currentStageMeta = activeItem ? stageMeta[activeItem.stage] : null;
  const woodInfo = activeItem ? woodTypeLabels[activeItem.woodType] : null;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-16 right-6 z-50 bg-cyan-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-cyan-300 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Terminal Top Bar */}
      <div className="bg-gradient-to-r from-[#070D22] via-[#0B1432] to-[#070D22] border border-cyan-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-inner">
            <Scan className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 text-[10px] font-bold tracking-wider border border-cyan-500/30">
                FACTORY FLOOR TERMINAL
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {lang === 'bn' ? 'অনলাইন ফ্লোর সিঙ্ক' : 'Online'}
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-white font-display">
              {lang === 'bn'
                ? 'কারিগর ও সুপারভাইজার ফ্লোর টার্মিনাল'
                : 'Carpenter & Floor Supervisor Terminal'}
            </h2>
          </div>
        </div>

        {/* Quick QR Barcode Scanner Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualScan()}
              placeholder={
                lang === 'bn'
                  ? 'QR / বারকোড স্ক্যান বা আইডি টাইপ করুন (যেমন ITEM-8101-A)...'
                  : 'Scan QR Barcode or type UID...'
              }
              className="w-full bg-[#040817] border border-cyan-500/40 focus:border-cyan-400 text-xs font-mono text-cyan-300 rounded-xl pl-9 pr-3 py-2.5 placeholder-slate-500 outline-none"
            />
          </div>

          <button
            onClick={() => handleManualScan()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
          >
            <Scan className="w-4 h-4" />
            <span>{lang === 'bn' ? 'স্ক্যান করুন' : 'Scan'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left 8 Cols Active Item Terminal, Right 4 Cols Quick Items Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Loaded Item Dossier & Big Stage Controls */}
        <div className="lg:col-span-8 space-y-5">
          {activeItem ? (
            <div className="glass-navy-card rounded-2xl p-5 border border-cyan-500/30 space-y-5 shadow-2xl relative">
              {/* Header: Item Identity & Category */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono font-bold text-xs bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/40">
                      UID: {activeItem.id}
                    </span>

                    {woodInfo && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg border"
                        style={{
                          color: woodInfo.color,
                          borderColor: `${woodInfo.color}50`,
                          backgroundColor: `${woodInfo.color}15`
                        }}
                      >
                        {lang === 'bn' ? woodInfo.bn : woodInfo.en}
                      </span>
                    )}

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border uppercase ${
                        priorityLabels[activeItem.priority].badge
                      }`}
                    >
                      {priorityLabels[activeItem.priority][lang]}
                    </span>
                  </div>

                  <h3 className="text-lg lg:text-xl font-bold text-white font-display">
                    {activeItem.itemName}
                  </h3>

                  {activeOrder && (
                    <p className="text-xs text-slate-400 mt-1">
                      <span className="text-slate-300 font-semibold">{activeOrder.customerName}</span> ({activeOrder.customerPhone}) •{' '}
                      <span className="font-mono text-cyan-400">{activeOrder.orderNumber}</span> •{' '}
                      <span className="text-amber-300 font-semibold">{activeOrder.siteLocation}</span>
                    </p>
                  )}
                </div>

                {/* QR Code Graphic */}
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/95 border border-slate-600 shadow shrink-0">
                  <QRCodeSVG value={activeItem.qrCode} size={64} level="M" />
                  <span className="text-[9px] font-mono text-slate-900 font-bold mt-1">
                    {activeItem.id}
                  </span>
                </div>
              </div>

              {/* GIANT DIMENSIONS & WOOD SPECS (MISTAKE-PROOFING) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#040817] border border-cyan-500/30 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {lang === 'bn' ? 'উচ্চতা (Height)' : 'Height'}
                  </span>
                  <div className="text-2xl font-bold text-cyan-300 font-mono">
                    {activeItem.dimensions.height}"
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {(activeItem.dimensions.height * 25.4).toFixed(0)} mm
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040817] border border-cyan-500/30 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {lang === 'bn' ? 'প্রস্থ (Width)' : 'Width'}
                  </span>
                  <div className="text-2xl font-bold text-cyan-300 font-mono">
                    {activeItem.dimensions.width}"
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {(activeItem.dimensions.width * 25.4).toFixed(0)} mm
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040817] border border-cyan-500/30 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {lang === 'bn' ? 'পুরুত্ব (Thickness)' : 'Thickness'}
                  </span>
                  <div className="text-2xl font-bold text-cyan-300 font-mono">
                    {activeItem.dimensions.thickness}"
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {(activeItem.dimensions.thickness * 25.4).toFixed(0)} mm
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040817] border border-cyan-500/30 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {lang === 'bn' ? 'পরিমাণ (Qty)' : 'Quantity'}
                  </span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {activeItem.quantity} {lang === 'bn' ? 'টি' : 'Pcs'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {productCategoryLabels[activeItem.category][lang]}
                  </span>
                </div>
              </div>

              {/* Secondary Specs: CNC Code, Finish, Lock Pocket */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B1432] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'নকশা / সিএনসি কোড' : 'CNC Design Code'}</span>
                  <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">
                    {activeItem.designCode || 'Standard Plain'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1432] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'পলিশ ও ফিনিশ' : 'Finish Type'}</span>
                  <span className="font-semibold text-slate-200 text-sm mt-0.5 block">
                    {finishTypeLabels[activeItem.finishType][lang]}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1432] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'ফিটিংস / লক পকেট' : 'Fittings'}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${activeItem.lockPocket ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {activeItem.lockPocket ? '✓ হ্যান্ডেল লক পকেট' : 'লক পকেট নেই'}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${activeItem.hingeCutting ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {activeItem.hingeCutting ? '✓ কব্জা খাঁজ' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* CURRENT STAGE HIGHLIGHT & PROGRESSION */}
              {currentStageMeta && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B1432] via-[#101E46] to-[#0B1432] border-2 border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        CURRENT PRODUCTION STAGE #{currentStageMeta.step} of 9
                      </span>
                      <div className="text-xl font-bold text-white font-display mt-0.5 flex items-center gap-2">
                        <span>{lang === 'bn' ? currentStageMeta.bn : currentStageMeta.en}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {lang === 'bn' ? currentStageMeta.descriptionBn : currentStageMeta.en}
                      </p>
                    </div>

                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-slate-950 shrink-0 shadow-lg"
                      style={{ backgroundColor: currentStageMeta.color }}
                    >
                      {currentStageMeta.step}
                    </div>
                  </div>

                  {/* Stage Operator Note Input */}
                  <div className="pt-2 border-t border-slate-700/60">
                    <input
                      type="text"
                      value={stageNote}
                      onChange={e => setStageNote(e.target.value)}
                      placeholder={
                        lang === 'bn'
                          ? 'এই স্টেজের বিশেষ কাজের মন্তব্য বা সাইজ আপডেট লিখুন (ঐচ্ছিক)...'
                          : 'Add stage remark / inspection note...'
                      }
                      className="w-full bg-[#040817] border border-slate-700 focus:border-cyan-400 text-xs text-slate-200 rounded-xl p-2.5 outline-none placeholder-slate-500"
                    />
                  </div>

                  {/* BIG TOUCH ACTION BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleAdvance}
                      className="py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span>{lang === 'bn' ? '১-ট্যাপে পরবর্তী ধাপে পাঠান' : 'Advance Next Stage'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setShowReworkDialog(true)}
                      className="py-4 px-4 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-5 h-5 text-rose-400" />
                      <span>{lang === 'bn' ? 'QC রিজেক্ট / রিওয়ার্কে পাঠান' : 'QC Fail / Send to Rework'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Stage History Timeline */}
              <div className="p-4 rounded-xl bg-[#040817] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <History className="w-4 h-4" />
                    {lang === 'bn' ? 'কাজের ইতিহাস ও লগ' : 'Stage Progression Log'}
                  </span>
                  <button
                    onClick={() => setSelectedItemForTicket(activeItem)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'জব টিকিট স্টিকার প্রিন্ট' : 'Print Sticker'}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeItem.stageHistory.map((log, lIdx) => (
                    <div
                      key={lIdx}
                      className="flex items-start justify-between gap-3 text-xs p-2 rounded-lg bg-[#070D22] border border-slate-800"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-bold text-white">
                            {stageMeta[log.stage] ? stageMeta[log.stage][lang] : log.stage}
                          </span>
                          <span className="text-slate-400 block text-[11px]">
                            {log.operator} {log.note && `• ${log.note}`}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-navy-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
              <QrCode className="w-16 h-16 text-cyan-400 mx-auto opacity-60 animate-bounce" />
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'কোনো আইটেম সিলেক্ট বা স্ক্যান করা হয়নি' : 'No Item Scanned Yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'ডান পাশের তালিকা থেকে কোনো দরজা সিলেক্ট করুন অথবা উপরে কিউআর কোড স্ক্যান করুন।'
                  : 'Select an active item from the right side or scan a QR barcode above.'}
              </p>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Active Floor Items Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-navy-card rounded-2xl p-4 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'ফ্লোরে চলমান আইটেম লিস্ট' : 'Active Floor Items'}</span>
              </h3>
              <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                {activeItemsList.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {activeItemsList.map(({ item, customerName, orderNo }) => {
                const isSelected = activeItem?.id === item.id;
                const meta = stageMeta[item.stage];
                const wood = woodTypeLabels[item.woodType];

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundFx.playScanBeep();
                      setActiveItem(item);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-150 space-y-1.5 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-950/50'
                        : 'bg-[#070D22] border-slate-800 hover:border-slate-600 hover:bg-[#0B1432]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-cyan-300">
                        {item.id}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: meta.color,
                          backgroundColor: `${meta.color}15`
                        }}
                      >
                        {lang === 'bn' ? meta.shortBn : meta.en}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white line-clamp-1">
                      {item.itemName}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="truncate max-w-[120px]">{customerName}</span>
                      <span className="font-mono text-cyan-400">
                        {item.dimensions.height}"×{item.dimensions.width}"×{item.dimensions.thickness}"
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QC Rework Modal */}
      {showReworkDialog && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070D22] border border-rose-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{lang === 'bn' ? 'কোয়ালিটি রিজেক্ট ও রিওয়ার্ক' : 'QC Rejection & Rework'}</span>
              </div>
              <button
                onClick={() => setShowReworkDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRework} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? 'কোন স্টেজে ফেরত যাবে?' : 'Return to stage:'}
                </label>
                <select
                  value={reworkStage}
                  onChange={e => setReworkStage(e.target.value as ProductionStage)}
                  className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
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
                  {lang === 'bn' ? 'রিজেকশনের সুনির্দিষ্ট কারণ:' : 'Reason:'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reworkReason}
                  onChange={e => setReworkReason(e.target.value)}
                  placeholder={lang === 'bn' ? 'ত্রুটির বিবরণ দিন...' : 'Describe defect...'}
                  className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReworkDialog(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold"
                >
                  {lang === 'bn' ? 'কনফার্ম করুন' : 'Confirm Rework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
