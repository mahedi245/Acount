'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calculator,
  Info,
  CheckCircle,
  Trees,
  Target,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { Quotation, QuotationItem, WoodSpecies, ItemType, PolishType, DoorDesign } from '@/types';
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

interface QuotationFormProps {
  initialData?: Quotation;
  prefillItem?: {
    description: string;
    woodSpecies: string;
    rate: number;
  };
  onSave: (quotationData: Omit<Quotation, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function QuotationForm({ initialData, prefillItem, onSave, onCancel }: QuotationFormProps) {
  const { language } = useApp();
  const { settings, quotations, marketingAgents } = useData();

  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
  const [siteLocation, setSiteLocation] = useState(initialData?.siteLocation || '');

  // Marketing Agent & Custom Reference mode
  const [marketingAgentId, setMarketingAgentId] = useState(initialData?.marketingAgentId || '');
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

  const [date, setDate] = useState(initialData?.date || getTodayIsoDate());
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil || addDaysToDate(getTodayIsoDate(), 15)
  );
  const defaultAutoQtNum =
    initialData?.quotationNumber ||
    `DTC-QT-${new Date().getFullYear()}-${String(quotations.length + 43).padStart(3, '0')}`;
  const [quotationNumberInput, setQuotationNumberInput] = useState(defaultAutoQtNum);

  const [items, setItems] = useState<QuotationItem[]>(() => {
    if (initialData?.items && initialData.items.length > 0) return initialData.items;
    if (prefillItem) {
      return [
        {
          id: `item-${Date.now()}`,
          itemType: 'door',
          description: prefillItem.description,
          woodSpecies: prefillItem.woodSpecies,
          lengthFt: 7,
          widthIn: 34,
          thicknessIn: 1.5,
          quantity: 1,
          unitRate: prefillItem.rate,
          rateType: 'per_piece',
          polishType: 'PU Polish',
          design: 'CNC Carving',
          fittingIncluded: true,
          totalAmount: prefillItem.rate,
        },
      ];
    }
    return [
      {
        id: `item-${Date.now()}`,
        itemType: 'door',
        description: language === 'bn' ? 'সলিড সেগুন পাল্লা' : 'Solid Teak Door Shutter',
        woodSpecies: 'Chittagong Teak (চিটাগাং সেগুন)',
        lengthFt: 7,
        widthIn: 34,
        thicknessIn: 1.5,
        quantity: 2,
        unitRate: 32000,
        rateType: 'per_piece',
        polishType: 'Hand Polish',
        design: 'Groove Design',
        fittingIncluded: true,
        totalAmount: 64000,
      },
    ];
  });

  const [discount, setDiscount] = useState<number>(initialData?.discount || 0);
  const [transportCost, setTransportCost] = useState<number>(initialData?.transportCost || 0);
  const [fittingCost, setFittingCost] = useState<number>(initialData?.fittingCost || 0);
  const [vatPercent, setVatPercent] = useState<number>(initialData?.vatPercent || 0);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  // Subtotal Calculation
  const subTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const vatAmount = Math.round((subTotal - discount) * (vatPercent / 100));
  const grandTotal = Math.max(0, subTotal - discount + transportCost + fittingCost + vatAmount);

  // Add Item to list
  const handleAddItem = (type: ItemType) => {
    let defaultDesc = language === 'bn' ? 'নতুন আইটেম' : 'New Item';
    let defaultRate = 5000;
    let defaultRateType: QuotationItem['rateType'] = 'per_piece';

    if (type === 'door') {
      defaultDesc = language === 'bn' ? 'দরজার পাল্লা' : 'Door Shutter';
      defaultRate = 25000;
    } else if (type === ('solid_deep_door' as any)) {
      defaultDesc = language === 'bn' ? 'সলিড ডিপ ডোর শাটার (Solid Deep Shutter)' : 'Solid Deep Door Shutter';
      defaultRate = 35000;
    } else if (type === 'choukhat') {
      defaultDesc = language === 'bn' ? 'দরজার চৌকাঠ (স্ট্যান্ডার্ড ফ্রেম)' : 'Door Frame (Choukhat Frame)';
      defaultRate = 8500;
    } else if (type === 'timber_cft') {
      defaultDesc = language === 'bn' ? 'সাইজ কাঠ' : 'Sawn Timber';
      defaultRate = 4500;
      defaultRateType = 'per_cft';
    } else if (type === 'furniture') {
      defaultDesc = language === 'bn' ? 'ফার্নিচার আইটেম' : 'Furniture Item';
      defaultRate = 35000;
    } else if (type === 'interior_item') {
      defaultDesc = language === 'bn' ? 'ইন্টেরিয়র প্যানেলিং / কেবিনেট' : 'Interior Paneling / Cabinet';
      defaultRate = 45000;
    } else {
      defaultDesc = language === 'bn' ? 'কাস্টম নতুন আইটেম' : 'Custom Item';
      defaultRate = 15000;
    }

    const isSolidDeep = type === ('solid_deep_door' as any);
    const actualItemType = isSolidDeep ? 'door' : (type as ItemType);
    const isDoor = actualItemType === 'door';
    const isChoukhat = actualItemType === 'choukhat';

    const newItem: QuotationItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      itemType: actualItemType,
      description: defaultDesc,
      woodSpecies: 'Chittagong Teak (চিটাগাং সেগুন)',
      heightIn: isDoor ? 82 : isChoukhat ? 84 : undefined,
      doorWidthIn: isChoukhat ? 30 : undefined,
      lengthIn: isChoukhat ? 30 : undefined,
      lengthFt: isChoukhat ? ((84 * 2) + 30) / 12 : isDoor ? 82 / 12 : 7,
      widthIn: isChoukhat ? 5.75 : isDoor ? 37 : 34,
      thicknessIn: isChoukhat ? 2.25 : isSolidDeep ? 1.75 : 1.5,
      quantity: 1,
      unitRate: defaultRate,
      rateType: defaultRateType,
      polishType: isSolidDeep ? 'PU Polish' : 'Hand Polish',
      design: 'Plain Solid',
      fittingIncluded: false,
      totalAmount: defaultRate,
    };

    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, updates: Partial<QuotationItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...updates };

