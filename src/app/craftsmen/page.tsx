'use client';

import React, { useState } from 'react';
import {
  Users,
  User,
  Plus,
  Hammer,
  CheckCircle2,
  Clock,
  DollarSign,
  Phone,
  Search,
  Check,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Printer,
  FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { Craftsman, CraftsmanTask } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getTodayIsoDate, addDaysToDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import Modal from '@/components/common/Modal';
import PrintHeader from '@/components/common/PrintHeader';
import CraftsmanTaskSlipModal from '@/components/craftsmen/CraftsmanTaskSlipModal';

export default function CraftsmenPage() {
  const { language, showToast, t } = useApp();
  const {
    craftsmen,
    craftsmanTasks,
    orders,
    addCraftsman,
    assignTask,
    updateCraftsmanTask,
    recordAdvanceKhoraki,
  } = useData();

  const [activeTab, setActiveTab] = useState<'tasks' | 'roster'>('tasks');
  const [searchTerm, setSearchTerm] = useState('');

  // Assign Task Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCraftsmanId, setSelectedCraftsmanId] = useState(craftsmen[0]?.id || '');
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [selectedItemDesc, setSelectedItemDesc] = useState('');
  const [taskQuantity, setTaskQuantity] = useState<number>(1);
  const [wageRatePerUnit, setWageRatePerUnit] = useState<number>(1500);
  const [taskDeadline, setTaskDeadline] = useState(addDaysToDate(getTodayIsoDate(), 5));

  // Add Craftsman Modal
  const [isAddCraftsmanOpen, setIsAddCraftsmanOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cSpecialty, setCSpecialty] = useState<Craftsman['specialty']>('Door Master');
  const [cWageType, setCWageType] = useState<Craftsman['wageType']>('piece_rate');
  const [cDailyWage, setCDailyWage] = useState<number>(1000);
  const [cMonthlySalary, setCMonthlySalary] = useState<number>(0);

  // Advance / Khoraki Modal
  const [selectedCraftsmanForAdvance, setSelectedCraftsmanForAdvance] = useState<Craftsman | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number>(1000);
  const [advanceNotes, setAdvanceNotes] = useState<string>('জরুরি খোরাকি গ্রহণ');

  // Job Slip Print Modal
  const [selectedTaskForSlip, setSelectedTaskForSlip] = useState<CraftsmanTask | null>(null);

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');

  const handleAssignTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const craftsman = craftsmen.find((c) => c.id === selectedCraftsmanId);
    const order = orders.find((o) => o.id === selectedOrderId);
    if (!craftsman || !order) return;

    const totalWageAmount = taskQuantity * wageRatePerUnit;

    assignTask({
      craftsmanId: craftsman.id,
      craftsmanName: craftsman.name,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      itemDescription: selectedItemDesc || (order.items[0]?.description || 'কাঠের কাজ'),
      quantity: taskQuantity,
      completedQuantity: 0,
      wageRatePerUnit,
      totalWageAmount,
      assignedDate: getTodayIsoDate(),
      deadlineDate: taskDeadline,
      status: 'assigned',
      isPaid: false,
    });

    showToast(
      language === 'bn'
        ? `কাজটি ${craftsman.name}-কে সফলভাবে অ্যাসাইন করা হয়েছে!`
        : `Task assigned to ${craftsman.name}!`,
      'success'
    );
    setIsAssignModalOpen(false);
  };

  const handleAddCraftsmanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;

    addCraftsman({
      name: cName,
      phone: cPhone,
      specialty: cSpecialty,
      wageType: cWageType,
      standardDailyWage: cDailyWage,
      standardMonthlySalary: cMonthlySalary,
      isActive: true,
      joinDate: getTodayIsoDate(),
    });

    showToast(
      language === 'bn' ? 'নতুন কারিগর সফলভাবে যুক্ত হয়েছে।' : 'Craftsman added successfully.',
      'success'
    );
    setIsAddCraftsmanOpen(false);
    setCName('');
    setCPhone('');
  };

  const handleRecordAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCraftsmanForAdvance || advanceAmount <= 0) return;

    recordAdvanceKhoraki(selectedCraftsmanForAdvance.id, advanceAmount, advanceNotes);

    showToast(
      language === 'bn'
        ? `${selectedCraftsmanForAdvance.name}-কে ৳${advanceAmount} খোরাকি/অগ্রিম দেওয়া হয়েছে।`
        : `Advance of BDT ${advanceAmount} recorded.`,
      'success'
    );
    setSelectedCraftsmanForAdvance(null);
  };

  const handleMarkTaskCompleted = (task: CraftsmanTask) => {
    updateCraftsmanTask(task.id, {
      status: 'completed',
      completedQuantity: task.quantity,
      completedDate: getTodayIsoDate(),
    });
    showToast(
      language === 'bn'
        ? `কাজটি সম্পন্ন চিহ্নিত হয়েছে এবং কারিগরের হিসাবে ৳${task.totalWageAmount} যোগ হয়েছে!`
        : `Task completed and BDT ${task.totalWageAmount} added to balance!`,
      'success'
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'কারিগর ও মিস্ত্রি টাস্ক ম্যানেজমেন্ট' : 'Craftsmen & Task Assignments'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'দরজা, চৌকাঠ ও পলিশ কারিগরদের নির্দিষ্ট কাজ প্রদান, পিস-রেট চুক্তি ও অগ্রিম খোরাকি হিসাব।'
              : 'Assign order items to artisans, track piece-rate earnings, daily wages and advances.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddCraftsmanOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>{language === 'bn' ? 'নতুন কারিগর যোগ' : 'Add Craftsman'}</span>
          </button>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
          >
            <Hammer className="w-4 h-4 text-white" />
            <span>{language === 'bn' ? 'অর্ডার কাজ অ্যাসাইন করুন' : 'Assign Task'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit no-print">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hammer className="w-4 h-4 text-red-500" />
          <span>{language === 'bn' ? 'অ্যাসাইনকৃত কাজের তালিকা' : 'Active Assigned Tasks'}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px]">
            {craftsmanTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'roster'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-red-500" />
          <span>{language === 'bn' ? 'কারিগর রোস্টার ও মজুরি ব্যালেন্স' : 'Craftsmen Roster & Balance'}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px]">
            {craftsmen.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Task Assignment Cards */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {craftsmanTasks.map((task) => {
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm space-y-4 transition-all ${
                  isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {task.orderNumber}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 truncate">
                      {task.customerName}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isDone
                      ? language === 'bn'
                        ? 'সম্পন্ন'
                        : 'Completed'
                      : language === 'bn'
                      ? 'চলমান'
                      : 'In Progress'}
                  </span>
                </div>

                {/* Craftsman & Task Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-red-100 text-red-800 font-bold text-xs flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 leading-tight">
                        {task.craftsmanName}
                      </p>
                      <p className="text-[10px] text-red-700 font-semibold">
                        {language === 'bn' ? 'পিস-রেট মজুরি' : 'Piece-Rate'}: {formatCurrency(task.wageRatePerUnit, language)} / {language === 'bn' ? 'পিস' : 'Pcs'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800">{task.itemDescription}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {language === 'bn' ? 'অ্যাসাইন পরিমাণ:' : 'Assigned Qty:'}{' '}
                      <strong>{task.quantity} {language === 'bn' ? 'পিস' : 'Pcs'}</strong>
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-3 rounded-2xl bg-slate-900 text-white flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {language === 'bn' ? 'মোট প্রাপ্য মজুরি' : 'Total Wage'}
                    </span>
                    <p className="text-sm font-black text-red-400">
                      {formatCurrency(task.totalWageAmount, language)}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <p>{language === 'bn' ? 'টার্গেট:' : 'Deadline:'} {formatDate(task.deadlineDate, language)}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedTaskForSlip(task)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5 text-red-600" />
                    <span>{language === 'bn' ? 'জব স্লিপ' : 'Job Slip'}</span>
                  </button>

                  {!isDone ? (
                    <button
                      onClick={() => handleMarkTaskCompleted(task)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>{language === 'bn' ? 'সম্পন্ন করুন' : 'Complete'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সমাপ্ত' : 'Done'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Craftsmen Roster & Balance Table */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-4 printable-sheet print:p-0 print:border-none print:shadow-none print:space-y-2">
          {/* Header on print */}
          <div className="hidden print:block mb-4">
            <PrintHeader
              documentTitleBn="কারিগর ও মিস্ত্রিদের আর্থিক লেজার ও মজুরি রেজিস্টার"
              documentTitleEn="ARTISANS FINANCIAL LEDGER & WAGE REGISTRY"
              docDate={new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 no-print">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {language === 'bn' ? 'কারিগর ও মিস্ত্রিদের আর্থিক লেজার' : 'Artisans Financial Ledger'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'মোট আয়, অগ্রিম খোরাকি এবং অবশিষ্ট প্রাপ্য মজুরির হিসাব'
                  : 'Track total earned, advance loans taken and net balance payable'}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <Printer className="w-4 h-4 text-red-500" />
              <span>{language === 'bn' ? 'লেজার শিট প্রিন্ট করুন (A4)' : 'Print Ledger (A4 PDF)'}</span>
            </button>
          </div>

          <div className="overflow-x-auto print:mb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                <tr>
                  <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'কারিগরের নাম' : 'Craftsman'}</th>
                  <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'দক্ষতা' : 'Skill'}</th>
                  <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'মজুরি মডেল' : 'Wage Type'}</th>
                  <th className="p-3 text-center print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'চলমান কাজ' : 'Active Tasks'}</th>
                  <th className="p-3 text-right print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'মোট আয়' : 'Total Earned'}</th>
                  <th className="p-3 text-right print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'নেওয়া খোরাকি' : 'Advance Taken'}</th>
                  <th className="p-3 text-right print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'প্রাপ্য ব্যালেন্স' : 'Net Balance'}</th>
                  <th className="p-3 text-right no-print">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                {craftsmen.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 print:p-1.5 print:text-[8pt]">
                      <p className="font-bold text-slate-900 print:text-black">{c.name}</p>
                      <p className="text-[10px] text-slate-500 print:text-slate-700 print:text-[7pt]">{c.phone}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 print:text-black print:p-1.5 print:text-[8pt]">{c.specialty}</td>
                    <td className="p-3 print:p-1.5 print:text-[8pt]">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-[10px] text-slate-800 print:text-black print:border print:p-0 print:border-none print:text-[7.5pt]">
                        {c.wageType === 'piece_rate'
                          ? language === 'bn'
                            ? 'পিস-রেট (চুক্তি)'
                            : 'Piece-Rate'
                          : c.wageType === 'daily'
                          ? `${language === 'bn' ? 'দৈনিক' : 'Daily'} ${formatCurrency(c.standardDailyWage, language)}`
                          : `${language === 'bn' ? 'মাসিক' : 'Monthly'} ${formatCurrency(c.standardMonthlySalary, language)}`}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-red-600 print:text-black print:p-1.5 print:text-[8pt]">
                      {c.activeTasksCount} {language === 'bn' ? 'টি' : 'Tasks'}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 print:text-black print:p-1.5 print:text-[8pt]">{formatCurrency(c.totalEarned, language)}</td>
                    <td className="p-3 text-right font-bold text-amber-700 print:text-black print:p-1.5 print:text-[8pt]">{formatCurrency(c.totalAdvanceTaken, language)}</td>
                    <td className="p-3 text-right font-black text-emerald-700 text-sm print:text-black print:p-1.5 print:text-[8pt]">
                      {formatCurrency(c.balanceDue, language)}
                    </td>
                    <td className="p-3 text-right no-print">
                      <button
                        onClick={() => setSelectedCraftsmanForAdvance(c)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors"
                      >
                        + {language === 'bn' ? 'খোরাকি' : 'Advance'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-black text-slate-900 print:bg-slate-200 border-t-2 border-slate-900">
                <tr>
                  <td colSpan={4} className="p-3 text-right uppercase print:p-1.5 print:text-[8pt]">
                    {language === 'bn' ? 'সর্বমোট যোগফল:' : 'Grand Total:'}
                  </td>
                  <td className="p-3 text-right print:p-1.5 print:text-[8pt]">
                    {formatCurrency(craftsmen.reduce((sum, c) => sum + c.totalEarned, 0), language)}
                  </td>
                  <td className="p-3 text-right text-amber-800 print:text-black print:p-1.5 print:text-[8pt]">
                    {formatCurrency(craftsmen.reduce((sum, c) => sum + c.totalAdvanceTaken, 0), language)}
                  </td>
                  <td className="p-3 text-right text-emerald-800 text-sm print:text-black print:p-1.5 print:text-[8pt]">
                    {formatCurrency(craftsmen.reduce((sum, c) => sum + c.balanceDue, 0), language)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* In Words on print */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs hidden print:block print:bg-white print:border-slate-400 print:text-[8pt] print:mb-2">
            <span className="font-bold text-slate-700 block print:text-black">
              {language === 'bn' ? 'মোট অবশিষ্ট বকেয়া মজুরি কথায়:' : 'Total Net Payable Wage in Words:'}
            </span>
            <p className="font-extrabold text-slate-900 italic mt-0.5 print:text-black">
              {amountInWords(craftsmen.reduce((sum, c) => sum + c.balanceDue, 0), language)}
            </p>
          </div>

          {/* Signatures on print */}
          <div className="hidden print:grid grid-cols-3 gap-6 pt-8 text-center text-xs signature-section print:pt-4 print:gap-3 print:text-[8pt]">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'হিসাবরক্ষক' : 'Accountant'}
              </div>
              <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                {language === 'bn' ? 'ওয়ার্কশপ সুপারভাইজার' : 'Workshop Supervisor'}
              </div>
              <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 print:text-black">
                {language === 'bn' ? 'ফ্যাক্টরি ইন-চার্জ / কর্তৃপক্ষ' : 'Factory Authority'}
              </div>
              <p className="text-[10px] text-red-700 font-semibold print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={language === 'bn' ? 'অর্ডারের কাজ কারিগরকে অ্যাসাইন করুন' : 'Assign Task to Artisan'}
        maxWidth="lg"
      >
        <form onSubmit={handleAssignTaskSubmit} className="space-y-4 text-left">
          {/* Select Craftsman */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কারিগর নির্বাচন করুন *' : 'Select Craftsman *'}
            </label>
            <select
              value={selectedCraftsmanId}
              onChange={(e) => setSelectedCraftsmanId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            >
              {craftsmen.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Select Active Order */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাজের অর্ডার নির্বাচন *' : 'Select Order *'}
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                const o = orders.find((ord) => ord.id === e.target.value);
                if (o && o.items[0]) {
                  setSelectedItemDesc(o.items[0].description);
                  setTaskQuantity(o.items[0].quantity);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            >
              {activeOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.customerName}
                </option>
              ))}
            </select>
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাজের বিবরণ *' : 'Task Description *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'bn' ? 'যেমন: ৩টি সেগুন কাঠের দরজা তৈরি ও গ্রুভিং' : 'e.g. 3 Teak wood doors crafted'}
              value={selectedItemDesc}
              onChange={(e) => setSelectedItemDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'পরিমাণ (পিস)' : 'Quantity (Pcs)'}
              </label>
              <input
                type="number"
                min="1"
                value={taskQuantity}
                onChange={(e) => setTaskQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'প্রতি পিস মজুরি (৳)' : 'Wage / Piece (BDT)'}
              </label>
              <input
                type="number"
                min="0"
                value={wageRatePerUnit}
                onChange={(e) => setWageRatePerUnit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাজ শেষের ডেডলাইন' : 'Deadline'}
            </label>
            <input
              type="date"
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20"
            >
              {language === 'bn' ? 'কাজ অ্যাসাইন করুন' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Craftsman Modal */}
      <Modal
        isOpen={isAddCraftsmanOpen}
        onClose={() => setIsAddCraftsmanOpen(false)}
        title={language === 'bn' ? 'নতুন কারিগর / মিস্ত্রি যুক্ত করুন' : 'Add New Craftsman'}
        maxWidth="md"
      >
        <form onSubmit={handleAddCraftsmanSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কারিগরের নাম *' : 'Craftsman Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'bn' ? 'ওস্তাদ মো: রহিম' : 'e.g. Master Md. Rahim'}
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}
            </label>
            <input
              type="text"
              placeholder="017XX-XXXXXX"
              value={cPhone}
              onChange={(e) => setCPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাজের বিশেষত্ব' : 'Specialty'}
            </label>
            <select
              value={cSpecialty}
              onChange={(e) => setCSpecialty(e.target.value as Craftsman['specialty'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            >
              <option value="Door Master">{language === 'bn' ? 'দরজা স্পেশালিস্ট' : 'Door Master'}</option>
              <option value="Choukhat Specialist">{language === 'bn' ? 'চৌকাঠ স্পেশালিস্ট' : 'Choukhat Specialist'}</option>
              <option value="Polish Master">{language === 'bn' ? 'পলিশ মাস্টার' : 'Polish Master'}</option>
              <option value="Furniture Carpenter">{language === 'bn' ? 'ফার্নিচার মিস্ত্রি' : 'Furniture Carpenter'}</option>
              <option value="Sawmill Operator">{language === 'bn' ? 'স-মিল অপারেটর' : 'Sawmill Operator'}</option>
              <option value="Interior Craftsman">{language === 'bn' ? 'ইন্টেরিয়র কারিগর' : 'Interior Craftsman'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মজুরি মডেল' : 'Wage Model'}
            </label>
            <select
              value={cWageType}
              onChange={(e) => setCWageType(e.target.value as Craftsman['wageType'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            >
              <option value="piece_rate">{language === 'bn' ? 'পিস-রেট চুক্তি ভিত্তিক' : 'Piece-Rate'}</option>
              <option value="daily">{language === 'bn' ? 'দৈনিক হাজিরা' : 'Daily Wage'}</option>
              <option value="monthly">{language === 'bn' ? 'মাসিক স্থায়ী বেতন' : 'Monthly Salary'}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddCraftsmanOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20"
            >
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Craftsman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Advance Khoraki Modal */}
      <Modal
        isOpen={selectedCraftsmanForAdvance !== null}
        onClose={() => setSelectedCraftsmanForAdvance(null)}
        title={language === 'bn' ? 'খোরাকি / অগ্রিম লোন প্রদান' : 'Record Advance / Khoraki'}
        subtitle={selectedCraftsmanForAdvance ? `${selectedCraftsmanForAdvance.name}` : ''}
        maxWidth="sm"
      >
        <form onSubmit={handleRecordAdvance} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'খোরাকির পরিমাণ (টাকা) *' : 'Advance Amount (BDT) *'}
            </label>
            <input
              type="number"
              min="100"
              step="100"
              required
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কারণ / মন্তব্য' : 'Reason / Note'}
            </label>
            <input
              type="text"
              value={advanceNotes}
              onChange={(e) => setAdvanceNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedCraftsmanForAdvance(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
            >
              {language === 'bn' ? 'খোরাকি কনফার্ম' : 'Confirm Advance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Slip Printable Modal */}
      <CraftsmanTaskSlipModal
        isOpen={selectedTaskForSlip !== null}
        onClose={() => setSelectedTaskForSlip(null)}
        task={selectedTaskForSlip}
        craftsman={craftsmen.find((c) => c.id === selectedTaskForSlip?.craftsmanId)}
      />
    </div>
  );
}
