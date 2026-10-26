export type ProductionStage =
  | 'SEASONING'
  | 'SIZING'
  | 'JOINERY'
  | 'CNC_CARVING'
  | 'SANDING'
  | 'POLISHING'
  | 'QC_PACKING'
  | 'READY_DISPATCH'
  | 'DELIVERED';

export type WoodType =
  | 'CTG_TEAK'
  | 'BURMA_TEAK'
  | 'GAMARI'
  | 'MAHOGANY'
  | 'GORJON'
  | 'RED_OAK'
  | 'FLUSH_BOARD'
  | 'MALAYSIAN_PROCESSED';

export type ProductCategory =
  | 'DOOR_SOLID'
  | 'DOOR_FLUSH'
  | 'DOOR_DOUBLE'
  | 'FRAME_CHOUKHAT'
  | 'CABINET_FURNITURE'
  | 'SLIDING_PARTITION';

export type FinishType =
  | 'LACQUER_GLOSS'
  | 'LACQUER_MATT'
  | 'PU_COATING'
  | 'DUCO_PAINT'
  | 'HAND_POLISH'
  | 'RAW_UNPOLISHED';

export type QCStatus = 'PASSED' | 'REWORK_REQUIRED' | 'PENDING';

export type PriorityLevel = 'NORMAL' | 'URGENT' | 'CRITICAL';

export interface StageLog {
  stage: ProductionStage;
  timestamp: string;
  operator: string;
  note?: string;
  photoUrl?: string;
}

export interface OrderItem {
  id: string; // e.g. "ITEM-101"
  orderId: string; // e.g. "ORD-401"
  itemName: string;
  category: ProductCategory;
  woodType: WoodType;
  stage: ProductionStage;
  dimensions: {
    height: number;
    width: number;
    thickness: number;
    unit: 'inch' | 'mm';
    rebate?: string; // e.g. "1.5 x 0.5 inch"
  };
  designCode: string;
  finishType: FinishType;
  lockPocket: boolean;
  hingeCutting: boolean;
  stageHistory: StageLog[];
  qcStatus: QCStatus;
  qcNotes?: string;
  assignedWorker?: string;
  qrCode: string;
  photoUrl?: string;
  priority: PriorityLevel;
  locationTag?: string;
  quantity: number;
  readyForDispatch?: boolean;
}

export interface CustomerOrder {
  id: string; // e.g. "ORD-401"
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  siteLocation: string;
  orderDate: string;
  promisedDeliveryDate: string;
  items: OrderItem[];
  status: 'IN_PRODUCTION' | 'PARTIALLY_READY' | 'READY_FOR_DELIVERY' | 'DISPATCHED' | 'COMPLETED';
  notes?: string;
  deliveryDriver?: string;
  vehicleNumber?: string;
  gatePassId?: string;
  challanNumber?: string;
  dispatchedAt?: string;
}

export interface DailyShiftReport {
  reportDate: string;
  generatedAt: string;
  shift: 'DAY' | 'NIGHT' | 'FULL_DAY';
  supervisorName: string;
  plantLocation: string;
  totalActiveOrders: number;
  totalFloorUnits: number;
  completedUnitsToday: number;
  polishingQueueUnits: number;
  readyForDispatchUnits: number;
  qcReworkUnits: number;
  urgentOrdersCount: number;
  stageDistribution: Record<ProductionStage, number>;
  urgentItemsList: Array<{
    itemName: string;
    customerName: string;
    woodType: WoodType;
    stage: ProductionStage;
    promisedDate: string;
    priority: PriorityLevel;
  }>;
  qcAlertsList: Array<{
    itemName: string;
    customerName: string;
    reason: string;
    currentStage: ProductionStage;
  }>;
  dispatchesToday: Array<{
    orderNumber: string;
    customerName: string;
    siteLocation: string;
    itemCount: number;
    challanNumber?: string;
    vehicleNumber?: string;
  }>;
  generalRemarks?: string;
}

export type UserRole =
  | 'PRODUCTION_MANAGER'
  | 'FACTORY_SUPERVISOR'
  | 'LOGISTICS_MANAGER'
  | 'EXECUTIVE_ADMIN';

export type Language = 'bn' | 'en';
