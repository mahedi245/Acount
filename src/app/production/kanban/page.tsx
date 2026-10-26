'use client';

import React from 'react';
import { FactoryProvider } from '@/components/factory/context/FactoryContext';
import { KanbanBoard } from '@/components/factory/components/KanbanBoard';
import { JobTicketModal } from '@/components/factory/components/JobTicketModal';

export default function KanbanPage() {
  return (
    <FactoryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <KanbanBoard />
        <JobTicketModal />
      </div>
    </FactoryProvider>
  );
}
