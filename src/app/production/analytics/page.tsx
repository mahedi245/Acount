'use client';

import React from 'react';
import { FactoryProvider } from '@/components/factory/context/FactoryContext';
import { AnalyticsView } from '@/components/factory/components/AnalyticsView';

export default function AnalyticsPage() {
  return (
    <FactoryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <AnalyticsView />
      </div>
    </FactoryProvider>
  );
}
