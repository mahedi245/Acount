'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Download,
  Upload,
  RotateCcw,
  Globe,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Phone,
  Mail,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';

export default function SettingsPage() {
  const { language, setLanguage, showToast, t } = useApp();
  const { settings, updateSettings, exportDataJson, importDataJson, resetToDemoData } =
    useData();

  const [companyNameBn, setCompanyNameBn] = useState(settings.companyNameBn);
  const [companyNameEn, setCompanyNameEn] = useState(settings.companyNameEn);
  const [taglineBn, setTaglineBn] = useState(settings.taglineBn);
  const [taglineEn, setTaglineEn] = useState(settings.taglineEn);
  const [showroomAddressBn, setShowroomAddressBn] = useState(
    settings.showroomAddressBn || '১০৪৩, বেগম রোকেয়া সরণি, মেট্রোরেল ২৯৮ পিলার, শেওড়াপাড়া, মিরপুর, ঢাকা।'
  );
  const [showroomAddressEn, setShowroomAddressEn] = useState(
    settings.showroomAddressEn || '1043, Begum Rokeya Sarani, Metro 298 Piller, Sheorapara, Mirpur, Dhaka.'
  );
  const [factoryAddressBn, setFactoryAddressBn] = useState(
    settings.factoryAddressBn || '২০২, সাঁতারকুল রোড, উত্তর বাড্ডা, ঢাকা-১২১২।'
  );
  const [factoryAddressEn, setFactoryAddressEn] = useState(
    settings.factoryAddressEn || '202, Satarkul Road, Uttar Badda, Dhaka-1212.'
  );
  const [phone1, setPhone1] = useState(settings.phone1 || '+88 01733-743384');
  const [phone2, setPhone2] = useState(settings.phone2 || '+88 01847-456584');
  const [telephone1, setTelephone1] = useState(settings.telephone1 || '02-55057003');
  const [telephone2, setTelephone2] = useState(settings.telephone2 || '02-55056973');
  const [email, setEmail] = useState(settings.email || 'dhakatimbercomplexe@gmail.com');
  const [website, setWebsite] = useState(settings.website || 'www.dhakatimbercomplex.com');
  const [binNo, setBinNo] = useState(settings.binNo);
  const [bankName, setBankName] = useState(settings.bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(settings.bankDetails.accountNumber);
  const [branch, setBranch] = useState(settings.bankDetails.branch);
  const [bKashMerchant, setBKashMerchant] = useState(settings.mobileBanking.bKashMerchant || '');
  const [quotationTermsText, setQuotationTermsText] = useState(settings.quotationTerms.join('\n'));
  const [invoiceTermsText, setInvoiceTermsText] = useState(settings.invoiceTerms.join('\n'));

  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings({
      ...settings,
      companyNameBn,
      companyNameEn,
      taglineBn,
      taglineEn,
      addressBn: factoryAddressBn,
      addressEn: factoryAddressEn,
      showroomAddressBn,
      showroomAddressEn,
      factoryAddressBn,
      factoryAddressEn,
      phone1,
      phone2,
      telephone1,
      telephone2,
      email,
      website,
      binNo,
      logoUrl: '/logo.png',
      bankDetails: {
        ...settings.bankDetails,
        bankName,
        accountNumber,
        branch,
      },
      mobileBanking: {
        ...settings.mobileBanking,
        bKashMerchant,
      },
      quotationTerms: quotationTermsText.split('\n').filter((t) => t.trim()),
      invoiceTerms: invoiceTermsText.split('\n').filter((t) => t.trim()),
    });

    showToast(
      language === 'bn' ? 'কোম্পানি প্রোফাইল ও যোগাযোগের তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Company profile & contact details updated!',
      'success'
    );
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dhaka-timber-complex-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast(
      language === 'bn' ? 'সম্পূর্ণ ERP ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে!' : 'ERP Backup JSON downloaded!',
      'success'
    );
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          showToast(
            language === 'bn' ? 'ডাটাবেস সফলভাবে রিস্টোর হয়েছে!' : 'Database restored successfully!',
            'success'
          );
        } else {
          showToast(
            language === 'bn' ? 'ব্যাকআপ ফাইলটি ত্রুটিপূর্ণ!' : 'Invalid backup JSON file!',
            'error'
          );
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        language === 'bn'
          ? 'আপনি কি নিশ্চিত যে সকল ডাটা মুছে ডেমো ডাটায় রিসেট করতে চান?'
          : 'Are you sure you want to reset all data to default seed data?'
      )
    ) {
      resetToDemoData();
      showToast(
        language === 'bn' ? 'সিস্টেম ডেমো ডাটায় রিসেট করা হয়েছে!' : 'Reset to seed data complete!',
        'info'
      );
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-red-600" />
          <span>{language === 'bn' ? 'সিস্টেম সেটিংস ও কোম্পানি প্রোফাইল' : 'Settings & Company Profile'}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'bn'
            ? 'কোম্পানি লোগো, শোরুম ও ফ্যাক্টরি ঠিকানা, ফোন/টেলিফোন, কোটেশন ও ইনভয়েস শর্তাবলী।'
            : 'Company branding, showroom & factory address, phones, website, and offline database JSON backup.'}
        </p>
      </div>

      {/* Official Branding & Logo Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-red-500 p-2 flex items-center justify-center shrink-0 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="DTC Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900 uppercase">DHAKA TIMBER COMPLEX</h2>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 text-xs font-bold border border-red-300">DTC</span>
          </div>
          <p className="text-xs font-semibold text-red-700">
            {language === 'bn' ? 'ঢাকা টিম্বার কমপ্লেক্স' : 'Door, Frame, Furniture & Timber Supplier'}
          </p>
          <p className="text-xs text-slate-500">
            {language === 'bn' ? 'অফিসিয়াল লোগো সক্রিয় আছে এবং সকল প্রিন্ট পেপার ও চালানে প্রদর্শিত হবে।' : 'Official logo is active on all printed quotations, invoices, and challans.'}
          </p>
        </div>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-red-600" />
          <span>{language === 'bn' ? 'ভাষা নির্বাচন' : 'System Language'}</span>
        </h3>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage('bn')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              language === 'bn'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>বাংলা</span>
            {language === 'bn' && <CheckCircle2 className="w-4 h-4 text-white" />}
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>English</span>
            {language === 'en' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Company Profile Form */}
      <form
        onSubmit={handleSaveCompanyProfile}
        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5"
      >
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-red-600" />
          <span>{language === 'bn' ? 'কোম্পানি প্রোফাইল ও অফিসিয়াল যোগাযোগ' : 'Company Profile & Official Contacts'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রতিষ্ঠানের নাম (বাংলা) *' : 'Company Name (Bangla) *'}
            </label>
            <input
              type="text"
              required
              value={companyNameBn}
              onChange={(e) => setCompanyNameBn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রতিষ্ঠানের নাম (English) *' : 'Company Name (English) *'}
            </label>
            <input
              type="text"
              required
              value={companyNameEn}
              onChange={(e) => setCompanyNameEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাজের ধরন / ট্যাগলাইন (বাংলা)' : 'Tagline / Work Nature (Bangla)'}
            </label>
            <input
              type="text"
              value={taglineBn}
              onChange={(e) => setTaglineBn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কাজের ধরন / ট্যাগলাইন (English)' : 'Tagline / Work Nature (English)'}
            </label>
            <input
              type="text"
              value={taglineEn}
              onChange={(e) => setTaglineEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
            />
          </div>
        </div>

        {/* Showroom & Factory Addresses */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-red-600" />
            <span>{language === 'bn' ? 'শোরুমের ঠিকানা' : 'Showroom Address'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'bn' ? 'শোরুম ঠিকানা (বাংলা)' : 'Showroom Address (Bangla)'}
              </label>
              <input
                type="text"
                value={showroomAddressBn}
                onChange={(e) => setShowroomAddressBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'bn' ? 'শোরুম ঠিকানা (English)' : 'Showroom Address (English)'}
              </label>
              <input
                type="text"
                value={showroomAddressEn}
                onChange={(e) => setShowroomAddressEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            <span>{language === 'bn' ? 'হেড অফিস ও ফ্যাক্টরির ঠিকানা' : 'Head Office & Factory'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'bn' ? 'ফ্যাক্টরি ঠিকানা (বাংলা)' : 'Factory Address (Bangla)'}
              </label>
              <input
                type="text"
                value={factoryAddressBn}
                onChange={(e) => setFactoryAddressBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {language === 'bn' ? 'ফ্যাক্টরি ঠিকানা (English)' : 'Factory Address (English)'}
              </label>
              <input
                type="text"
                value={factoryAddressEn}
                onChange={(e) => setFactoryAddressEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers, Email & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মোবাইল ১ (হটলাইন)' : 'Mobile 1'}
            </label>
            <input
              type="text"
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মোবাইল ২' : 'Mobile 2'}
            </label>
            <input
              type="text"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'টেলিফোন ১' : 'Telephone 1'}
            </label>
            <input
              type="text"
              value={telephone1}
              onChange={(e) => setTelephone1(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'টেলিফোন ২' : 'Telephone 2'}
            </label>
            <input
              type="text"
              value={telephone2}
              onChange={(e) => setTelephone2(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'ওয়েবসাইট' : 'Website'}
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'ভ্যাট / BIN নম্বর' : 'VAT / BIN No'}
            </label>
            <input
              type="text"
              value={binNo}
              onChange={(e) => setBinNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Banking Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'ব্যাংকের নাম' : 'Bank Name'}
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'বিকাশ / নগদ নম্বর' : 'bKash / Nagad'}
            </label>
            <input
              type="text"
              value={bKashMerchant}
              onChange={(e) => setBKashMerchant(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'কোটেশনের সাধারণ শর্তাবলী (প্রতি লাইনে একটি)' : 'Quotation Terms & Conditions'}
          </label>
          <textarea
            rows={3}
            value={quotationTermsText}
            onChange={(e) => setQuotationTermsText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {language === 'bn' ? 'ইনভয়েসের শর্তাবলী (প্রতি লাইনে একটি)' : 'Invoice Terms & Conditions'}
          </label>
          <textarea
            rows={3}
            value={invoiceTermsText}
            onChange={(e) => setInvoiceTermsText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium"
          />
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'bn' ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile'}</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Restore Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{language === 'bn' ? 'ডাটাবেজ ব্যাকআপ ও রিস্টোর' : 'Backup & Restore Database'}</span>
        </h3>

        <p className="text-xs text-slate-500">
          {language === 'bn'
            ? 'সকল কোটেশন, অর্ডার, ইনভেন্টরি, কারিগর এবং চালানের ডাটা নিরাপদ রাখতে নিয়মিত JSON ব্যাকআপ ফাইল ডাউনলোড করুন।'
            : 'Export and download complete offline JSON backup of all ERP modules, or restore from a previously saved JSON file.'}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Download JSON */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{language === 'bn' ? 'ব্যাকআপ ফাইল ডাউনলোড' : 'Download JSON Backup'}</span>
          </button>

          {/* Upload JSON */}
          <label className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-all border border-slate-300">
            <Upload className="w-4 h-4 text-red-600" />
            <span>{language === 'bn' ? 'ব্যাকআপ রিস্টোর করুন' : 'Restore from JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all border border-rose-200 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'bn' ? 'ফ্যাক্টরি রিসেট / ডেমো ডাটা' : 'Reset to Demo Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
