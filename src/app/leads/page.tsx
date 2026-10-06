'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import {
  Plus,
  Search,
  PhoneCall,
  MapPin,
  CalendarDays,
  Edit3,
  Trash2,
  MessageSquare,
  Building,
  User,
  Clock,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Lead, LeadStatus, LeadSource, LeadConversation } from '@/types';
import Modal from '@/components/common/Modal';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currency';

export default function LeadsPage() {
  const { language, showToast } = useApp();
  const { leads, addLead, updateLead, deleteLead } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'All'>('All');

  // Lead Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [source, setSource] = useState<LeadSource>('Phone Call');
  const [status, setStatus] = useState<LeadStatus>('New Lead');
  const [requirementNotes, setRequirementNotes] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [followUpDate, setFollowUpDate] = useState('');

  // Conversation Log Modal
  const [selectedLeadForLogs, setSelectedLeadForLogs] = useState<Lead | null>(null);
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogTalkedBy, setNewLogTalkedBy] = useState('');

  const statuses: LeadStatus[] = [
    'New Lead',
    'Measurement Scheduled',
    'Quotation Sent',
    'Negotiation',
    'Won',
    'Lost'
  ];

  const filteredLeads = leads.filter(l => {
    const matchSearch =
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerPhone.includes(searchTerm) ||
      (l.address && l.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setCustomerName(lead.customerName);
      setCustomerPhone(lead.customerPhone);
      setAddress(lead.address || '');
      setCompanyName(lead.companyName || '');
      setSource(lead.source);
      setStatus(lead.status);
      setRequirementNotes(lead.requirementNotes);
      setEstimatedValue(lead.estimatedValue || 0);
      setFollowUpDate(lead.followUpDate || '');
    } else {
      setEditingLead(null);
      setCustomerName('');
      setCustomerPhone('');
      setAddress('');
      setCompanyName('');
      setSource('Phone Call');
      setStatus('New Lead');
      setRequirementNotes('');
      setEstimatedValue(0);
      setFollowUpDate('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast(language === 'bn' ? 'নাম এবং ফোন নম্বর প্রয়োজন' : 'Name & Phone required', 'error');
      return;
    }

    if (editingLead) {
      updateLead(editingLead.id, {
        customerName,
        customerPhone,
        address,
        companyName,
        source,
        status,
        requirementNotes,
        estimatedValue,
        followUpDate
      });
      showToast(language === 'bn' ? 'লিড সফলভাবে আপডেট হয়েছে!' : 'Lead updated successfully', 'success');
    } else {
      addLead({
        customerName,
        customerPhone,
        address,
        companyName,
        source,
        status,
        requirementNotes,
        estimatedValue,
        followUpDate,
        conversations: []
      });
      showToast(language === 'bn' ? 'নতুন লিড যুক্ত হয়েছে!' : 'New Lead added successfully', 'success');
    }
    setIsModalOpen(false);
  };

  // Add Conversation Record
  const handleAddConversationLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForLogs || !newLogNote.trim()) return;

    const newLog: LeadConversation = {
      id: `conv-${Date.now()}`,
      date: new Date().toISOString(),
      note: newLogNote.trim(),
      talkedBy: newLogTalkedBy.trim() || 'Showroom Staff'
    };

    const updatedLogs = [newLog, ...(selectedLeadForLogs.conversations || [])];

    updateLead(selectedLeadForLogs.id, {
      conversations: updatedLogs
    });

    // Update local state to reflect immediately
    setSelectedLeadForLogs({
      ...selectedLeadForLogs,
      conversations: updatedLogs
    });

    setNewLogNote('');
    showToast(language === 'bn' ? 'কথোপকথন রেকর্ড সেভ হয়েছে!' : 'Discussion note saved!', 'success');
  };

  const getStatusColor = (s: LeadStatus) => {
    switch (s) {
      case 'New Lead':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Measurement Scheduled':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Quotation Sent':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Negotiation':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Won':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Lost':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-red-600" />
            {language === 'bn' ? 'কাস্টমার লিড ও প্রি-সেলস খতিয়ান' : 'Customer Leads & CRM'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'সম্ভাব্য ক্রেতার ঠিকানা, কী কী কথা হয়েছে তার ইতিহাস এবং ফলো-আপ শিডিউল'
              : 'Track client addresses, discussion records, and follow-up schedules'}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন লিড এন্ট্রি' : '+ Add New Lead'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === 'bn' ? 'নাম, ফোন নম্বর বা ঠিকানা দিয়ে খুঁজুন...' : 'Search by Name, Phone, or Address...'
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          />
        </div>
        <div className="flex bg-white rounded-2xl border border-slate-200 p-1 overflow-x-auto shadow-sm">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'bn' ? 'সব লিড' : 'All'} ({leads.length})
          </button>
          {statuses.map(s => {
            const count = leads.filter(l => l.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filterStatus === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{s}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      filterStatus === s ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 font-bold space-y-2">
          <PhoneCall className="w-8 h-8 mx-auto text-slate-300" />
          <p>{language === 'bn' ? 'কোনো লিড বা সম্ভাব্য কাস্টমার রেকর্ড পাওয়া যায়নি।' : 'No leads found.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map(lead => {
            const convCount = lead.conversations?.length || 0;
            return (
              <div
                key={lead.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${getStatusColor(lead.status)}`}
                    >
                      {lead.status}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                      {lead.source}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-snug">{lead.customerName}</h3>
                    {lead.companyName && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" /> {lead.companyName}
                      </p>
                    )}
                  </div>

                  {/* Phone & Address Details */}
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
                    <p className="flex items-center gap-2 font-mono font-bold text-slate-800">
                      <PhoneCall className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{lead.customerPhone}</span>
                    </p>

                    <p className="flex items-start gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {lead.address ? lead.address : <em className="text-slate-400">ঠিকানা দেওয়া হয়নি</em>}
                      </span>
                    </p>
                  </div>

                  {/* Requirements Note */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      কাস্টমারের চাহিদা / রিকোয়ারমেন্ট:
                    </span>
                    <p className="line-clamp-2 leading-relaxed">{lead.requirementNotes}</p>
                    {lead.estimatedValue && lead.estimatedValue > 0 ? (
                      <p className="font-bold text-emerald-700 pt-1 border-t border-slate-200/60 font-mono">
                        সম্ভাব্য কাজের মূল্য: {formatCurrency(lead.estimatedValue, language)}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Bottom Actions & Conversation History Trigger */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedLeadForLogs(lead)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>কথোপকথন রেকর্ড ({convCount})</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(lead)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="এডিট করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি নিশ্চিত "${lead.customerName}" এর রেকর্ড মুছে ফেলতে চান?`)) {
                            deleteLead(lead.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {lead.followUpDate && (
                    <div className="text-[11px] font-bold text-red-600 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-xl border border-red-100">
                      <CalendarDays className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>পরবর্তী ফলো-আপ: {formatDate(lead.followUpDate, language)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEAD ADD / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingLead ? 'কাস্টমার লিড এডিট করুন' : 'নতুন সম্ভাব্য কাস্টমার (Lead) যোগ করুন'}
          subtitle="ঠিকানা, চাহিদা ও যোগাযোগের তথ্য সেভ রাখুন"
          maxWidth="xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টমারের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ইঞ্জিনিয়ার রফিকুল ইসলাম"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ফোন নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টমার / সাইটের ঠিকানা *</label>
                <input
                  type="text"
                  placeholder="বাড়ি #১২, রোড #৪, সেক্টর #৭, উত্তরা, ঢাকা"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">কোম্পানি / প্রজেক্টের নাম (যদি থাকে)</label>
                <input
                  type="text"
                  placeholder="ডেল্টা বিল্ডার্স / নিজ বাড়ি"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টমারের চাহিদা ও কি কি লাগবে *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="যেমন: চিটাগাং সেগুনের ৫টি মেইন ডোর এবং মেহগনি চৌকাঠ লাগবে। বাজেট নিয়ে কথা হয়েছে।"
                  value={requirementNotes}
                  onChange={e => setRequirementNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বর্তমান স্ট্যাটাস</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">লিডের উৎস (Source)</label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {['Phone Call', 'Walk-in', 'WhatsApp', 'Facebook', 'Agent Referral'].map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সম্ভাব্য মোট কাজের পরিমাণ (৳)</label>
                <input
                  type="number"
                  placeholder="যেমন: 50000"
                  value={estimatedValue || ''}
                  onChange={e => setEstimatedValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পরবর্তী ফলো-আপের তারিখ</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                লিড সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONVERSATION & DISCUSSION HISTORY MODAL */}
      {selectedLeadForLogs && (
        <Modal
          isOpen={!!selectedLeadForLogs}
          onClose={() => setSelectedLeadForLogs(null)}
          title={`কথোপকথন ও আলোচনার ইতিহাস: ${selectedLeadForLogs.customerName}`}
          subtitle={`ফোন: ${selectedLeadForLogs.customerPhone} • ঠিকানা: ${selectedLeadForLogs.address || 'দেওয়া নেই'}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-left">
            {/* New Note Form */}
            <form onSubmit={handleAddConversationLog} className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-2">
              <span className="text-xs font-extrabold text-amber-900 block">
                + নতুন কি কি কথা হলো তা লিখে রাখুন:
              </span>
              <textarea
                required
                rows={2}
                placeholder="আজকে কথা হলো, কাস্টমার বলেছে রবিবার সাইট ভিজিট করতে। দরদাম নিয়ে সন্তুষ্ট..."
                value={newLogNote}
                onChange={e => setNewLogNote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="কার সাথে কথা হলো / কে কথা বলেছেন (যেমন: শোরুম ম্যানেজার)"
                  value={newLogTalkedBy}
                  onChange={e => setNewLogTalkedBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-medium flex-1 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>নোট সেভ করুন</span>
                </button>
              </div>
            </form>

            {/* Conversation Timeline */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                আগের সব কথাবার্তার খতিয়ান:
              </span>

              {(!selectedLeadForLogs.conversations || selectedLeadForLogs.conversations.length === 0) ? (
                <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  এখনো কোনো পূর্ববর্তী আলোচনার নোট যুক্ত করা হয়নি। উপরের ফর্ম দিয়ে যোগ করুন।
                </div>
              ) : (
                selectedLeadForLogs.conversations.map(conv => (
                  <div key={conv.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <User className="w-3 h-3 text-red-600" />
                        {conv.talkedBy || 'Showroom Staff'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.date).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-1">
                      {conv.note}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedLeadForLogs(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
