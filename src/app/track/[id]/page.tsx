'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Package,
  Calendar,
  Phone,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  Hammer,
  Sparkles,
  Receipt,
  FileText,
  Search,
  ExternalLink,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Trees,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatCft } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { translateWoodSpecies, translateDoorDesign, translatePolishType } from '@/translations/dict';
import QRCode from '@/components/common/QRCode';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, deliveryChallans, quotations, settings } = useData();
  const { language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const paramId = (params?.id as string) || '';

  // Find order by ID, Order Number, or Quotation Number
  const order = orders.find(
    (o) =>
      o.id.toLowerCase() === paramId.toLowerCase() ||
      o.orderNumber.toLowerCase() === paramId.toLowerCase() ||
      (o.quotationNumber && o.quotationNumber.toLowerCase() === paramId.toLowerCase()) ||
      (o.quotationId && o.quotationId.toLowerCase() === paramId.toLowerCase())
  );

  const quote = !order
    ? quotations.find(
        (q) =>
          q.id.toLowerCase() === paramId.toLowerCase() ||
          q.quotationNumber.toLowerCase() === paramId.toLowerCase()
      )
    : null;

  // Matching Challans for this order
  const challans = order
    ? deliveryChallans.filter(
        (c) => c.orderId === order.id || c.orderNumber === order.orderNumber
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/track/${encodeURIComponent(searchQuery.trim())}`);
  };

  const steps = [
    {
      id: 'step-1',
      titleBn: '১. নিশ্চিত অর্ডার',
      titleEn: '1. Order Confirmed',
      descBn: 'অর্ডার নথিভুক্ত ও অগ্রিম গ্রহণ সম্পন্ন',
      descEn: 'Order booked with advance payment',
      icon: CheckCircle2,
      isCompleted: true,
      isActive: order?.status === 'confirmed',
    },
    {
      id: 'step-2',
      titleBn: '২. কাঠ চেরাই ও সাইজিং',
      titleEn: '2. Sawmill & Timber Sizing',
      descBn: 'স-মিলে সঠিক মাপে কাঠ সাইজ করা হচ্ছে',
      descEn: 'Timber sizing and sawing at mill',
      icon: Trees,
      isCompleted:
        order?.status === 'wood_sizing' ||
        order?.status === 'carpentry' ||
        order?.status === 'polish' ||
        order?.status === 'ready_for_delivery' ||
        order?.status === 'partial_delivered' ||
        order?.status === 'delivered',
      isActive: order?.status === 'wood_sizing',
    },
    {
      id: 'step-3',
      titleBn: '৩. মিস্ত্রি কাজ ও ফ্রেম তৈরি',
      titleEn: '3. Carpentry & Assembly',
      descBn: 'কারিগর দ্বারা পাল্লা ও চৌকাঠ তৈরি ও জয়েন্টিং',
      descEn: 'Carpentry frame & shutter fabrication',
      icon: Hammer,
      isCompleted:
        order?.status === 'carpentry' ||
        order?.status === 'polish' ||
        order?.status === 'ready_for_delivery' ||
        order?.status === 'partial_delivered' ||
        order?.status === 'delivered',
      isActive: order?.status === 'carpentry',
    },
    {
      id: 'step-4',
      titleBn: '৪. পলিশিং ও ফিনিশিং',
      titleEn: '4. Polish & Finishing',
      descBn: 'PU/হ্যান্ড পলিশ, সিরিজ পেপার ও গ্রুভিং ফিনিশিং',
      descEn: 'PU or hand polishing, coating and sanding',
      icon: Sparkles,
      isCompleted:
        order?.status === 'polish' ||
        order?.status === 'ready_for_delivery' ||
        order?.status === 'partial_delivered' ||
        order?.status === 'delivered',
      isActive: order?.status === 'polish',
    },
    {
      id: 'step-5',
      titleBn: '৫. ফ্যাক্টরি কোয়ালিটি চেক',
      titleEn: '5. Quality Check & Ready',
      descBn: 'নিখুঁত সাইজ ও কোয়ালিটি যাচাই সম্পন্ন, গাড়িতে তোলার জন্য প্রস্তুত',
      descEn: 'Inspection verified, ready for site dispatch',
      icon: Package,
      isCompleted:
        order?.status === 'ready_for_delivery' ||
        order?.status === 'partial_delivered' ||
        order?.status === 'delivered',
      isActive: order?.status === 'ready_for_delivery',
    },
    {
      id: 'step-6',
      titleBn: '৬. সাইটে ডেলিভারি সম্পন্ন',
      titleEn: '6. Delivered to Site',
      descBn: 'চালানসহ মালামাল কাস্টমারের ঠিকানায় পৌঁছে দেওয়া হয়েছে',
      descEn: 'Items delivered with official challan to customer site',
      icon: Truck,
      isCompleted: order?.status === 'delivered',
      isActive: order?.status === 'delivered',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 text-left">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand Header & Top Bar (White Themed) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-md">
          <div className="flex items-center gap-3.5">
            <Link
              href="/track"
              className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center border-2 border-red-600 shadow-md hover:scale-105 transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="DTC Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  {settings.companyNameBn || 'ঢাকা টিম্বার কমপ্লেক্স'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-extrabold text-[10px] border border-red-200">
                  DTC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'bn'
                  ? 'স্মার্ট লাইভ অর্ডার ও ডেলিভারি ট্র্যাকিং পোর্টাল'
                  : 'Live Work Order & Delivery Tracking Portal'}
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'অর্ডার নম্বর লিখুন...' : 'Order # / Quote #...'}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white w-44 sm:w-52 font-mono font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all active:scale-95"
            >
              {language === 'bn' ? 'খুঁজুন' : 'Search'}
            </button>
          </form>
        </div>

        {/* Not Found View */}
        {!order && !quote ? (
          <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-md space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'অর্ডার বা কোটেশন পাওয়া যায়নি' : 'Order or Quotation Not Found'}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {language === 'bn'
                ? 'অনুগ্রহ করে সঠিক অর্ডার নম্বর (যেমন: DTC-WO-2026-001) অথবা কোটেশন নম্বর দিয়ে সার্চ করুন।'
                : 'Please verify the Order Number (e.g. DTC-WO-2026-001) or Quotation Number and search again.'}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/orders"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {language === 'bn' ? 'অর্ডার তালিকায় যান' : 'Go to Orders'}
              </Link>
              <a
                href={`tel:${settings.phone1}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'শোরুমে কল করুন' : 'Call DTC Hotline'}</span>
              </a>
            </div>
          </div>
        ) : null}

        {/* ORDER FOUND VIEW (Clean White & Slate) */}
        {order && (
          <div className="space-y-6">
            {/* Top Status Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'bn' ? 'অফিসিয়াল অর্ডার ভেরিফাইড' : 'DTC Verified Record'}</span>
                    </span>

                    <span className="text-xs text-slate-500 font-mono font-bold">
                      {order.orderNumber}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {order.customerName}
                  </h2>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{order.siteLocation || order.customerAddress}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {language === 'bn' ? 'প্রত্যাশিত ডেলিভারি' : 'Expected Delivery'}
                    </span>
                    <p className="text-xs font-black text-red-600 mt-0.5">
                      {formatDate(order.expectedDeliveryDate, language)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {language === 'bn' ? 'অর্ডার বুকিং:' : 'Booked:'} {formatDate(order.orderDate, language)}
                    </span>
                  </div>

                  <div className="p-1 rounded-xl bg-white border border-slate-200">
                    <QRCode
                      value={`https://dhakatimbercomplex.com/track/${order.id}`}
                      size={60}
                      fgColor="#000000"
                      bgColor="#ffffff"
                      centerLabel="DTC"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>{language === 'bn' ? 'কারখানা লাইভ অগ্রগতি:' : 'Factory Live Progress:'}</span>
                  </span>
                  <span className="font-black text-red-600 text-sm">
                    {order.productionProgressPercent}%
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${order.productionProgressPercent}%` }}
                  />
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-2xl border text-xs transition-all ${
                          step.isActive
                            ? 'bg-red-50 border-red-400 text-red-950 shadow-md shadow-red-600/10'
                            : step.isCompleted
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            className={`w-4 h-4 ${
                              step.isActive
                                ? 'text-red-600 animate-pulse'
                                : step.isCompleted
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          />
                          {step.isCompleted ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          ) : step.isActive ? (
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                          ) : null}
                        </div>
                        <h4 className="font-bold text-slate-900 text-[11px] leading-tight">
                          {language === 'bn' ? step.titleBn : step.titleEn}
                        </h4>
                        <p className="text-[9.5px] text-slate-600 mt-1 leading-tight">
                          {language === 'bn' ? step.descBn : step.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Items & Payment Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ordered Items (2 cols) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Package className="w-4 h-4 text-red-600" />
                  <span>{language === 'bn' ? 'অর্ডারকৃত কাঠের মালামাল' : 'Ordered Timber Items'}</span>
                </h3>

                <div className="space-y-3">
                  {order.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{it.description}</p>
                          <p className="text-slate-600 font-medium mt-0.5">
                            {translateWoodSpecies(it.woodSpecies, language)}
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-white font-mono font-bold text-slate-900 text-xs border border-slate-200 shadow-2xs">
                          {it.quantity} {language === 'bn' ? 'টি' : 'Pcs'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1">
                        <span className="px-2 py-0.5 rounded bg-white font-mono text-slate-800 border border-slate-200">
                          {it.lengthFt}' × {it.widthIn}" × {it.thicknessIn}"
                        </span>
                        {it.totalCft ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200">
                            {formatCft(it.totalCft, language)}
                          </span>
                        ) : null}
                        {it.design && (
                          <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            {translateDoorDesign(it.design, language)}
                          </span>
                        )}
                        {it.polishType && (
                          <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            {translatePolishType(it.polishType, language)}
                          </span>
                        )}
                      </div>

                      {/* Delivery Status Indicator */}
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                        <span className="text-slate-500">
                          {language === 'bn' ? 'সাইটে পৌঁছানো হয়েছে:' : 'Delivered to site:'}
                        </span>
                        <span
                          className={`font-bold ${
                            it.deliveredQuantity >= it.quantity
                              ? 'text-emerald-700'
                              : it.deliveredQuantity > 0
                              ? 'text-amber-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {it.deliveredQuantity} / {it.quantity} {language === 'bn' ? 'টি সম্পন্ন' : 'Pcs'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary Ledger */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'পেমেন্ট খতিয়ান' : 'Payment Ledger'}</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 px-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100">
                      <span>{language === 'bn' ? 'সর্বমোট অর্ডার মূল্য:' : 'Grand Total:'}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(order.grandTotal, language)}</span>
                    </div>

                    <div className="flex justify-between py-1.5 px-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                      <span>{language === 'bn' ? 'মোট নগদ পরিশোধ:' : 'Total Paid:'}</span>
                      <span className="font-black text-emerald-700">{formatCurrency(order.totalPaid, language)}</span>
                    </div>

                    <div className="flex justify-between py-2 px-3 rounded-xl bg-red-50 text-red-950 border border-red-200">
                      <span>{language === 'bn' ? 'অবশিষ্ট বকেয়া:' : 'Due Balance:'}</span>
                      <span className="font-black text-red-600 text-sm">{formatCurrency(order.dueAmount, language)}</span>
                    </div>
                  </div>

                  {/* Payment Records */}
                  {order.paymentRecords.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {language === 'bn' ? 'গৃহীত কিস্তি রসিদসমূহ:' : 'Receipt Vouchers:'}
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {order.paymentRecords.map((pay) => (
                          <div
                            key={pay.id}
                            className="p-2.5 rounded-xl bg-slate-50 text-[11px] flex items-center justify-between border border-slate-200"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{pay.method}</p>
                              <p className="text-[10px] text-slate-500">{formatDate(pay.date, language)}</p>
                            </div>
                            <span className="font-black text-emerald-700">
                              {formatCurrency(pay.amount, language)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hotline support box */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 mt-4 shadow-md">
                  <p className="text-[11px] font-bold text-slate-300">
                    {language === 'bn' ? 'যেকোনো অনুসন্ধানে সরাসরি যোগাযোগ:' : 'Direct Assistance Hotline:'}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <a
                      href={`tel:${settings.phone1}`}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{settings.phone1}</span>
                    </a>
                    <a
                      href={`https://wa.me/8801733743384?text=${encodeURIComponent(`Hello DTC, inquiry regarding Order #${order.orderNumber}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                    >
                      <span>WhatsApp মেসেজ পাঠান</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Challans Box if any */}
            {challans.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>{language === 'bn' ? 'ডেলিভারি চালান ও পরিবহন রেকর্ড' : 'Delivery Challans & Dispatch Log'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {challans.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-700 text-xs">{ch.challanNumber}</span>
                        <span className="text-[10px] text-slate-500">{formatDate(ch.deliveryDate, language)}</span>
                      </div>

                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        <p>
                          <strong className="text-slate-500">গাড়ি:</strong> {ch.vehicleNumber || 'পিকআপ ভ্যান'}
                        </p>
                        {ch.driverName && (
                          <p>
                            <strong className="text-slate-500">চালক:</strong> {ch.driverName} {ch.driverPhone && `(${ch.driverPhone})`}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[11px]">
                        <span className="text-slate-500 block">{language === 'bn' ? 'মালামাল:' : 'Items:'}</span>
                        <p className="font-semibold text-slate-900">
                          {ch.deliveredItems.map((i) => `${i.quantity}x ${i.itemDescription}`).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
