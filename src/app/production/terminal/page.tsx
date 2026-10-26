'use client';

import React from 'react';
import { FactoryProvider } from '@/components/factory/context/FactoryContext';
import { FloorTerminal } from '@/components/factory/components/FloorTerminal';
import { JobTicketModal } from '@/components/factory/components/JobTicketModal';

export default function TerminalPage() {
  return (
    <FactoryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <FloorTerminal />
        <JobTicketModal />
      </div>
    </FactoryProvider>
  );
}
