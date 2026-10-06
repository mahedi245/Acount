'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Quotation,
  Order,
  Craftsman,
  CraftsmanTask,
  SawmillLogEntry,
  InteriorProject,
  DeliveryChallan,
  AttendanceRecord,
  WoodInventoryItem,
  CompanySettings,
  OrderStatus,
  PaymentRecord,
  ExpenseRecord,
  CommunicationLog,
  DesignCatalogItem,
  MarketingAgent,
  MarketingCommissionPayout,
  FinancialAccount,
  AccountTransfer,
  Lead,
} from '@/types';
import {
  initialCompanySettings,
  initialInventory,
  initialCraftsmen,
  initialQuotations,
  initialOrders,
  initialCraftsmanTasks,
  initialSawmillLogs,
  initialInteriorProjects,
  initialDeliveryChallans,
  initialAttendance,
  initialExpenses,
  initialCommunicationLogs,
  initialDesignCatalog,
  initialMarketingAgents,
  initialCommissionPayouts,
  initialFinancialAccounts,
  initialAccountTransfers,
} from '@/utils/seedData';
import { getTodayIsoDate } from '@/utils/dateUtils';

interface DataContextType {
  settings: CompanySettings;
  updateSettings: (settings: CompanySettings) => void;

  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => Quotation;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToOrder: (
    quotationId: string,
    advancePaid: number,
    paymentMethod: PaymentRecord['method'],
    deliveryDate: string,
    notes?: string
  ) => Order;

  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addPaymentToOrder: (orderId: string, payment: Omit<PaymentRecord, 'id'>) => void;
  updatePaymentRecord: (orderId: string, paymentId: string, updates: Partial<PaymentRecord>) => void;
  deletePaymentFromOrder: (orderId: string, paymentId: string) => void;
  assignMarketingAgentToOrder: (orderId: string, agentId?: string, agentName?: string) => void;
  updateOrderProductionStatus: (orderId: string, status: OrderStatus, progressPercent?: number) => void;

  craftsmen: Craftsman[];
  addCraftsman: (craftsman: Omit<Craftsman, 'id' | 'totalEarned' | 'totalAdvanceTaken' | 'balanceDue' | 'activeTasksCount'>) => Craftsman;
  updateCraftsman: (id: string, updates: Partial<Craftsman>) => void;

  craftsmanTasks: CraftsmanTask[];
  assignTask: (task: Omit<CraftsmanTask, 'id'>) => CraftsmanTask;
  updateCraftsmanTask: (taskId: string, updates: Partial<CraftsmanTask>) => void;

  sawmillLogs: SawmillLogEntry[];
  addSawmillLog: (log: Omit<SawmillLogEntry, 'id'>) => SawmillLogEntry;

  interiorProjects: InteriorProject[];
  addInteriorProject: (project: Omit<InteriorProject, 'id'>) => InteriorProject;
  updateInteriorProject: (id: string, updates: Partial<InteriorProject>) => void;
  addMaterialToProject: (projectId: string, material: { materialName: string; quantity: string; cost: number; date: string }) => void;
  addLaborToProject: (projectId: string, labor: { craftsmanName: string; task: string; amount: number; date: string }) => void;

  deliveryChallans: DeliveryChallan[];
  createDeliveryChallan: (
    orderId: string,
    challanDetails: {
      deliveryAddress: string;
      vehicleType: string;
      vehicleNumber: string;
      driverName: string;
      driverPhone: string;
      deliveredItems: { orderItemId: string; quantity: number }[];
      notes?: string;
    }
  ) => DeliveryChallan;

  attendanceRecords: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  recordAdvanceKhoraki: (craftsmanId: string, amount: number, notes?: string) => void;

