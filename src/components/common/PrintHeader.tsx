'use client';

import React from 'react';
import { Phone, Mail, Globe, Building2, Store, FileText } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';

interface PrintHeaderProps {
  documentTitleBn?: string;
  documentTitleEn?: string;
  docNumber?: string;
  docDate?: string;
  title?: string;
  subtitle?: string;
}

export default function PrintHeader({
  documentTitleBn,
  documentTitleEn,
  docNumber,
  docDate,
  title,
  subtitle,
}: PrintHeaderProps) {
  const { settings } = useData();
  const { language } = useApp();

  const displayTitle =
    title ||
    (language === 'bn' ? documentTitleBn || '' : documentTitleEn || documentTitleBn || '');

  return (
    <div className="border-b-2 border-slate-900 pb-3 mb-5 text-left print:border-black print:pb-1.5 print:mb-2">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 print:gap-2">
        <div className="flex items-center gap-3.5 print:gap-2">
          {/* Logo */}
          <div className="shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl || '/logo.png'}
              alt="DHAKA TIMBER COMPLEX (DTC)"
              className="h-14 sm:h-16 w-auto max-w-[120px] object-contain print:h-11 print:max-w-[90px]"
              onError={(e) => {
                // Fallback badge if image fails to render
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div>
            <div className="flex items-baseline gap-2 print:gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-none font-sans uppercase print:text-base print:font-black print:text-black">
                {settings.companyNameEn || 'DHAKA TIMBER COMPLEX'}
              </h1>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-red-600 text-white shadow-sm print:bg-red-700 print:text-white print:border print:border-red-800 print:text-[9px] print:px-1.5 print:py-0">
                DTC
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-red-700 leading-tight mt-0.5 print:text-xs print:font-bold print:text-red-700 print:mt-0">
              {settings.companyNameBn || 'ঢাকা টিম্বার কমপ্লেক্স'}
            </h2>
            <p className="text-[11px] text-slate-700 font-semibold mt-0.5 print:text-[7.5pt] print:text-slate-800 print:mt-0">
              {subtitle || (language === 'bn' ? settings.taglineBn : settings.taglineEn)}
            </p>
          </div>
        </div>

        {/* Document Title Badge */}
        {displayTitle && (
          <div className="text-right shrink-0">
            <div className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-sm print:bg-black print:text-white print:border print:border-black print:px-2.5 print:py-0.5 print:text-[10px] print:rounded-md">
              {displayTitle}
            </div>
            {docNumber && (
              <p className="text-xs font-bold text-slate-900 mt-1 font-mono print:text-black print:text-[9px] print:mt-0.5">
                {docNumber}
              </p>
            )}
            {docDate && (
              <p className="text-[11px] text-slate-700 font-medium print:text-black print:text-[8pt]">
                {language === 'bn' ? 'তারিখ:' : 'Date:'} {docDate}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Addresses & Contact Details */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10.5px] leading-tight text-slate-700 space-y-1 print:border-slate-300 print:text-[7.5pt] print:mt-1 print:pt-1 print:space-y-0.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 print:grid-cols-2 print:gap-1">
          {/* Showroom */}
          <div className="flex items-start gap-1">
            <Store className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5 print:w-2.5 print:h-2.5 print:text-red-700" />
            <span>
              <strong className="text-slate-900 font-bold print:text-black">
                {language === 'bn' ? 'শোরুম:' : 'Showroom:'}
              </strong>{' '}
              {language === 'bn'
                ? settings.showroomAddressBn || settings.showroomAddressEn || settings.addressBn
                : settings.showroomAddressEn || settings.addressEn}
            </span>
          </div>

          {/* Head Office & Factory */}
          <div className="flex items-start gap-1">
            <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5 print:w-2.5 print:h-2.5 print:text-red-700" />
            <span>
              <strong className="text-slate-900 font-bold print:text-black">
                {language === 'bn' ? 'হেড অফিস ও ফ্যাক্টরি:' : 'Head Office & Factory:'}
              </strong>{' '}
              {language === 'bn'
                ? settings.factoryAddressBn || settings.factoryAddressEn || settings.addressBn
                : settings.factoryAddressEn || settings.addressEn}
            </span>
          </div>
        </div>

        {/* Phones, Telephones, Email & Web */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1 text-[10px] text-slate-700 border-t border-slate-100 print:border-slate-200 print:text-[7pt] print:pt-0.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 print:gap-x-2">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-red-600 shrink-0 print:w-2.5 print:h-2.5 print:text-red-700" />
              <span>
                <strong className="text-slate-900 font-bold print:text-black">{language === 'bn' ? 'মোবাইল:' : 'Mob:'}</strong>{' '}
                {settings.phone1}, {settings.phone2}
              </span>
            </div>
            {(settings.telephone1 || settings.telephone2) && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-red-600 shrink-0 print:w-2.5 print:h-2.5 print:text-red-700" />
                <span>
                  <strong className="text-slate-900 font-bold print:text-black">{language === 'bn' ? 'ফোন:' : 'Tel:'}</strong>{' '}
                  {settings.telephone1}
                  {settings.telephone2 ? `, ${settings.telephone2}` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 print:gap-x-2">
            {settings.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-red-600 shrink-0 print:w-2.5 print:h-2.5 print:text-red-700" />
                <span className="font-medium">{settings.email}</span>
              </div>
            )}
            {settings.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-red-600 shrink-0 print:w-2.5 print:h-2.5 print:text-red-700" />
                <span className="font-semibold text-slate-900 print:text-black">{settings.website}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
