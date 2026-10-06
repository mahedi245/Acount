'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Languages,
  Calculator,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  Truck,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/utils/dateUtils';
import { translateStatus } from '@/translations/dict';

export default function Header() {
  const { language, toggleLanguage, toggleSidebar, openCftModal, t } = useApp();
  const { orders, deliveryChallans, quotations } = useData();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-sm no-print">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            {language === 'bn' ? 'ঢাকা টিম্বার কমপ্লেক্স' : 'Dhaka Timber Complex'}
          </h2>
          <p className="text-[11px] text-slate-600 font-medium">
            {formatDate(new Date().toISOString(), language)} • {currentTime}
          </p>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Quotation Button */}
        <Link
          href="/quotations"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-red-600" />
          <span>{language === 'bn' ? 'নতুন কোটেশন' : 'New Quotation'}</span>
        </Link>

        {/* Quick CFT Tool Button */}
        <button
          onClick={openCftModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-all shadow-sm"
          title="CFT Calculator"
        >
          <Calculator className="w-3.5 h-3.5 text-red-600" />
          <span className="hidden sm:inline">
            {language === 'bn' ? 'CFT ক্যালকুলেটর' : 'CFT Calc'}
          </span>
        </button>

        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all shadow-sm"
          title="Switch Language"
        >
          <Languages className="w-3.5 h-3.5 text-red-600" />
          <span className="font-bold">{language === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {activeOrders.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            )}
            {activeOrders.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600"></span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'bn' ? 'জরুরি নোটিফিকেশন' : 'Notifications'}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                    {activeOrders.length} {language === 'bn' ? 'চলমান অর্ডার' : 'Active'}
                  </span>
                </div>

                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  {activeOrders.slice(0, 4).map((ord) => (
                    <Link
                      key={ord.id}
                      href={`/orders`}
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-red-600 font-semibold">
                          {translateStatus(ord.status, language)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{ord.customerName}</p>
                      <p className="text-[10px] text-slate-600">
                        {language === 'bn' ? 'ডেলিভারি তারিখ:' : 'Delivery:'}{' '}
                        {formatDate(ord.expectedDeliveryDate, language)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
