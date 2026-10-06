'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ShoppingBag,
  Calculator,
  Hammer,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { language, openCftModal } = useApp();

  const navItems = [
    {
      href: '/',
      labelBn: 'ড্যাশবোর্ড',
      labelEn: 'Home',
      icon: LayoutDashboard,
    },
    {
      href: '/quotations',
      labelBn: 'কোটেশন',
      labelEn: 'Quotes',
      icon: FileSpreadsheet,
    },
    {
      href: '/orders',
      labelBn: 'অর্ডার',
      labelEn: 'Orders',
      icon: ShoppingBag,
    },
    {
      href: '/production',
      labelBn: 'প্রোডাকশন',
      labelEn: 'Workshop',
      icon: Hammer,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg no-print">
      {navItems.map((item) => {
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-red-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px]">
              {language === 'bn' ? item.labelBn : item.labelEn}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