        // Synchronize Door dimensions
        if (updated.itemType === 'door') {
          if (updates.heightIn !== undefined) {
            const hNum = Number(updates.heightIn) || 0;
            updated.lengthFt = hNum / 12;
          } else if (updates.lengthFt !== undefined && updates.heightIn === undefined) {
            updated.heightIn = Math.round(Number(updates.lengthFt) * 12);
          }
        }

        // Synchronize Choukhat dimensions: running feet = (heightIn * 2 + doorWidthIn) / 12
        if (updated.itemType === 'choukhat') {
          const h = updated.heightIn !== undefined ? Number(updated.heightIn) : 84;
          const w = updated.doorWidthIn !== undefined ? Number(updated.doorWidthIn) : (Number(updated.lengthIn) || 30);
          updated.heightIn = h;
          updated.doorWidthIn = w;
          updated.lengthIn = w;
          updated.lengthFt = ((h * 2) + w) / 12;
        }

        // Recalculate CFT
        const cftRes = calculateSawnWoodCft({
          lengthFt: updated.lengthFt,
          lengthIn: updated.itemType === 'choukhat' ? 0 : (updated.lengthIn || 0),
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

    const quotationNumber = quotationNumberInput.trim() || defaultAutoQtNum;

    const selectedAgent = marketingAgents.find((a) => a.id === marketingAgentId);

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

    onSave({
      quotationNumber,
      customerName,
      customerPhone,
      customerAddress,
      siteLocation,
      marketingAgentId: finalAgentId,
      marketingAgentName: finalAgentName,
      date,
      validUntil,
      items,
      subTotal,
      discount,
      transportCost,
      fittingCost,
      vatPercent,
      vatAmount,
      grandTotal,
      status: initialData?.status || 'draft',
      termsAndConditions: initialData?.termsAndConditions || settings.quotationTerms,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Customer Info Card */}
      <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {language === 'bn' ? 'গ্রাহক ও সাইটের তথ্য' : 'Customer & Site Details'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কোটেশন নম্বর (কাস্টম)' : 'Custom Quotation Number'}
            </label>
            <input
              type="text"
              required
              value={quotationNumberInput}
              onChange={(e) => setQuotationNumberInput(e.target.value)}
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
              placeholder={language === 'bn' ? 'মো: রফিকুল ইসলাম / ইঞ্জিনিয়ার মোস্তাফিজ' : 'e.g. Engr. Mostafizur Rahman'}
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
              placeholder={language === 'bn' ? 'উত্তরা সেক্টর ৪ ডুপ্লেক্স ভিলা' : 'e.g. Uttara Sector 4 Duplex'}
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
              placeholder={language === 'bn' ? 'বাড়ি #৪৭, রোড #১১, সেক্টর #৪, উত্তরা, ঢাকা' : 'House #47, Road #11, Sector #4, Uttara, Dhaka'}
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
                  placeholder="রেফারেন্স বা প্রতিনিধির নাম লিখুন (যেমন: মো: সেলিম কন্ট্রাক্টর বা ফ্যাক্টরি স্পেশাল)"
                  value={customAgentName}
                  onChange={(e) => setCustomAgentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[10px] text-slate-500">সরাসরি টাইপকৃত নাম এই কোটেশন ও অর্ডারের রেফারেন্স হিসেবে সংরক্ষিত হবে।</p>
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ইস্যু তারিখ' : 'Issue Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'মেয়াদ' : 'Valid Until'}
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {language === 'bn' ? 'কোটেশন আইটেমসমূহ' : 'Quotation Items'}
          </h4>

          {/* Add Type buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAddItem('door')}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold border border-red-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ {language === 'bn' ? 'দরজার পাল্লা' : 'Door'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('solid_deep_door' as any)}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ {language === 'bn' ? 'সলিড ডিপ পাল্লা' : 'Solid Deep Shutter'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('choukhat')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ {language === 'bn' ? 'চৌকাঠ' : 'Frame'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('timber_cft')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ {language === 'bn' ? 'সাইজ কাঠ' : 'Timber CFT'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('furniture')}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ {language === 'bn' ? 'ফার্নিচার' : 'Furniture'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddItem('custom' as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3 text-red-400" />
              <span>+ {language === 'bn' ? 'কাস্টম আইটেম' : 'Custom Item'}</span>
            </button>
          </div>
        </div>

        {/* Item Rows */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative group"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    {translateItemType(item.itemType, language)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="px-2.5 py-1 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1"
                  title="আইটেম মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছুন</span>
                </button>
              </div>

              {/* Row inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Description with quick suggestions */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'bn' ? 'আইটেম বিবরণ / নাম *' : 'Description *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleUpdateItem(index, { description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      'সলিড সেগুন পাল্লা (Main Door)',
                      'গামারি কাঠের গ্রুভ পাল্লা',
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
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      {language === 'bn' ? 'কাঠের ধরন' : 'Wood Species'}
                    </label>
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
                      className="w-full px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-slate-900"
                    />
                  ) : (
                    <select
                      value={item.woodSpecies}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          toggleCustomWood(item.id);
                        } else {
                          handleUpdateItem(index, { woodSpecies: e.target.value as WoodSpecies });
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {WOOD_SPECIES_OPTIONS.map((sp) => (
                        <option key={sp} value={sp}>
                          {translateWoodSpecies(sp, language)}
                        </option>
                      ))}
                      <option value="__CUSTOM__">✏️ + নতুন কাঠ লিখুন...</option>
                    </select>
                  )}
                </div>

                {/* Dimensions (L x W x T) — context-aware by item type */}

                {/* DOOR: Width × Height in inches */}
                {item.itemType === 'door' && (
                  <div className="sm:col-span-4 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">দরজার পাল্লার সাইজ</span>
                      <span className="text-[10px] text-slate-500 font-mono">প্রস্থ" × উচ্চতা"</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">প্রস্থ / Width (")</label>
                        <input type="number" step="0.25" placeholder="37"
                          value={item.widthIn ?? ''}
                          onChange={(e) => handleUpdateItem(index, { widthIn: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-end justify-center pb-1.5">
                        <span className="text-base font-black text-slate-400">×</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">উচ্চতা / Height (")</label>
                        <input type="number" step="0.25" placeholder="82"
                          value={item.heightIn !== undefined ? item.heightIn : (item.lengthFt ? Math.round(item.lengthFt * 12) : '')}
                          onChange={(e) => handleUpdateItem(index, { heightIn: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পুরুত্ব / Thick (")</label>
                        <input type="number" step="0.25" placeholder="1.5"
                          value={item.thicknessIn ?? ''}
                          onChange={(e) => handleUpdateItem(index, { thicknessIn: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরিমাণ (পিস)</label>
                        <input type="number" min="1"
                          value={item.quantity ?? ''}
                          onChange={(e) => handleUpdateItem(index, { quantity: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      সাইজ: {item.widthIn}" × {item.heightIn || (item.lengthFt ? Math.round(item.lengthFt * 12) : 0)}" × {item.thicknessIn}" | CFT: {item.cftPerPiece?.toFixed(3) || '—'} × {item.quantity} = {item.totalCft?.toFixed(3) || '—'} CFT
                    </p>
                  </div>
                )}

                {/* CHOUKHAT FRAME: FrameWidth × FrameThick × DoorWidth × DoorHeight */}
                {item.itemType === 'choukhat' && (
                  <div className="sm:col-span-4 space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">চৌকাঠ ফ্রেম সাইজ</span>
                      <span className="text-[10px] text-slate-500 font-mono">ফ্রেম প্রস্থ" × পুরুত্ব" × দরজা প্রস্থ" × উচ্চতা"</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ফ্রেম প্রস্থ (")</label>
                        <input type="number" step="0.25" placeholder="5.75"
                          value={item.widthIn ?? ''}
                          onChange={(e) => handleUpdateItem(index, { widthIn: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পুরুত্ব (")</label>
                        <input type="number" step="0.25" placeholder="2.25"
                          value={item.thicknessIn ?? ''}
                          onChange={(e) => handleUpdateItem(index, { thicknessIn: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">দরজা প্রস্থ (")</label>
                        <input type="number" step="0.25" placeholder="30"
                          value={item.doorWidthIn !== undefined ? item.doorWidthIn : (item.lengthIn || '')}
                          onChange={(e) => handleUpdateItem(index, { doorWidthIn: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">উচ্চতা (")</label>
                        <input type="number" step="0.25" placeholder="84"
                          value={item.heightIn !== undefined ? item.heightIn : 84}
                          onChange={(e) => handleUpdateItem(index, { heightIn: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরিমাণ (সেট)</label>
                        <input type="number" min="1"
                          value={item.quantity ?? ''}
                          onChange={(e) => handleUpdateItem(index, { quantity: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-700 font-mono">
                      সাইজ: {item.widthIn}" × {item.thicknessIn}" × {item.doorWidthIn || item.lengthIn || 30}" × {item.heightIn || 84}" | CFT: {item.totalCft?.toFixed(3) || '—'} CFT
                    </p>
                  </div>
                )}

                {/* OTHER ITEMS: standard L×W×T */}
                {item.itemType !== 'door' && item.itemType !== 'choukhat' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'bn' ? 'দৈর্ঘ্য (ফুট)' : 'Length (Ft)'}
                      </label>
                      <input type="number" step="0.5"
                        value={item.lengthFt}
                        onChange={(e) => handleUpdateItem(index, { lengthFt: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'bn' ? 'প্রস্থ (ইঞ্চি)' : 'Width (In)'}
                      </label>
                      <input type="number" step="0.25"
                        value={item.widthIn}
                        onChange={(e) => handleUpdateItem(index, { widthIn: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'bn' ? 'পুরুত্ব (ইঞ্চি)' : 'Thick (In)'}
                      </label>
                      <input type="number" step="0.25"
                        value={item.thicknessIn}
                        onChange={(e) => handleUpdateItem(index, { thicknessIn: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                  </>
                )}

                {/* Design */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      {language === 'bn' ? 'ডিজাইন' : 'Design'}
                    </label>
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
                      className="w-full px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-slate-900"
                    />
                  ) : (
                    <select
                      value={item.design}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          toggleCustomDesign(item.id);
                        } else {
                          handleUpdateItem(index, { design: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                    >
                      {DOOR_DESIGNS.map((d) => (
                        <option key={d} value={d}>
                          {translateDoorDesign(d, language)}
                        </option>
                      ))}
                      <option value="__CUSTOM__">✏️ + নতুন ডিজাইন লিখুন...</option>
                    </select>
                  )}
                </div>

                {/* Polish */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      {language === 'bn' ? 'পলিশ' : 'Polish'}
                    </label>
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
                      className="w-full px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-slate-900"
                    />
                  ) : (
                    <select
                      value={item.polishType}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          toggleCustomPolish(item.id);
                        } else {
                          handleUpdateItem(index, { polishType: e.target.value as PolishType });
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                    >
                      {POLISH_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {translatePolishType(p, language)}
                        </option>
                      ))}
                      <option value="__CUSTOM__">✏️ + নতুন পলিশ লিখুন...</option>
                    </select>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'bn' ? 'পরিমাণ (সংখ্যা)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>

                {/* Rate & Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'bn' ? 'দর / রেট (৳)' : 'Unit Rate (৳)'}
                  </label>
                  <input
                    type="number"
                    value={item.unitRate}
                    onChange={(e) => handleUpdateItem(index, { unitRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>

                {/* Line Total */}
                <div className="bg-red-50/80 p-2 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-red-800 uppercase">
                    {language === 'bn' ? 'আইটেম মোট' : 'Line Total'}
                  </span>
                  <p className="text-sm font-extrabold text-red-950">
                    {formatCurrency(item.totalAmount, language)}
                  </p>
                  {item.totalCft ? (
                    <span className="text-[9px] text-red-700">
                      {formatCft(item.totalCft, language)}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Item-specific Note */}
              <div className="pt-1">
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
          ))}
        </div>
      </div>

      {/* Financial Summary Calculation Card */}
      <div className="bg-zinc-950 text-white p-5 rounded-3xl space-y-4">
        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
          {language === 'bn' ? 'মূল্য ও বিলের সারসংক্ষেপ' : 'Financial Summary'}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] text-slate-300 font-semibold mb-1">
              {language === 'bn' ? 'আইটেম মোট' : 'Subtotal'}
            </label>
            <p className="text-base font-bold text-white">{formatCurrency(subTotal, language)}</p>
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 font-semibold mb-1">
              {language === 'bn' ? 'ডিসকাউন্ট (৳)' : 'Discount (৳)'}
            </label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 font-semibold mb-1">
              {language === 'bn' ? 'পরিবহন খরচ (৳)' : 'Transport (৳)'}
            </label>
            <input
              type="number"
              min="0"
              value={transportCost}
              onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 font-semibold mb-1">
              {language === 'bn' ? 'ফিটিং খরচ (৳)' : 'Fitting (৳)'}
            </label>
            <input
              type="number"
              min="0"
              value={fittingCost}
              onChange={(e) => setFittingCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Grand Total Bar */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-300">
            {language === 'bn' ? 'সর্বমোট কোটেশন মূল্য:' : 'Grand Total Amount:'}
          </span>
          <span className="text-2xl font-black text-emerald-400">
            {formatCurrency(grandTotal, language)}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {language === 'bn' ? 'মন্তব্য / স্পেশাল নোট' : 'Notes / Remarks'}
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'কাস্টমারের সাথে বিশেষ কোনো শর্ত বা কাঠ সিলেকশন থাকলে লিখুন...'
              : 'Add any special terms or wood selection notes...'
          }
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          {language === 'bn' ? 'বাতিল' : 'Cancel'}
        </button>

        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/20"
        >
          {language === 'bn' ? 'কোটেশন সংরক্ষণ করুন' : 'Save Quotation'}
        </button>
      </div>
    </form>
  );
}
