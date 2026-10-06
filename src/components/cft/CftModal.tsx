'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import SawnCftCalculator from './SawnCftCalculator';
import LogCftCalculator from './LogCftCalculator';
import { Ruler, Trees } from 'lucide-react';

export default function CftModal() {
  const { isCftModalOpen, closeCftModal, language } = useApp();
  const [activeTab, setActiveTab] = useState<'sawn' | 'log'>('sawn');

  return (
    <Modal
      isOpen={isCftModalOpen}
      onClose={closeCftModal}
      title={language === 'bn' ? 'টিম্বার ও গোল কাঠ CFT ক্যালকুলেটর' : 'Timber & Round Log CFT Calculator'}
      subtitle={language === 'bn' ? 'সাইজ কাঠ ও গোল কাঠের নির্ভুল সিএফটি ও দাম বের করার টুল' : 'Instant accurate volume and pricing estimation tool'}
      maxWidth="4xl"
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('sawn')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sawn'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>{language === 'bn' ? 'সাইজ কাঠ' : 'Sawn Timber'}</span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'log'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trees className="w-4 h-4 text-red-400" />
          <span>{language === 'bn' ? 'গোল কাঠ' : 'Round Log'}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'sawn' ? <SawnCftCalculator /> : <LogCftCalculator />}
    </Modal>
  );
}
