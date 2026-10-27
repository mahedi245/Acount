'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calculator,
  Info,
  CheckCircle2,
  Trees,
  Landmark,
  ShoppingBag,
  Calendar,
  DollarSign,
  Target,
  Pencil,
  Sparkles,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderItem, WoodSpecies, ItemType, PolishType, DoorDesign, PaymentRecord } from '@/types';
import { calculateSawnWoodCft } from '@/utils/cftCalculations';
import { formatCurrency, formatCft } from '@/utils/currency';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { getTodayIsoDate, addDaysToDate } from '@/utils/dateUtils';
import {
  translateWoodSpecies,
  translatePolishType,
  translateDoorDesign,
  translateItemType,
} from '@/translations/dict';

const WOOD_SPECIES_OPTIONS: WoodSpecies[] = [
  'Chittagong Teak (চিটাগাং সেগুন)',
  'Burma Teak (বার্মা সেগুন)',
  'Gamari (গামারি)',
  'Mahogany (মেহগনি)',
  'Shil Karoi (শীল কড়ই)',
  'Garjan (গর্জন)',
  'Chapalish (চাপালিশ)',
  'Akashmoni (আকাশমণি)',
  'Pine Wood (পাইন কাঠ)',
  'Red Meranti (মালয়েশিয়ান লোহা কাঠ)',
  'Gorjon Ply / Board',
];

const POLISH_OPTIONS: PolishType[] = [
  'None (Raw)',
  'Hand Polish',
  'PU Polish',
  'NC Lacquer',
  'Melamine Polish',
  'Natural Oil',
];

const DOOR_DESIGNS: DoorDesign[] = [
  'Plain Solid',
  'CNC Carving',
  'Groove Design',
  'Panel Door',
  'Glass Cut',
  'Veneered',
];

interface DirectOrderFormProps {
  onSave: (
    orderData: Omit<Order, 'id' | 'createdAt'>,
    advancePayment?: {
      amount: number;
      method: PaymentRecord['method'];
      accountId?: string;
      accountName?: string;
      referenceNo?: string;
      notes?: string;
    }
  ) => void;
  onCancel: () => void;
}

