'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Trees,
  Wrench,
  DollarSign,
  TrendingUp,
  Printer,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { WoodInventoryItem, WoodSpecies } from '@/types';
import { formatCurrency, formatCft } from '@/utils/currency';
import { formatDate, getTodayIsoDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import { translateWoodSpecies, translateLocation } from '@/translations/dict';
import Modal from '@/components/common/Modal';
import PrintHeader from '@/components/common/PrintHeader';

const WOOD_SPECIES_LIST: WoodSpecies[] = [
  'Chittagong Teak (চিটাগাং সেগুন)',
  'Burma Teak (বার্মা সেগুন)',
  'Gamari (গামারি)',
  'Mahogany (মেহগনি)',
  'Shil Karoi (শীল কড়ই)',
  'Garjan (গর্জন)',
  'Chapalish (চাপালিশ)',
  'Akashmoni (আকাশমণি)',
  'Pine Wood (পাইন কাঠ)',
];

export default function InventoryPage() {
  const { language, showToast, t } = useApp();
  const { inventory, adjustInventoryStock, addInventoryItem } = useData();

  const [activeTab, setActiveTab] = useState<'timber' | 'hardware'>('timber');
  const [searchTerm, setSearchTerm] = useState('');

  // Stock Adjustment Modal
  const [selectedItemForAdj, setSelectedItemForAdj] = useState<WoodInventoryItem | null>(null);
  const [adjType, setAdjType] = useState<'in' | 'out'>('in');
  const [adjQuantity, setAdjQuantity] = useState<number>(10);
  const [adjNotes, setAdjNotes] = useState<string>('নতুন কাঠ ক্রয় / সাইজিং ইনপুট');

  // Add Item Modal
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemSpecies, setNewItemSpecies] = useState<WoodSpecies>('Chittagong Teak (চিটাগাং সেগুন)');
  const [newItemType, setNewItemType] = useState<WoodInventoryItem['type']>('sawn_timber');
  const [newItemLocation, setNewItemLocation] = useState<WoodInventoryItem['location']>('Main Godown');
  const [newItemStock, setNewItemStock] = useState<number>(50);
  const [newItemUnit, setNewItemUnit] = useState<WoodInventoryItem['unit']>('CFT');
  const [newItemAvgPurchaseRate, setNewItemAvgPurchaseRate] = useState<number>(3800);
  const [newItemSellingRate, setNewItemSellingRate] = useState<number>(4500);
  const [newItemMinAlertStock, setNewItemMinAlertStock] = useState<number>(15);

  const timberItems = inventory.filter(
    (i) => i.type === 'sawn_timber' || i.type === 'round_log'
  );
  const hardwareItems = inventory.filter(
    (i) => i.type === 'hardware' || i.type === 'board' || i.type === 'ready_door' || i.type === 'ready_frame'
  );

  const activeItems = (activeTab === 'timber' ? timberItems : hardwareItems).filter(
    (i) =>
      i.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totals
  const totalTimberCft = timberItems.reduce((sum, it) => sum + it.currentStock, 0);
  const totalInventoryValue = inventory.reduce(
    (sum, it) => sum + it.currentStock * it.avgPurchaseRate,
    0
  );
  const lowStockCount = inventory.filter((it) => it.currentStock <= it.minAlertStock).length;

  const handleStockAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdj || adjQuantity <= 0) return;

    const delta = adjType === 'in' ? adjQuantity : -adjQuantity;
    adjustInventoryStock(selectedItemForAdj.id, delta, adjType === 'in');

    showToast(
      language === 'bn'
        ? `${selectedItemForAdj.species} স্টকে ${adjQuantity} ${selectedItemForAdj.unit} ${
            adjType === 'in' ? 'যোগ' : 'কর্তন'
          } করা হয়েছে।`
        : `Stock updated for ${selectedItemForAdj.species}.`,
      'success'
    );
    setSelectedItemForAdj(null);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addInventoryItem({
      species: newItemSpecies,
      type: newItemType,
      location: newItemLocation,
      currentStock: newItemStock,
      unit: newItemUnit,
      avgPurchaseRate: newItemAvgPurchaseRate,
      sellingRate: newItemSellingRate,
      minAlertStock: newItemMinAlertStock,
      lastRestockedDate: getTodayIsoDate(),
    });

    showToast(
      language === 'bn' ? 'নতুন আইটেম স্টকে যুক্ত হয়েছে!' : 'New stock item created!',
      'success'
    );
    setIsAddItemOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'টিম্বার ও মেটেরিয়াল ইনভেন্টরি' : 'Timber & Material Inventory'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'সেগুন, গামারি, মেহগনি সাইজ কাঠ ও গোল কাঠের CFT স্টক, হার্ডওয়্যার এবং মূল্য মূল্যায়ন।'
              : 'Real-time timber volume stock, hardware consumables, reorder alerts and stock valuation.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddItemOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>{language === 'bn' ? 'নতুন স্টক আইটেম যোগ' : 'Add Stock Item'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">{language === 'bn' ? 'মোট কাঠের স্টক' : 'Total Timber Stock'}</p>
            <p className="text-lg font-black text-slate-950">{formatCft(totalTimberCft, language)}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">{language === 'bn' ? 'স্টকের মোট ক্রয়মূল্য' : 'Inventory Valuation'}</p>
            <p className="text-lg font-black text-emerald-700">{formatCurrency(totalInventoryValue, language)}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">{language === 'bn' ? 'স্বল্প স্টক সতর্কতা' : 'Low Stock Alerts'}</p>
            <p className="text-lg font-black text-rose-700">{lowStockCount} {language === 'bn' ? 'টি আইটেম' : 'Items'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit no-print">
        <button
          onClick={() => setActiveTab('timber')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timber'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trees className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'কাঠের প্রজাতি ও সাইজ স্টক' : 'Timber Species (CFT)'}</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-slate-200 text-[10px]">
            {timberItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hardware'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-red-400" />
          <span>{language === 'bn' ? 'হার্ডওয়্যার ও অন্যান্য সামগ্রী' : 'Hardware & Consumables'}</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-slate-200 text-[10px]">
            {hardwareItems.length}
          </span>
        </button>
      </div>

      {/* Table Card / Printable Stock Valuation */}
      <div className="printable-sheet bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5 print:border-none print:shadow-none print:p-0 print:space-y-2">
        {/* Print Header shown only on print */}
        <div className="hidden print:block mb-4">
          <PrintHeader
            documentTitleBn="টিম্বার ও মেটেরিয়াল স্টক মূল্যায়ন প্রতিবেদন"
            documentTitleEn="TIMBER STOCK & VALUATION REPORT"
            docDate={new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
          />

          {/* Printable KPI Summary Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-2 text-left">
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 print:bg-white">
              <span className="text-[7pt] text-slate-500 uppercase font-bold block print:text-black">
                {language === 'bn' ? 'মোট কাঠের স্টক' : 'Total Timber Stock'}
              </span>
              <span className="text-xs font-black text-black">
                {formatCft(totalTimberCft, language)}
              </span>
            </div>
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 print:bg-white">
              <span className="text-[7pt] text-slate-500 uppercase font-bold block print:text-black">
                {language === 'bn' ? 'স্টক মোট মূল্যায়ন' : 'Stock Valuation'}
              </span>
              <span className="text-xs font-black text-black">
                {formatCurrency(totalInventoryValue, language)}
              </span>
            </div>
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 print:bg-white">
              <span className="text-[7pt] text-slate-500 uppercase font-bold block print:text-black">
                {language === 'bn' ? 'স্বল্প স্টক আইটেম' : 'Low Stock Alerts'}
              </span>
              <span className="text-xs font-black text-black">
                {lowStockCount} {language === 'bn' ? 'টি' : 'Items'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 no-print">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'কাঠের প্রজাতি বা অবস্থান খুঁজুন...' : 'Search stock item...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>{language === 'bn' ? 'স্টক রিপোর্ট প্রিন্ট / PDF' : 'Print Stock Report (A4)'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
              <tr>
                <th className="p-2.5 rounded-l-lg">{language === 'bn' ? 'আইটেম / কাঠের প্রজাতি' : 'Item / Species'}</th>
                <th className="p-2.5">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="p-2.5">{language === 'bn' ? 'গোডাউন অবস্থান' : 'Location'}</th>
                <th className="p-2.5">{language === 'bn' ? 'বর্তমান স্টক' : 'Current Stock'}</th>
                <th className="p-2.5">{language === 'bn' ? 'ক্রয়মূল্য / রেট' : 'Cost Rate'}</th>
                <th className="p-2.5">{language === 'bn' ? 'বিক্রয় রেট' : 'Selling Rate'}</th>
                <th className="p-2.5">{language === 'bn' ? 'মোট স্টক মূল্য' : 'Valuation'}</th>
                <th className="p-2.5 text-right rounded-r-lg no-print">{language === 'bn' ? 'স্টক সমন্বয়' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-300">
              {activeItems.map((it) => {
                const isLow = it.currentStock <= it.minAlertStock;
                const valuation = it.currentStock * it.avgPurchaseRate;

                return (
                  <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 print:text-black">
                      <p>{translateWoodSpecies(it.species, language)}</p>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 no-print">
                          <AlertTriangle className="w-3 h-3" />
                          {language === 'bn' ? 'স্টক কম' : 'Low Stock'}
                        </span>
                      )}
                    </td>

                    <td className="p-2.5 print:text-black">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-[10px] text-slate-700 print:bg-transparent print:p-0">
                        {it.type === 'sawn_timber'
                          ? (language === 'bn' ? 'সাইজ কাঠ' : 'Sawn Timber')
                          : it.type === 'round_log'
                          ? (language === 'bn' ? 'গোল কাঠ' : 'Round Log')
                          : it.type === 'hardware'
                          ? (language === 'bn' ? 'হার্ডওয়্যার' : 'Hardware')
                          : it.type === 'ready_door'
                          ? (language === 'bn' ? 'তৈরি পাল্লা' : 'Ready Door')
                          : it.type === 'ready_frame'
                          ? (language === 'bn' ? 'তৈরি চৌকাঠ' : 'Ready Frame')
                          : (language === 'bn' ? 'বোর্ড / প্লাইউড' : 'Board / Plywood')}
                      </span>
                    </td>

                    <td className="p-2.5 text-slate-600 font-medium print:text-black">{translateLocation(it.location, language)}</td>

                    <td className="p-2.5">
                      <span className={`font-black text-xs ${isLow ? 'text-rose-600' : 'text-slate-900'} print:text-black`}>
                        {it.currentStock} {it.unit}
                      </span>
                    </td>

                    <td className="p-2.5 font-semibold text-slate-700 print:text-black">
                      {formatCurrency(it.avgPurchaseRate, language)}/{it.unit}
                    </td>

                    <td className="p-2.5 font-bold text-red-700 print:text-black">
                      {formatCurrency(it.sellingRate, language)}/{it.unit}
                    </td>

                    <td className="p-2.5 font-black text-emerald-800 print:text-black">
                      {formatCurrency(valuation, language)}
                    </td>

                    <td className="p-2.5 text-right no-print">
                      <button
                        onClick={() => setSelectedItemForAdj(it)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 font-bold border border-red-200 text-[11px] transition-colors"
                      >
                        {language === 'bn' ? 'স্টক +/-' : 'Adjust Stock'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
              <tr>
                <td colSpan={3} className="p-2.5 uppercase text-xs">
                  {language === 'bn' ? 'মোট স্টক ও মোট মূল্যায়ন:' : 'Total Stock & Valuation:'}
                </td>
                <td className="p-2.5 font-black text-red-400 print:text-white text-xs">
                  {formatCft(totalTimberCft, language)}
                </td>
                <td colSpan={2}></td>
                <td colSpan={2} className="p-2.5 font-black text-emerald-400 print:text-white text-sm">
                  {formatCurrency(totalInventoryValue, language)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* In Words on print */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs hidden print:block print:bg-white print:border-slate-400">
          <span className="font-bold text-slate-700 block">
            {language === 'bn' ? 'মোট ইনভেন্টরি মূল্যায়ন মূল্য কথায়:' : 'Total Stock Valuation in Words:'}
          </span>
          <p className="font-extrabold text-slate-900 italic mt-0.5">
            {amountInWords(totalInventoryValue, language)}
          </p>
        </div>

        {/* Signatures on print */}
        <div className="hidden print:grid grid-cols-3 gap-6 pt-8 text-center text-xs signature-section print:pt-4 print:gap-3 print:text-[8pt]">
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
              {language === 'bn' ? 'গোডাউন ইন-চার্জ' : 'Godown In-Charge'}
            </div>
            <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
              {language === 'bn' ? 'স্টক অডিটর' : 'Stock Auditor'}
            </div>
            <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</p>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 print:text-black">
              {language === 'bn' ? 'কারখানা কর্তৃপক্ষ' : 'Factory Authority'}
            </div>
            <p className="text-[10px] text-red-700 font-semibold print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={selectedItemForAdj !== null}
        onClose={() => setSelectedItemForAdj(null)}
        title={language === 'bn' ? 'স্টক বৃদ্ধি / কর্তন সমন্বয়' : 'Stock In / Out Adjustment'}
        subtitle={translateWoodSpecies(selectedItemForAdj?.species || '', language)}
        maxWidth="md"
      >
        <form onSubmit={handleStockAdjSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAdjType('in')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                adjType === 'in' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{language === 'bn' ? 'স্টক বৃদ্ধি (ইন)' : 'Stock IN'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjType('out')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                adjType === 'out' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-700'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{language === 'bn' ? 'স্টক ব্যবহার (আউট)' : 'Stock OUT'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn'
                ? `সমন্বয়ের পরিমাণ (${selectedItemForAdj?.unit || 'CFT'}) *`
                : `Quantity (${selectedItemForAdj?.unit}) *`}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={adjQuantity}
              onChange={(e) => setAdjQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কারণ / মন্তব্য *' : 'Reason / Note *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                language === 'bn'
                  ? 'যেমন: চট্টগ্রাম থেকে নতুন চালান প্রাপ্তি বা দরজার জন্য কাঠ ইস্যু'
                  : 'e.g. New timber batch from Chittagong or door sizing issue'
              }
              value={adjNotes}
              onChange={(e) => setAdjNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedItemForAdj(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
            >
              {language === 'bn' ? 'স্টক আপডেট করুন' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add New Stock Item Modal */}
      <Modal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title={language === 'bn' ? 'নতুন স্টক আইটেম যুক্ত করুন' : 'Add New Inventory Item'}
        maxWidth="lg"
      >
        <form onSubmit={handleAddItemSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'আইটেম / প্রজাতি *' : 'Species / Item Name *'}
              </label>
              <select
                value={newItemSpecies}
                onChange={(e) => setNewItemSpecies(e.target.value as WoodSpecies)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              >
                {WOOD_SPECIES_LIST.map((sp) => (
                  <option key={sp} value={sp}>
                    {translateWoodSpecies(sp, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={newItemType}
                onChange={(e) =>
                  setNewItemType(e.target.value as WoodInventoryItem['type'])
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              >
                <option value="sawn_timber">{language === 'bn' ? 'সাইজ কাঠ' : 'Sawn Timber'}</option>
                <option value="round_log">{language === 'bn' ? 'গোল কাঠ' : 'Round Log'}</option>
                <option value="hardware">{language === 'bn' ? 'হার্ডওয়্যার' : 'Hardware'}</option>
                <option value="ready_door">{language === 'bn' ? 'তৈরি পাল্লা' : 'Ready Door'}</option>
                <option value="ready_frame">{language === 'bn' ? 'তৈরি চৌকাঠ' : 'Ready Frame'}</option>
                <option value="board">{language === 'bn' ? 'বোর্ড / প্লাইউড' : 'Board / Plywood'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'প্রারম্ভিক স্টক' : 'Initial Stock'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newItemStock}
                onChange={(e) => setNewItemStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'একক' : 'Unit'}
              </label>
              <select
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value as WoodInventoryItem['unit'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              >
                <option value="CFT">CFT</option>
                <option value="Pcs">{language === 'bn' ? 'পিস' : 'Pcs'}</option>
                <option value="Sheets">{language === 'bn' ? 'শীট' : 'Sheets'}</option>
                <option value="Sets">{language === 'bn' ? 'সেট' : 'Sets'}</option>
                <option value="Kg">{language === 'bn' ? 'কেজি' : 'Kg'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'সর্বনিম্ন সতর্ক সীমা' : 'Low Stock Alert'}
              </label>
              <input
                type="number"
                min="1"
                value={newItemMinAlertStock}
                onChange={(e) => setNewItemMinAlertStock(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ক্রয়মূল্য / রেট (৳)' : 'Cost Rate (BDT)'}
              </label>
              <input
                type="number"
                min="0"
                value={newItemAvgPurchaseRate}
                onChange={(e) => setNewItemAvgPurchaseRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'বিক্রয় রেট (৳)' : 'Selling Rate (BDT)'}
              </label>
              <input
                type="number"
                min="0"
                value={newItemSellingRate}
                onChange={(e) => setNewItemSellingRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'গোডাউন অবস্থান' : 'Location in Yard'}
            </label>
            <select
              value={newItemLocation}
              onChange={(e) => setNewItemLocation(e.target.value as WoodInventoryItem['location'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            >
              <option value="Sawmill Yard">{language === 'bn' ? 'স-মিল ইয়ার্ড' : 'Sawmill Yard'}</option>
              <option value="Main Godown">{language === 'bn' ? 'প্রধান গোডাউন' : 'Main Godown'}</option>
              <option value="Finishing Workshop">{language === 'bn' ? 'ফিনিশিং ওয়ার্কশপ' : 'Finishing Workshop'}</option>
              <option value="Showroom">{language === 'bn' ? 'শোরুম' : 'Showroom'}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddItemOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
            >
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
