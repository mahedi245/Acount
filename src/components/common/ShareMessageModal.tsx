'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  X,
  Phone,
  Smartphone,
  ExternalLink,
  Languages,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import {
  CommunicationChannel,
  CommunicationType,
  Language,
} from '@/types';
import { formatWhatsAppUrl, formatSmsUrl } from '@/utils/messageTemplates';

interface ShareMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  customerName: string;
  customerPhone: string;
  type: CommunicationType;
  orderNumber?: string;
  quotationNumber?: string;
  amount?: number;
  initialMessageBn: string;
  initialMessageEn?: string;
}

export default function ShareMessageModal({
  isOpen,
  onClose,
  title,
  customerName,
  customerPhone,
  type,
  orderNumber,
  quotationNumber,
  amount,
  initialMessageBn,
  initialMessageEn,
}: ShareMessageModalProps) {
  const { language: appLanguage, showToast } = useApp();
  const { addCommunicationLog } = useData();

  const [messageLang, setMessageLang] = useState<Language>(appLanguage);
  const [editedMessage, setEditedMessage] = useState(initialMessageBn);
  const [copied, setCopied] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel>('whatsapp');

  useEffect(() => {
    if (messageLang === 'en' && initialMessageEn) {
      setEditedMessage(initialMessageEn);
    } else {
      setEditedMessage(initialMessageBn);
    }
  }, [messageLang, initialMessageBn, initialMessageEn]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedMessage);
      setCopied(true);
      showToast(
        appLanguage === 'bn' ? 'মেসেজ কপি হয়েছে!' : 'Message copied to clipboard!',
        'success'
      );

      // Record in communication log
      addCommunicationLog({
        customerName,
        customerPhone,
        type,
        channel: selectedChannel,
        message: editedMessage,
        orderNumber,
        quotationNumber,
        amount,
        status: 'copied',
      });

      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendWhatsApp = () => {
    // Record in communication log
    addCommunicationLog({
      customerName,
      customerPhone,
      type,
      channel: 'whatsapp',
      message: editedMessage,
      orderNumber,
      quotationNumber,
      amount,
      status: 'sent',
    });

    showToast(
      appLanguage === 'bn' ? 'WhatsApp বার্তা প্রস্তুত করা হচ্ছে...' : 'Opening WhatsApp...',
      'success'
    );

    const url = formatWhatsAppUrl(customerPhone, editedMessage);
    window.open(url, '_blank');
    onClose();
  };

  const handleSendSms = () => {
    // Record in communication log
    addCommunicationLog({
      customerName,
      customerPhone,
      type,
      channel: 'sms',
      message: editedMessage,
      orderNumber,
      quotationNumber,
      amount,
      status: 'sent',
    });

    showToast(
      appLanguage === 'bn' ? 'SMS অ্যাপ চালু করা হচ্ছে...' : 'Launching SMS App...',
      'success'
    );

    const url = formatSmsUrl(customerPhone, editedMessage);
    window.location.href = url;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto no-print">
      <div className="relative w-full max-w-lg bg-zinc-950 text-slate-100 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {title || (appLanguage === 'bn' ? 'কাস্টমার মেসেজ ও WhatsApp' : 'Send Customer Alert')}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                {customerName} • <span className="font-mono text-zinc-300">{customerPhone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Channel and Language Toggle */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedChannel('whatsapp')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('sms')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                  selectedChannel === 'sms'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>SMS</span>
              </button>
            </div>

            {initialMessageEn && (
              <button
                type="button"
                onClick={() => setMessageLang(messageLang === 'bn' ? 'en' : 'bn')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-semibold border border-zinc-800"
              >
                <Languages className="w-3.5 h-3.5 text-zinc-400" />
                <span>{messageLang === 'bn' ? 'বাংলা' : 'English'}</span>
              </button>
            )}
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>{appLanguage === 'bn' ? 'বার্তা প্রিভিউ (প্রয়োজনে এডিট করুন):' : 'Message Preview (Editable):'}</span>
              <span>{editedMessage.length} characters</span>
            </div>
            <textarea
              rows={8}
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Quick Notice Info */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[10.5px] text-zinc-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {appLanguage === 'bn'
                ? 'বার্তা পাঠালে স্বয়ংক্রিয়ভাবে গ্রাহকের যোগাযোগ খতিয়ানে (Communication Log) রেকর্ড সংরক্ষিত থাকবে।'
                : 'Sending will automatically record an activity entry in Customer Communication History.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all active:scale-95 border border-zinc-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{appLanguage === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-300" />
                  <span>{appLanguage === 'bn' ? 'মেসেজ কপি করুন' : 'Copy Message'}</span>
                </>
              )}
            </button>

            {selectedChannel === 'whatsapp' ? (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{appLanguage === 'bn' ? 'WhatsApp এ পাঠান' : 'Send to WhatsApp'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendSms}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>{appLanguage === 'bn' ? 'SMS পাঠান' : 'Send via SMS'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
