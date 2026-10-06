'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  Search,
  Printer,
  DollarSign,
  Truck,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowRight,
  Hammer,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate, isOverdue } from '@/utils/dateUtils';
import StatusBadge from '@/components/common/Badge';
import PaymentModal from '@/components/orders/PaymentModal';
import DirectOrderForm from '@/components/orders/DirectOrderForm';

export default function OrdersPage() {
  const { language, showToast, t } = useApp();
  const { orders, addOrder, updateOrderProductionStatus, deleteOrder } = useData();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm) ||
      (o.siteLocation && o.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStageChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderProductionStatus(orderId, newStatus);
    showToast(
      language === 'bn' ? 'অর্ডার স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে।' : 'Order status updated.',
      'success'
    );
  };

  const handleSaveDirectOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder = addOrder(orderData);
    setIsCreatingOrder(false);
    showToast(
      language === 'bn'
        ? `কাজের অর্ডার #${newOrder.orderNumber} সফলভাবে তৈরি হয়েছে।`
        : `Work Order #${newOrder.orderNumber} created successfully.`,
      'success'
    );
  };

  if (isCreatingOrder) {
    return (
      <DirectOrderForm
        onSave={handleSaveDirectOrder}
        onCancel={() => setIsCreatingOrder(false)}
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'কাজের অর্ডার ও ইনভয়েস ম্যানেজমেন্ট' : 'Work Orders & Invoicing'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'সরাসরি শোরুম বা কারখানা অর্ডার তৈরি, পেমেন্ট আদায় ও ডেলিভারি ট্র্যাকিং।'
              : 'Direct work order creation, payment receipts, due collections and deliveries.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/quotations"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <span>{language === 'bn' ? 'কোটেশন থেকে অর্ডার' : 'Via Quotation'}</span>
          </Link>

          <button
            onClick={() => setIsCreatingOrder(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ সরাসরি নতুন অর্ডার' : '+ Direct New Order'}</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'অর্ডার নং, গ্রাহক, ফোন নম্বর...' : 'Search by order #, customer, phone...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', bn: 'সকল অর্ডার', en: 'All' },
            { key: 'confirmed', bn: 'নিশ্চিত', en: 'Confirmed' },
            { key: 'wood_sizing', bn: 'চেরাই চলছে', en: 'Sizing' },
            { key: 'carpentry', bn: 'তৈরি কাজ', en: 'Carpentry' },
            { key: 'polish', bn: 'পলিশ', en: 'Polish' },
            { key: 'ready_for_delivery', bn: 'রেডি', en: 'Ready' },
            { key: 'delivered', bn: 'ডেলিভার্ড', en: 'Delivered' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'bn' ? st.bn : st.en}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid / Table */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {language === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const overdue = isOverdue(order.expectedDeliveryDate) && order.status !== 'delivered';

            return (
              <div
                key={order.id}
                className={`bg-white p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all space-y-4 ${
                  overdue ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-black text-xs border border-red-200">
                      WO
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm font-bold text-slate-900 hover:text-red-700 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <StatusBadge status={order.status} />
                        {overdue && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                            {language === 'bn' ? 'ডেলিভারি বিলম্বিত' : 'Overdue'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>{order.customerName} • {order.customerPhone}</span>
                        {order.marketingAgentName && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                            🎯 {order.marketingAgentName}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Financial Quick Glance */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {language === 'bn' ? 'মোট মূল্য' : 'Total'}
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(order.grandTotal, language)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {language === 'bn' ? 'জমা' : 'Paid'}
                      </span>
                      <p className="text-sm font-bold text-emerald-700">
                        {formatCurrency(order.totalPaid, language)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {language === 'bn' ? 'বকেয়া' : 'Due'}
                      </span>
                      <p className="text-base font-black text-rose-600">
                        {formatCurrency(order.dueAmount, language)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Stage Dropdown */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                      <span>{language === 'bn' ? 'কারখানা প্রোডাকশন অগ্রগতি' : 'Workshop Progress'}</span>
                      <span className="text-red-600">{order.productionProgressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${order.productionProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Stage Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-600">
                      {language === 'bn' ? 'ধাপ পরিবর্তন:' : 'Change Stage:'}
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStageChange(order.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="confirmed">{language === 'bn' ? '১. নিশ্চিত অর্ডার' : '1. Confirmed'}</option>
                      <option value="wood_sizing">{language === 'bn' ? '২. কাঠ চেরাই চলছে' : '2. Wood Sizing'}</option>
                      <option value="carpentry">{language === 'bn' ? '৩. কারিগর বানাচ্ছে' : '3. Carpentry'}</option>
                      <option value="polish">{language === 'bn' ? '৪. পলিশ ও ফিনিশিং' : '4. Polishing'}</option>
                      <option value="ready_for_delivery">{language === 'bn' ? '৫. প্রস্তুত' : '5. Ready'}</option>
                      <option value="partial_delivered">{language === 'bn' ? '৬. আংশিক ডেলিভারি' : '6. Partial'}</option>
                      <option value="delivered">{language === 'bn' ? '৭. সম্পূর্ণ ডেলিভারি' : '7. Delivered'}</option>
                    </select>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {order.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <strong>{it.quantity}x</strong> {it.description}
                      <span className="text-[10px] text-slate-500">
                        ({language === 'bn' ? 'ডেলিভারি' : 'Delivered'}: {it.deliveredQuantity}/{it.quantity})
                      </span>
                    </span>
                  ))}
                </div>

                {/* Bottom Bar: Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    {language === 'bn' ? 'অর্ডার:' : 'Ordered:'} {formatDate(order.orderDate, language)} •{' '}
                    <span className={overdue ? 'text-rose-600 font-bold' : ''}>
                      {language === 'bn' ? 'ডেলিভারি টার্গেট:' : 'Target:'} {formatDate(order.expectedDeliveryDate, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Record Payment Button */}
                    {order.dueAmount > 0 && (
                      <button
                        onClick={() => setSelectedOrderForPayment(order)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'পেমেন্ট জমা নিন' : 'Collect Due'}</span>
                      </button>
                    )}

                    {/* Generate Challan Shortcut */}
                    <Link
                      href="/delivery"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-bold transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'চালান কাটুন' : 'Challan'}</span>
                    </Link>

                    {/* View & Print Invoice */}
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-red-700" />
                      <span>{language === 'bn' ? 'ইনভয়েস প্রিন্ট' : 'Invoice'}</span>
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(language === 'bn' ? 'আপনি কি এই অর্ডারটি মুছে ফেলতে চান?' : 'Delete this order?')) {
                          deleteOrder(order.id);
                          showToast(language === 'bn' ? 'অর্ডার মুছে ফেলা হয়েছে।' : 'Order deleted.', 'info');
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={selectedOrderForPayment !== null}
        order={selectedOrderForPayment}
        onClose={() => setSelectedOrderForPayment(null)}
      />
    </div>
  );
}
