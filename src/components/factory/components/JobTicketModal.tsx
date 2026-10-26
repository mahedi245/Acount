import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels, finishTypeLabels, productCategoryLabels } from '../utils/translations';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Check, DoorOpen, ShieldCheck } from 'lucide-react';

export const JobTicketModal: React.FC = () => {
  const { selectedItemForTicket, setSelectedItemForTicket, orders, lang } = useFactory();

  if (!selectedItemForTicket) return null;

  const parentOrder = orders.find(ord => ord.id === selectedItemForTicket.orderId);
  const wood = woodTypeLabels[selectedItemForTicket.woodType];
  const currentStage = stageMeta[selectedItemForTicket.stage];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 relative print-page animate-in fade-in zoom-in-95 border border-slate-300">
        {/* Screen Top Bar */}
        <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {lang === 'bn' ? 'ফ্যাক্টরি জব টিকিট স্টিকার (Job Ticket)' : 'Factory Production Sticker'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্রিন্ট করুন' : 'Print'}</span>
            </button>
            <button
              onClick={() => setSelectedItemForTicket(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE JOB TICKET STICKER (High contrast for carpenters) */}
        <div className="border-2 border-dashed border-slate-900 p-4 rounded-xl space-y-3 bg-slate-50">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-2">
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 font-display">
                KATHA & KABAT WOODWORKS
              </h2>
              <span className="text-[10px] text-slate-600 font-semibold block">
                FACTORY JOB TICKET / ট্র্যাকিং টিকিট
              </span>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                {selectedItemForTicket.id}
              </span>
              <div className="text-[10px] font-mono text-slate-600 font-bold mt-0.5">
                {parentOrder?.orderNumber}
              </div>
            </div>
          </div>

          {/* Customer & Site */}
          <div className="text-xs space-y-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">কাস্টমার:</span>
              <span className="font-bold text-slate-900">{parentOrder?.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">সাইট লোকেশন:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {parentOrder?.siteLocation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">ডেলিভারি ডেট:</span>
              <span className="font-mono font-bold text-slate-900">
                {parentOrder?.promisedDeliveryDate}
              </span>
            </div>
          </div>

          {/* GIANT MEASUREMENT & SPECS BOX */}
          <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5">
            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
              কাটিং ও প্ল্যানিং মাপ (H × W × T):
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {selectedItemForTicket.dimensions.height}" × {selectedItemForTicket.dimensions.width}" × {selectedItemForTicket.dimensions.thickness}"
            </div>
            <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700">
              <span className="font-bold text-amber-300">{wood.bn}</span>
              <span>{productCategoryLabels[selectedItemForTicket.category].bn}</span>
            </div>
          </div>

          {/* CNC, Finish & Fittings */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">নকশা / CNC কোড:</span>
              <span className="font-mono font-bold text-slate-900 block truncate">
                {selectedItemForTicket.designCode || 'Standard Plain'}
              </span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">পলিশের ধরন:</span>
              <span className="font-semibold text-slate-900 block truncate">
                {finishTypeLabels[selectedItemForTicket.finishType].bn}
              </span>
            </div>
          </div>

          {/* Hardware Checks */}
          <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-200">
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${selectedItemForTicket.lockPocket ? 'bg-slate-900 text-white' : 'border border-slate-400'}`}>
                {selectedItemForTicket.lockPocket ? '✓' : ''}
              </span>
              <span>হ্যান্ডেল লক পকেট</span>
            </span>

            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${selectedItemForTicket.hingeCutting ? 'bg-slate-900 text-white' : 'border border-slate-400'}`}>
                {selectedItemForTicket.hingeCutting ? '✓' : ''}
              </span>
              <span>কব্জা খাঁজ</span>
            </span>
          </div>

          {/* QR Code & Barcode Section */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">মোবাইল স্ক্যান QR:</span>
              <div className="text-xs font-mono font-black text-slate-900 mt-0.5">
                {selectedItemForTicket.id}
              </div>
              <span className="text-[9px] text-slate-400">
                ফ্লোর টার্মিনালে স্ক্যান করুন
              </span>
            </div>

            <div className="p-1 bg-white border border-slate-300 rounded shadow-sm">
              <QRCodeSVG value={selectedItemForTicket.qrCode} size={64} level="H" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
