'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Hammer,
  Layers,
  CheckCircle2,
  User,
  Calendar,
  Package,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { InteriorProject } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getTodayIsoDate, addDaysToDate } from '@/utils/dateUtils';
import Modal from '@/components/common/Modal';

export default function InteriorProjectsPage() {
  const { language, showToast } = useApp();
  const {
    interiorProjects,
    addInteriorProject,
    updateInteriorProject,
    addMaterialToProject,
    addLaborToProject,
  } = useData();

  // Create Project Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [contractAmount, setContractAmount] = useState<number>(500000);
  const [supervisorName, setSupervisorName] = useState('ইঞ্জি: তারেক মাহমুদ');

  // Add Material Modal
  const [selectedProjForMaterial, setSelectedProjForMaterial] = useState<InteriorProject | null>(null);
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState<number>(0);

  // Add Labor Modal
  const [selectedProjForLabor, setSelectedProjForLabor] = useState<InteriorProject | null>(null);
  const [craftsmanName, setCraftsmanName] = useState('');
  const [task, setTask] = useState('');
  const [amount, setAmount] = useState<number>(0);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !clientName.trim()) {
      alert(language === 'bn' ? 'প্রজেক্টের নাম ও ক্লায়েন্টের নাম লিখুন।' : 'Please enter project and client name.');
      return;
    }

    addInteriorProject({
      projectName,
      clientName,
      clientPhone,
      siteAddress,
      startDate: getTodayIsoDate(),
      targetEndDate: addDaysToDate(getTodayIsoDate(), 30),
      supervisorName,
      contractAmount,
      materialCost: 0,
      laborCost: 0,
      otherExpenses: 0,
      totalExpenses: 0,
      estimatedProfit: contractAmount,
      progressPercent: 10,
      currentStage: 'Site Measurement',
      status: 'active',
      materialsUsed: [],
      laborEntries: [],
    });

    showToast(
      language === 'bn' ? 'নতুন ইন্টেরিয়র প্রজেক্ট সফলভাবে তৈরি হয়েছে।' : 'New interior project created.',
      'success'
    );
    setIsCreateOpen(false);
    setProjectName('');
    setClientName('');
    setClientPhone('');
    setSiteAddress('');
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjForMaterial || !materialName.trim() || cost <= 0) return;

    addMaterialToProject(selectedProjForMaterial.id, {
      materialName,
      quantity,
      cost,
      date: getTodayIsoDate(),
    });

    showToast(language === 'bn' ? 'মেটেরিয়াল খরচ যোগ করা হয়েছে।' : 'Material cost added.', 'success');
    setSelectedProjForMaterial(null);
    setMaterialName('');
    setQuantity('');
    setCost(0);
  };

  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjForLabor || !craftsmanName.trim() || amount <= 0) return;

    addLaborToProject(selectedProjForLabor.id, {
      craftsmanName,
      task,
      amount,
      date: getTodayIsoDate(),
    });

    showToast(language === 'bn' ? 'লেবার মজুরি যোগ করা হয়েছে।' : 'Labor expense added.', 'success');
    setSelectedProjForLabor(null);
    setCraftsmanName('');
    setTask('');
    setAmount(0);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/production"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-red-600" />
              <span>{language === 'bn' ? 'ইন্টেরিয়র সাইট প্রজেক্ট ম্যানেজমেন্ট' : 'Interior Site Projects'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'bn'
                ? 'ডুপ্লেক্স ভিলা, ফ্ল্যাট ইন্টেরিয়র ও অফিস প্রজেক্টের খরচ, লেবার ও লাভ ট্র্যাকিং।'
                : 'Track interior site contracts, wood & board consumption, labor costs and project profits.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন ইন্টেরিয়র প্রজেক্ট যোগ' : 'New Interior Project'}</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {interiorProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5"
          >
            {/* Top Info Banner */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {project.projectName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    {project.currentStage}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  {language === 'bn' ? 'ক্লায়েন্ট:' : 'Client:'} {project.clientName} ({project.clientPhone}) •{' '}
                  {project.siteAddress}
                </p>
                <p className="text-[11px] text-red-700 font-medium mt-0.5">
                  {language === 'bn' ? 'সাইট সুপারভাইজার:' : 'Supervisor:'} {project.supervisorName} •{' '}
                  {language === 'bn' ? 'টার্গেট শেষ:' : 'Deadline:'} {formatDate(project.targetEndDate, language)}
                </p>
              </div>

              {/* Progress Slider */}
              <div className="min-w-[180px] space-y-1 text-right">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{language === 'bn' ? 'কাজের অগ্রগতি' : 'Progress'}</span>
                  <span className="text-red-700">{project.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-emerald-500 rounded-full"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Financial Health Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {language === 'bn' ? 'চুক্তি মূল্য' : 'Contract Value'}
                </span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {formatCurrency(project.contractAmount, language)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase">
                  {language === 'bn' ? 'মেটেরিয়াল খরচ' : 'Material Cost'}
                </span>
                <p className="text-base font-black text-amber-900 mt-0.5">
                  {formatCurrency(project.materialCost, language)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-800 uppercase">
                  {language === 'bn' ? 'লেবার ও মিস্ত্রি খরচ' : 'Labor Cost'}
                </span>
                <p className="text-base font-black text-purple-900 mt-0.5">
                  {formatCurrency(project.laborCost, language)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">
                  {language === 'bn' ? 'প্রত্যাশিত লাভ' : 'Estimated Profit'}
                </span>
                <p className="text-base font-black text-emerald-900 mt-0.5">
                  {formatCurrency(project.estimatedProfit, language)}
                </p>
              </div>
            </div>

            {/* Material & Labor Two Column Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Materials Log */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-red-600" />
                    <span>{language === 'bn' ? 'মেটেরিয়াল ব্যবহার লগ' : 'Material Logs'}</span>
                  </h4>
                  <button
                    onClick={() => setSelectedProjForMaterial(project)}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মেটেরিয়াল যোগ' : 'Add Material'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {project.materialsUsed.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">কোনো মেটেরিয়াল এন্ট্রি নেই।</p>
                  ) : (
                    project.materialsUsed.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{m.materialName}</p>
                          <p className="text-[10px] text-slate-500">{m.date}</p>
                        </div>
                        <span className="font-extrabold text-amber-800">
                          {formatCurrency(m.cost, language)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Labor Log */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Hammer className="w-4 h-4 text-purple-700" />
                    <span>{language === 'bn' ? 'মিস্ত্রি ও কারিগর মজুরি লগ' : 'Labor Logs'}</span>
                  </h4>
                  <button
                    onClick={() => setSelectedProjForLabor(project)}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লেবার যোগ' : 'Add Labor'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {project.laborEntries.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">কোনো লেবার এন্ট্রি নেই।</p>
                  ) : (
                    project.laborEntries.map((l, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{l.craftsmanName}</p>
                          <p className="text-[10px] text-slate-500">
                            {l.task} • {l.date}
                          </p>
                        </div>
                        <span className="font-extrabold text-purple-800">
                          {formatCurrency(l.amount, language)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={language === 'bn' ? 'নতুন ইন্টেরিয়র সাইট প্রজেক্ট শুরু করুন' : 'New Interior Project'}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রজেক্টের নাম *' : 'Project Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'bn' ? 'যেমন: গুলশান-২ লাক্সারি অ্যাপার্টমেন্ট ইন্টেরিয়র' : 'e.g., Gulshan-2 Luxury Apartment Interior'}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ক্লায়েন্টের নাম *' : 'Client Name *'}
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'সাইট ঠিকানা' : 'Site Address'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'রোড #৮, ব্লক #আই, বসুন্ধরা আ/এ, ঢাকা' : 'Road #8, Block #I, Bashundhara R/A, Dhaka'}
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'চুক্তি মূল্য (টাকা)' : 'Contract Value (BDT)'}
              </label>
              <input
                type="number"
                min="0"
                value={contractAmount}
                onChange={(e) => setContractAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'সুপারভাইজার' : 'Supervisor'}
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20"
            >
              {language === 'bn' ? 'প্রজেক্ট শুরু করুন' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Material Modal */}
      <Modal
        isOpen={selectedProjForMaterial !== null}
        onClose={() => setSelectedProjForMaterial(null)}
        title={language === 'bn' ? 'প্রজেক্টে মেটেরিয়াল যোগ করুন' : 'Add Material Expense'}
        maxWidth="md"
      >
        <form onSubmit={handleAddMaterial} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মেটেরিয়ালের নাম *' : 'Material Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'bn' ? 'যেমন: চিটাগাং সেগুন সাইজ কাঠ / গর্জন প্লাইউড' : 'e.g. Chittagong Teak sawn wood / Garjan plywood'}
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'পরিমাণ ও একক' : 'Quantity / Unit'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: ৪৫ সিএফটি / ২০ শিট' : 'e.g. 45 CFT / 20 Sheets'}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মোট খরচ (টাকা) *' : 'Cost (BDT) *'}
            </label>
            <input
              type="number"
              min="1"
              required
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-amber-700"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedProjForMaterial(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
            >
              {language === 'bn' ? 'খরচ সংরক্ষণ' : 'Save Material'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Labor Modal */}
      <Modal
        isOpen={selectedProjForLabor !== null}
        onClose={() => setSelectedProjForLabor(null)}
        title={language === 'bn' ? 'মিস্ত্রি ও লেবার মজুরি যোগ করুন' : 'Add Labor Expense'}
        maxWidth="md"
      >
        <form onSubmit={handleAddLabor} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কারিগরের নাম / দল *' : 'Craftsman / Team *'}
            </label>
            <input
              type="text"
              required
              placeholder="মাস্টার রফিকুল / সাইট টিম"
              value={craftsmanName}
              onChange={(e) => setCraftsmanName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাজের বিবরণ' : 'Task Description'}
            </label>
            <input
              type="text"
              placeholder="ওয়াল প্যানেলিং / কিচেন ক্যাবিনেট বক্সিং"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রদত্ত মজুরি (টাকা) *' : 'Labor Wage Amount (BDT) *'}
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-purple-700"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedProjForLabor(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold"
            >
              {language === 'bn' ? 'মজুরি সংরক্ষণ' : 'Save Labor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
