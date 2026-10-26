'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ShoppingBag,
  Hammer,
  Building2,
  Users,
  Truck,
  CalendarCheck,
  Trees,
  Calculator,
  Settings,
  DollarSign,
  UserCheck,
  BarChart3,
  X,
  Sparkles,
  ShieldCheck,
  Target,
  BookOpen,
  Landmark,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { language, sidebarOpen, setSidebarOpen, openCftModal, t } = useApp();
  const { orders, deliveryChallans, quotations } = useData();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const pendingQuotationsCount = quotations.filter((q) => q.status === 'draft' || q.status === 'sent').length;

  const menuGroups = [
    {
      titleBn: 'ড্যাশবোর্ড ও সেলস',
      titleEn: 'Dashboard & Sales',
      items: [
        { href: '/', labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard, badge: null },
        { href: '/quotations', labelBn: 'কোটেশন ও বিলিং', labelEn: 'Quotations', icon: FileSpreadsheet, badge: pendingQuotationsCount > 0 ? pendingQuotationsCount : null, badgeColor: 'bg-amber-500 text-white' },
        { href: '/leads', labelBn: 'কাস্টমার লিড', labelEn: 'Leads CRM', icon: Target, badge: 'NEW', badgeColor: 'bg-blue-600 text-white text-[10px]' },
        { href: '/orders', labelBn: 'কাজের অর্ডার', labelEn: 'Orders', icon: ShoppingBag, badge: activeOrdersCount > 0 ? activeOrdersCount : null, badgeColor: 'bg-emerald-600 text-white' },
        { href: '/customers', labelBn: 'গ্রাহক ও বাকি', labelEn: 'Clients', icon: UserCheck, badge: null },
        { href: '/track', labelBn: 'অর্ডার ট্র্যাকিং', labelEn: 'Order Track', icon: ShieldCheck, badge: null },
      ]
    },
    {
      titleBn: 'ফ্যাক্টরি ও প্রোডাকশন',
      titleEn: 'Factory & Production',
      items: [
        { href: '/production', labelBn: 'স-মিল ও প্রোডাকশন', labelEn: 'Sawmill', icon: Hammer, badge: null },
        { href: '/production/kanban', labelBn: 'ফ্যাক্টরি কানবান বোর্ড', labelEn: 'Kanban Board', icon: LayoutDashboard, badge: 'PROD', badgeColor: 'bg-amber-600 text-white text-[10px]' },
        { href: '/production/terminal', labelBn: 'ফ্লোর টার্মিনাল', labelEn: 'Floor Terminal', icon: ShieldCheck, badge: 'LIVE', badgeColor: 'bg-emerald-600 text-white text-[10px]' },
        { href: '/production/dispatch', labelBn: 'ডিসপ্যাচ ও চালান', labelEn: 'Dispatch', icon: Truck, badge: null },
        { href: '/production/analytics', labelBn: 'প্রোডাকশন অ্যানালিটিক্স', labelEn: 'Analytics', icon: BarChart3, badge: null },
        { href: '/production/interior', labelBn: 'ইন্টেরিয়র প্রজেক্ট', labelEn: 'Interior', icon: Building2, badge: null },
        { href: '/inventory', labelBn: 'টিম্বার স্টক', labelEn: 'Timber Stock', icon: Trees, badge: null },
        { href: '/delivery', labelBn: 'ডেলিভারি ও চালান', labelEn: 'Delivery', icon: Truck, badge: null },
        { href: '/craftsmen', labelBn: 'কারিগর ও মিস্ত্রি', labelEn: 'Craftsmen', icon: Users, badge: null },
      ]
    },
    {
      titleBn: 'অ্যাকাউন্টস ও এইচআর',
      titleEn: 'Accounts & HR',
      items: [
        { href: '/accounts', labelBn: 'আয়-ব্যয় ও ব্যাংক', labelEn: 'Accounts', icon: Landmark, badge: 'LIVE', badgeColor: 'bg-emerald-600 text-white text-[10px]' },
        { href: '/attendance', labelBn: 'হাজিরা ও বেতন', labelEn: 'Payroll', icon: CalendarCheck, badge: null },
        { href: '/marketing', labelBn: 'কমিশন ও সেলস', labelEn: 'Commission', icon: Target, badge: '১%', badgeColor: 'bg-red-600 text-white text-[10px]' },
        { href: '/reports', labelBn: 'অডিট রিপোর্ট', labelEn: 'Reports', icon: BarChart3, badge: null },
      ]
    },
    {
      titleBn: 'সিস্টেম ও সেটিংস',
      titleEn: 'System & Settings',
      items: [
        { href: '/catalog', labelBn: 'ডিজাইন ক্যাটালগ', labelEn: 'Catalog', icon: Sparkles, badge: 'NEW', badgeColor: 'bg-red-600 text-white text-[10px]' },
        { href: '/rules-book', labelBn: 'রুলস বুক ও SOP', labelEn: 'SOP', icon: BookOpen, badge: 'SOP', badgeColor: 'bg-red-600 text-white text-[10px]' },
        { href: '/settings', labelBn: 'সেটিংস ও ব্যাকআপ', labelEn: 'Settings', icon: Settings, badge: null },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity no-print print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-black via-zinc-950 to-neutral-950 text-slate-100 flex flex-col border-r border-zinc-800 shadow-2xl transition-transform duration-300 ease-in-out no-print print:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-black/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shadow-black/80 group-hover:scale-105 transition-transform overflow-hidden border border-red-500/40 shrink-0">
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
            <div className="min-w-0">
              <h1 className="font-black text-sm leading-tight tracking-tight text-white group-hover:text-red-400 transition-colors uppercase truncate">
                DHAKA TIMBER
              </h1>
              <p className="text-[11px] text-red-500 font-bold tracking-wide">COMPLEX (DTC)</p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'bn' ? group.titleBn : group.titleEn}
              </div>

              {group.items.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href) &&
                      (item.href !== '/production' || pathname === '/production');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Store Status Info */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-[11px] font-semibold text-slate-200">
                  {language === 'bn' ? 'স-মিল ও কারখানা লাইভ' : 'Workshop Active'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === 'bn' ? 'বাড্ডা ফ্যাক্টরি ও শোরুম' : 'Badda & Mirpur, Dhaka'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30">
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
