'use client';

import React from 'react';
import { FactoryProvider } from '@/components/factory/context/FactoryContext';
import { DispatchManager } from '@/components/factory/components/DispatchManager';

export default function DispatchPage() {
  return (
    <FactoryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <DispatchManager />
      </div>
    </FactoryProvider>
  );
}
