'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShieldCheck, Phone, MapPin, Truck, Trees, Sparkles, ArrowRight, Package } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';

export default function TrackLookupPage() {
  const router = useRouter();
  const { settings, orders } = useData();
  const { language } = useApp();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/track/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8">
      {/* Container */}
      <div className="max-w-2xl mx-auto w-full my-auto space-y-8 py-10">
        {/* Brand Banner */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-white p-2 mx-auto flex items-center justify-center border-2 border-red-600 shadow-xl shadow-red-600/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="DTC Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-1.5">
            <span className="px-3.5 py-1 rounded-full bg-red-50 text-red-700 font-extrabold text-xs uppercase tracking-wider border border-red-200 inline-block shadow-2xs">
              {settings.companyNameBn || 'ঢাকা টিম্বার কমপ্লেক্স (DTC)'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'bn' ? 'স্মার্ট অর্ডার ও ডেলিভারি ট্র্যাকিং' : 'Live Order & Delivery Tracking'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {language === 'bn'
                ? 'আপনার ইনভয়েস বা চালানের কিউআর কোড স্ক্যান করুন অথবা অর্ডার নম্বর লিখে তাৎক্ষণিক লাইভ স্ট্যাটাস দেখুন।'
                : 'Enter your Work Order Number or scan QR code to check real-time workshop & delivery progress.'}
            </p>
          </div>
        </div>

        {/* Search Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'অর্ডার নম্বর / কোটেশন নম্বর লিখুন:' : 'Enter Order Number / Quotation Number:'}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="যেমন: DTC-WO-2026-001"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{language === 'bn' ? 'লাইভ স্ট্যাটাস দেখুন' : 'Track Order Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Recent active orders helper */}
          {orders.length > 0 && (
            <div className="pt-4 border-t border-slate-100 text-left space-y-2">
              <span className="text-[10.5px] uppercase font-bold text-slate-500 block">
                {language === 'bn' ? 'সাম্প্রতিক কাজের অর্ডার (নমুনা ট্র্যাকিং):' : 'Sample Active Orders:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => router.push(`/track/${o.id}`)}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-red-50 text-[11px] font-mono font-bold text-slate-700 hover:text-red-700 border border-slate-200 transition-colors"
                  >
                    {o.orderNumber} ({o.customerName.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Features Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-slate-100">
            <div className="p-2 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-800 text-[11px]">১০০% জেনুইন কাঠ</p>
              <p className="text-[9.5px] text-slate-500">সিজনিং গ্যারান্টি</p>
            </div>
            <div className="p-2 space-y-1">
              <Sparkles className="w-4 h-4 text-amber-600 mx-auto" />
              <p className="font-bold text-slate-800 text-[11px]">সিএনসি কার্ভিং</p>
              <p className="text-[9.5px] text-slate-500">নিখুঁত খোদাই</p>
            </div>
            <div className="p-2 space-y-1">
              <Truck className="w-4 h-4 text-blue-600 mx-auto" />
              <p className="font-bold text-slate-800 text-[11px]">নিরাপদ চালান</p>
              <p className="text-[9.5px] text-slate-500">সাইটে ডেলিভারি</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            {settings.companyNameEn || 'DHAKA TIMBER COMPLEX'}
          </p>
          <p className="text-[11px]">
            {language === 'bn' ? 'শোরুম: শেওড়াপাড়া, মিরপুর • ফ্যাক্টরি: সাঁতারকুল, উত্তর বাড্ডা, ঢাকা।' : 'Showroom: Sheorapara, Mirpur • Factory: Badda, Dhaka.'}
          </p>
          <p className="text-[11px]">
            হটলাইন: <strong className="text-slate-800 font-mono">{settings.phone1}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