  inventory: WoodInventoryItem[];
  addInventoryItem: (item: Omit<WoodInventoryItem, 'id'>) => WoodInventoryItem;
  adjustInventoryStock: (itemId: string, quantityChange: number, isRestock?: boolean) => void;

  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'voucherNo'>) => ExpenseRecord;
  deleteExpense: (id: string) => void;
  customExpenseCategories: string[];
  addCustomExpenseCategory: (categoryName: string) => void;
  deleteCustomExpenseCategory: (categoryName: string) => void;

  communicationLogs: CommunicationLog[];
  addCommunicationLog: (log: Omit<CommunicationLog, 'id' | 'sentAt'>) => CommunicationLog;

  designCatalog: DesignCatalogItem[];
  addDesignCatalogItem: (item: Omit<DesignCatalogItem, 'id'>) => DesignCatalogItem;
  updateDesignCatalogItem: (id: string, updates: Partial<DesignCatalogItem>) => void;
  deleteDesignCatalogItem: (id: string) => void;

  marketingAgents: MarketingAgent[];
  addMarketingAgent: (agent: Omit<MarketingAgent, 'id'>) => MarketingAgent;
  updateMarketingAgent: (id: string, updates: Partial<MarketingAgent>) => void;
  deleteMarketingAgent: (id: string) => void;

  commissionPayouts: MarketingCommissionPayout[];
  disburseCommissionPayout: (
    payout: Omit<MarketingCommissionPayout, 'id' | 'payoutNumber' | 'createdAt'>,
    syncToAccounts?: boolean
  ) => MarketingCommissionPayout;
  deleteCommissionPayout: (id: string) => void;

  getAgentMonthlyStats: (
    agentId: string,
    monthYear: string
  ) => {
    totalCollection: number;
    grossCommission: number;
    paidCommission: number;
    balanceDue: number;
    ratePerLakh: number;
    collectionRecords: Array<{
      orderId: string;
      orderNumber: string;
      customerName: string;
      siteLocation?: string;
      paymentId: string;
      paymentDate: string;
      paymentMethod: string;
      amount: number;
      commission: number;
      note?: string;
    }>;
    orderCount: number;
  };

  financialAccounts: FinancialAccount[];
  addFinancialAccount: (account: Omit<FinancialAccount, 'id'>) => FinancialAccount;
  updateFinancialAccount: (id: string, updates: Partial<FinancialAccount>) => void;
  deleteFinancialAccount: (id: string) => void;

  accountTransfers: AccountTransfer[];
  addAccountTransfer: (
    transfer: Omit<AccountTransfer, 'id' | 'transferNumber' | 'createdAt'>
  ) => AccountTransfer;
  deleteAccountTransfer: (id: string) => void;

  getAccountLiveBalance: (accountId: string) => {
    liveBalance: number;
    openingBalance: number;
    totalInflow: number;
    totalOutflow: number;
  };
  getAllAccountsSummary: () => {
    totalLiveBalance: number;
    totalCash: number;
    totalBank: number;
    totalMfs: number;
    totalPettyCash: number;
  };
  getAccountLedgerTransactions: (
    accountId?: string,
    fromDate?: string,
    toDate?: string
  ) => Array<{
    id: string;
    date: string;
    type: 'opening' | 'order_collection' | 'expense' | 'commission_payout' | 'transfer_in' | 'transfer_out';
    title: string;
    refNo?: string;
    accountName: string;
    debit: number; // Inflow (+)
    credit: number; // Outflow (-)
    balance: number;
    notes?: string;
  }>;

  resetToDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'dtc_erp_data_v5';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(initialCompanySettings);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [craftsmen, setCraftsmen] = useState<Craftsman[]>(initialCraftsmen);
  const [craftsmanTasks, setCraftsmanTasks] = useState<CraftsmanTask[]>(initialCraftsmanTasks);
  const [sawmillLogs, setSawmillLogs] = useState<SawmillLogEntry[]>(initialSawmillLogs);
  const [interiorProjects, setInteriorProjects] = useState<InteriorProject[]>(initialInteriorProjects);
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>(initialDeliveryChallans);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [inventory, setInventory] = useState<WoodInventoryItem[]>(initialInventory);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses);
  const [customExpenseCategories, setCustomExpenseCategories] = useState<string[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(initialCommunicationLogs);
  const [designCatalog, setDesignCatalog] = useState<DesignCatalogItem[]>(initialDesignCatalog);
  const [marketingAgents, setMarketingAgents] = useState<MarketingAgent[]>(initialMarketingAgents);
  const [commissionPayouts, setCommissionPayouts] = useState<MarketingCommissionPayout[]>(initialCommissionPayouts);
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(initialFinancialAccounts);
  const [accountTransfers, setAccountTransfers] = useState<AccountTransfer[]>(initialAccountTransfers);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) {
          setSettings({ ...initialCompanySettings, ...parsed.settings });
        }
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.quotations) setQuotations(parsed.quotations);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.craftsmen) setCraftsmen(parsed.craftsmen);
        if (parsed.craftsmanTasks) setCraftsmanTasks(parsed.craftsmanTasks);
        if (parsed.sawmillLogs) setSawmillLogs(parsed.sawmillLogs);
        if (parsed.interiorProjects) setInteriorProjects(parsed.interiorProjects);
        if (parsed.deliveryChallans) setDeliveryChallans(parsed.deliveryChallans);
        if (parsed.attendanceRecords) setAttendanceRecords(parsed.attendanceRecords);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.customExpenseCategories) setCustomExpenseCategories(parsed.customExpenseCategories);
        if (parsed.communicationLogs) setCommunicationLogs(parsed.communicationLogs);
        if (parsed.designCatalog) setDesignCatalog(parsed.designCatalog);
        if (parsed.marketingAgents) setMarketingAgents(parsed.marketingAgents);
        if (parsed.commissionPayouts) setCommissionPayouts(parsed.commissionPayouts);
        if (parsed.financialAccounts) setFinancialAccounts(parsed.financialAccounts);
        if (parsed.accountTransfers) setAccountTransfers(parsed.accountTransfers);
      }
    } catch (e) {
      console.error('Failed to load local storage data:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const fullData = {
        leads,
        settings,
        quotations,
        orders,
        craftsmen,
        craftsmanTasks,
        sawmillLogs,
        interiorProjects,
        deliveryChallans,
        attendanceRecords,
        inventory,
        expenses,
        customExpenseCategories,
        communicationLogs,
        designCatalog,
        marketingAgents,
        commissionPayouts,
        financialAccounts,
        accountTransfers,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }, [
    isLoaded,
    settings,
    quotations,
    orders,
    craftsmen,
    craftsmanTasks,
    sawmillLogs,
    interiorProjects,
    deliveryChallans,
    attendanceRecords,
    inventory,
    expenses,
    customExpenseCategories,
    communicationLogs,
    designCatalog,
    marketingAgents,
    commissionPayouts,
    financialAccounts,
    accountTransfers,
  ]);

  const updateSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
  };

  const addLead = (leadDetails: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadDetails,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  // Quotation CRUD
  const addQuotation = (quotationData: Omit<Quotation, 'id' | 'createdAt'>): Quotation => {
    const newQuotation: Quotation = {
      ...quotationData,
      id: `quot-${Date.now()}`,
      createdAt: getTodayIsoDate(),
    };
    setQuotations((prev) => [newQuotation, ...prev]);
    return newQuotation;
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  };

  // Convert Quotation To Work Order
  const convertQuotationToOrder = (
    quotationId: string,
    advancePaid: number = 0,
    paymentMethod: PaymentRecord['method'] = 'Cash',
    deliveryDate: string,
    notes?: string
  ): Order => {
    const quot = quotations.find((q) => q.id === quotationId);
    if (!quot) throw new Error('Quotation not found');

    const paymentRecords: PaymentRecord[] = [];
    if (advancePaid > 0) {
      paymentRecords.push({
        id: `pay-${Date.now()}`,
        date: getTodayIsoDate(),
        amount: advancePaid,
        method: paymentMethod,
        receivedBy: 'Manager / Cashier',
        note: 'কোটেশন অনুমোদন ও কাজের অর্ডার বুকিং বাবদ অগ্রিম গ্রহণ',
      });
    }

    const orderNumber = `DTC-WO-${new Date().getFullYear()}-${String(orders.length + 21).padStart(3, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      quotationId: quot.id,
      quotationNumber: quot.quotationNumber,
      customerName: quot.customerName,
      customerPhone: quot.customerPhone,
      customerAddress: quot.customerAddress,
      siteLocation: quot.siteLocation,
      orderDate: getTodayIsoDate(),
      expectedDeliveryDate: deliveryDate || getTodayIsoDate(),
      items: quot.items.map((it) => ({
        ...it,
        deliveredQuantity: 0,
        productionStatus: 'pending',
      })),
      subTotal: quot.subTotal,
      discount: quot.discount,
      transportCost: quot.transportCost,
      fittingCost: quot.fittingCost,
      grandTotal: quot.grandTotal,
      totalPaid: advancePaid,
      dueAmount: Math.max(0, quot.grandTotal - advancePaid),
      paymentRecords,
      status: 'confirmed',
      productionProgressPercent: 10,
      marketingAgentId: quot.marketingAgentId,
      marketingAgentName: quot.marketingAgentName,
      notes: notes || quot.notes,
      createdAt: getTodayIsoDate(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update quotation status
    updateQuotation(quotationId, {
      status: 'converted',
      convertedOrderId: newOrder.id,
    });

    return newOrder;
  };

  // Order CRUD
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      createdAt: getTodayIsoDate(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const addPaymentToOrder = (orderId: string, payment: Omit<PaymentRecord, 'id'>) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const newPaymentRecord: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
    };

    const updatedPayments = [...targetOrder.paymentRecords, newPaymentRecord];
    const newTotalPaid = updatedPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const newDueAmount = Math.max(0, targetOrder.grandTotal - newTotalPaid);

    updateOrder(orderId, {
      paymentRecords: updatedPayments,
      totalPaid: newTotalPaid,
      dueAmount: newDueAmount,
    });
  };

  const updatePaymentRecord = (
    orderId: string,
    paymentId: string,
    updates: Partial<PaymentRecord>
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const updatedPayments = targetOrder.paymentRecords.map((p) =>
      p.id === paymentId ? { ...p, ...updates } : p
    );
    const newTotalPaid = updatedPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const newDueAmount = Math.max(0, targetOrder.grandTotal - newTotalPaid);

    updateOrder(orderId, {
      paymentRecords: updatedPayments,
      totalPaid: newTotalPaid,
      dueAmount: newDueAmount,
    });
  };

  const deletePaymentFromOrder = (orderId: string, paymentId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const updatedPayments = targetOrder.paymentRecords.filter((p) => p.id !== paymentId);
    const newTotalPaid = updatedPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const newDueAmount = Math.max(0, targetOrder.grandTotal - newTotalPaid);

    updateOrder(orderId, {
      paymentRecords: updatedPayments,
      totalPaid: newTotalPaid,
      dueAmount: newDueAmount,
    });
  };

  const assignMarketingAgentToOrder = (
    orderId: string,
    agentId?: string,
    agentName?: string
  ) => {
    updateOrder(orderId, {
      marketingAgentId: agentId || undefined,
      marketingAgentName: agentName || undefined,
    });
  };

  const updateOrderProductionStatus = (
    orderId: string,
    status: OrderStatus,
    progressPercent?: number
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    let defaultProgress = target.productionProgressPercent;
    if (progressPercent !== undefined) {
      defaultProgress = progressPercent;
    } else {
      switch (status) {
        case 'confirmed':
          defaultProgress = 10;
          break;
        case 'wood_sizing':
          defaultProgress = 30;
          break;
        case 'carpentry':
          defaultProgress = 55;
          break;
        case 'polish':
          defaultProgress = 80;
          break;
        case 'ready_for_delivery':
          defaultProgress = 95;
          break;
        case 'delivered':
          defaultProgress = 100;
          break;
        case 'partial_delivered':
          defaultProgress = Math.max(70, target.productionProgressPercent);
          break;
      }
    }

    updateOrder(orderId, { status, productionProgressPercent: defaultProgress });
  };

  // Craftsmen & Tasks
  const addCraftsman = (
    data: Omit<Craftsman, 'id' | 'totalEarned' | 'totalAdvanceTaken' | 'balanceDue' | 'activeTasksCount'>
  ): Craftsman => {
    const newC: Craftsman = {
      ...data,
      id: `craft-${Date.now()}`,
      totalEarned: 0,
      totalAdvanceTaken: 0,
      balanceDue: 0,
      activeTasksCount: 0,
    };
    setCraftsmen((prev) => [...prev, newC]);
    return newC;
  };

  const updateCraftsman = (id: string, updates: Partial<Craftsman>) => {
    setCraftsmen((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const assignTask = (taskData: Omit<CraftsmanTask, 'id'>): CraftsmanTask => {
    const newTask: CraftsmanTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };

    setCraftsmanTasks((prev) => [newTask, ...prev]);

    // Update order item assigned craftsman
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === taskData.orderId) {
          const updatedItems = ord.items.map((item) => {
            if (item.description === taskData.itemDescription) {
              return {
                ...item,
                assignedCraftsmanId: taskData.craftsmanId,
                assignedCraftsmanName: taskData.craftsmanName,
                craftsmanWageAmount: taskData.wageRatePerUnit,
              };
            }
            return item;
          });
          return { ...ord, items: updatedItems };
        }
        return ord;
      })
    );

    // Update craftsman active task count
    setCraftsmen((prev) =>
      prev.map((c) =>
        c.id === taskData.craftsmanId ? { ...c, activeTasksCount: c.activeTasksCount + 1 } : c
      )
    );

    return newTask;
  };

  const updateCraftsmanTask = (taskId: string, updates: Partial<CraftsmanTask>) => {
    const currentTask = craftsmanTasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    setCraftsmanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );

    if (updates.status === 'completed' && currentTask.status !== 'completed') {
      // Add to craftsman total earned
      const earned = currentTask.totalWageAmount;
      setCraftsmen((prev) =>
        prev.map((c) => {
          if (c.id === currentTask.craftsmanId) {
            const newEarned = c.totalEarned + earned;
            const newBalance = newEarned - c.totalAdvanceTaken;
            return {
              ...c,
              totalEarned: newEarned,
              balanceDue: newBalance,
              activeTasksCount: Math.max(0, c.activeTasksCount - 1),
            };
          }
          return c;
        })
      );
    }
  };

  // Sawmill Logs
  const addSawmillLog = (logData: Omit<SawmillLogEntry, 'id'>): SawmillLogEntry => {
    const newLog: SawmillLogEntry = {
      ...logData,
      id: `saw-${Date.now()}`,
    };
    setSawmillLogs((prev) => [newLog, ...prev]);

    // Automatically update sawn timber inventory
    const targetSpecies = logData.woodSpecies;
    const invMatch = inventory.find(
      (i) => i.species.toLowerCase().includes(targetSpecies.toLowerCase()) && i.type === 'sawn_timber'
    );
    if (invMatch) {
      adjustInventoryStock(invMatch.id, logData.outputSawnCft, true);
    }

    return newLog;
  };

  // Interior Projects
  const addInteriorProject = (data: Omit<InteriorProject, 'id'>): InteriorProject => {
    const newProject: InteriorProject = {
      ...data,
      id: `proj-${Date.now()}`,
    };
    setInteriorProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateInteriorProject = (id: string, updates: Partial<InteriorProject>) => {
    setInteriorProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          updated.totalExpenses = updated.materialCost + updated.laborCost + updated.otherExpenses;
          updated.estimatedProfit = updated.contractAmount - updated.totalExpenses;
          return updated;
        }
        return p;
      })
    );
  };

  const addMaterialToProject = (
    projectId: string,
    material: { materialName: string; quantity: string; cost: number; date: string }
  ) => {
    const project = interiorProjects.find((p) => p.id === projectId);
    if (!project) return;

    const newMaterials = [...project.materialsUsed, material];
    const newMaterialCost = newMaterials.reduce((sum, m) => sum + m.cost, 0);

    updateInteriorProject(projectId, {
      materialsUsed: newMaterials,
      materialCost: newMaterialCost,
    });
  };

  const addLaborToProject = (
    projectId: string,
    labor: { craftsmanName: string; task: string; amount: number; date: string }
  ) => {
    const project = interiorProjects.find((p) => p.id === projectId);
    if (!project) return;

    const newLaborEntries = [...project.laborEntries, labor];
    const newLaborCost = newLaborEntries.reduce((sum, l) => sum + l.amount, 0);

    updateInteriorProject(projectId, {
      laborEntries: newLaborEntries,
      laborCost: newLaborCost,
    });
  };

  // Delivery Challan
  const createDeliveryChallan = (
    orderId: string,
    challanDetails: {
      deliveryAddress: string;
      vehicleType: string;
      vehicleNumber: string;
      driverName: string;
      driverPhone: string;
      deliveredItems: { orderItemId: string; quantity: number }[];
      notes?: string;
    }
  ): DeliveryChallan => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) throw new Error('Order not found');

    const challanItems = challanDetails.deliveredItems
      .map((del) => {
        const item = targetOrder.items.find((it) => it.id === del.orderItemId);
        if (!item || del.quantity <= 0) return null;
        return {
          orderItemId: item.id,
          itemDescription: item.description,
          woodSpecies: String(item.woodSpecies),
          sizeSpecs: `${item.lengthFt}' × ${item.widthIn}" × ${item.thicknessIn}"`,
          quantity: del.quantity,
        };
      })
      .filter(Boolean) as DeliveryChallan['deliveredItems'];

    const challanNumber = `DTC-CH-${new Date().getFullYear()}-${String(
      deliveryChallans.length + 16
    ).padStart(3, '0')}`;

    const newChallan: DeliveryChallan = {
      id: `chal-${Date.now()}`,
      challanNumber,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      customerName: targetOrder.customerName,
      customerPhone: targetOrder.customerPhone,
      deliveryAddress: challanDetails.deliveryAddress || targetOrder.customerAddress,
      deliveryDate: getTodayIsoDate(),
      vehicleType: challanDetails.vehicleType,
      vehicleNumber: challanDetails.vehicleNumber,
      driverName: challanDetails.driverName,
      driverPhone: challanDetails.driverPhone,
      deliveredItems: challanItems,
      status: 'dispatched',
      notes: challanDetails.notes,
    };

    setDeliveryChallans((prev) => [newChallan, ...prev]);

    // Update order items delivered count and order status
    let allDelivered = true;
    let anyDelivered = false;

    const updatedOrderItems = targetOrder.items.map((it) => {
      const deliveredNow = challanDetails.deliveredItems.find((d) => d.orderItemId === it.id);
      const newDeliveredTotal = (it.deliveredQuantity || 0) + (deliveredNow ? deliveredNow.quantity : 0);

      if (newDeliveredTotal > 0) anyDelivered = true;
      if (newDeliveredTotal < it.quantity) allDelivered = false;

      return {
        ...it,
        deliveredQuantity: newDeliveredTotal,
      };
    });

    const newOrderStatus: OrderStatus = allDelivered
      ? 'delivered'
      : anyDelivered
      ? 'partial_delivered'
      : targetOrder.status;

    updateOrder(orderId, {
      items: updatedOrderItems,
      status: newOrderStatus,
      productionProgressPercent: allDelivered ? 100 : Math.max(85, targetOrder.productionProgressPercent),
    });

    return newChallan;
  };

  // Attendance & Advances
  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const existingIndex = attendanceRecords.findIndex(
      (a) => a.date === record.date && a.craftsmanId === record.craftsmanId
    );

    if (existingIndex >= 0) {
      setAttendanceRecords((prev) =>
        prev.map((a, i) => (i === existingIndex ? { ...record, id: a.id } : a))
      );
    } else {
      const newRecord: AttendanceRecord = {
        ...record,
        id: `att-${Date.now()}`,
      };
      setAttendanceRecords((prev) => [newRecord, ...prev]);
    }
  };

  const recordAdvanceKhoraki = (craftsmanId: string, amount: number, notes?: string) => {
    const craftsman = craftsmen.find((c) => c.id === craftsmanId);
    if (!craftsman) return;

    // Update craftsman totals
    const newAdvance = craftsman.totalAdvanceTaken + amount;
    const newBalance = craftsman.totalEarned - newAdvance;

    updateCraftsman(craftsmanId, {
      totalAdvanceTaken: newAdvance,
      balanceDue: newBalance,
    });

    // Also record today's attendance advance
    const today = getTodayIsoDate();
    const existingAtt = attendanceRecords.find(
      (a) => a.date === today && a.craftsmanId === craftsmanId
    );

    if (existingAtt) {
      markAttendance({
        ...existingAtt,
        advanceTakenToday: (existingAtt.advanceTakenToday || 0) + amount,
        notes: notes || existingAtt.notes,
      });
    } else {
      markAttendance({
        date: today,
        craftsmanId,
        craftsmanName: craftsman.name,
        status: 'present',
        overtimeHours: 0,
        dailyWageAmount: craftsman.standardDailyWage,
        advanceTakenToday: amount,
        notes: notes || 'খোরাকি গ্রহণ',
      });
    }
  };

  // Inventory
  const addInventoryItem = (itemData: Omit<WoodInventoryItem, 'id'>): WoodInventoryItem => {
    const newItem: WoodInventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
    };
    setInventory((prev) => [...prev, newItem]);
    return newItem;
  };

  const adjustInventoryStock = (itemId: string, quantityChange: number, isRestock: boolean = false) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.currentStock + quantityChange);
          return {
            ...item,
            currentStock: Number(newStock.toFixed(2)),
            lastRestockedDate: isRestock ? getTodayIsoDate() : item.lastRestockedDate,
          };
        }
        return item;
      })
    );
  };

  // Expenses CRUD
  const addCustomExpenseCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    setCustomExpenseCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  };

  const deleteCustomExpenseCategory = (categoryName: string) => {
    setCustomExpenseCategories((prev) => prev.filter((c) => c !== categoryName));
  };

  const addExpense = (expenseData: Omit<ExpenseRecord, 'id' | 'voucherNo'>): ExpenseRecord => {
    const voucherNo = `DTC-EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`;
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      voucherNo,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    if (expenseData.category && typeof expenseData.category === 'string') {
      addCustomExpenseCategory(expenseData.category);
    }

    return newExpense;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Communication Logs
  const addCommunicationLog = (logData: Omit<CommunicationLog, 'id' | 'sentAt'>): CommunicationLog => {
    const newLog: CommunicationLog = {
      ...logData,
      id: `comm-${Date.now()}`,
      sentAt: `${getTodayIsoDate()} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setCommunicationLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  // Design Catalog CRUD
  const addDesignCatalogItem = (itemData: Omit<DesignCatalogItem, 'id'>): DesignCatalogItem => {
    const newItem: DesignCatalogItem = {
      ...itemData,
      id: `cat-${Date.now()}`,
    };
    setDesignCatalog((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateDesignCatalogItem = (id: string, updates: Partial<DesignCatalogItem>) => {
    setDesignCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteDesignCatalogItem = (id: string) => {
    setDesignCatalog((prev) => prev.filter((item) => item.id !== id));
  };

  // Marketing Agents CRUD
  const addMarketingAgent = (agentData: Omit<MarketingAgent, 'id'>): MarketingAgent => {
    const newAgent: MarketingAgent = {
      ...agentData,
      id: `mkt-${Date.now()}`,
    };
    setMarketingAgents((prev) => [...prev, newAgent]);
    return newAgent;
  };

  const updateMarketingAgent = (id: string, updates: Partial<MarketingAgent>) => {
    setMarketingAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteMarketingAgent = (id: string) => {
    setMarketingAgents((prev) => prev.filter((a) => a.id !== id));
  };

  // Marketing Commission Payouts
  const disburseCommissionPayout = (
    payoutData: Omit<MarketingCommissionPayout, 'id' | 'payoutNumber' | 'createdAt'>,
    syncToAccounts: boolean = true
  ): MarketingCommissionPayout => {
    const cleanMonth = (payoutData.month || '').replace('-', '');
    const payoutNumber = `DTC-MCOM-${cleanMonth}-${String(commissionPayouts.length + 1).padStart(3, '0')}`;
    const newPayout: MarketingCommissionPayout = {
      ...payoutData,
      id: `payout-${Date.now()}`,
      payoutNumber,
      createdAt: getTodayIsoDate(),
    };

    setCommissionPayouts((prev) => [newPayout, ...prev]);

    // Automatically sync as Expense into Accounts Ledger
    if (syncToAccounts && payoutData.netPaidAmount > 0) {
      addExpense({
        title: `মার্কেটিং সেলস কমিশন - ${payoutData.agentName} (${payoutData.month})`,
        category: 'Marketing & Sales Commission',
        amount: payoutData.netPaidAmount,
        date: payoutData.paymentDate || getTodayIsoDate(),
        paymentMethod: payoutData.paymentMethod,
        paidTo: `${payoutData.agentName}`,
        paidBy: payoutData.paidBy || 'Manager / Accounts',
        notes: `মোট কালেকশন ৳${payoutData.totalCollectionInMonth.toLocaleString('en-IN')} এর মাসিক কমিশন ভাউচার #${payoutNumber}`,
      });
    }

    return newPayout;
  };

  const deleteCommissionPayout = (id: string) => {
    setCommissionPayouts((prev) => prev.filter((p) => p.id !== id));
  };

  // Monthly Collection & Commission Calculator for Agent
  const getAgentMonthlyStats = (agentId: string, monthYear: string) => {
    const agent = marketingAgents.find((a) => a.id === agentId);
    const ratePerLakh = agent?.commissionRatePerLakh || 1000;

    const collectionRecords: Array<{
      orderId: string;
      orderNumber: string;
      customerName: string;
      siteLocation?: string;
      paymentId: string;
      paymentDate: string;
      paymentMethod: string;
      amount: number;
      commission: number;
      note?: string;
    }> = [];

    let totalCollection = 0;
    const orderIdsSet = new Set<string>();

    const agentOrders = orders.filter((o) => o.marketingAgentId === agentId);

    agentOrders.forEach((ord) => {
      ord.paymentRecords.forEach((pay) => {
        if (pay.date && pay.date.startsWith(monthYear)) {
          totalCollection += pay.amount;
          orderIdsSet.add(ord.id);
          const comm = Math.round((pay.amount / 100000) * ratePerLakh);
          collectionRecords.push({
            orderId: ord.id,
            orderNumber: ord.orderNumber,
            customerName: ord.customerName,
            siteLocation: ord.siteLocation,
            paymentId: pay.id,
            paymentDate: pay.date,
            paymentMethod: pay.method,
            amount: pay.amount,
            commission: comm,
            note: pay.note,
          });
        }
      });
    });

    const grossCommission = Math.round((totalCollection / 100000) * ratePerLakh);

    // Sum already paid payouts for this agent in this month
    const paidForMonth = commissionPayouts
      .filter((p) => p.agentId === agentId && p.month === monthYear)
      .reduce((sum, p) => sum + p.netPaidAmount, 0);

    const balanceDue = Math.max(0, grossCommission - paidForMonth);

    return {
      totalCollection,
      grossCommission,
      paidCommission: paidForMonth,
      balanceDue,
      ratePerLakh,
      collectionRecords,
      orderCount: orderIdsSet.size,
    };
  };

  // Financial Accounts CRUD
  const addFinancialAccount = (accountData: Omit<FinancialAccount, 'id'>): FinancialAccount => {
    const newAccount: FinancialAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
    };
    setFinancialAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  };

  const updateFinancialAccount = (id: string, updates: Partial<FinancialAccount>) => {
    setFinancialAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteFinancialAccount = (id: string) => {
    setFinancialAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // Account Transfers CRUD
  const addAccountTransfer = (
    transferData: Omit<AccountTransfer, 'id' | 'transferNumber' | 'createdAt'>
  ): AccountTransfer => {
    const transferNumber = `DTC-TRF-${new Date().getFullYear()}-${String(accountTransfers.length + 1).padStart(3, '0')}`;
    const newTransfer: AccountTransfer = {
      ...transferData,
      id: `trf-${Date.now()}`,
      transferNumber,
      createdAt: getTodayIsoDate(),
    };
    setAccountTransfers((prev) => [newTransfer, ...prev]);
    return newTransfer;
  };

  const deleteAccountTransfer = (id: string) => {
    setAccountTransfers((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: check if a transaction belongs to a given financial account
  const isTransactionForAccount = (
    itemAccountId: string | undefined,
    itemMethod: string | undefined,
    account: FinancialAccount
  ): boolean => {
    if (itemAccountId) {
      return itemAccountId === account.id;
    }
    const m = (itemMethod || '').toLowerCase();
    if (account.accountType === 'cash' && (m === 'cash' || m.includes('নগদ') || m === '')) {
      return account.id === 'acc-1' || financialAccounts.filter(a => a.accountType === 'cash')[0]?.id === account.id;
    }
    if (account.accountType === 'bank' && (m === 'bank transfer' || m === 'cheque' || m.includes('ব্যাংক') || m.includes('চেক'))) {
      return account.id === 'acc-2' || financialAccounts.filter(a => a.accountType === 'bank')[0]?.id === account.id;
    }
    if (account.accountType === 'mfs' && (m === 'bkash' || m === 'nagad' || m.includes('বিকাশ') || m.includes('নগদ'))) {
      return account.id === 'acc-4' || financialAccounts.filter(a => a.accountType === 'mfs')[0]?.id === account.id;
    }
    return false;
  };

  // Live balance calculation for a specific account
  const getAccountLiveBalance = (accountId: string) => {
    const account = financialAccounts.find((a) => a.id === accountId);
    if (!account) return { liveBalance: 0, openingBalance: 0, totalInflow: 0, totalOutflow: 0 };

    const openingBalance = account.openingBalance || 0;
    let totalInflow = 0;
    let totalOutflow = 0;

    // 1. Order Collections (Inflow +)
    orders.forEach((ord) => {
      ord.paymentRecords.forEach((pay) => {
        if (isTransactionForAccount(pay.accountId, pay.method, account)) {
          totalInflow += pay.amount;
        }
      });
    });

    // 2. Transfers in (Inflow +)
    accountTransfers.forEach((trf) => {
      if (trf.toAccountId === accountId) {
        totalInflow += trf.amount;
      }
    });

    // 3. Expenses (Outflow -)
    expenses.forEach((exp) => {
      if (isTransactionForAccount(exp.accountId, exp.paymentMethod, account)) {
        totalOutflow += exp.amount;
      }
    });

    // 4. Commission Payouts (Outflow -)
    commissionPayouts.forEach((payout) => {
      if (isTransactionForAccount(payout.accountId, payout.paymentMethod, account)) {
        totalOutflow += payout.netPaidAmount;
      }
    });

    // 5. Transfers out (Outflow -)
    accountTransfers.forEach((trf) => {
      if (trf.fromAccountId === accountId) {
        totalOutflow += trf.amount;
      }
    });

    const liveBalance = openingBalance + totalInflow - totalOutflow;

    return {
      liveBalance,
      openingBalance,
      totalInflow,
      totalOutflow,
    };
  };

  // Summary across all accounts
  const getAllAccountsSummary = () => {
    let totalLiveBalance = 0;
    let totalCash = 0;
    let totalBank = 0;
    let totalMfs = 0;
    let totalPettyCash = 0;

    financialAccounts.forEach((acc) => {
      if (acc.isActive !== false) {
        const bal = getAccountLiveBalance(acc.id).liveBalance;
        totalLiveBalance += bal;
        if (acc.accountType === 'cash') totalCash += bal;
        else if (acc.accountType === 'bank') totalBank += bal;
        else if (acc.accountType === 'mfs') totalMfs += bal;
        else if (acc.accountType === 'petty_cash') totalPettyCash += bal;
      }
    });

    return {
      totalLiveBalance,
      totalCash,
      totalBank,
      totalMfs,
      totalPettyCash,
    };
  };

  // Unified daybook & ledger transaction history
  const getAccountLedgerTransactions = (
    accountId?: string,
    fromDate?: string,
    toDate?: string
  ) => {
    type LedgerTx = {
      id: string;
      date: string;
      type: 'opening' | 'order_collection' | 'expense' | 'commission_payout' | 'transfer_in' | 'transfer_out';
      title: string;
      refNo?: string;
      accountName: string;
      debit: number;
      credit: number;
      balance: number;
      notes?: string;
    };

    const rawList: Omit<LedgerTx, 'balance'>[] = [];

    const targetAccounts = accountId
      ? financialAccounts.filter((a) => a.id === accountId)
      : financialAccounts.filter((a) => a.isActive !== false);

    // Order Collections
    orders.forEach((ord) => {
      ord.paymentRecords.forEach((pay) => {
        targetAccounts.forEach((acc) => {
          if (isTransactionForAccount(pay.accountId, pay.method, acc)) {
            rawList.push({
              id: pay.id,
              date: pay.date,
              type: 'order_collection',
              title: `অর্ডার কালেকশন - ${ord.customerName} (${ord.orderNumber})`,
              refNo: pay.referenceNo,
              accountName: acc.accountName,
              debit: pay.amount,
              credit: 0,
              notes: pay.note || `পেমেন্ট মেথড: ${pay.method}`,
            });
          }
        });
      });
    });

    // Expenses
    expenses.forEach((exp) => {
      targetAccounts.forEach((acc) => {
        if (isTransactionForAccount(exp.accountId, exp.paymentMethod, acc)) {
          rawList.push({
            id: exp.id,
            date: exp.date,
            type: 'expense',
            title: `খরচ ভাউচার #${exp.voucherNo} - ${exp.title} (${exp.category})`,
            refNo: exp.voucherNo,
            accountName: acc.accountName,
            debit: 0,
            credit: exp.amount,
            notes: exp.notes || `প্রদানকারী: ${exp.paidBy}, গ্রহীতা: ${exp.paidTo}`,
          });
        }
      });
    });

    // Commission Payouts
    commissionPayouts.forEach((payout) => {
      targetAccounts.forEach((acc) => {
        if (isTransactionForAccount(payout.accountId, payout.paymentMethod, acc)) {
          rawList.push({
            id: payout.id,
            date: payout.paymentDate,
            type: 'commission_payout',
            title: `মার্কেটিং কমিশন ভাউচার #${payout.payoutNumber} - ${payout.agentName}`,
            refNo: payout.payoutNumber,
            accountName: acc.accountName,
            debit: 0,
            credit: payout.netPaidAmount,
            notes: `মাস: ${payout.month}, কালেকশন বেস: ৳${payout.totalCollectionInMonth.toLocaleString('en-IN')}`,
          });
        }
      });
    });

    // Account Transfers
    accountTransfers.forEach((trf) => {
      targetAccounts.forEach((acc) => {
        if (trf.toAccountId === acc.id) {
          rawList.push({
            id: `${trf.id}-in`,
            date: trf.transferDate,
            type: 'transfer_in',
            title: `ফান্ড জমা - ${trf.fromAccountName} থেকে গৃহীত`,
            refNo: trf.transferNumber,
            accountName: acc.accountName,
            debit: trf.amount,
            credit: 0,
            notes: trf.notes,
          });
        }
        if (trf.fromAccountId === acc.id) {
          rawList.push({
            id: `${trf.id}-out`,
            date: trf.transferDate,
            type: 'transfer_out',
            title: `ফান্ড ট্রান্সফার - ${trf.toAccountName} এ প্রেরিত`,
            refNo: trf.transferNumber,
            accountName: acc.accountName,
            debit: 0,
            credit: trf.amount,
            notes: trf.notes,
          });
        }
      });
    });

    // Sort chronologically (oldest to newest) to calculate running balance
    rawList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const filtered = rawList.filter((tx) => {
      if (fromDate && tx.date < fromDate) return false;
      if (toDate && tx.date > toDate) return false;
      return true;
    });

    let runningBal = targetAccounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0);

    const result: LedgerTx[] = filtered.map((tx) => {
      runningBal = runningBal + tx.debit - tx.credit;
      return {
        ...tx,
        balance: runningBal,
      };
    });

    // Return newest first
    return result.reverse();
  };

  // Reset & Backup
  const resetToDemoData = () => {
    setSettings(initialCompanySettings);
    setQuotations(initialQuotations);
    setOrders(initialOrders);
    setCraftsmen(initialCraftsmen);
    setCraftsmanTasks(initialCraftsmanTasks);
    setSawmillLogs(initialSawmillLogs);
    setInteriorProjects(initialInteriorProjects);
    setDeliveryChallans(initialDeliveryChallans);
    setAttendanceRecords(initialAttendance);
    setInventory(initialInventory);
    setExpenses(initialExpenses);
    setCommunicationLogs(initialCommunicationLogs);
    setDesignCatalog(initialDesignCatalog);
    setMarketingAgents(initialMarketingAgents);
    setCommissionPayouts(initialCommissionPayouts);
    setFinancialAccounts(initialFinancialAccounts);
    setAccountTransfers(initialAccountTransfers);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportDataJson = (): string => {
    return JSON.stringify(
      {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings,
        quotations,
        orders,
        craftsmen,
        craftsmanTasks,
        sawmillLogs,
        interiorProjects,
        deliveryChallans,
        attendanceRecords,
        inventory,
        expenses,
        communicationLogs,
        designCatalog,
        marketingAgents,
        commissionPayouts,
        financialAccounts,
        accountTransfers,
      },
      null,
      2
    );
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.quotations) setQuotations(parsed.quotations);
      if (parsed.orders) setOrders(parsed.orders);
      if (parsed.craftsmen) setCraftsmen(parsed.craftsmen);
      if (parsed.craftsmanTasks) setCraftsmanTasks(parsed.craftsmanTasks);
      if (parsed.sawmillLogs) setSawmillLogs(parsed.sawmillLogs);
      if (parsed.interiorProjects) setInteriorProjects(parsed.interiorProjects);
      if (parsed.deliveryChallans) setDeliveryChallans(parsed.deliveryChallans);
      if (parsed.attendanceRecords) setAttendanceRecords(parsed.attendanceRecords);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.communicationLogs) setCommunicationLogs(parsed.communicationLogs);
      if (parsed.designCatalog) setDesignCatalog(parsed.designCatalog);
      if (parsed.marketingAgents) setMarketingAgents(parsed.marketingAgents);
      if (parsed.commissionPayouts) setCommissionPayouts(parsed.commissionPayouts);
      if (parsed.financialAccounts) setFinancialAccounts(parsed.financialAccounts);
      if (parsed.accountTransfers) setAccountTransfers(parsed.accountTransfers);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        settings,
        updateSettings,
        leads,
        addLead,
        updateLead,
        deleteLead,
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToOrder,
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        addPaymentToOrder,
        updatePaymentRecord,
        deletePaymentFromOrder,
        assignMarketingAgentToOrder,
        updateOrderProductionStatus,
        craftsmen,
        addCraftsman,
        updateCraftsman,
        craftsmanTasks,
        assignTask,
        updateCraftsmanTask,
        sawmillLogs,
        addSawmillLog,
        interiorProjects,
        addInteriorProject,
        updateInteriorProject,
        addMaterialToProject,
        addLaborToProject,
        deliveryChallans,
        createDeliveryChallan,
        attendanceRecords,
        markAttendance,
        recordAdvanceKhoraki,
        inventory,
        addInventoryItem,
        adjustInventoryStock,
        expenses,
        addExpense,
        deleteExpense,
        customExpenseCategories,
        addCustomExpenseCategory,
        deleteCustomExpenseCategory,
        communicationLogs,
        addCommunicationLog,
        designCatalog,
        addDesignCatalogItem,
        updateDesignCatalogItem,
        deleteDesignCatalogItem,
        marketingAgents,
        addMarketingAgent,
        updateMarketingAgent,
        deleteMarketingAgent,
        commissionPayouts,
        disburseCommissionPayout,
        deleteCommissionPayout,
        getAgentMonthlyStats,
        financialAccounts,
        addFinancialAccount,
        updateFinancialAccount,
        deleteFinancialAccount,
        accountTransfers,
        addAccountTransfer,
        deleteAccountTransfer,
        getAccountLiveBalance,
        getAllAccountsSummary,
        getAccountLedgerTransactions,
        resetToDemoData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
