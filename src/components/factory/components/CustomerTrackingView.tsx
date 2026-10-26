import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { stageMeta, woodTypeLabels } from '../utils/translations';
import { CustomerOrder, ProductionStage } from '../types';
import {
  Search,
  UserCheck,
  Phone,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Clock,
  Layers,
  Truck,
  DoorOpen
} from 'lucide-react';

export const CustomerTrackingView: React.FC = () => {
  const {
    orders,
    lang,
    searchQuery,
    setSearchQuery,
    setSelectedOrderForChallan,
    setSelectedItemForTicket
  } = useFactory();

  const [localQuery, setLocalQuery] = useState<string>(searchQuery);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(() => {
    return orders.length > 0 ? orders[0] : null;
  });
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Search logic
  const query = (localQuery || searchQuery).trim().toLowerCase();

  const matchedOrders = orders.filter(ord => {
    if (!query) return true;
    return (
      ord.customerName.toLowerCase().includes(query) ||
      ord.customerPhone.toLowerCase().includes(query) ||
      ord.orderNumber.toLowerCase().includes(query) ||
      ord.siteLocation.toLowerCase().includes(query) ||
      ord.items.some(it => it.id.toLowerCase().includes(query) || it.itemName.toLowerCase().includes(query))
    );
  });

  const activeOrder = selectedOrder || (matchedOrders.length > 0 ? matchedOrders[0] : null);

  const handleGenerateWhatsAppText = () => {
    if (!activeOrder) return;

    let msg = `*KATHA & KABAT - কারখানা প্রোডাকশন আপডেট*\n`;
    msg += `শ্রদ্ধেয় *${activeOrder.customerName}* সাহেব,\n`;
    msg += `আপনার অর্ডার নং: *${activeOrder.orderNumber}* (${activeOrder.siteLocation})\n`;
    msg += `সম্ভাব্য ডেলিভারি ডেডলাইন: *${activeOrder.promisedDeliveryDate}*\n\n`;
    msg += `*আইটেমসমূহের বর্তমান কারখানা অগ্রগতি:*\n`;

    activeOrder.items.forEach((it, idx) => {
      const meta = stageMeta[it.stage];
      msg += `${idx + 1}. *${it.itemName}*\n`;
      msg += `   • সাইজ: ${it.dimensions.height}"×${it.dimensions.width}"×${it.dimensions.thickness}"\n`;
      msg += `   • বর্তমান ধাপ: *${meta.bn}* (ধাপ ${meta.step}/৮)\n`;
      if (it.stage === 'READY_DISPATCH') {
        msg += `   • স্ট্যাটাস: গাড়িতে লোডিং ও ডেলিভারির জন্য প্রস্তুত ✓\n`;
      }
    });

    if (activeOrder.notes) {
      msg += `\n*বিশেষ নির্দেশনা:* ${activeOrder.notes}\n`;
    }

    msg += `\nকারখানা হেল্পলাইন: Katha & Kabat MES Desk। ধন্যবাদ!`;

    navigator.clipboard.writeText(msg);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-[#070D22] via-[#0B1432] to-[#070D22] border border-cyan-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-bold text-white font-display">
              {lang === 'bn' ? 'কাস্টমার লাইভ ট্র্যাকিং ও সাপোর্ট ডোর ডেস্ক' : 'Customer Live Order Tracker'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'ফোন নম্বর বা নাম লিখে যেকোনো কাস্টমারের সকল দরজার লাইভ স্ট্যাটাস দেখুন'
                : 'Lookup customer by mobile or name to track individual door & frame progress'}
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={localQuery}
            onChange={e => {
              setLocalQuery(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder={
              lang === 'bn'
                ? 'কাস্টমার নাম, মোবাইল (01712...), বা অর্ডার নং...'
                : 'Search Name, Phone, or Order ID...'
            }
            className="w-full bg-[#040817] border border-cyan-500/40 focus:border-cyan-400 text-xs text-cyan-200 rounded-xl pl-10 pr-3 py-2.5 outline-none placeholder-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 4 Cols: Order List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {lang === 'bn' ? `ম্যাচিং অর্ডারসমূহ (${matchedOrders.length})` : `Matching Orders (${matchedOrders.length})`}
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {matchedOrders.map(order => {
              const isSelected = activeOrder?.id === order.id;
              const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#101E46] to-[#0B1432] border-cyan-400 shadow-xl shadow-cyan-950/40'
                      : 'bg-[#070D22] border-slate-800 hover:border-slate-700 hover:bg-[#0B1432]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{order.customerName}</span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span className="font-mono">{order.customerPhone}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>{totalItems} টি ডোর/চৌকাঠ</span>
                    <span className="text-amber-300 font-mono">
                      ডেলিভারি: {order.promisedDeliveryDate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Detailed Customer Tracking Dossier */}
        <div className="lg:col-span-8 space-y-5">
          {activeOrder ? (
            <div className="space-y-5">
              {/* Customer Dossier Card */}
              <div className="glass-navy-card rounded-2xl p-5 border border-cyan-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                        {activeOrder.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        বুকিং তারিখ: {activeOrder.orderDate}
                      </span>
                      <span className="text-xs text-amber-300 font-mono font-semibold">
                        • ডেলিভারি ডেডলাইন: {activeOrder.promisedDeliveryDate}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display">
                      {activeOrder.customerName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono">{activeOrder.customerPhone}</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{activeOrder.deliveryAddress}</span>
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Copy Button & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleGenerateWhatsAppText}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      {copiedNotice ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>WhatsApp স্ট্যাটাস কপি</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedOrderForChallan(activeOrder)}
                      className="px-3.5 py-2 rounded-xl bg-[#0B1432] hover:bg-[#101E46] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4 text-cyan-400" />
                      <span>চালান স্লিপ</span>
                    </button>
                  </div>
                </div>

                {/* Technical Overview Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#040817] border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">প্রজেক্ট লোকেশন</span>
                    <div className="text-sm font-bold text-white mt-0.5 truncate">
                      {activeOrder.siteLocation}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">মোট দরজার সংখ্যা</span>
                    <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">
                      {activeOrder.items.reduce((s, i) => s + i.quantity, 0)} টি
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">বর্তমান কারখানা স্ট্যাটাস</span>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">
                      {activeOrder.status === 'COMPLETED' ? 'সম্পূর্ণ ডেলিভার্ড' :
                       activeOrder.status === 'READY_FOR_DELIVERY' ? 'ডেলিভারি প্রস্তুত' :
                       activeOrder.status === 'PARTIALLY_READY' ? 'আংশিক প্রস্তুত' : 'প্রোডাকশনে চলমান'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Door / Frame Stage Pipeline Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <DoorOpen className="w-4 h-4" />
                    <span>আইটেম অনুযায়ী লাইভ অগ্রগতি ({activeOrder.items.length} টি মডেল)</span>
                  </span>
                </div>

                <div className="space-y-4">
                  {activeOrder.items.map((item, idx) => {
                    const currentStageObj = stageMeta[item.stage];
                    const woodObj = woodTypeLabels[item.woodType];
                    const currentStep = currentStageObj?.step || 1;

                    return (
                      <div
                        key={item.id}
                        className="glass-navy-card rounded-2xl p-4 border border-slate-700/80 space-y-4"
                      >
                        {/* Item Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-mono font-bold">
                              #{idx + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white">{item.itemName}</h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="font-mono text-cyan-400">{item.id}</span>
                                <span>•</span>
                                <span style={{ color: woodObj?.color || '#38bdf8' }} className="font-semibold">
                                  {woodObj ? woodObj[lang] : item.woodType}
                                </span>
                                <span>•</span>
                                <span className="font-mono">
                                  {item.dimensions.height}"×{item.dimensions.width}"×{item.dimensions.thickness}"
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-full border"
                              style={{
                                color: currentStageObj.color,
                                borderColor: `${currentStageObj.color}40`,
                                backgroundColor: `${currentStageObj.color}15`
                              }}
                            >
                              {lang === 'bn' ? currentStageObj.bn : currentStageObj.en}
                            </span>

                            <button
                              onClick={() => setSelectedItemForTicket(item)}
                              title="Print Sticker"
                              className="p-1.5 rounded-lg bg-[#040817] hover:bg-slate-800 border border-slate-700 text-slate-300"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 8-Stage Step Timeline Bar */}
                        <div className="relative pt-2 pb-1">
                          <div className="grid grid-cols-8 gap-1 text-center">
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
                            ).map((stg) => {
                              const sMeta = stageMeta[stg];
                              const isCompleted = currentStep > sMeta.step;
                              const isCurrent = currentStep === sMeta.step;

                              return (
                                <div key={stg} className="flex flex-col items-center space-y-1">
                                  <div
                                    className={`w-full h-2 rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-emerald-400'
                                        : isCurrent
                                        ? 'bg-cyan-400 animate-pulse'
                                        : 'bg-slate-800'
                                    }`}
                                  />
                                  <span
                                    className={`text-[9px] font-semibold leading-tight line-clamp-1 ${
                                      isCurrent
                                        ? 'text-cyan-300 font-bold'
                                        : isCompleted
                                        ? 'text-emerald-400'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {lang === 'bn' ? sMeta.shortBn : sMeta.en}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Last History Note */}
                        {item.stageHistory.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-[#040817] border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>
                                <span className="font-semibold text-slate-300">সর্বশেষ আপডেট:</span>{' '}
                                {item.stageHistory[item.stageHistory.length - 1].note || 'স্টেজ অগ্রগতি সম্পন্ন'}
                              </span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {item.stageHistory[item.stageHistory.length - 1].timestamp}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-navy-card rounded-2xl p-12 text-center border border-slate-800">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <div className="text-slate-400 text-xs font-semibold">কোনো কাস্টমার পাওয়া যায়নি</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