export default function DirectOrderForm({ onSave, onCancel }: DirectOrderFormProps) {
  const { language } = useApp();
  const { orders, marketingAgents, financialAccounts, getAccountLiveBalance } = useData();

  // Customer & Site details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [siteLocation, setSiteLocation] = useState('');

  // Marketing Agent & Custom Reference mode
  const [marketingAgentId, setMarketingAgentId] = useState('');
  const [isCustomAgentMode, setIsCustomAgentMode] = useState(false);
  const [customAgentName, setCustomAgentName] = useState('');

  // Per-item custom free-text mode toggles
  const [customWoodMode, setCustomWoodMode] = useState<Record<string, boolean>>({});
  const [customDesignMode, setCustomDesignMode] = useState<Record<string, boolean>>({});
  const [customPolishMode, setCustomPolishMode] = useState<Record<string, boolean>>({});

  const toggleCustomWood = (itemId: string) => {
    setCustomWoodMode((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };
  const toggleCustomDesign = (itemId: string) => {
    setCustomDesignMode((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };
  const toggleCustomPolish = (itemId: string) => {
    setCustomPolishMode((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Dates & Order Number
  const [orderDate, setOrderDate] = useState(getTodayIsoDate());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(addDaysToDate(getTodayIsoDate(), 10));
  const defaultAutoOrderNum = `DTC-WO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
  const [orderNumberInput, setOrderNumberInput] = useState(defaultAutoOrderNum);

  // Items
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: `item-${Date.now()}`,
      itemType: 'door',
      description: language === 'bn' ? 'সলিড সেগুন পাল্লা (Main Door)' : 'Solid Teak Door Shutter',
      woodSpecies: 'Chittagong Teak (চিটাগাং সেগুন)',
      lengthFt: 7,
      widthIn: 34,
      thicknessIn: 1.5,
      quantity: 1,
      deliveredQuantity: 0,
      unitRate: 35000,
      rateType: 'per_piece',
      polishType: 'PU Polish',
      design: 'CNC Carving',
      fittingIncluded: true,
      totalAmount: 35000,
      productionStatus: 'pending',
    },
  ]);

  // Financial calculations
  const [discount, setDiscount] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [fittingCost, setFittingCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Advance Booking Payment
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('Cash');
  const [depositAccountId, setDepositAccountId] = useState<string>('acc-1');
  const [paymentRefNo, setPaymentRefNo] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('কাজের অর্ডার বুকিং বাবদ অগ্রিম গ্রহণ');

  // Subtotal Calculation
  const subTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const grandTotal = Math.max(0, subTotal - discount + transportCost + fittingCost);
  const dueAmount = Math.max(0, grandTotal - advancePaid);

  // Add Item
  const handleAddItem = (type: ItemType) => {
    let defaultDesc = language === 'bn' ? 'নতুন আইটেম' : 'New Item';
    let defaultRate = 5000;
    let defaultRateType: OrderItem['rateType'] = 'per_piece';

    if (type === 'door') {
      defaultDesc = language === 'bn' ? 'দরজার পাল্লা' : 'Door Shutter';
      defaultRate = 28000;
    } else if (type === 'solid_deep_door' as any) {
      defaultDesc = language === 'bn' ? 'সলিড ডিপ ডোর শাটার (Solid Deep Door Shutter)' : 'Solid Deep Door Shutter';
      defaultRate = 35000;
    } else if (type === 'choukhat') {
      defaultDesc = language === 'bn' ? 'দরজার চৌকাঠ ফ্রেম' : 'Door Frame (Choukhat)';
      defaultRate = 7500;
    } else if (type === 'timber_cft') {
      defaultDesc = language === 'bn' ? 'সাইজ কাঠ' : 'Sawn Timber';
      defaultRate = 4500;
      defaultRateType = 'per_cft';
    } else if (type === 'furniture') {
      defaultDesc = language === 'bn' ? 'ফার্নিচার আইটেম' : 'Furniture Item';
      defaultRate = 35000;
    } else if (type === 'interior_item') {
      defaultDesc = language === 'bn' ? 'ইন্টেরিয়র উপাদান' : 'Interior Element';
      defaultRate = 40000;
    } else {
      defaultDesc = language === 'bn' ? 'কাস্টম নতুন আইটেম' : 'Custom Item';
      defaultRate = 15000;
    }

    const isSolidDeep = type === ('solid_deep_door' as any);
    const actualItemType = isSolidDeep ? 'door' : (type as ItemType);

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      itemType: actualItemType,
      description: defaultDesc,
      woodSpecies: 'Chittagong Teak (চিটাগাং সেগুন)',
      lengthFt: type === 'choukhat' ? 17.25 : 7,
      widthIn: type === 'choukhat' ? 5.5 : 34,
      thicknessIn: type === 'choukhat' ? 2.25 : isSolidDeep ? 1.75 : 1.5,
      quantity: 1,
      deliveredQuantity: 0,
      unitRate: defaultRate,
      rateType: defaultRateType,
      polishType: isSolidDeep ? 'PU Polish' : 'Hand Polish',
      design: isSolidDeep ? 'Plain Solid' : 'Plain Solid',
      fittingIncluded: false,
      totalAmount: defaultRate,
      productionStatus: 'pending',
    };

    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, updates: Partial<OrderItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...updates };

        // Recalculate CFT
        const cftRes = calculateSawnWoodCft({
          lengthFt: updated.lengthFt,
          lengthIn: updated.lengthIn || 0,
          widthIn: updated.widthIn,
          widthSuuta: updated.widthSuuta || 0,
          thicknessIn: updated.thicknessIn,
          thicknessSuuta: updated.thicknessSuuta || 0,
          quantity: updated.quantity,
        });

        updated.cftPerPiece = cftRes.cftPerPiece;
        updated.totalCft = cftRes.totalCft;

        // Recalculate Total
        if (updated.rateType === 'per_cft') {
          updated.totalAmount = Math.round(cftRes.totalCft * updated.unitRate);
        } else {
          updated.totalAmount = Math.round(updated.quantity * updated.unitRate);
        }

        return updated;
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert(language === 'bn' ? 'দয়া করে গ্রাহকের নাম ও মোবাইল নম্বর লিখুন।' : 'Please enter customer name and phone.');
      return;
    }
    if (items.length === 0) {
      alert(language === 'bn' ? 'কমপক্ষে একটি আইটেম যোগ করুন।' : 'Please add at least one item.');
      return;
    }

    const orderNumber = orderNumberInput.trim() || defaultAutoOrderNum;
    const selectedAgent = marketingAgents.find((a) => a.id === marketingAgentId);
    const selectedAcc = financialAccounts.find((a) => a.id === depositAccountId);

    let finalAgentId: string | undefined = undefined;
    let finalAgentName: string | undefined = 'শোরুম সরাসরি (Direct Showroom)';

    if (isCustomAgentMode && customAgentName.trim()) {
      finalAgentId = 'custom-ref';
      finalAgentName = customAgentName.trim();
    } else if (marketingAgentId === 'factory') {
      finalAgentId = 'factory-direct';
      finalAgentName = 'কারখানা সরাসরি (Direct Factory)';
    } else if (marketingAgentId) {
      finalAgentId = selectedAgent?.id;
      finalAgentName = selectedAgent?.name;
    }

    const paymentRecords: PaymentRecord[] = [];
    if (advancePaid > 0) {
      paymentRecords.push({
        id: `pay-${Date.now()}`,
        date: orderDate,
        amount: advancePaid,
        method: paymentMethod,
        referenceNo: paymentRefNo.trim() || undefined,
        receivedBy: 'Manager / Cashier',
        accountId: depositAccountId,
        accountName: selectedAcc?.accountName || undefined,
        note: paymentNotes.trim() || 'কাজের অর্ডার বুকিং অগ্রিম',
      });
    }

    onSave(
      {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        siteLocation: siteLocation.trim() || undefined,
        orderDate,
        expectedDeliveryDate,
        items,
        subTotal,
        discount,
        transportCost,
        fittingCost,
        grandTotal,
        totalPaid: advancePaid,
        dueAmount,
        paymentRecords,
        status: 'confirmed',
        productionProgressPercent: 10,
        marketingAgentId: finalAgentId,
        marketingAgentName: finalAgentName,
        notes: notes.trim() || undefined,
      },
      advancePaid > 0
        ? {
            amount: advancePaid,
            method: paymentMethod,
            accountId: depositAccountId,
            accountName: selectedAcc?.accountName,
            referenceNo: paymentRefNo.trim() || undefined,
            notes: paymentNotes.trim(),
          }
        : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 uppercase tracking-wider mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সরাসরি কাজের অর্ডার তৈরি' : 'Direct Work Order Entry'}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {language === 'bn' ? 'নতুন কাজের অর্ডার ও বুকিং এন্ট্রি' : 'Create New Work Order Directly'}
          </h2>
          <p className="text-xs text-slate-500">
            কোটেশন ছাড়াই সরাসরি শোরুম বা কারখানা ক্লায়েন্টের অর্ডার ও অগ্রিম গ্রহণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order'}</span>
          </button>
        </div>
      </div>

      {/* Customer & Site Details Card */}
      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {language === 'bn' ? '১. গ্রাহক, সাইট ও রেফারেন্স তথ্য' : '1. Customer & Site Details'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'অর্ডার নম্বর (কাস্টম)' : 'Custom Order Number'}
            </label>
            <input
              type="text"
              required
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'গ্রাহকের নাম *' : 'Customer Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'bn' ? 'মো: মোস্তাফিজুর রহমান / আরিফ সাহেব' : 'e.g. Mostafizur Rahman'}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
            </label>
            <input
              type="text"
              required
              placeholder="01711-XXXXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'সাইট / প্রজেক্টের নাম' : 'Site / Project Name'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'উত্তরা সেক্টর ৪ ডুপ্লেক্স বাড়ি' : 'Site Location'}
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'বাড়ি #৪৭, রোড #১১, সেক্টর #৪, উত্তরা, ঢাকা' : 'House #47, Uttara, Dhaka'}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'bn' ? 'মার্কেটিং প্রতিনিধি (১% কমিশন)' : 'Marketing Agent (1%)'}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomAgentMode(!isCustomAgentMode);
                  if (!isCustomAgentMode) {
                    setMarketingAgentId('__CUSTOM__');
                    setCustomAgentName('');
                  } else {
                    setMarketingAgentId('');
                  }
                }}
                className="text-[10px] font-bold text-red-700 hover:underline"
              >
                {isCustomAgentMode ? '← তালিকা থেকে বাছুন' : '+ নতুন রেফারেন্স লিখুন'}
              </button>
            </div>

            {isCustomAgentMode ? (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="রেফারেন্স বা প্রতিনিধির নাম লিখুন (যেমন: মো: সেলিম কন্ট্রাক্টর বা কারখানার স্পেশাল)"
                  value={customAgentName}
                  onChange={(e) => setCustomAgentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[10px] text-slate-500">সরাসরি টাইপকৃত নাম এই অর্ডারের রেফারেন্স হিসেবে সংরক্ষিত হবে।</p>
              </div>
            ) : (
              <select
                value={marketingAgentId}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomAgentMode(true);
                    setMarketingAgentId('__CUSTOM__');
                  } else {
                    setMarketingAgentId(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">🏪 শোরুম সরাসরি (Direct Showroom)</option>
                <option value="factory">🏭 কারখানা সরাসরি (Direct Factory)</option>
                {marketingAgents
                  .filter((a) => a.isActive)
                  .map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      🎯 {agent.name} ({agent.designation})
                    </option>
                  ))}
                <option value="__CUSTOM__">✏️ + নতুন প্রতিনিধি / রেফারেন্স লিখুন...</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'অর্ডার তারিখ' : 'Order Date'}
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-red-700 font-bold">
              {language === 'bn' ? 'সম্ভাব্য ডেলিভারি তারিখ *' : 'Expected Delivery Date *'}
            </label>
            <input
              type="date"
              required
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-red-300 text-xs font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {language === 'bn' ? '২. কাজের আইটেমসমূহ ও পরিমাপ' : '2. Order Items & Dimensions'}
          </h4>

          {/* Add Type buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAddItem('door')}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold border border-red-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ দরজার পাল্লা</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('solid_deep_door' as any)}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ সলিড ডিপ পাল্লা</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('choukhat')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ চৌকাঠ ফ্রেম</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('timber_cft')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ সাইজ কাঠ (CFT)</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('furniture')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ ফার্নিচার</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('custom' as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3 text-red-400" />
              <span>+ কাস্টম আইটেম</span>
            </button>
          </div>
        </div>

        {/* Item Rows */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span>{item.description}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="px-2.5 py-1 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1"
                  title="আইটেম মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>আইটেম মুছুন</span>
                </button>
              </div>

              {/* Primary Item Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                {/* Description with quick suggestions */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">বিবরণ / আইটেমের নাম *</label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleUpdateItem(index, { description: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      'সলিড সেগুন পাল্লা (Main Door)',
                      'গামারি গ্রুভ পাল্লা',
                      'মেহগনি ফ্ল্যাট বেডরুম ডোর',
                      'শীল কড়ই চৌকাঠ ফ্রেম',
                      'সেগুন ডাইনিং টেবিল',
                    ].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleUpdateItem(index, { description: sug })}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors"
                      >
                        + {sug.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wood Species (Select or Type) */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-slate-500">কাঠের প্রজাতি</label>
                    <button
                      type="button"
                      onClick={() => toggleCustomWood(item.id)}
                      className="text-[9px] font-bold text-red-700 hover:underline"
                    >
                      {customWoodMode[item.id] ? '← তালিকা' : '✏️ নতুন কাঠ'}
                    </button>
                  </div>
                  {customWoodMode[item.id] ? (
                    <input
                      type="text"
                      placeholder="কাঠের নাম লিখুন (যেমন: গর্জন / পাইন কাঠ)"
                      value={item.woodSpecies}
                      onChange={(e) => handleUpdateItem(index, { woodSpecies: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 font-bold text-xs"
                    />
                  ) : (
                    <select
                      value={item.woodSpecies}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          toggleCustomWood(item.id);
                        } else {
                          handleUpdateItem(index, { woodSpecies: e.target.value });
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold"
                    >
                      {WOOD_SPECIES_OPTIONS.map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                      <option value="__CUSTOM__">✏️ + নতুন কাঠ লিখুন...</option>
                    </select>
                  )}
                </div>

                {/* Door Design (Select or Type) */}
                {item.itemType === 'door' && (
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-500">ডিজাইন</label>
                      <button
                        type="button"
                        onClick={() => toggleCustomDesign(item.id)}
                        className="text-[9px] font-bold text-red-700 hover:underline"
                      >
                        {customDesignMode[item.id] ? '← তালিকা' : '✏️ নতুন'}
                      </button>
                    </div>
                    {customDesignMode[item.id] ? (
                      <input
                        type="text"
                        placeholder="ডিজাইন নাম (যেমন: ময়ূর খোদাই / ৩ডি গ্লাস)"
                        value={item.design || ''}
                        onChange={(e) => handleUpdateItem(index, { design: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 font-bold text-xs"
                      />
                    ) : (
                      <select
                        value={item.design || 'Plain Solid'}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            toggleCustomDesign(item.id);
                          } else {
                            handleUpdateItem(index, { design: e.target.value });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold"
                      >
                        {DOOR_DESIGNS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                        <option value="__CUSTOM__">✏️ + নতুন ডিজাইন লিখুন...</option>
                      </select>
                    )}
                  </div>
                )}

                {/* Polish Type (Select or Type) */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-slate-500">পলিশের ধরন</label>
                    <button
                      type="button"
                      onClick={() => toggleCustomPolish(item.id)}
                      className="text-[9px] font-bold text-red-700 hover:underline"
                    >
                      {customPolishMode[item.id] ? '← তালিকা' : '✏️ নতুন'}
                    </button>
                  </div>
                  {customPolishMode[item.id] ? (
                    <input
                      type="text"
                      placeholder="পলিশ নাম (যেমন: ম্যাট পিইউ ফিনিশ)"
                      value={item.polishType || ''}
                      onChange={(e) => handleUpdateItem(index, { polishType: e.target.value as PolishType })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 font-bold text-xs"
                    />
                  ) : (
                    <select
                      value={item.polishType || 'Hand Polish'}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          toggleCustomPolish(item.id);
                        } else {
                          handleUpdateItem(index, { polishType: e.target.value as PolishType });
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold"
                    >
                      {POLISH_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      <option value="__CUSTOM__">✏️ + নতুন পলিশ লিখুন...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Dimensions & CFT Bar */}
              <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">

                {/* ===== DOOR: Width × Height in inches ===== */}
                {item.itemType === 'door' && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-black text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">দরজার পাল্লার সাইজ</span>
                      <span className="text-[10px] text-slate-500 font-mono">প্রস্থ" × উচ্চতা"</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">প্রস্থ / Width (")</label>
                        <input
                          type="number"
                          step="0.25"
                          placeholder="37"
                          value={item.widthIn}
                          onChange={(e) => handleUpdateItem(index, { widthIn: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-end justify-center pb-1.5">
                        <span className="text-base font-black text-slate-400">×</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">উচ্চতা / Height (")</label>
                        <input
                          type="number"
                          step="0.25"
                          placeholder="82"
                          value={Math.round(item.lengthFt * 12)}
                          onChange={(e) => handleUpdateItem(index, { lengthFt: Number(e.target.value) / 12 })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পুরুত্ব / Thick (")</label>
                        <input
                          type="number"
                          step="0.25"
                          placeholder="1.5"
                          value={item.thicknessIn}
                          onChange={(e) => handleUpdateItem(index, { thicknessIn: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরিমাণ (পিস)</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, { quantity: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      সাইজ: {item.widthIn}" × {Math.round(item.lengthFt * 12)}" × {item.thicknessIn}" | CFT: {item.cftPerPiece?.toFixed(3) || '—'} × {item.quantity} = {item.totalCft?.toFixed(3) || '—'} CFT
                    </p>
                  </div>
                )}

                {/* ===== CHOUKHAT FRAME: FrameWidth × FrameThick × DoorWidth × DoorHeight ===== */}
                {item.itemType === 'choukhat' && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">চৌকাঠ ফ্রেম সাইজ</span>
                      <span className="text-[10px] text-slate-500 font-mono">ফ্রেম প্রস্থ" × পুরুত্ব" × দরজা প্রস্থ" × উচ্চতা"</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ফ্রেম প্রস্থ (")</label>
                        <input
                          type="number"
                          step="0.25"
                          placeholder="5.75"
                          value={item.widthIn}
                          onChange={(e) => handleUpdateItem(index, { widthIn: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পুরুত্ব (")</label>
                        <input
                          type="number"
                          step="0.25"
                          placeholder="2.25"
                          value={item.thicknessIn}
                          onChange={(e) => handleUpdateItem(index, { thicknessIn: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">দরজা প্রস্থ (")</label>
                        <input
                          type="number"
                          step="0.25"
                          placeholder="30"
                          value={item.lengthIn || 0}
                          onChange={(e) => handleUpdateItem(index, { lengthIn: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">উচ্চতা (")</label>
                        <input
                          type="number"
                          step="0.25"
                          placeholder="84"
                          value={Math.round(item.lengthFt * 12)}
                          onChange={(e) => {
                            const door_height_in = Number(e.target.value);
                            // Running feet = (height*2 + door_width_in) / 12
                            const doorWidthIn = item.lengthIn || 30;
                            const rft = ((door_height_in * 2) + doorWidthIn) / 12;
                            handleUpdateItem(index, { lengthFt: rft });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরিমাণ (সেট)</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, { quantity: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {item.widthIn}" × {item.thicknessIn}" × ({(item.lengthIn || 0)}" + {Math.round(item.lengthFt * 12) > 0 ? Math.round(((item.lengthFt * 12) - (item.lengthIn || 0)) / 2) : '?'}"×2) | CFT: {item.totalCft?.toFixed(3) || '—'} CFT
                    </p>
                  </div>
                )}

                {/* ===== OTHER ITEMS (timber, furniture, etc.) ===== */}
                {item.itemType !== 'door' && item.itemType !== 'choukhat' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">দৈর্ঘ্য (ফুট)</label>
                      <input
                        type="number"
                        step="0.25"
                        value={item.lengthFt}
                        onChange={(e) => handleUpdateItem(index, { lengthFt: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">প্রস্থ (ইঞ্চি)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={item.widthIn}
                        onChange={(e) => handleUpdateItem(index, { widthIn: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পুরুত্ব (ইঞ্চি)</label>
                      <input
                        type="number"
                        step="0.25"
                        value={item.thicknessIn}
                        onChange={(e) => handleUpdateItem(index, { thicknessIn: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরিমাণ</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, { quantity: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">দর (৳)</label>
                      <input
                        type="number"
                        step="100"
                        value={item.unitRate}
                        onChange={(e) => handleUpdateItem(index, { unitRate: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-200 font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Rate & Total row — always shown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">দর / রেট (৳)</label>
                    <input
                      type="number"
                      step="100"
                      value={item.unitRate}
                      onChange={(e) => handleUpdateItem(index, { unitRate: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right flex flex-col justify-center">
                      <span className="block text-[10px] font-bold text-slate-500">আইটেম মোট</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {formatCurrency(item.totalAmount, language)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item-specific Note */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    {language === 'bn' ? 'আইটেম নোট / বিশেষ নির্দেশনা (ঐচ্ছিক)' : 'Item Note / Special Instructions (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'যেমন: পাল্লার একপাশে গ্লাস কাটিং হবে, লক হোল করতে হবে...' : 'e.g. Glass cutting on one side...'}
                    value={item.notes || ''}
                    onChange={(e) => handleUpdateItem(index, { notes: e.target.value })}
                    className="w-full px-2.5 py-1 rounded-lg bg-amber-50/50 border border-amber-200 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advance Booking & Account Deposit Card */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-emerald-400" />
          <span>৩. অগ্রিম বুকিং পেমেন্ট ও জমা অ্যাকাউন্ট (Advance & Banking Deposit)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              অগ্রিম বুকিং টাকা (৳)
            </label>
            <input
              type="number"
              min="0"
              value={advancePaid || ''}
              onChange={(e) => setAdvancePaid(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-black text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              পেমেন্ট মাধ্যম
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentRecord['method'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Cash">Cash (নগদ ক্যাশ)</option>
              <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
              <option value="bKash">bKash (বিকাশ)</option>
              <option value="Nagad">Nagad (নগদ)</option>
              <option value="Cheque">Cheque (ব্যাংক চেক)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              টাকা কোন অ্যাকাউন্টে জমা হবে?
            </label>
            <select
              value={depositAccountId}
              onChange={(e) => setDepositAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {financialAccounts
                .filter((a) => a.isActive !== false)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} (ব্যালেন্স: ৳{getAccountLiveBalance(acc.id).liveBalance.toLocaleString('en-IN')})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              ট্রানজেকশন / চেক নং
            </label>
            <input
              type="text"
              placeholder="TrxID / Cheque #88190"
              value={paymentRefNo}
              onChange={(e) => setPaymentRefNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Financial Summary Calculation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">মন্তব্য ও বিশেষ নির্দেশনা</label>
          <textarea
            rows={3}
            placeholder="কাঠের সিজনিং ও ডেলিভারির বিশেষ নোট..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-600">আইটেম মোট (Subtotal):</span>
            <strong className="font-mono">{formatCurrency(subTotal, language)}</strong>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200">
            <span className="text-slate-600">বিশেষ ছাড় (Discount ৳):</span>
            <input
              type="number"
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              className="w-24 text-right px-2 py-0.5 rounded bg-white border border-slate-300 font-mono font-bold"
            />
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200">
            <span className="text-slate-600">পরিবহন ভাড়া (Transport ৳):</span>
            <input
              type="number"
              min="0"
              value={transportCost || ''}
              onChange={(e) => setTransportCost(Number(e.target.value))}
              placeholder="0"
              className="w-24 text-right px-2 py-0.5 rounded bg-white border border-slate-300 font-mono font-bold"
            />
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200">
            <span className="text-slate-600">ফিটিং চার্জ (Fitting ৳):</span>
            <input
              type="number"
              min="0"
              value={fittingCost || ''}
              onChange={(e) => setFittingCost(Number(e.target.value))}
              placeholder="0"
              className="w-24 text-right px-2 py-0.5 rounded bg-white border border-slate-300 font-mono font-bold"
            />
          </div>

          <div className="flex justify-between py-1.5 text-sm font-black text-slate-900 border-b-2 border-slate-900">
            <span>সর্বমোট অর্ডার মূল্য:</span>
            <span className="font-mono">{formatCurrency(grandTotal, language)}</span>
          </div>

          <div className="flex justify-between py-1 text-emerald-700 font-bold">
            <span>গৃহীত অগ্রিম (Paid):</span>
            <span className="font-mono">-{formatCurrency(advancePaid, language)}</span>
          </div>

          <div className="flex justify-between py-2 text-base font-black text-red-600 bg-red-50 p-2 rounded-xl">
            <span>অবশিষ্ট বকেয়া (Due):</span>
            <span className="font-mono">{formatCurrency(dueAmount, language)}</span>
          </div>
        </div>
      </div>

      {/* Footer Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
        >
          {language === 'bn' ? 'বাতিল' : 'Cancel'}
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'bn' ? 'সরাসরি কাজের অর্ডার নিশ্চিত করুন' : 'Confirm Work Order'}</span>
        </button>
      </div>
    </form>
  );
}
