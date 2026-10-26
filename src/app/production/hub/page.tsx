'use client';

import React, { useState } from 'react';
import { FactoryProvider, useFactory } from '@/components/factory/context/FactoryContext';
import { DashboardView } from '@/components/factory/components/DashboardView';
import { KanbanBoard } from '@/components/factory/components/KanbanBoard';
import { OrderConfigurator } from '@/components/factory/components/OrderConfigurator';
import { FloorTerminal } from '@/components/factory/components/FloorTerminal';
import { CustomerTrackingView } from '@/components/factory/components/CustomerTrackingView';
import { DispatchManager } from '@/components/factory/components/DispatchManager';
import { AnalyticsView } from '@/components/factory/components/AnalyticsView';
import { JobTicketModal } from '@/components/factory/components/JobTicketModal';
import { ExecutiveReportModal } from '@/components/factory/components/ExecutiveReportModal';
import { FactoryTvHUD } from '@/components/factory/components/FactoryTvHUD';
import { LayoutDashboard, KanbanSquare, PlusCircle, ShieldCheck, MapPin, Truck, BarChart3, Hammer } from 'lucide-react';
import Link from 'next/link';

function FactoryHubContent() {
  const { activeTab, setActiveTab, lang } = useFactory();

  const tabs = [
    { id: 'dashboard', labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', labelBn: 'কানবান পাইপলাইন', labelEn: 'Kanban Board', icon: KanbanSquare },
    { id: 'order-new', labelBn: 'নতুন অর্ডার কনফিগারার', labelEn: 'New Order', icon: PlusCircle },
    { id: 'floor-terminal', labelBn: 'ফ্লোর টার্মিনাল', labelEn: 'Floor Terminal', icon: ShieldCheck },
    { id: 'customer-tracking', labelBn: 'গ্রাহক ট্র্যাকিং', labelEn: 'Customer View', icon: MapPin },
    { id: 'dispatch', labelBn: 'ডিসপ্যাচ ও চালান', labelEn: 'Dispatch', icon: Truck },
    { id: 'analytics', labelBn: 'অ্যানালিটিক্স', labelEn: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-4 text-left">
      {/* Top Navigation Bar mirroring the exact standalone Production app */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">
              {lang === 'bn' ? 'ফ্যাক্টরি সেন্ট্রাল কন্ট্রোল হাব (হুবাহু প্রোডাকশন অ্যাপ)' : 'Factory Central Control Hub'}
            </h1>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'সরাসরি সম্পূর্ণ প্রোডাকশন সিস্টেম এবং ওয়ার্কশপ ড্যাশবোর্ড' : 'Complete factory workshop management system'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-slate-950 rounded-2xl border border-slate-800">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{lang === 'bn' ? t.labelBn : t.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-xl min-h-[600px]">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'order-new' && <OrderConfigurator />}
        {activeTab === 'floor-terminal' && <FloorTerminal />}
        {activeTab === 'customer-tracking' && <CustomerTrackingView />}
        {activeTab === 'dispatch' && <DispatchManager />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </div>

      {/* Global Modals */}
      <JobTicketModal />
      <ExecutiveReportModal />
      <FactoryTvHUD />
    </div>
  );
}

export default function FactoryHubPage() {
  return (
    <FactoryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-6">
        <FactoryHubContent />
      </div>
    </FactoryProvider>
  );
}
