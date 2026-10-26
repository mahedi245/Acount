import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerOrder, OrderItem, ProductionStage, UserRole, Language } from '../types';
import { initialOrders } from '../data/mockData';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface FactoryContextType {
  orders: CustomerOrder[];
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTvMode: boolean;
  setIsTvMode: (val: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (val: boolean) => void;
  selectedItemForTicket: OrderItem | null;
  setSelectedItemForTicket: (item: OrderItem | null) => void;
  selectedOrderForChallan: CustomerOrder | null;
  setSelectedOrderForChallan: (order: CustomerOrder | null) => void;
  advanceItemStage: (itemId: string, note?: string) => void;
  reworkQCItem: (itemId: string, targetStage: ProductionStage, reason: string) => void;
  createNewOrder: (order: CustomerOrder) => void;
  assignDispatch: (orderId: string, driver: string, vehicle: string, itemIds: string[]) => void;
  getItemById: (itemId: string) => { item: OrderItem; order: CustomerOrder } | null;
}

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

const STAGE_ORDER: ProductionStage[] = [
  'SEASONING',
  'SIZING',
  'JOINERY',
  'CNC_CARVING',
  'SANDING',
  'POLISHING',
  'QC_PACKING',
  'READY_DISPATCH',
  'DELIVERED'
];

export const FactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('woodcraft_orders_v1');
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          return initialOrders;
        }
      }
    }
    return initialOrders;
  });

  const [role, setRole] = useState<UserRole>('PRODUCTION_MANAGER');
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTvMode, setIsTvMode] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedItemForTicket, setSelectedItemForTicket] = useState<OrderItem | null>(null);
  const [selectedOrderForChallan, setSelectedOrderForChallan] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('woodcraft_orders_v1', JSON.stringify(orders));
    }
  }, [orders]);

  const advanceItemStage = (itemId: string, note?: string) => {
    soundFx.playSuccessChime();
    setOrders(prevOrders => {
      let isFinal = false;
      const updated = prevOrders.map(order => {
        const itemIdx = order.items.findIndex(it => it.id === itemId);
        if (itemIdx === -1) return order;

        const currentItem = order.items[itemIdx];
        const currentStageIdx = STAGE_ORDER.indexOf(currentItem.stage);
        if (currentStageIdx === -1 || currentStageIdx >= STAGE_ORDER.length - 1) return order;

        const nextStage = STAGE_ORDER[currentStageIdx + 1];
        if (nextStage === 'READY_DISPATCH' || nextStage === 'DELIVERED') {
          isFinal = true;
        }

        const now = new Date();
        const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const updatedItem: OrderItem = {
          ...currentItem,
          stage: nextStage,
          qcStatus: nextStage === 'QC_PACKING' ? 'PASSED' : currentItem.qcStatus,
          readyForDispatch: nextStage === 'READY_DISPATCH' || nextStage === 'DELIVERED',
          stageHistory: [
            ...currentItem.stageHistory,
            {
              stage: nextStage,
              timestamp: dateStr,
              operator: role === 'FACTORY_SUPERVISOR' ? 'সুপারভাইজার (ফ্লোর)' : 'প্রোডাকশন ম্যানেজার',
              note: note || (lang === 'bn' ? `স্টেজ সফলভাবে সম্পন্ন (${nextStage})` : `Moved to ${nextStage}`)
            }
          ]
        };

        const newItems = [...order.items];
        newItems[itemIdx] = updatedItem;

        // Calculate order overall status
        const allDelivered = newItems.every(i => i.stage === 'DELIVERED');
        const allReady = newItems.every(i => i.stage === 'READY_DISPATCH' || i.stage === 'DELIVERED');
        const anyReady = newItems.some(i => i.stage === 'READY_DISPATCH' || i.stage === 'DELIVERED' || i.stage === 'QC_PACKING');

        let newOrderStatus = order.status;
        if (allDelivered) newOrderStatus = 'COMPLETED';
        else if (allReady) newOrderStatus = 'READY_FOR_DELIVERY';
        else if (anyReady) newOrderStatus = 'PARTIALLY_READY';
        else newOrderStatus = 'IN_PRODUCTION';

        return {
          ...order,
          items: newItems,
          status: newOrderStatus
        };
      });

      if (isFinal) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      return updated;
    });
  };

  const reworkQCItem = (itemId: string, targetStage: ProductionStage, reason: string) => {
    soundFx.playErrorBuzz();
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        const itemIdx = order.items.findIndex(it => it.id === itemId);
        if (itemIdx === -1) return order;

        const currentItem = order.items[itemIdx];
        const now = new Date();
        const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const updatedItem: OrderItem = {
          ...currentItem,
          stage: targetStage,
          qcStatus: 'REWORK_REQUIRED',
          qcNotes: reason,
          stageHistory: [
            ...currentItem.stageHistory,
            {
              stage: targetStage,
              timestamp: dateStr,
              operator: 'কোয়ালিটি কন্ট্রোল (QC)',
              note: `[QC Rework Alert] কারণ: ${reason}`
            }
          ]
        };

        const newItems = [...order.items];
        newItems[itemIdx] = updatedItem;

        return {
          ...order,
          items: newItems,
          status: 'IN_PRODUCTION'
        };
      });
    });
  };

  const createNewOrder = (newOrder: CustomerOrder) => {
    soundFx.playSuccessChime();
    setOrders(prev => [newOrder, ...prev]);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  const assignDispatch = (orderId: string, driver: string, vehicle: string, itemIds: string[]) => {
    soundFx.playSuccessChime();
    const now = new Date();
    const challanNo = `CH-${Math.floor(1000 + Math.random() * 9000)}`;
    const gatePass = `GP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      const updatedItems = ord.items.map(item => {
        if (itemIds.includes(item.id)) {
          return {
            ...item,
            stage: 'DELIVERED' as ProductionStage,
            readyForDispatch: true,
            stageHistory: [
              ...item.stageHistory,
              {
                stage: 'DELIVERED' as ProductionStage,
                timestamp: `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                operator: driver,
                note: `চালান ${challanNo} সহ গাড়ি (${vehicle})-এ ডিসপ্যাচ করা হয়েছে`
              }
            ]
          };
        }
        return item;
      });

      const allDone = updatedItems.every(i => i.stage === 'DELIVERED');

      return {
        ...ord,
        items: updatedItems,
        deliveryDriver: driver,
        vehicleNumber: vehicle,
        gatePassId: gatePass,
        challanNumber: challanNo,
        dispatchedAt: now.toISOString(),
        status: allDone ? 'COMPLETED' : 'DISPATCHED'
      };
    }));
  };

  const getItemById = (itemId: string) => {
    for (const ord of orders) {
      const it = ord.items.find(i => i.id.toLowerCase() === itemId.trim().toLowerCase() || i.qrCode.toLowerCase() === itemId.trim().toLowerCase());
      if (it) {
        return { item: it, order: ord };
      }
    }
    return null;
  };

  return (
    <FactoryContext.Provider
      value={{
        orders,
        role,
        setRole,
        lang,
        setLang,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isTvMode,
        setIsTvMode,
        isReportModalOpen,
        setIsReportModalOpen,
        selectedItemForTicket,
        setSelectedItemForTicket,
        selectedOrderForChallan,
        setSelectedOrderForChallan,
        advanceItemStage,
        reworkQCItem,
        createNewOrder,
        assignDispatch,
        getItemById
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactory must be used within a FactoryProvider');
  }
  return context;
};
