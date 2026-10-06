'use client';

import React from 'react';
import { Printer, X, Landmark, DollarSign, Calendar } from 'lucide-react';
import { FinancialAccount } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { amountInWords } from '@/utils/numberToWords';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import PrintHeader from '@/components/common/PrintHeader';

interface LedgerItem {
  id: string;
  date: string;
  type: string;
  title: string;
  refNo?: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  notes?: string;
}

interface AccountStatementPrintModalProps {
  account?: FinancialAccount;
  transactions: LedgerItem[];
  fromDate?: string;
  toDate?: string;
  onClose: () => void;
}

export default function AccountStatementPrintModal({
  account,
  transactions,
  fromDate,
  toDate,
  onClose,
}: AccountStatementPrintModalProps) {
  const { language } = useApp();
  const { settings } = useData();

  const handlePrint = () => {
    window.print();
  };

  const totalInflow = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalOutflow = transactions.reduce((sum, t) => sum + t.credit, 0);
  const closingBalance = transactions.length > 0 ? transactions[0].balance : (account?.openingBalance || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto printable-modal-overlay">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 printable-modal print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wide uppercase">
              {language === 'bn'
                ? 'অ্যাকাউন্ট লেজার স্টেটমেন্ট প্রিভিউ ও প্রিন্ট'
                : 'Account Ledger Statement Preview & Print'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>{language === 'bn' ? 'স্টেটমেন্ট প্রিন্ট / PDF' : 'Print Statement'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Content */}
        <div className="p-8 sm:p-10 text-slate-900 printable-sheet print:p-2 text-xs font-sans">
          {/* Official Letterhead */}
          <PrintHeader
            documentTitleBn="অফিসিয়াল ব্যাংক ও ক্যাশ খতিয়ান বিবরণী"
            documentTitleEn="OFFICIAL BANK & CASH LEDGER STATEMENT"
          />

          {/* Account Meta Grid */}
          <div className="grid grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 print:bg-white print:border-slate-300 print:mb-2 print:p-2.5 print:gap-2 print:text-[8pt] items-center">
            <div className="col-span-7 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
                {language === 'bn' ? 'অ্যাকাউন্টের বিবরণ (Account Profile)' : 'Account Profile'}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 print:text-black print:text-xs">
                {account?.accountName || 'All Financial Accounts (সমন্বিত খতিয়ান)'}
              </h3>
              {account?.accountNumber && (
                <p className="text-slate-700 font-mono font-medium print:text-black">
                  A/C: {account.accountNumber} {account.branchName ? `• Branch: ${account.branchName}` : ''}
                </p>
              )}
              {account?.bankName && (
                <p className="text-slate-600 font-medium print:text-black">
                  Bank: {account.bankName} {account.routingNo ? `(Routing: ${account.routingNo})` : ''}
                </p>
              )}
            </div>

            <div className="col-span-5 text-right space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
                {language === 'bn' ? 'বিবরণীর সময়কাল' : 'Statement Period'}
              </span>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'তারিখ:' : 'Period:'}</span>{' '}
                <strong>{fromDate || 'শুরু'}</strong> থেকে <strong>{toDate || 'বর্তমান'}</strong>
              </p>
              <p className="text-slate-800 print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'প্রারম্ভিক ব্যালেন্স:' : 'Opening Bal:'}</span>{' '}
                <strong className="font-mono">{formatCurrency(account?.openingBalance || 0, language)}</strong>
              </p>
              <p className="text-emerald-700 font-bold print:text-black">
                <span className="text-slate-500 print:text-black">{language === 'bn' ? 'সমাপনী ব্যালেন্স:' : 'Closing Bal:'} </span>
                <strong className="font-mono text-sm print:text-xs">{formatCurrency(closingBalance, language)}</strong>
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto print:overflow-hidden print:w-full mb-6 print:mb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold print:bg-slate-900 print:text-white">
                  <th className="p-2 text-center w-8 rounded-l-lg">#</th>
                  <th className="p-2">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="p-2">{language === 'bn' ? 'লেনদেনের বিবরণ ও ভাউচার' : 'Particulars / Voucher'}</th>
                  <th className="p-2">{language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}</th>
                  <th className="p-2 text-right">{language === 'bn' ? 'জমা / Inflow (+)' : 'Debit (+)'}</th>
                  <th className="p-2 text-right">{language === 'bn' ? 'খরচ / Outflow (-)' : 'Credit (-)'}</th>
                  <th className="p-2 text-right rounded-r-lg">{language === 'bn' ? 'ব্যালেন্স (৳)' : 'Balance (BDT)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 font-bold print:p-2">
                      {language === 'bn' ? 'এই সময়কালের কোনো লেনদেন নেই।' : 'No transactions recorded.'}
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-2 text-center font-bold text-slate-400 print:text-black">{idx + 1}</td>
                      <td className="p-2 font-mono text-slate-700 print:text-black">{formatDate(tx.date, language)}</td>
                      <td className="p-2">
                        <p className="font-bold text-slate-900 print:text-black">{tx.title}</p>
                        {tx.notes && <p className="text-[10px] text-slate-500 italic print:text-slate-700">{tx.notes}</p>}
                      </td>
                      <td className="p-2 text-slate-700 print:text-black">{tx.accountName}</td>
                      <td className="p-2 text-right font-black text-emerald-700 font-mono print:text-black">
                        {tx.debit > 0 ? formatCurrency(tx.debit, language) : '-'}
                      </td>
                      <td className="p-2 text-right font-black text-rose-700 font-mono print:text-black">
                        {tx.credit > 0 ? formatCurrency(tx.credit, language) : '-'}
                      </td>
                      <td className="p-2 text-right font-black text-slate-900 font-mono text-xs print:text-black">
                        {formatCurrency(tx.balance, language)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Ledger Summary Footprint */}
          <div className="grid grid-cols-12 gap-4 mb-6 print:mb-2 print:gap-2">
            <div className="col-span-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 print:bg-white print:border-slate-300 print:p-2.5 print:rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 print:text-black">
                  {language === 'bn' ? 'সমাপনী ব্যালেন্স (কথায়):' : 'Closing Balance in Words:'}
                </span>
                <p className="text-xs font-bold text-slate-900 italic print:text-black print:text-[8pt]">
                  {amountInWords(closingBalance, language)}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 print:border-slate-300 print:text-[7pt] print:mt-1.5 print:pt-1">
                ঢাকা টিম্বার কমপ্লেক্স (DTC) অটোমেটেড মাল্টি-অ্যাকাউন্ট অডিট সিস্টেম।
              </div>
            </div>

            <div className="col-span-6 space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 print:bg-white print:border-slate-300 print:p-2.5 print:space-y-1 print:rounded-lg">
              <div className="flex justify-between py-1 text-xs text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'মোট জমা / Inflows (+):' : 'Total Inflows (+):'}</span>
                <strong className="font-mono text-emerald-700 print:text-black">{formatCurrency(totalInflow, language)}</strong>
              </div>
              <div className="flex justify-between py-1 text-xs text-slate-700 border-b border-slate-200 print:text-black print:py-0.5 print:text-[8pt]">
                <span>{language === 'bn' ? 'মোট খরচ / Outflows (-):' : 'Total Outflows (-):'}</span>
                <strong className="font-mono text-rose-700 print:text-black">{formatCurrency(totalOutflow, language)}</strong>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-slate-900 bg-emerald-50/80 p-2 rounded-xl print:bg-white print:text-black print:border-t-2 print:border-black print:py-1 print:px-2 print:text-[9pt] print:rounded-none">
                <span>{language === 'bn' ? 'বর্তমান অবশিষ্ট ব্যালেন্স:' : 'Net Available Balance:'}</span>
                <span className="text-base text-emerald-800 print:text-black print:text-[9.5pt]">{formatCurrency(closingBalance, language)}</span>
              </div>
            </div>
          </div>

          {/* Authorization Signature Blocks */}
          <div className="grid grid-cols-3 gap-8 pt-10 mt-6 border-t border-slate-200 signature-section print:pt-4 print:mt-3 print:gap-3 print:border-black text-center text-xs print:text-[8pt]">
            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 font-bold text-slate-800 print:text-black print:pt-1">
                {language === 'bn' ? 'অ্যাকাউন্ট্যান্ট / প্রস্তুতকারী' : 'Accountant'}
              </div>
              <span className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Dhaka Timber Complex</span>
            </div>

            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 font-bold text-slate-800 print:text-black print:pt-1">
                {language === 'bn' ? 'হিসাব নিরীক্ষক / অডিটর' : 'Audited By'}
              </div>
              <span className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Internal Audit</span>
            </div>

            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 font-bold text-slate-800 print:text-black print:pt-1">
                {language === 'bn' ? 'ম্যানেজিং ডিরেক্টর / অনুমোদন' : 'Approved By MD'}
              </div>
              <span className="text-[10px] text-slate-500 print:text-black print:text-[7pt]">Managing Director</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
