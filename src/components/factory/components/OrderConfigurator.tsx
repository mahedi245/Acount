import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { woodTypeLabels, productCategoryLabels, finishTypeLabels, priorityLabels } from '../utils/translations';
import { CustomerOrder, OrderItem, ProductCategory, WoodType, FinishType, PriorityLevel } from '../types';
import {
  Plus,
  Trash2,
  Save,
  Calendar,
  User,
  Phone,
  MapPin,
  Layers
} from 'lucide-react';

interface ConfigItemState {
  id: string;
  itemName: string;
  category: ProductCategory;
  woodType: WoodType;
  height: number;
  width: number;
  thickness: number;
  unit: 'inch' | 'mm';
  rebate: string;
  designCode: string;
  finishType: FinishType;
  lockPocket: boolean;
  hingeCutting: boolean;
  priority: PriorityLevel;
  quantity: number;
  assignedWorker: string;
}

export const OrderConfigurator: React.FC = () => {
  const { createNewOrder, lang, setActiveTab } = useFactory();

  // Customer header state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [siteLocation, setSiteLocation] = useState<string>('');
  const [promisedDeliveryDate, setPromisedDeliveryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // default 2 weeks
    return d.toISOString().split('T')[0];
  });
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Item list state
  const [items, setItems] = useState<ConfigItemState[]>([
    {
      id: `ITEM-${Math.floor(1000 + Math.random() * 9000)}-A`,
      itemName: '৩৯" × ৮১" চিটাগাং সেগুন সলিড মেইন ডোর',
      category: 'DOOR_SOLID',
      woodType: 'CTG_TEAK',
      height: 81,
      width: 39,
      thickness: 1.5,
      unit: 'inch',
      rebate: '1.5 x 0.5"',
      designCode: 'CNC-RF-104 (রয়্যাল ফ্লোরাল)',
      finishType: 'LACQUER_GLOSS',
      lockPocket: true,
      hingeCutting: true,
      priority: 'NORMAL',
      quantity: 1,
      assignedWorker: 'ওস্তাদ সেলিম'
    }
  ]);

  const addItemRow = () => {
    const nextLetter = String.fromCharCode(65 + items.length);
    const newItem: ConfigItemState = {
      id: `ITEM-${Math.floor(1000 + Math.random() * 9000)}-${nextLetter}`,
      itemName: '৪০" × ৮৩" চিটাগাং সেগুন চৌকাঠ (Frame)',
      category: 'FRAME_CHOUKHAT',
      woodType: 'CTG_TEAK',
      height: 83,
      width: 40,
      thickness: 2.75,
      unit: 'inch',
      rebate: '6" x 2.75"',
      designCode: 'STANDARD-REBATED',
      finishType: 'LACQUER_MATT',
      lockPocket: false,
      hingeCutting: true,
      priority: 'NORMAL',
      quantity: 1,
      assignedWorker: 'জামাল মিস্ত্রি'
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItemField = (idx: number, field: keyof ConfigItemState, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে কাস্টমারের নাম ও মোবাইল নম্বর লিখুন।' : 'Please enter Customer Name and Phone.');
      return;
    }

    const orderId = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const orderNo = `WO-${Math.floor(8000 + Math.random() * 2000)}`;
    const today = new Date().toISOString().split('T')[0];

    const formattedItems: OrderItem[] = items.map((it, idx) => ({
      id: it.id || `ITEM-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + idx)}`,
      orderId: orderId,
      itemName: it.itemName,
      category: it.category,
      woodType: it.woodType,
      stage: 'SEASONING',
      dimensions: {
        height: Number(it.height),
        width: Number(it.width),
        thickness: Number(it.thickness),
        unit: it.unit,
        rebate: it.rebate
      },
      designCode: it.designCode,
      finishType: it.finishType,
      lockPocket: it.lockPocket,
      hingeCutting: it.hingeCutting,
      priority: it.priority,
      qcStatus: 'PENDING',
      quantity: Number(it.quantity),
      assignedWorker: it.assignedWorker,
      qrCode: it.id,
      stageHistory: [
        {
          stage: 'SEASONING',
          timestamp: `${today} 10:00`,
          operator: 'অর্ডার এন্ট্রি ডেস্ক',
          note: 'নতুন অর্ডার বুকিং ও সিজনিং পাইপলাইনে অন্তর্ভুক্ত'
        }
      ]
    }));

    const newOrder: CustomerOrder = {
      id: orderId,
      orderNumber: orderNo,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim() || 'ঢাকা সাইট ডেলিভারি',
      siteLocation: siteLocation.trim() || customerName,
      orderDate: today,
      promisedDeliveryDate: promisedDeliveryDate,
      status: 'IN_PRODUCTION',
      notes: orderNotes,
      items: formattedItems
    };

    createNewOrder(newOrder);
    setActiveTab('kanban');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1500px] mx-auto">
      {/* Top Title Banner */}
      <div className="bg-gradient-to-r from-[#070D22] via-[#0B1432] to-[#070D22] border border-cyan-500/20 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-bold tracking-wider border border-cyan-500/30">
            ORDER ENTRY & SPECIFICATION ENGINE
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1">
            {lang === 'bn' ? 'নতুন কাস্টমার অর্ডার ও ডোর কনফিগারেশন' : 'New Customer Work Order & Door Specs'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'bn'
              ? 'নিখুঁত মাপজোখ, কাঠের ধরন, সিএনসি ডিজাইন কোড এবং পলিশ স্পেসিফিকেশন এন্ট্রি করুন'
              : 'Enter precise dimensions, wood species, CNC designs and polish finishes'}
          </p>
        </div>

        {/* Real-time Item Count Badge */}
        <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/30 flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'মোট পাল্লা ও চৌকাঠ' : 'Total Items'}</span>
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {totalQuantity} {lang === 'bn' ? 'টি' : 'Units'}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'ভিন্ন ডিজাইন লাইন' : 'Unique Lines'}</span>
            <div className="text-sm font-bold text-amber-400 font-mono">
              {items.length} {lang === 'bn' ? 'টি' : 'Types'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Header Info Card */}
        <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'bn' ? '১. কাস্টমার ও সাইট ডেলিভারি তথ্য' : '1. Customer & Delivery Site Details'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'কাস্টমারের নাম / প্রজেক্ট ইনচার্জ *' : 'Customer Name *'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="যেমন: ইঞ্জিঃ তারেক মাহমুদ"
                  className="w-full bg-[#070D22] border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'মোবাইল নম্বর (হোয়াটসঅ্যাপ) *' : 'Phone Number *'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="01712-XXXXXX"
                  className="w-full bg-[#070D22] border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'সম্ভাব্য ডেলিভারি ডেডলাইন *' : 'Promised Delivery Date *'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  required
                  value={promisedDeliveryDate}
                  onChange={e => setPromisedDeliveryDate(e.target.value)}
                  className="w-full bg-[#070D22] border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'প্রজেক্ট লোকেশন / সাইটের নাম' : 'Site Location'}
              </label>
              <input
                type="text"
                value={siteLocation}
                onChange={e => setSiteLocation(e.target.value)}
                placeholder="যেমন: উত্তরা সেক্টর-৪ রেসিডেন্সিয়াল"
                className="w-full bg-[#070D22] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'পূর্ণাঙ্গ ডেলিভারি ঠিকানা / সাইটের ঠিকানা' : 'Full Delivery Address'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="বাড়ি-৪২, রোড-১১, সেক্টর-৪, উত্তরা, ঢাকা"
                  className="w-full bg-[#070D22] border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {lang === 'bn' ? 'বিশেষ কারিগরি নোট ও নির্দেশনা' : 'Special Technical Notes'}
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              placeholder="যেমন: মেইন ডোরে এন্টিক ব্রাঞ্চ হ্যান্ডেল লক পকেট কাটতে হবে, চৌকাঠের খাঁজ ১.৫ x ০.৫ ইঞ্চি..."
              className="w-full bg-[#070D22] border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-slate-200 outline-none text-xs"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="glass-navy-card rounded-2xl p-5 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>
                {lang === 'bn'
                  ? '২. দরজা, চৌকাঠ ও ফার্নিচার আইটেমের তালিকা'
                  : '2. Door, Frame & Furniture Item Specifications'}
              </span>
            </h3>

            <button
              type="button"
              onClick={addItemRow}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? '+ নতুন আইটেম যোগ করুন' : '+ Add Item'}</span>
            </button>
          </div>

          {/* Dynamic Item Cards */}
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#070D22] border border-slate-700/80 hover:border-cyan-500/40 transition-all space-y-3 relative"
              >
                {/* Item Top Bar */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{item.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.priority}
                      onChange={e => updateItemField(idx, 'priority', e.target.value as PriorityLevel)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border outline-none ${priorityLabels[item.priority].badge}`}
                    >
                      <option value="NORMAL">Normal Priority</option>
                      <option value="URGENT">Urgent Priority</option>
                      <option value="CRITICAL">Critical / VIP</option>
                    </select>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid Inputs for Each Item */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Item Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'আইটেমের নাম / স্পেসিফিকেশন' : 'Item Description'}
                    </label>
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={e => updateItemField(idx, 'itemName', e.target.value)}
                      placeholder="৩৯ x ৮১ চিটাগাং সেগুন সলিড ডোর..."
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none focus:border-cyan-400 font-semibold"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                    </label>
                    <select
                      value={item.category}
                      onChange={e => updateItemField(idx, 'category', e.target.value)}
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none focus:border-cyan-400"
                    >
                      {Object.entries(productCategoryLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {lang === 'bn' ? v.bn : v.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Wood Type */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'কাঠের ধরন (Wood Type)' : 'Wood Species'}
                    </label>
                    <select
                      value={item.woodType}
                      onChange={e => updateItemField(idx, 'woodType', e.target.value)}
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-amber-300 font-bold outline-none focus:border-amber-400"
                    >
                      {Object.entries(woodTypeLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {lang === 'bn' ? v.bn : v.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dimensions: Height, Width, Thickness */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'উচ্চতা Height (ইঞ্চি)' : 'Height (inch)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.height}
                      onChange={e => updateItemField(idx, 'height', Number(e.target.value))}
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-cyan-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'প্রস্থ Width (ইঞ্চি)' : 'Width (inch)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.width}
                      onChange={e => updateItemField(idx, 'width', Number(e.target.value))}
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-cyan-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'পুরুত্ব / থিকনেস (ইঞ্চি)' : 'Thickness (inch)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.thickness}
                      onChange={e => updateItemField(idx, 'thickness', Number(e.target.value))}
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-cyan-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'সিএনসি নকশা কোড' : 'CNC Design Code'}
                    </label>
                    <input
                      type="text"
                      value={item.designCode}
                      onChange={e => updateItemField(idx, 'designCode', e.target.value)}
                      placeholder="CNC-RF-104"
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-amber-300 font-mono outline-none"
                    />
                  </div>

                  {/* Finish & Polish */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'পলিশ ও কালার ফিনিশ' : 'Polish Finish'}
                    </label>
                    <select
                      value={item.finishType}
                      onChange={e => updateItemField(idx, 'finishType', e.target.value)}
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
                    >
                      {Object.entries(finishTypeLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {lang === 'bn' ? v.bn : v.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'পরিমাণ (Quantity)' : 'Quantity (Pcs)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItemField(idx, 'quantity', Number(e.target.value))}
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold outline-none"
                    />
                  </div>

                  {/* Assigned Master */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lang === 'bn' ? 'দায়িত্বপ্রাপ্ত মিস্ত্রি / সেকশন' : 'Assigned Craftsman'}
                    </label>
                    <input
                      type="text"
                      value={item.assignedWorker}
                      onChange={e => updateItemField(idx, 'assignedWorker', e.target.value)}
                      placeholder="ওস্তাদ সেলিম..."
                      className="w-full bg-[#0B1432] border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
                    />
                  </div>

                  {/* Hardware Toggles */}
                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={item.lockPocket}
                        onChange={e => updateItemField(idx, 'lockPocket', e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 w-4 h-4"
                      />
                      <span>{lang === 'bn' ? 'লক পকেট কাটা' : 'Lock Pocket'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={item.hingeCutting}
                        onChange={e => updateItemField(idx, 'hingeCutting', e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 w-4 h-4"
                      />
                      <span>{lang === 'bn' ? 'কব্জা খাঁজ' : 'Hinge Groove'}</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <Save className="w-5 h-5" />
            <span>{lang === 'bn' ? 'অর্ডার সেভ ও প্রোডাকশনে পাঠান' : 'Save Order & Launch Production'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
