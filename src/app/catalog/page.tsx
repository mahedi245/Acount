'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  Filter,
  Layers,
  Plus,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  Maximize2,
  Tag,
  Trees,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { DesignCatalogItem, DesignCategory, WoodSpecies, PolishType } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { translateWoodSpecies, translatePolishType } from '@/translations/dict';
import Modal from '@/components/common/Modal';
import ShareMessageModal from '@/components/common/ShareMessageModal';
import { generateCatalogShareMessage } from '@/utils/messageTemplates';

export default function CatalogPage() {
  const router = useRouter();
  const { designCatalog, addDesignCatalogItem, settings } = useData();
  const { language, showToast } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForShare, setSelectedItemForShare] = useState<DesignCatalogItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form state
  const [newItem, setNewItem] = useState({
    code: `DTC-DR-${String(designCatalog.length + 1).padStart(2, '0')}`,
    titleBn: '',
    titleEn: '',
    category: 'solid_door' as DesignCategory,
    woodSpecies: 'Chittagong Teak (চিটাগাং সেগুন)' as WoodSpecies,
    recommendedPolish: 'PU Polish' as PolishType,
    standardSizes: "7' × 34\", 7' × 38\"",
    priceEstimatePerPiece: 25000,
    priceEstimatePerSqft: 1200,
    descriptionBn: '',
    descriptionEn: '',
    tags: 'Solid Wood, Door',
  });

  const categories: { id: string; labelBn: string; labelEn: string }[] = [
    { id: 'all', labelBn: 'সকল ডিজাইন', labelEn: 'All Designs' },
    { id: 'cnc_door', labelBn: 'সিএনসি খোদাই পাল্লা', labelEn: 'CNC Carved Doors' },
    { id: 'panel_door', labelBn: 'প্যানেল ডোর', labelEn: 'Panel Doors' },
    { id: 'groove_door', labelBn: 'গ্রুভ ও আধুনিক পাল্লা', labelEn: 'Groove & Modern' },
    { id: 'solid_door', labelBn: 'সলিড কাঠ পাল্লা', labelEn: 'Solid Wood Doors' },
    { id: 'choukhat_frame', labelBn: 'চৌকাঠ ফ্রেম', labelEn: 'Choukhat Frames' },
    { id: 'veneer_door', labelBn: 'ভিনিয়ার্ড ও বোর্ড', labelEn: 'Veneered Doors' },
  ];

  const speciesList = [
    'all',
    'Chittagong Teak (চিটাগাং সেগুন)',
    'Burma Teak (বার্মা সেগুন)',
    'Gamari (গামারি)',
    'Mahogany (মেহগনি)',
    'Shil Karoi (শীল কড়ই)',
    'Red Meranti (মালয়েশিয়ান লোহা কাঠ)',
    'Gorjon Ply / Board',
  ];

  const filteredItems = designCatalog.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSpecies = selectedSpecies === 'all' || item.woodSpecies === selectedSpecies;
    const matchesSearch =
      item.titleBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSpecies && matchesSearch;
  });

  const handleCreateQuotationWithItem = (item: DesignCatalogItem) => {
    // Redirect to quotation creation with item intent
    router.push(`/quotations?prefillItem=${encodeURIComponent(item.titleBn)}&wood=${encodeURIComponent(item.woodSpecies)}&rate=${item.priceEstimatePerPiece}`);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.titleBn.trim()) {
      showToast(language === 'bn' ? 'ডিজাইনের নাম আবশ্যক' : 'Title is required', 'error');
      return;
    }

    addDesignCatalogItem({
      code: newItem.code,
      titleBn: newItem.titleBn,
      titleEn: newItem.titleEn || newItem.titleBn,
      category: newItem.category,
      woodSpecies: newItem.woodSpecies,
      recommendedPolish: newItem.recommendedPolish,
      standardSizes: newItem.standardSizes.split(',').map((s) => s.trim()),
      priceEstimatePerPiece: Number(newItem.priceEstimatePerPiece),
      priceEstimatePerSqft: Number(newItem.priceEstimatePerSqft) || undefined,
      descriptionBn: newItem.descriptionBn,
      descriptionEn: newItem.descriptionEn || newItem.descriptionBn,
      tags: newItem.tags.split(',').map((t) => t.trim()),
      isFeatured: false,
    });

    showToast(language === 'bn' ? 'নতুন ডিজাইন সফলভাবে যুক্ত হয়েছে' : 'Design added to catalog', 'success');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-red-600" />
              <span>{language === 'bn' ? 'দরজা ও কাঠের ডিজাইন ক্যাটালগ' : 'Door & Furniture Design Catalog'}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px] border border-red-200">
              SHOWROOM
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'সেগুন, গামারি, শীল কড়ই ও মেহগনি কাঠের পাল্লা, চৌকাঠ এবং সিএনসি খোদাই মডেল সম্ভার।'
              : 'Browse solid wood, CNC carved, panel doors, and solid frames catalog with price estimates.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন ডিজাইন যুক্ত করুন' : 'Add New Model'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Category Ribbon */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {language === 'bn' ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Search & Species Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                language === 'bn'
                  ? 'মডেল কোড, ডিজাইন নাম বা ট্যাগ দিয়ে খুঁজুন (যেমন: সেগুন, CNC, Groove)...'
                  : 'Search design by name, code or tag...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500"
            >
              <option value="all">
                {language === 'bn' ? '🪵 সকল কাঠের প্রজাতি' : '🪵 All Wood Species'}
              </option>
              {speciesList.slice(1).map((sp) => (
                <option key={sp} value={sp}>
                  {translateWoodSpecies(sp, language)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Visual Showcase / Card Header */}
            <div className="relative p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white space-y-3">
              {/* Top Meta Chips */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-red-600/90 text-white font-mono font-black text-xs shadow-md">
                  {item.code}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px] border border-zinc-700">
                  {translateWoodSpecies(item.woodSpecies, language).split('(')[0]}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="font-extrabold text-base text-white group-hover:text-red-400 transition-colors leading-snug">
                  {language === 'bn' ? item.titleBn : item.titleEn}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  {language === 'bn' ? item.descriptionBn : item.descriptionEn}
                </p>
              </div>

              {/* Estimated Price Bar */}
              <div className="pt-2 flex items-baseline justify-between border-t border-zinc-800/80">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    {language === 'bn' ? 'আনুমানিক মূল্য:' : 'Est. Rate:'}
                  </span>
                  <p className="text-lg font-black text-emerald-400">
                    {formatCurrency(item.priceEstimatePerPiece, language)}
                    <span className="text-[11px] text-zinc-400 font-normal"> / {language === 'bn' ? 'পিস' : 'Pc'}</span>
                  </p>
                </div>

                {item.priceEstimatePerSqft ? (
                  <span className="text-[11px] text-zinc-300 font-semibold bg-zinc-800/80 px-2 py-0.5 rounded">
                    ৳{item.priceEstimatePerSqft} / {language === 'bn' ? 'স্কয়ার ফিট' : 'sqft'}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Middle Specs & Details */}
            <div className="p-5 space-y-3 text-xs flex-1">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    {language === 'bn' ? 'সুপারিশকৃত পলিশ:' : 'Polish Finish:'}
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {translatePolishType(item.recommendedPolish, language)}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    {language === 'bn' ? 'স্ট্যান্ডার্ড সাইজ:' : 'Standard Sizes:'}
                  </span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5 truncate" title={item.standardSizes.join(', ')}>
                    {item.standardSizes[0]}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedItemForShare(item)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                title={language === 'bn' ? 'কাস্টমারকে WhatsApp এ পাঠান' : 'Share to WhatsApp'}
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'WhatsApp শেয়ার' : 'Share Model'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateQuotationWithItem(item)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কোটেশনে নিন' : 'Use in Quote'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Design Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={language === 'bn' ? 'নতুন ডোর / ফার্নিচার ডিজাইন মডেল যোগ' : 'Add New Catalog Model'}
          subtitle={language === 'bn' ? 'ফ্যাক্টরির নিজস্ব ডিজাইন ও প্রাক্কলিত রেট যোগ করুন' : 'Add custom workshop door design & price estimates'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveNewItem} className="space-y-4 text-xs text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'মডেল কোড (Model Code):' : 'Model Code:'}
                </label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'ক্যাটাগরি (Category):' : 'Category:'}
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as DesignCategory })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                >
                  <option value="solid_door">সলিড কাঠ পাল্লা (Solid Door)</option>
                  <option value="cnc_door">সিএনসি খোদাই পাল্লা (CNC Door)</option>
                  <option value="panel_door">প্যানেল ডোর (Panel Door)</option>
                  <option value="groove_door">গ্রুভ ও আধুনিক পাল্লা (Groove Door)</option>
                  <option value="choukhat_frame">চৌকাঠ ফ্রেম (Choukhat Frame)</option>
                  <option value="veneer_door">ভিনিয়ার্ড ডোর (Veneered Door)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'ডিজাইনের নাম (বাংলা):' : 'Design Title (Bengali):'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: চিটাগাং সেগুন রয়েল কার্ভিং"
                  value={newItem.titleBn}
                  onChange={(e) => setNewItem({ ...newItem, titleBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'ডিজাইনের নাম (English):' : 'Design Title (English):'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Teak Carved Door"
                  value={newItem.titleEn}
                  onChange={(e) => setNewItem({ ...newItem, titleEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'কাঠের প্রজাতি:' : 'Wood Species:'}
                </label>
                <select
                  value={newItem.woodSpecies}
                  onChange={(e) => setNewItem({ ...newItem, woodSpecies: e.target.value as WoodSpecies })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                >
                  {speciesList.slice(1).map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'প্রস্তাবিত পলিশ:' : 'Recommended Polish:'}
                </label>
                <select
                  value={newItem.recommendedPolish}
                  onChange={(e) => setNewItem({ ...newItem, recommendedPolish: e.target.value as PolishType })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                >
                  <option value="PU Polish">PU Polish</option>
                  <option value="Hand Polish">Hand Polish</option>
                  <option value="NC Lacquer">NC Lacquer</option>
                  <option value="Melamine Polish">Melamine Polish</option>
                  <option value="None (Raw)">None (Raw)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'আনুমানিক মূল্য (পিস):' : 'Est. Price (Pc):'}
                </label>
                <input
                  type="number"
                  value={newItem.priceEstimatePerPiece}
                  onChange={(e) => setNewItem({ ...newItem, priceEstimatePerPiece: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'মূল্য (প্রতি Sqft):' : 'Price / Sqft:'}
                </label>
                <input
                  type="number"
                  value={newItem.priceEstimatePerSqft}
                  onChange={(e) => setNewItem({ ...newItem, priceEstimatePerSqft: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'সাইজসমূহ (কমা দিয়ে):' : 'Sizes (comma separated):'}
                </label>
                <input
                  type="text"
                  value={newItem.standardSizes}
                  onChange={(e) => setNewItem({ ...newItem, standardSizes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'ডিজাইনের সংক্ষিপ্ত বিবরণ:' : 'Description:'}
              </label>
              <textarea
                rows={3}
                value={newItem.descriptionBn}
                onChange={(e) => setNewItem({ ...newItem, descriptionBn: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300"
                placeholder="কাঠের গুণগত মান ও ফিনিশিং স্পেক্স..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20"
              >
                {language === 'bn' ? 'ডিজাইন সেভ করুন' : 'Save Model'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share Message Modal */}
      {selectedItemForShare && (
        <ShareMessageModal
          isOpen={Boolean(selectedItemForShare)}
          onClose={() => setSelectedItemForShare(null)}
          title={language === 'bn' ? `ডিজাইন শেয়ার: ${selectedItemForShare.code}` : `Share Model: ${selectedItemForShare.code}`}
          customerName={language === 'bn' ? 'গ্রাহক' : 'Customer'}
          customerPhone="+8801"
          type="custom"
          initialMessageBn={generateCatalogShareMessage(selectedItemForShare, settings, 'bn')}
          initialMessageEn={generateCatalogShareMessage(selectedItemForShare, settings, 'en')}
        />
      )}
    </div>
  );
}
