import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels } from '../utils/translations';
import { CustomerOrder, OrderItem } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  Truck,
  CheckCircle2,
  Printer,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Scan,
  Check,
  DoorOpen
} from 'lucide-react';

export const DispatchManager: React.FC = () => {
  const {
    orders,
    lang,
    assignDispatch,
    selectedOrderForChallan,
    setSelectedOrderForChallan
  } = useFactory();

  // Find orders that have items ready for dispatch or partially ready
  const dispatchableOrders = orders.filter(ord =>
    ord.items.some(i => i.stage === 'READY_DISPATCH' || i.stage === 'QC_PACKING' || ord.status === 'DISPATCHED' || ord.status === 'COMPLETED')
  );

  const [activeOrder, setActiveOrder] = useState<CustomerOrder | null>(() => {
    if (selectedOrderForChallan) return selectedOrderForChallan;
    return dispatchableOrders.length > 0 ? dispatchableOrders[0] : (orders[0] || null);
  });

  const [driverName, setDriverName] = useState<string>('মোবারক হোসেন (ড্রাইভার)');
  const [vehicleNo, setVehicleNo] = useState<string>('ঢাকা মেট্রো-ন ১২-৮৮৭৬ (পিকআপ)');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => {
    if (activeOrder) {
      return activeOrder.items.filter(i => i.stage === 'READY_DISPATCH').map(i => i.id);
    }
    return [];
  });
  const [showPrintChallan, setShowPrintChallan] = useState<boolean>(false);

  const handleSelectOrder = (ord: CustomerOrder) => {
    setActiveOrder(ord);
    setSelectedItemIds(ord.items.filter(i => i.stage === 'READY_DISPATCH').map(i => i.id));
  };

  const toggleItemCheck = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDispatchConfirm = () => {
    if (!activeOrder) return;
    if (selectedItemIds.length === 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে অন্তত ১টি আইটেম লোডিংয়ের জন্য সিলেক্ট করুন।' : 'Please select at least 1 item for loading.');
      return;
    }
    assignDispatch(activeOrder.id, driverName, vehicleNo, selectedItemIds);
    setShowPrintChallan(true);
  };

  const printableOrder = activeOrder;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#070D22] via-[#0B1432] to-[#070D22] border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-bold text-white font-display">
              {lang === 'bn'
                ? 'ডেলিভারি লোডিং ও চালান গেটপাস ইনচার্জ'
                : 'Dispatch & Delivery Challan Gate'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'ট্রাকে দরজা ও চৌকাঠ লোডিং ভেরিফিকেশন এবং অফিশিয়াল ডেলিভারি চালান প্রস্তুতকরণ'
                : 'Truck loading checklist and official delivery challan / gatepass generation'}
            </p>
          </div>
        </div>

        {activeOrder && (
          <button
            onClick={() => setShowPrintChallan(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ডেলিভারি চালান প্রিন্ট' : 'Print Delivery Challan'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Orders & Loading Check */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 4 Cols: Order Picker */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {lang === 'bn' ? 'ডেলিভারি রেডি অর্ডার তালিকা' : 'Ready for Dispatch Orders'}
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {orders.map(order => {
              const isSelected = activeOrder?.id === order.id;
              const readyItems = order.items.filter(i => i.stage === 'READY_DISPATCH').length;
              const deliveredItems = order.items.filter(i => i.stage === 'DELIVERED').length;

              return (
                <button
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-[#101E46] border-emerald-400 shadow-xl shadow-emerald-950/40'
                      : 'bg-[#070D22] border-slate-800 hover:border-slate-700 hover:bg-[#0B1432]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{order.customerName}</span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    {order.siteLocation}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-emerald-400 font-semibold">
                      {readyItems} টি রেডি
                      {deliveredItems > 0 && ` (${deliveredItems} টি প্রেরিত)`}
                    </span>
                    <span className="font-mono text-amber-300">
                      {order.promisedDeliveryDate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Truck Loading Station & Driver Assignment */}
        <div className="lg:col-span-8 space-y-5">
          {activeOrder ? (
            <div className="space-y-5">
              {/* Vehicle & Driver Info Card */}
              <div className="glass-navy-card rounded-2xl p-5 border border-emerald-500/30 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? '১. ডেলিভারি গাড়ি ও ড্রাইভার অ্যাসাইনমেন্ট' : '1. Delivery Vehicle & Driver'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'bn' ? 'ড্রাইভারের নাম ও ফোন' : 'Driver Name & Phone'}
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      placeholder="মোবারক হোসেন (০১৭৮৮-XXXXXX)"
                      className="w-full bg-[#070D22] border border-slate-700 focus:border-emerald-400 rounded-xl p-2.5 text-slate-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'bn' ? 'গাড়ির নম্বর / পিকআপ ভ্যান' : 'Vehicle Number'}
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={e => setVehicleNo(e.target.value)}
                      placeholder="ঢাকা মেট্রো-ন ১২-৮৮৭৬"
                      className="w-full bg-[#070D22] border border-slate-700 focus:border-emerald-400 rounded-xl p-2.5 text-slate-200 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Truck Loading Checklist Card */}
              <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'bn' ? '২. ট্রাকে লোডিং চেকলিস্ট (জিরো-মিসিং ভেরিফিকেশন)' : '2. Truck Loading Checklist'}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'bn'
                        ? 'যেসব আইটেম গাড়িতে তোলা হচ্ছে সেগুলো টিক দিন বা কিউআর স্ক্যান করুন'
                        : 'Check items as they are physically loaded onto the truck'}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {selectedItemIds.length} of {activeOrder.items.length} Loaded
                  </span>
                </div>

                {/* Items Checklist */}
                <div className="space-y-2.5">
                  {activeOrder.items.map(item => {
                    const isChecked = selectedItemIds.includes(item.id);
                    const isDelivered = item.stage === 'DELIVERED';
                    const isReady = item.stage === 'READY_DISPATCH';
                    const wood = woodTypeLabels[item.woodType];

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemCheck(item.id)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                            : 'bg-[#070D22] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                              isChecked
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                : 'border-slate-700 bg-[#0B1432]'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{item.itemName}</span>
                              <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                {item.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span style={{ color: wood.color }} className="font-semibold">{wood[lang]}</span>
                              <span>•</span>
                              <span className="font-mono">{item.dimensions.height}"×{item.dimensions.width}"×{item.dimensions.thickness}"</span>
                              <span>•</span>
                              <span className="text-slate-300 font-bold">{item.quantity} টি</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isDelivered
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : isReady
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {isDelivered ? 'ডেলিভার্ড' : isReady ? 'লোডের জন্য প্রস্তুত' : 'প্রোডাকশনে'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dispatch Confirm Button */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={handleDispatchConfirm}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
                  >
                    <Truck className="w-5 h-5" />
                    <span>
                      {lang === 'bn'
                        ? 'গাড়ি ডিসপ্যাচ ও ডেলিভারি চালান প্রিন্ট করুন'
                        : 'Confirm Dispatch & Generate Challan'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-navy-card rounded-2xl p-12 text-center border border-slate-800">
              <Truck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <div className="text-slate-400 text-xs">কোনো অর্ডার সিলেক্ট করা নেই</div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Delivery Challan Modal */}
      {showPrintChallan && printableOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl p-8 space-y-6 relative print-page animate-in fade-in zoom-in-95">
            {/* Top Toolbar for Screen View */}
            <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Official Delivery Challan & Gate Pass (ডেলিভারি চালান)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন (Print)</span>
                </button>
                <button
                  onClick={() => setShowPrintChallan(false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>
            </div>

            {/* PRINTABLE CHALLAN BODY */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
                    KATHA & KABAT WOODWORKS
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    প্রিমিয়াম সলিড উডেন ডোর, চৌকাঠ ও লাক্সারি ফার্নিচার কারখানা
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    কারখানা: তেজগাঁও শিল্প এলাকা, ঢাকা | হটলাইন: +৮৮০১৭০০-০০০০০০ | ইমেইল: info@woodcraft.com
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                    ডেলিভারি চালান ও গেট পাস
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-1.5">
                    চালান নং: {printableOrder.challanNumber || `CH-${Math.floor(1000 + Math.random() * 9000)}`}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    তারিখ: {new Date().toLocaleDateString('bn-BD')}
                  </div>
                </div>
              </div>

              {/* Customer & Logistics Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">প্রাপকের বিবরণ:</span>
                  <div className="font-bold text-slate-900 text-sm">{printableOrder.customerName}</div>
                  <div className="text-slate-700 font-mono">{printableOrder.customerPhone}</div>
                  <div className="text-slate-600 mt-0.5">{printableOrder.deliveryAddress}</div>
                  <div className="text-slate-800 font-semibold mt-1">সাইট: {printableOrder.siteLocation}</div>
                </div>

                <div className="border-l border-slate-200 pl-4 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">পরিবহন ও গেট পাস:</span>
                  <div className="text-slate-800">
                    <span className="font-semibold">গাড়ির নং:</span> {vehicleNo}
                  </div>
                  <div className="text-slate-800">
                    <span className="font-semibold">ড্রাইভার:</span> {driverName}
                  </div>
                  <div className="text-slate-800 font-mono">
                    <span className="font-semibold">অর্ডার নং:</span> {printableOrder.orderNumber}
                  </div>
                  <div className="text-slate-800 font-mono">
                    <span className="font-semibold">গেট পাস আইডি:</span> {printableOrder.gatePassId || 'GP-2026-10-08-01'}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-900 text-white font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 border border-slate-300">নং</th>
                    <th className="p-2.5 border border-slate-300">আইটেম কোড</th>
                    <th className="p-2.5 border border-slate-300">বিবরণ ও কাঠের ধরন</th>
                    <th className="p-2.5 border border-slate-300">পরিমাপ (ইঞ্চি)</th>
                    <th className="p-2.5 border border-slate-300">নকশা / পলিশ</th>
                    <th className="p-2.5 border border-slate-300 text-center">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printableOrder.items
                    .filter(i => selectedItemIds.length === 0 || selectedItemIds.includes(i.id))
                    .map((it, idx) => (
                      <tr key={it.id} className="text-slate-800">
                        <td className="p-2 border border-slate-200 font-mono">{idx + 1}</td>
                        <td className="p-2 border border-slate-200 font-mono font-bold">{it.id}</td>
                        <td className="p-2 border border-slate-200">
                          <div className="font-bold">{it.itemName}</div>
                          <div className="text-[10px] text-slate-600">
                            {woodTypeLabels[it.woodType].bn}
                          </div>
                        </td>
                        <td className="p-2 border border-slate-200 font-mono">
                          {it.dimensions.height}" × {it.dimensions.width}" × {it.dimensions.thickness}"
                        </td>
                        <td className="p-2 border border-slate-200 text-[11px]">
                          {it.designCode || 'Standard'} • {it.finishType}
                        </td>
                        <td className="p-2 border border-slate-200 text-center font-bold">
                          {it.quantity} টি
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* QR Verification & Signatures */}
              <div className="pt-6 grid grid-cols-3 gap-6 items-end">
                <div className="flex items-center gap-3">
                  <div className="p-1 border border-slate-300 rounded bg-white">
                    <QRCodeSVG value={`CHALLAN-${printableOrder.id}-${printableOrder.challanNumber}`} size={56} />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    ডিজিটাল গেটপাস ও ডেলিভারি ভেরিফিকেশন QR
                  </span>
                </div>

                <div className="text-center">
                  <div className="border-t border-slate-800 pt-1 text-[11px] font-bold text-slate-800">
                    ফ্যাক্টরি ইনচার্জ / ডিসপ্যাচ
                  </div>
                  <div className="text-[9px] text-slate-500">স্বাক্ষর ও সিল</div>
                </div>

                <div className="text-center">
                  <div className="border-t border-slate-800 pt-1 text-[11px] font-bold text-slate-800">
                    সাইট রিসিভার / কাস্টমার
                  </div>
                  <div className="text-[9px] text-slate-500">স্বাক্ষর ও তারিখ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
