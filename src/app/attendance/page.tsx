'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Users,
  DollarSign,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { AttendanceRecord, AttendanceStatus, Craftsman } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getTodayIsoDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import Modal from '@/components/common/Modal';
import PrintHeader from '@/components/common/PrintHeader';

export default function AttendancePage() {
  const { language, showToast, t } = useApp();
  const {
    craftsmen,
    attendanceRecords,
    craftsmanTasks,
    markAttendance,
    recordAdvanceKhoraki,
  } = useData();

  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll'>('attendance');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoDate());

  // Daily attendance state mapping
  const [dayStatuses, setDayStatuses] = useState<
    Record<string, { status: AttendanceStatus; overtimeHours: number; notes: string }>
  >(() => {
    const map: Record<string, { status: AttendanceStatus; overtimeHours: number; notes: string }> = {};
    craftsmen.forEach((c) => {
      const existing = attendanceRecords.find(
        (a) => a.craftsmanId === c.id && a.date === getTodayIsoDate()
      );
      map[c.id] = {
        status: existing?.status || 'present',
        overtimeHours: existing?.overtimeHours || 0,
        notes: existing?.notes || '',
      };
    });
    return map;
  });

  // Sync dayStatuses when selectedDate changes or attendance records update
  useEffect(() => {
    setDayStatuses((prev) => {
      const map: Record<string, { status: AttendanceStatus; overtimeHours: number; notes: string }> = {};
      craftsmen.forEach((c) => {
        const existing = attendanceRecords.find(
          (a) => a.craftsmanId === c.id && a.date === selectedDate
        );
        map[c.id] = {
          status: existing?.status || prev[c.id]?.status || 'present',
          overtimeHours: existing?.overtimeHours !== undefined ? existing.overtimeHours : (prev[c.id]?.overtimeHours || 0),
          notes: existing?.notes !== undefined ? existing.notes : (prev[c.id]?.notes || ''),
        };
      });
      return map;
    });
  }, [selectedDate, craftsmen, attendanceRecords]);

  // Advance modal state
  const [selectedCraftsmanForAdvance, setSelectedCraftsmanForAdvance] = useState<Craftsman | null>(
    null
  );
  const [advanceAmount, setAdvanceAmount] = useState<number>(1000);
  const [advanceNotes, setAdvanceNotes] = useState<string>('জরুরি খোরাকি গ্রহণ');

  // Month selector for Payroll
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  const handleStatusChange = (craftsmanId: string, status: AttendanceStatus) => {
    setDayStatuses((prev) => ({
      ...prev,
      [craftsmanId]: {
        ...prev[craftsmanId],
        status,
      },
    }));
  };

  const handleOtChange = (craftsmanId: string, ot: number) => {
    setDayStatuses((prev) => ({
      ...prev,
      [craftsmanId]: {
        ...prev[craftsmanId],
        overtimeHours: ot,
      },
    }));
  };

  const handleNotesChange = (craftsmanId: string, notes: string) => {
    setDayStatuses((prev) => ({
      ...prev,
      [craftsmanId]: {
        ...prev[craftsmanId],
        notes,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    setDayStatuses((prev) => {
      const updated = { ...prev };
      craftsmen.forEach((c) => {
        updated[c.id] = {
          ...(updated[c.id] || { overtimeHours: 0, notes: '' }),
          status: 'present',
        };
      });
      return updated;
    });
    showToast(
      language === 'bn' ? 'সকল কারিগরকে উপস্থিত চিহ্নিত করা হয়েছে।' : 'All marked present.',
      'info'
    );
  };

  const handleSaveAttendance = () => {
    craftsmen.forEach((c) => {
      const info = dayStatuses[c.id] || { status: 'present', overtimeHours: 0, notes: '' };
      const existing = attendanceRecords.find(
        (a) => a.craftsmanId === c.id && a.date === selectedDate
      );
      markAttendance({
        craftsmanId: c.id,
        craftsmanName: c.name,
        date: selectedDate,
        status: info.status,
        overtimeHours: info.overtimeHours,
        dailyWageAmount: c.standardDailyWage,
        advanceTakenToday: existing?.advanceTakenToday || 0,
        notes: info.notes,
      });
    });

    showToast(
      language === 'bn'
        ? `${formatDate(selectedDate, language)} তারিখের হাজিরা সফলভাবে সংরক্ষিত হয়েছে!`
        : `Attendance saved for ${formatDate(selectedDate, language)}!`,
      'success'
    );
  };

  const handleSaveAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCraftsmanForAdvance || advanceAmount <= 0) return;

    recordAdvanceKhoraki(selectedCraftsmanForAdvance.id, advanceAmount, advanceNotes);
    showToast(
      language === 'bn'
        ? `${selectedCraftsmanForAdvance.name}-কে ৳${advanceAmount} খোরাকি প্রদান লিপিবদ্ধ হয়েছে।`
        : `Advance recorded for ${selectedCraftsmanForAdvance.name}.`,
      'success'
    );
    setSelectedCraftsmanForAdvance(null);
  };

  // Payroll Calculation engine
  const payrollRows = craftsmen.map((c) => {
    // calculate attendance days in this month
    const monthRecords = attendanceRecords.filter(
      (a) => a.craftsmanId === c.id && a.date.startsWith(selectedMonth)
    );
    const presentDays = monthRecords.filter((a) => a.status === 'present').length;
    const halfDays = monthRecords.filter((a) => a.status === 'half_day').length;
    const totalOtHours = monthRecords.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

    let baseEarning = 0;
    if (c.wageType === 'piece_rate') {
      // Sum of all completed tasks in this month
      const completedTasks = craftsmanTasks.filter(
        (t) => t.craftsmanId === c.id && t.status === 'completed'
      );
      baseEarning = completedTasks.reduce((sum, t) => sum + t.totalWageAmount, 0);
    } else if (c.wageType === 'daily') {
      baseEarning = (presentDays + halfDays * 0.5) * (c.standardDailyWage || 800);
    } else {
      baseEarning = c.standardMonthlySalary || 20000;
    }

    const otRatePerHour = c.wageType === 'daily' ? (c.standardDailyWage || 800) / 8 : 100;
    const otAmount = Math.round(totalOtHours * otRatePerHour);
    const grossSalary = baseEarning + otAmount;
    const advanceTaken = c.totalAdvanceTaken || 0;
    const netPayable = Math.max(0, grossSalary - advanceTaken);

    return {
      craftsman: c,
      presentDays,
      halfDays,
      totalOtHours,
      baseEarning,
      otAmount,
      grossSalary,
      advanceTaken,
      netPayable,
    };
  });

  const totalMonthlyPayroll = payrollRows.reduce((sum, r) => sum + r.netPayable, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'দৈনিক হাজিরা ও মাসিক বেতন শীট' : 'Daily Attendance & Payroll'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'কারিগর ও স্টাফদের দৈনিক উপস্থিতি, ওভারটাইম, খোরাকি লোন ও পিস-রেট মজুরি শীট।'
              : 'Attendance tracking, overtime, piece-rate earnings, advance deductions & automated pay slips.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'দৈনিক হাজিরা খাতা' : 'Daily Attendance'}</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payroll'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'মাসিক বেতন ও মজুরি শীট' : 'Salary & Wage Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Attendance Register */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'হাজিরার তারিখ:' : 'Attendance Date:'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {language === 'bn' ? 'সবাইকে উপস্থিত করুন' : 'Mark All Present'}
              </button>

              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95"
              >
                {language === 'bn' ? 'হাজিরা সংরক্ষণ করুন' : 'Save Attendance'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">{language === 'bn' ? 'কারিগরের নাম ও পদবী' : 'Craftsman'}</th>
                  <th className="p-3">{language === 'bn' ? 'মজুরি মডেল' : 'Wage Model'}</th>
                  <th className="p-3">{language === 'bn' ? 'আজকের উপস্থিতি' : 'Status'}</th>
                  <th className="p-3">{language === 'bn' ? 'ওভারটাইম (ঘণ্টা)' : 'Overtime (Hrs)'}</th>
                  <th className="p-3">{language === 'bn' ? 'মন্তব্য' : 'Remarks'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'খোরাকি প্রদান' : 'Khoraki / Advance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {craftsmen.map((c) => {
                  const state = dayStatuses[c.id] || {
                    status: 'present',
                    overtimeHours: 0,
                    notes: '',
                  };

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[10px] text-red-700 font-semibold">{c.specialty}</p>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-[10px] text-slate-800">
                          {c.wageType === 'piece_rate'
                            ? (language === 'bn' ? 'পিস-রেট (চুক্তি)' : 'Piece-rate (Contract)')
                            : c.wageType === 'daily'
                            ? (language === 'bn' ? `দৈনিক ৳${c.standardDailyWage}` : `Daily ৳${c.standardDailyWage}`)
                            : (language === 'bn' ? `মাসিক ৳${c.standardMonthlySalary}` : `Monthly ৳${c.standardMonthlySalary}`)}
                        </span>
                      </td>

                      {/* Status Selector Pills */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(c.id, 'present')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              state.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {language === 'bn' ? 'উপস্থিত' : 'Present'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(c.id, 'half_day')}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              state.status === 'half_day'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {language === 'bn' ? 'অর্ধ' : 'Half'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(c.id, 'absent')}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              state.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {language === 'bn' ? 'অনুপস্থিত' : 'Absent'}
                          </button>
                        </div>
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          value={state.overtimeHours}
                          onChange={(e) => handleOtChange(c.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-center"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          placeholder={language === 'bn' ? 'নোট লিখুন...' : 'Add notes...'}
                          value={state.notes}
                          onChange={(e) => handleNotesChange(c.id, e.target.value)}
                          className="w-40 px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-xs"
                        />
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCraftsmanForAdvance(c)}
                          className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] transition-colors"
                        >
                          + {language === 'bn' ? 'খোরাকি' : 'Advance'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Salary & Wage Sheet */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Top Actions & Summary */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'বেতনের মাস নির্বাচন:' : 'Select Month:'}
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {language === 'bn' ? 'মাসিক মোট প্রদেয় মজুরি' : 'Total Monthly Payroll'}
                </span>
                <p className="text-lg font-black text-emerald-700">
                  {formatCurrency(totalMonthlyPayroll, language)}
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'bn' ? 'বেতন শীট প্রিন্ট করুন' : 'Print Salary Sheet (A4)'}</span>
              </button>
            </div>
          </div>

          {/* Printable Salary Sheet Container */}
          <div className="printable-sheet bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none print:space-y-2">
            <PrintHeader
              documentTitleBn="মাসিক বেতন ও কারিগর মজুরি বিবরণী"
              documentTitleEn="MONTHLY PAYROLL & WAGE SHEET"
              docDate={selectedMonth}
              docNumber={`PAY-${selectedMonth.replace('-', '')}`}
            />

            <div className="overflow-x-auto border border-slate-300 rounded-2xl print:border-none print:rounded-none print:mb-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 print:bg-slate-900 print:text-white">
                  <tr>
                    <th className="p-3 print:p-1.5 print:text-[8pt]">#</th>
                    <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'কারিগরের নাম' : 'Artisan Name'}</th>
                    <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'মজুরি ধরণ' : 'Wage Type'}</th>
                    <th className="p-3 text-center print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'উপস্থিতি (দিন)' : 'Days / OT'}</th>
                    <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'মূল উপার্জন' : 'Base Earning'}</th>
                    <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'ওভারটাইম' : 'OT Pay'}</th>
                    <th className="p-3 print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'মোট আয়' : 'Gross Wage'}</th>
                    <th className="p-3 text-rose-700 print:text-black print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'কর্তন / খোরাকি' : 'Advance Taken'}</th>
                    <th className="p-3 text-emerald-800 font-black print:text-black print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'প্রদেয় নেট বেতন' : 'Net Payable'}</th>
                    <th className="p-3 text-center print:p-1.5 print:text-[8pt]">{language === 'bn' ? 'স্বাক্ষর' : 'Signature'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payrollRows.map((r, idx) => (
                    <tr key={r.craftsman.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-400 print:text-black print:p-1.5 print:text-[8pt]">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 print:text-black print:p-1.5 print:text-[8pt]">
                        {r.craftsman.name}
                        <span className="block text-[10px] text-slate-400 font-normal print:text-slate-600 print:text-[7pt]">
                          {r.craftsman.specialty}
                        </span>
                      </td>
                      <td className="p-3 print:p-1.5 print:text-[8pt]">
                        <span className="text-[11px] font-semibold text-slate-600 print:text-black print:text-[7.5pt]">
                          {r.craftsman.wageType === 'piece_rate'
                            ? (language === 'bn' ? 'পিস-রেট' : 'Piece-rate')
                            : r.craftsman.wageType === 'daily'
                            ? (language === 'bn' ? 'দৈনিক' : 'Daily')
                            : (language === 'bn' ? 'মাসিক' : 'Monthly')}
                        </span>
                      </td>
                      <td className="p-3 text-center text-[11px] text-slate-700 print:text-black print:p-1.5 print:text-[8pt]">
                        {r.presentDays} {language === 'bn' ? 'দিন' : 'Days'} {r.totalOtHours > 0 && `(+${r.totalOtHours}h)`}
                      </td>
                      <td className="p-3 font-bold text-slate-800 print:text-black print:p-1.5 print:text-[8pt]">
                        {formatCurrency(r.baseEarning, language)}
                      </td>
                      <td className="p-3 text-slate-600 print:text-black print:p-1.5 print:text-[8pt]">
                        {formatCurrency(r.otAmount, language)}
                      </td>
                      <td className="p-3 font-bold text-slate-900 print:text-black print:p-1.5 print:text-[8pt]">
                        {formatCurrency(r.grossSalary, language)}
                      </td>
                      <td className="p-3 font-bold text-rose-600 print:text-black print:p-1.5 print:text-[8pt]">
                        -{formatCurrency(r.advanceTaken, language)}
                      </td>
                      <td className="p-3 font-black text-emerald-700 text-sm print:text-black print:p-1.5 print:text-[8pt]">
                        {formatCurrency(r.netPayable, language)}
                      </td>
                      <td className="p-3 text-center border-l border-slate-200 print:p-1.5">
                        <div className="w-16 border-b border-slate-400 mx-auto mt-3 print:mt-2"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                  <tr>
                    <td colSpan={8} className="p-3 text-right uppercase tracking-wider text-xs print:p-1.5 print:text-[8pt]">
                      {language === 'bn' ? 'সর্বমোট প্রদেয় বেতন ও মজুরি:' : 'Total Net Payroll:'}
                    </td>
                    <td colSpan={2} className="p-3 font-black text-amber-400 text-sm print:text-white print:p-1.5 print:text-[8.5pt]">
                      {formatCurrency(totalMonthlyPayroll, language)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* In Words */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs print:bg-white print:border-slate-400 print:text-[8pt] print:mb-2">
              <span className="font-bold text-slate-700 block print:text-black">
                {language === 'bn' ? 'মোট প্রদেয় টাকা কথায়:' : 'Total Amount in Words:'}
              </span>
              <p className="font-extrabold text-slate-900 italic mt-0.5 print:text-black">
                {amountInWords(totalMonthlyPayroll, language)}
              </p>
            </div>

            {/* Authorizer Signatures */}
            <div className="hidden print:grid grid-cols-3 gap-6 pt-8 text-center text-xs signature-section print:pt-4 print:gap-3 print:text-[8pt]">
              <div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                  {language === 'bn' ? 'প্রস্তুতকারী (হিসাবরক্ষক)' : 'Prepared By Accountant'}
                </div>
                <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
              </div>

              <div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 print:text-black">
                  {language === 'bn' ? 'কারিগরি সুপারভাইজার' : 'Workshop Supervisor'}
                </div>
                <p className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</p>
              </div>

              <div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 print:text-black">
                  {language === 'bn' ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
                </div>
                <p className="text-[10px] text-red-700 font-semibold print:text-black print:text-[7pt]">Dhaka Timber Complex</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advance / Khoraki Modal */}
      <Modal
        isOpen={selectedCraftsmanForAdvance !== null}
        onClose={() => setSelectedCraftsmanForAdvance(null)}
        title={language === 'bn' ? 'খোরাকি / অগ্রিম লোন প্রদান' : 'Record Worker Advance'}
        subtitle={selectedCraftsmanForAdvance?.name}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveAdvance} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'টাকার পরিমাণ (৳) *' : 'Advance Amount (BDT) *'}
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
              {language === 'bn' ? 'মন্তব্য' : 'Note'}
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
              {language === 'bn' ? 'খোরাকি সংরক্ষণ করুন' : 'Confirm Advance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
