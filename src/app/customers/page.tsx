'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/utils/currency';
import { formatDate, getTodayIsoDate } from '@/utils/dateUtils';
import PrintHeader from '@/components/common/PrintHeader';
import Modal from '@/components/common/Modal';
import ShareMessageModal from '@/components/common/ShareMessageModal';
import { generatePaymentReminderMessage } from '@/utils/messageTemplates';

export default function CustomersPage() {
  const { language, showToast } = useApp();
  const { orders, quotations, communicationLogs, settings } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);
  const [reminderTarget, setReminderTarget] = useState<{
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    totalPaid: number;
    dueAmount: number;
    orderNumber?: string;
  } | null>(null);

  // Group all orders and quotations by customer phone / name
  const customerMap = new Map<
    string,
    {
      name: string;
      phone: string;
      address: string;
      orders: typeof orders;
      quotations: typeof quotations;
      totalOrderAmount: number;
      totalPaid: number;
      totalDue: number;
      lastActivityDate: string;
    }
  >();

  // Aggregate orders
  orders.forEach((ord) => {
    const key = ord.customerPhone || ord.customerName;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: ord.customerName,
        phone: ord.customerPhone,
        address: ord.customerAddress || ord.siteLocation || '',
        orders: [],
        quotations: [],
        totalOrderAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        lastActivityDate: ord.orderDate,
      });
    }
    const cust = customerMap.get(key)!;
    cust.orders.push(ord);
    cust.totalOrderAmount += ord.grandTotal;
    cust.totalPaid += ord.totalPaid;
    cust.totalDue += ord.dueAmount;
    if (new Date(ord.orderDate) > new Date(cust.lastActivityDate)) {
      cust.lastActivityDate = ord.orderDate;
    }
  });

  // Aggregate quotations
  quotations.forEach((quo) => {
    const key = quo.customerPhone || quo.customerName;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: quo.customerName,
        phone: quo.customerPhone,
        address: quo.customerAddress || quo.siteLocation || '',
        orders: [],
        quotations: [],
        totalOrderAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        lastActivityDate: quo.date,
      });
    }
    const cust = customerMap.get(key)!;
    cust.quotations.push(quo);
    if (!cust.address && (quo.customerAddress || quo.siteLocation)) {
      cust.address = quo.customerAddress || quo.siteLocation || '';
    }
  });

  const customersList = Array.from(customerMap.values());

  const filteredCustomers = customersList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDue = filterDueOnly ? c.totalDue > 0 : true;
    return matchesSearch && matchesDue;
  });

  // Overall Totals
  const totalClientsCount = customersList.length;
  const totalReceivablesDue = customersList.reduce((sum, c) => sum + c.totalDue, 0);
  const totalLifetimeSales = customersList.reduce((sum, c) => sum + c.totalOrderAmount, 0);
  const totalCollections = customersList.reduce((sum, c) => sum + c.totalPaid, 0);

  const activeCustomer = selectedCustomerPhone ? customerMap.get(selectedCustomerPhone) : null;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'গ্রাহক ও বাকি হিসাব ডিরেক্টরি' : 'Customer & Client Accounts'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'সকল ক্লায়েন্টের অর্ডার ইতিহাস, মোট লেনদেন, নগদ পরিশোধ ও বাকি লেজার।'
              : 'Client profiles, lifetime order history, payment records and outstanding receivables.'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-sm transition-all"
        >
          <Printer className="w-4 h-4 text-red-600" />
          <span>{language === 'bn' ? 'গ্রাহক তালিকা প্রিন্ট (A4)' : 'Print Client Directory'}</span>
        </button>
      </div>

      {/* KPI Cards (Screen only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'bn' ? 'মোট নিবন্ধিত গ্রাহক' : 'Total Client Accounts'}
          </span>
          <p className="text-2xl font-black text-slate-900">{totalClientsCount}</p>
          <p className="text-[11px] text-slate-500 font-semibold">
            {language === 'bn' ? 'সক্রিয় ও পূর্ববর্তী ক্রেতা' : 'Showroom & Site Clients'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'bn' ? 'মোট বিক্রয় লেনদেন' : 'Lifetime Bookings'}
          </span>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalLifetimeSales, language)}</p>
          <p className="text-[11px] text-slate-500 font-semibold">
            {language === 'bn' ? 'সকল অর্ডারের সমন্বিত বিল' : 'All finalized work orders'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {language === 'bn' ? 'মোট সংগৃহীত টাকা' : 'Total Received'}
          </span>
          <p className="text-2xl font-black text-emerald-700">{formatCurrency(totalCollections, language)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {language === 'bn' ? 'অগ্রিম ও কিস্তি পরিশোধ' : 'Cash, Bank & bKash collected'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 border border-red-700 shadow-xl text-white space-y-2">
          <span className="text-xs font-bold text-red-200 uppercase tracking-wider">
            {language === 'bn' ? 'মোট বকেয়া পাওনা' : 'Total Receivables (Due)'}
          </span>
          <p className="text-2xl font-black text-white">{formatCurrency(totalReceivablesDue, language)}</p>
          <p className="text-[11px] text-red-100 font-medium">
            {language === 'bn' ? 'ডেলিভারির সময় আদায়যোগ্য' : 'Collect before final dispatch'}
          </p>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 printable-sheet print:p-0 print:border-none print:shadow-none print:space-y-2">
        {/* Print Header */}
        <div className="hidden print:block mb-4">
          <PrintHeader
            documentTitleBn="গ্রাহক ও বকেয়া পাওনা ডিরেক্টরি"
            documentTitleEn="CLIENT DIRECTORY & RECEIVABLES STATEMENT"
            docNumber={`CUST-DIR-${new Date().getFullYear()}`}
            docDate={formatDate(getTodayIsoDate(), language)}
          />
        </div>

        {/* Printable KPI Summary in Print */}
        <div className="hidden print:grid grid-cols-4 gap-2 mb-2">
          <div className="p-2 rounded-lg border border-slate-300 text-left">
            <span className="text-[7pt] font-bold text-black uppercase block">{language === 'bn' ? 'মোট গ্রাহক' : 'Total Clients'}</span>
            <p className="text-xs font-black text-black">{totalClientsCount}</p>
          </div>
          <div className="p-2 rounded-lg border border-slate-300 text-left">
            <span className="text-[7pt] font-bold text-black uppercase block">{language === 'bn' ? 'মোট বিল' : 'Lifetime Sales'}</span>
            <p className="text-xs font-black text-black">{formatCurrency(totalLifetimeSales, language)}</p>
          </div>
          <div className="p-2 rounded-lg border border-slate-300 text-left">
            <span className="text-[7pt] font-bold text-black uppercase block">{language === 'bn' ? 'মোট আদায়' : 'Total Received'}</span>
            <p className="text-xs font-black text-black">{formatCurrency(totalCollections, language)}</p>
          </div>
          <div className="p-2 rounded-lg border border-slate-300 text-left">
            <span className="text-[7pt] font-bold text-black uppercase block">{language === 'bn' ? 'মোট বকেয়া' : 'Total Receivables'}</span>
            <p className="text-xs font-black text-black">{formatCurrency(totalReceivablesDue, language)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'গ্রাহকের নাম, মোবাইল বা ঠিকানা খুঁজুন...' : 'Search customer by name, phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDueOnly(!filterDueOnly)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterDueOnly
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'শুধুমাত্র বাকিদার গ্রাহক' : 'Due Balance Only'}</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto print:overflow-hidden print:w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
              <tr>
                <th className="p-3 rounded-l-xl">{language === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}</th>
                <th className="p-3">{language === 'bn' ? 'যোগাযোগ ও ঠিকানা' : 'Phone & Address'}</th>
                <th className="p-3 text-center">{language === 'bn' ? 'অর্ডার সংখ্যা' : 'Orders'}</th>
                <th className="p-3 text-right">{language === 'bn' ? 'মোট বিল (৳)' : 'Total Billed'}</th>
                <th className="p-3 text-right">{language === 'bn' ? 'পরিশোধিত (৳)' : 'Paid (BDT)'}</th>
                <th className="p-3 text-right">{language === 'bn' ? 'বকেয়া পাওনা (৳)' : 'Due Balance'}</th>
                <th className="p-3 text-center rounded-r-xl no-print">{language === 'bn' ? 'বিবরণ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-300">
              {filteredCustomers.map((cust, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 print:text-black text-sm">{cust.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {language === 'bn' ? 'সর্বশেষ:' : 'Last:'} {formatDate(cust.lastActivityDate, language)}
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="font-mono font-semibold text-slate-800 print:text-black flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 no-print" />
                      <span>{cust.phone}</span>
                    </p>
                    {cust.address && (
                      <p className="text-[10px] text-slate-500 truncate max-w-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 no-print" />
                        <span>{cust.address}</span>
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                        {cust.orders.length} {language === 'bn' ? 'অর্ডার' : 'Orders'}
                      </span>
                      {cust.quotations.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                          {cust.quotations.length} {language === 'bn' ? 'কোটেশন' : 'Quotes'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 print:text-black">
                    {formatCurrency(cust.totalOrderAmount, language)}
                  </td>
                  <td className="p-3 text-right font-semibold text-emerald-700 print:text-black">
                    {formatCurrency(cust.totalPaid, language)}
                  </td>
                  <td className="p-3 text-right">
                    {cust.totalDue > 0 ? (
                      <span className="font-black text-red-600 text-sm print:text-black">
                        {formatCurrency(cust.totalDue, language)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {language === 'bn' ? 'পরিশোধিত' : 'Paid Clear'}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1.5">
                      {cust.totalDue > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setReminderTarget({
                              customerName: cust.name,
                              customerPhone: cust.phone,
                              totalAmount: cust.totalOrderAmount,
                              totalPaid: cust.totalPaid,
                              dueAmount: cust.totalDue,
                              orderNumber: cust.orders[0]?.orderNumber,
                            })
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition-colors"
                          title={language === 'bn' ? 'WhatsApp বকেয়া রিমাইন্ডার পাঠান' : 'Send WhatsApp Reminder'}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">{language === 'bn' ? 'তাগাদা' : 'Reminder'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedCustomerPhone(cust.phone || cust.name)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <span>{language === 'bn' ? 'হিসাব খতিয়ান' : 'Statement'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-black text-slate-900 print:bg-slate-200 border-t-2 border-slate-900">
              <tr>
                <td colSpan={3} className="p-3 text-right uppercase">
                  {language === 'bn' ? 'সর্বমোট যোগফল:' : 'Total Directory Balance:'}
                </td>
                <td className="p-3 text-right">
                  {formatCurrency(filteredCustomers.reduce((s, c) => s + c.totalOrderAmount, 0), language)}
                </td>
                <td className="p-3 text-right text-emerald-700">
                  {formatCurrency(filteredCustomers.reduce((s, c) => s + c.totalPaid, 0), language)}
                </td>
                <td className="p-3 text-right text-red-700 text-sm font-black">
                  {formatCurrency(filteredCustomers.reduce((s, c) => s + c.totalDue, 0), language)}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Customer Statement Modal */}
      {activeCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomerPhone)}
          onClose={() => setSelectedCustomerPhone(null)}
          title={language === 'bn' ? `গ্রাহক খতিয়ান: ${activeCustomer.name}` : `Client Ledger: ${activeCustomer.name}`}
          subtitle={`${activeCustomer.phone} • ${activeCustomer.address}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-left">
            {/* Quick Stat Bar */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {language === 'bn' ? 'মোট অর্ডার বিল' : 'Total Billed'}
                </span>
                <p className="text-base font-black text-slate-900">
                  {formatCurrency(activeCustomer.totalOrderAmount, language)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">
                  {language === 'bn' ? 'মোট পরিশোধ' : 'Total Paid'}
                </span>
                <p className="text-base font-black text-emerald-700">
                  {formatCurrency(activeCustomer.totalPaid, language)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase">
                  {language === 'bn' ? 'বর্তমান বকেয়া' : 'Current Due'}
                </span>
                <p className="text-base font-black text-rose-700">
                  {formatCurrency(activeCustomer.totalDue, language)}
                </p>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-red-600" />
                <span>{language === 'bn' ? 'অর্ডারের তালিকা' : 'Work Orders'}</span>
              </h4>

              {activeCustomer.orders.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                  {language === 'bn' ? 'কোনো চূড়ান্ত অর্ডার পাওয়া যায়নি' : 'No finalized orders'}
                </p>
              ) : (
                <div className="space-y-2">
                  {activeCustomer.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{ord.orderNumber}</span>
                          <span className="text-[10px] text-slate-400">({formatDate(ord.orderDate, language)})</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {ord.items.map((i) => `${i.quantity}x ${i.description}`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">{formatCurrency(ord.grandTotal, language)}</p>
                        <p className="text-[10px] font-semibold text-rose-600">
                          {ord.dueAmount > 0
                            ? `${language === 'bn' ? 'বাকি' : 'Due'}: ${formatCurrency(ord.dueAmount, language)}`
                            : language === 'bn'
                            ? 'পরিশোধিত'
                            : 'Paid'}
                        </p>
                        <Link
                          href={`/orders/${ord.id}`}
                          className="text-[10px] text-red-600 font-bold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <span>{language === 'bn' ? 'ইনভয়েস দেখুন' : 'View Invoice'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quotations List */}
            {activeCustomer.quotations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                  <span>{language === 'bn' ? 'কোটেশন সমূহ' : 'Quotations & Estimates'}</span>
                </h4>

                <div className="space-y-2">
                  {activeCustomer.quotations.map((quo) => (
                    <div
                      key={quo.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{quo.quotationNumber}</span>
                          <span className="text-[10px] text-slate-500">({formatDate(quo.date, language)})</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 font-bold text-slate-700">
                          {quo.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">{formatCurrency(quo.grandTotal, language)}</p>
                        <Link
                          href={`/quotations/${quo.id}`}
                          className="text-[10px] text-amber-700 font-bold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <span>{language === 'bn' ? 'কোটেশন খুলুন' : 'Open Quote'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communication History Section */}
            {(() => {
              const custLogs = communicationLogs.filter(
                (l) =>
                  l.customerPhone === activeCustomer.phone ||
                  l.customerName.toLowerCase() === activeCustomer.name.toLowerCase()
              );

              return (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'bn' ? 'মেসেজ ও যোগাযোগ লগ' : 'Communication History'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {custLogs.length} {language === 'bn' ? 'টি এন্ট্রি' : 'entries'}
                    </span>
                  </h4>

                  {custLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                      {language === 'bn' ? 'কোনো পূর্ববর্তী মেসেজ লগ পাওয়া যায়নি।' : 'No message records logged yet.'}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {custLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {log.channel} • {log.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{log.sentAt}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 font-mono line-clamp-2 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                            {log.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeCustomer.phone}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Client'}</span>
                </a>

                {activeCustomer.totalDue > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setReminderTarget({
                        customerName: activeCustomer.name,
                        customerPhone: activeCustomer.phone,
                        totalAmount: activeCustomer.totalOrderAmount,
                        totalPaid: activeCustomer.totalPaid,
                        dueAmount: activeCustomer.totalDue,
                        orderNumber: activeCustomer.orders[0]?.orderNumber,
                      });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'WhatsApp বকেয়া তাগাদা' : 'Send Reminder'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomerPhone(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reminder Share Modal */}
      {reminderTarget && (
        <ShareMessageModal
          isOpen={Boolean(reminderTarget)}
          onClose={() => setReminderTarget(null)}
          title={language === 'bn' ? 'বকেয়া পরিশোধের তাগাদা বার্তা' : 'Send Payment Reminder'}
          customerName={reminderTarget.customerName}
          customerPhone={reminderTarget.customerPhone}
          type="payment_reminder"
          orderNumber={reminderTarget.orderNumber}
          amount={reminderTarget.dueAmount}
          initialMessageBn={generatePaymentReminderMessage(reminderTarget, settings, 'bn')}
          initialMessageEn={generatePaymentReminderMessage(reminderTarget, settings, 'en')}
        />
      )}
    </div>
  );
}
