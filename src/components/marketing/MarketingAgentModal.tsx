'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { MarketingAgent } from '@/types';
import { useApp } from '@/context/AppContext';
import { User, Phone, Mail, Award, DollarSign, FileText } from 'lucide-react';
import { getTodayIsoDate } from '@/utils/dateUtils';

interface MarketingAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: Omit<MarketingAgent, 'id'>) => void;
  editingAgent?: MarketingAgent | null;
}

export default function MarketingAgentModal({
  isOpen,
  onClose,
  onSave,
  editingAgent,
}: MarketingAgentModalProps) {
  const { language } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('Senior Sales Executive');
  const [commissionRatePerLakh, setCommissionRatePerLakh] = useState<number>(1000);
  const [joinDate, setJoinDate] = useState(getTodayIsoDate());
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingAgent) {
      setName(editingAgent.name || '');
      setPhone(editingAgent.phone || '');
      setEmail(editingAgent.email || '');
      setDesignation(editingAgent.designation || 'Senior Sales Executive');
      setCommissionRatePerLakh(editingAgent.commissionRatePerLakh || 1000);
      setJoinDate(editingAgent.joinDate || getTodayIsoDate());
      setIsActive(editingAgent.isActive !== false);
      setNotes(editingAgent.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setDesignation('Senior Sales Executive');
      setCommissionRatePerLakh(1000);
      setJoinDate(getTodayIsoDate());
      setIsActive(true);
      setNotes('');
    }
  }, [editingAgent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(language === 'bn' ? 'দয়া করে নাম ও মোবাইল নম্বর লিখুন।' : 'Please enter name and phone.');
      return;
    }

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      designation: designation.trim(),
      commissionRatePerLakh: Number(commissionRatePerLakh) || 1000,
      joinDate,
      isActive,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingAgent
          ? language === 'bn'
            ? 'মার্কেটিং এজেন্ট সম্পাদনা'
            : 'Edit Marketing Agent'
          : language === 'bn'
          ? 'নতুন মার্কেটিং এজেন্ট / প্রতিনিধি যুক্ত করুন'
          : 'Add New Marketing Agent'
      }
      subtitle={
        language === 'bn'
          ? 'অর্ডার কালেকশনের উপর ১% কমিশন ও বিক্রয় প্রতিনিধি প্রোফাইল'
          : 'Sales representative profile & 1% collection-based commission'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'প্রতিনিধির নাম *' : 'Agent Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'bn' ? 'কাজী আরিফুল ইসলাম' : 'e.g. Kazi Ariful Islam'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
            </label>
            <input
              type="text"
              required
              placeholder="01712-XXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'পদবী / রোল' : 'Designation / Role'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'Senior Sales Executive / Interior Partner' : 'e.g. Sales Executive'}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
            </label>
            <input
              type="email"
              placeholder="agent@dhakatimbercomplex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              {language === 'bn' ? 'কমিশন রেট (প্রতি লাখে টাকা)' : 'Commission Rate (Per 1 Lakh Tk)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={commissionRatePerLakh}
                onChange={(e) => setCommissionRatePerLakh(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ৳ (১%)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {language === 'bn' ? 'ডিফল্ট: ১,০০০ টাকা = মোট কালেকশনের ১%' : 'Default: 1,000 Tk = 1% on collection'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}
            </label>
            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {language === 'bn' ? 'মন্তব্য ও দায়িত্বপ্রাপ্ত এলাকা' : 'Notes & Assigned Area'}
          </label>
          <textarea
            rows={2}
            placeholder={language === 'bn' ? 'উত্তরা ও মিরপুর জোনের কর্পোরেট ক্লায়েন্ট ও প্রজেক্ট...' : 'Assigned projects and notes...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="agent-active-toggle"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
          />
          <label htmlFor="agent-active-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
            {language === 'bn' ? 'সক্রিয় এজেন্ট (Active)' : 'Active Agent'}
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all"
          >
            {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Agent'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
