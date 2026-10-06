'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Plus,
  Printer,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  FileText,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { DeliveryChallan, Order } from '@/types';
import { formatDate, getTodayIsoDate } from '@/utils/dateUtils';
import Modal from '@/components/common/Modal';

export default function DeliveryPage() {
  const { language, showToast, t } = useApp();
  const { deliveryChallans, orders, createDeliveryChallan } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Challan Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [vehicleNumber, setVehicleNumber] = useState<string>('ঢাকা মেট্রো-ন ১২-৩৪৫৬');
  const [driverName, setDriverName] = useState<string>('মো: আলমগীর হোসেন');
  const [driverPhone, setDriverPhone] = useState<string>('01712-334455');
  const [deliveryDate, setDeliveryDate] = useState<string>(getTodayIsoDate());
  const [challanNotes, setChallanNotes] = useState<string>('নিখুঁত কন্ডিশনে ডেলিভারি সম্পন্ন');

  // Selected items to deliver
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const handleOpenCreateModal = () => {
    if (orders.length > 0) {
      const firstOrder = orders.find((o) => o.status !== 'cancelled') || orders[0];
      setSelectedOrderId(firstOrder.id);
      const initialQtys: Record<string, number> = {};
      firstOrder.items.forEach((it) => {
        initialQtys[it.id] = it.quantity;
      });
      setItemQuantities(initialQtys);
    }
    setIsCreateModalOpen(true);
  };

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      const initialQtys: Record<string, number> = {};
      ord.items.forEach((it) => {
        initialQtys[it.id] = it.quantity;
      });
      setItemQuantities(initialQtys);
    }
  };

  const handleCreateChallanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const deliveredItems = Object.entries(itemQuantities)
      .map(([orderItemId, quantity]) => ({
        orderItemId,
        quantity,
      }))
      .filter((it) => it.quantity > 0);

    if (deliveredItems.length === 0) {
      showToast(
        language === 'bn' ? 'কমপক্ষে একটি আইটেমের পরিমাণ দিন!' : 'Enter quantity for at least one item!',
        'warning'
      );
      return;
    }

    const created = createDeliveryChallan(selectedOrder.id, {
      deliveryAddress: selectedOrder.customerAddress || selectedOrder.siteLocation || 'সাইট ডেলিভারি',
      vehicleType: 'Pickup',
      vehicleNumber,
      driverName,
      driverPhone,
      deliveredItems,
      notes: challanNotes,
    });

    showToast(
      language === 'bn'
        ? `ডেলিভারি চালান (${created.challanNumber}) সফলভাবে তৈরি হয়েছে!`
        : `Challan (${created.challanNumber}) created!`,
      'success'
    );
    setIsCreateModalOpen(false);
  };

  const filteredChallans = deliveryChallans.filter(
    (c) =>
      c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-red-600" />
            <span>{language === 'bn' ? 'ডেলিভারি ট্র্যাকিং ও চালান প্রিন্ট' : 'Delivery & Challan Management'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn'
              ? 'অর্ডারের পণ্য ডেলিভারি শিডিউল, আংশিক/সম্পূর্ণ চালান জেনারেশন এবং গ্রাহক প্রাপ্তি স্বীকার রসিদ।'
              : 'Delivery scheduling, partial/full challan creation, vehicle logistics, and A4 print templates.'}
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>{language === 'bn' ? 'নতুন ডেলিভারি চালান তৈরি' : 'Create Delivery Challan'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">{language === 'bn' ? 'মোট সরবরাহ চালান' : 'Total Challans'}</p>
            <p className="text-lg font-black text-slate-900">
              {deliveryChallans.length} {language === 'bn' ? 'টি' : 'Challans'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">{language === 'bn' ? 'সম্পূর্ণ ডেলিভারি' : 'Delivered'}</p>
            <p className="text-lg font-black text-slate-900">
              {deliveryChallans.filter((c) => c.status === 'delivered').length} {language === 'bn' ? 'টি' : 'Delivered'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">{language === 'bn' ? 'চলমান সরবরাহ' : 'Pending / Road'}</p>
            <p className="text-lg font-black text-slate-900">
              {deliveryChallans.filter((c) => c.status !== 'delivered').length} {language === 'bn' ? 'টি' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Challan List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'চালান নং বা গ্রাহকের নামে খুঁজুন...' : 'Search by challan # or customer...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-hidden print:w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">{language === 'bn' ? 'চালান নম্বর' : 'Challan #'}</th>
                <th className="p-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="p-3">{language === 'bn' ? 'গ্রাহক ও সাইট' : 'Customer & Site'}</th>
                <th className="p-3">{language === 'bn' ? 'অর্ডার নং' : 'Order Ref'}</th>
                <th className="p-3">{language === 'bn' ? 'সরবরাহকৃত পণ্য' : 'Delivered Items'}</th>
                <th className="p-3">{language === 'bn' ? 'পরিবহন ও চালক' : 'Vehicle & Driver'}</th>
                <th className="p-3">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-3 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChallans.map((challan) => {
                const totalPieces = challan.deliveredItems.reduce((sum, it) => sum + it.quantity, 0);

                return (
                  <tr key={challan.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/delivery/challan/${challan.id}`}
                        className="font-bold text-red-600 hover:text-red-700 font-mono flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{challan.challanNumber}</span>
                      </Link>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {formatDate(challan.deliveryDate, language)}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{challan.customerName}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {challan.deliveryAddress}
                      </p>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-700">
                      {challan.orderNumber}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {totalPieces} {language === 'bn' ? 'টি পণ্য' : 'Pcs'}
                    </td>
                    <td className="p-3 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-900">{challan.vehicleNumber || (language === 'bn' ? 'পিকআপ' : 'Pickup')}</p>
                      <p className="text-slate-400">{challan.driverName}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {challan.status === 'delivered'
                          ? language === 'bn'
                            ? 'ডেলিভারি সম্পন্ন'
                            : 'Delivered'
                          : language === 'bn'
                          ? 'পথে রয়েছে'
                          : 'Dispatched'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/delivery/challan/${challan.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'চালান প্রিন্ট' : 'View / Print'}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Challan Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={language === 'bn' ? 'নতুন ডেলিভারি চালান তৈরি করুন' : 'Generate Delivery Challan'}
        subtitle={language === 'bn' ? 'অর্ডার থেকে সরবরাহকৃত পণ্যের পরিমাণ ও পরিবহন তথ্য যুক্ত করুন' : 'Select order, shipped items and vehicle info'}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateChallanSubmit} className="space-y-4 text-left">
          {/* Order Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কোন অর্ডারের মাল পাঠাচ্ছেন? *' : 'Select Order *'}
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
            >
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.orderNumber} - {ord.customerName} ({ord.items.length} {language === 'bn' ? 'আইটেম' : 'Items'})
                </option>
              ))}
            </select>
          </div>

          {/* Customer & Address Auto-Preview */}
          {selectedOrder && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
              <p className="text-slate-500">{selectedOrder.customerAddress || selectedOrder.siteLocation}</p>
            </div>
          )}

          {/* Items & Quantities to Ship */}
          {selectedOrder && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 uppercase">
                {language === 'bn' ? 'চালানে অন্তর্ভুক্ত পণ্যের পরিমাণ:' : 'Shipped Quantities:'}
              </label>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 bg-white flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">{it.description}</p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn' ? 'অর্ডারের মোট পরিমাণ:' : 'Ordered:'} {it.quantity} {language === 'bn' ? 'টি' : 'pcs'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {language === 'bn' ? 'চালানে যাবে:' : 'Send:'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={it.quantity}
                        value={itemQuantities[it.id] ?? it.quantity}
                        onChange={(e) =>
                          setItemQuantities({
                            ...itemQuantities,
                            [it.id]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-center"
                      />
                      <span className="text-xs text-slate-500">{language === 'bn' ? 'টি' : 'pcs'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle and Driver Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'গাড়ির নম্বর' : 'Vehicle Number'}
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ড্রাইভারের নাম' : 'Driver Name'}
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ড্রাইভারের ফোন' : 'Driver Phone'}
              </label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20"
            >
              {language === 'bn' ? 'চালান তৈরি ও কনফার্ম' : 'Generate Challan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
