export type Language = 'bn' | 'en';

export type WoodSpecies =
  | 'Chittagong Teak (চিটাগাং সেগুন)'
  | 'Burma Teak (বার্মা সেগুন)'
  | 'Gamari (গামারি)'
  | 'Mahogany (মেহগনি)'
  | 'Shil Karoi (শীল কড়ই)'
  | 'Garjan (গর্জন)'
  | 'Chapalish (চাপালিশ)'
  | 'Akashmoni (আকাশমণি)'
  | 'Pine Wood (পাইন কাঠ)'
  | 'Red Meranti (মালয়েশিয়ান লোহা কাঠ)'
  | 'Gorjon Ply / Board';

export type ItemType = 'door' | 'choukhat' | 'timber_cft' | 'furniture' | 'interior_item';

export type PolishType = 'None (Raw)' | 'Hand Polish' | 'PU Polish' | 'NC Lacquer' | 'Melamine Polish' | 'Natural Oil';

export type DoorDesign = 'Plain Solid' | 'CNC Carving' | 'Groove Design' | 'Panel Door' | 'Glass Cut' | 'Veneered';

export interface QuotationItem {
  id: string;
  itemType: ItemType;
  description: string;
  woodSpecies: WoodSpecies | string;
  // Dimensions
  lengthFt: number;
  lengthIn?: number;
  heightIn?: number;
  doorWidthIn?: number;
  widthIn: number;
  widthSuuta?: number; // 1/8 of an inch
  thicknessIn: number;
  thicknessSuuta?: number;
  // Computed
  cftPerPiece?: number;
  quantity: number;
  totalCft?: number;
  unitRate: number; // Rate per piece or rate per CFT
  rateType: 'per_piece' | 'per_cft' | 'per_sqft' | 'fixed';
  polishType?: PolishType;
  design?: DoorDesign | string;
  fittingIncluded?: boolean;
  totalAmount: number;
  notes?: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  siteLocation?: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subTotal: number;
  discount: number;
  transportCost: number;
  fittingCost: number;
  vatPercent: number;
  vatAmount: number;
  grandTotal: number;
  status: QuotationStatus;
  termsAndConditions: string[];
  notes?: string;
  marketingAgentId?: string;
  marketingAgentName?: string;
  convertedOrderId?: string;
  createdAt: string;
}

export type OrderStatus =
  | 'confirmed'
  | 'wood_sizing'
  | 'carpentry'
  | 'polish'
  | 'ready_for_delivery'
  | 'partial_delivered'
  | 'delivered'
  | 'cancelled';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque';
  referenceNo?: string;
  receivedBy: string;
  accountId?: string;
  accountName?: string;
  note?: string;
}

export interface OrderItem extends QuotationItem {
  deliveredQuantity: number;
  assignedCraftsmanId?: string;
  assignedCraftsmanName?: string;
  craftsmanWageType?: 'piece_rate' | 'daily' | 'contract';
  craftsmanWageAmount?: number;
  productionStatus?: 'pending' | 'sizing' | 'carpentry' | 'polishing' | 'ready' | 'delivered';
}

export interface Order {
  id: string;
  orderNumber: string;
  quotationId?: string;
  quotationNumber?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  siteLocation?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: OrderItem[];
  subTotal: number;
  discount: number;
  transportCost: number;
  fittingCost: number;
  grandTotal: number;
  totalPaid: number;
  dueAmount: number;
  paymentRecords: PaymentRecord[];
  status: OrderStatus;
  productionProgressPercent: number;
  marketingAgentId?: string;
  marketingAgentName?: string;
  notes?: string;
  createdAt: string;
}

export interface Craftsman {
  id: string;
  name: string;
  phone: string;
  nationalId?: string;
  specialty: 'Door Master' | 'Choukhat Specialist' | 'Polish Master' | 'Furniture Carpenter' | 'Sawmill Operator' | 'Interior Craftsman';
  wageType: 'piece_rate' | 'daily' | 'monthly';
  standardDailyWage: number;
  standardMonthlySalary: number;
  totalEarned: number;
  totalAdvanceTaken: number;
  balanceDue: number;
  activeTasksCount: number;
  isActive: boolean;
  joinDate: string;
}

export interface CraftsmanTask {
  id: string;
  craftsmanId: string;
  craftsmanName: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  itemDescription: string;
  quantity: number;
  completedQuantity: number;
  wageRatePerUnit: number;
  totalWageAmount: number;
  assignedDate: string;
  deadlineDate: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'verified';
  completedDate?: string;
  isPaid: boolean;
}

export interface SawmillLogEntry {
  id: string;
  entryDate: string;
  woodSpecies: WoodSpecies | string;
  logBatchNo: string;
  logLengthFt: number;
  logGirthInches: number; // বেড়
  roundLogCft: number; // Hoppus CFT
  outputSawnCft: number; // সাইজ কাঠ CFT
  wastageCft: number;
  wastagePercent: number;
  sawyerName: string;
  sawingCostPerCft: number;
  totalSawingCost: number;
  notes?: string;
}

export interface InteriorProject {
  id: string;
  projectName: string;
  clientName: string;
  clientPhone: string;
  siteAddress: string;
  startDate: string;
  targetEndDate: string;
  supervisorName: string;
  contractAmount: number;
  materialCost: number;
  laborCost: number;
  otherExpenses: number;
  totalExpenses: number;
  estimatedProfit: number;
  progressPercent: number;
  currentStage: 'Site Measurement' | 'Wood & Material Sourcing' | 'Factory Framing' | 'Site Installation' | 'Polish & Finishing' | 'Final Handover';
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  materialsUsed: {
    materialName: string;
    quantity: string;
    cost: number;
    date: string;
  }[];
  laborEntries: {
    craftsmanName: string;
    task: string;
    amount: number;
    date: string;
  }[];
}

export interface DeliveryChallanItem {
  orderItemId: string;
  itemDescription: string;
  woodSpecies: string;
  sizeSpecs: string;
  quantity: number;
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  vehicleType: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  deliveredItems: DeliveryChallanItem[];
  receivedByName?: string;
  status: 'dispatched' | 'delivered' | 'returned';
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  craftsmanId: string;
  craftsmanName: string;
  status: AttendanceStatus;
  inTime?: string;
  outTime?: string;
  overtimeHours: number;
  dailyWageAmount: number;
  advanceTakenToday: number;
  notes?: string;
}

export interface AdvanceRecord {
  id: string;
  craftsmanId: string;
  craftsmanName: string;
  date: string;
  amount: number;
  reason: string;
  approvedBy: string;
  isDeducted: boolean;
}

export interface WoodInventoryItem {
  id: string;
  species: WoodSpecies | string;
  type: 'sawn_timber' | 'round_log' | 'ready_frame' | 'ready_door' | 'hardware' | 'board';
  unit: 'CFT' | 'Pcs' | 'Sheets' | 'Sets' | 'Kg';
  currentStock: number;
  minAlertStock: number;
  avgPurchaseRate: number; // BDT per unit
  sellingRate: number; // BDT per unit
  location: 'Sawmill Yard' | 'Main Godown' | 'Finishing Workshop' | 'Showroom';
  lastRestockedDate: string;
}

export interface CompanySettings {
  companyNameEn: string;
  companyNameBn: string;
  taglineEn: string;
  taglineBn: string;
  addressEn: string;
  addressBn: string;
  showroomAddressEn?: string;
  showroomAddressBn?: string;
  factoryAddressEn?: string;
  factoryAddressBn?: string;
  phone1: string;
  phone2: string;
  telephone1?: string;
  telephone2?: string;
  email: string;
  website?: string;
  logoUrl?: string;
  tradeLicenseNo: string;
  binNo: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    routingNo?: string;
  };
  mobileBanking: {
    bKashMerchant?: string;
    bKashPersonal?: string;
    nagadPersonal?: string;
  };
  quotationTerms: string[];
  invoiceTerms: string[];
  defaultVatPercent: number;
}

export type ExpenseCategory =
  | 'Showroom Rent'
  | 'Factory & Sawmill Rent'
  | 'Electricity & Utility'
  | 'Raw Timber Procurement'
  | 'Sawmill Blades & Machine Parts'
  | 'Polish Chemicals & Varnish'
  | 'Transport, Truck & Fuel'
  | 'Hardware & Screws'
  | 'Office, Tea & Entertainment'
  | 'Staff Salary & Allowance'
  | 'Marketing & Sales Commission'
  | 'Other Operational Expense';

export interface ExpenseRecord {
  id: string;
  voucherNo: string;
  category: ExpenseCategory | string;
  title: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque';
  paidTo: string;
  paidBy: string;
  accountId?: string;
  accountName?: string;
  notes?: string;
}

export type CommunicationChannel = 'whatsapp' | 'sms';
export type CommunicationType =
  | 'quotation'
  | 'order_status'
  | 'money_receipt'
  | 'challan'
  | 'payment_reminder'
  | 'custom';

export interface CommunicationLog {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  message: string;
  sentAt: string;
  orderNumber?: string;
  quotationNumber?: string;
  amount?: number;
  status: 'sent' | 'copied';
}

export type DesignCategory =
  | 'solid_door'
  | 'cnc_door'
  | 'panel_door'
  | 'groove_door'
  | 'choukhat_frame'
  | 'veneer_door'
  | 'furniture';

export interface DesignCatalogItem {
  id: string;
  code: string;
  titleBn: string;
  titleEn: string;
  category: DesignCategory;
  woodSpecies: WoodSpecies | string;
  recommendedPolish: PolishType;
  standardSizes: string[];
  priceEstimatePerPiece: number;
  priceEstimatePerSqft?: number;
  priceEstimatePerCft?: number;
  descriptionBn: string;
  descriptionEn: string;
  tags: string[];
  imageUrl?: string;
  isFeatured?: boolean;
}

export interface MarketingAgent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  designation: string; // e.g. 'Senior Sales Executive', 'Contractor Partner', 'Interior Designer', 'Field Agent'
  commissionRatePerLakh: number; // default 1000 (1% on collection)
  joinDate: string;
  isActive: boolean;
  notes?: string;
}

export interface MarketingCommissionPayout {
  id: string;
  payoutNumber: string; // e.g. DTC-MCOM-202610-001
  agentId: string;
  agentName: string;
  month: string; // 'YYYY-MM'
  totalCollectionInMonth: number;
  commissionRatePerLakh: number;
  grossCommissionAmount: number;
  deductionAmount: number;
  netPaidAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque';
  paymentDate: string;
  referenceNo?: string;
  paidBy: string;
  accountId?: string;
  accountName?: string;
  notes?: string;
  createdAt: string;
}

export type FinancialAccountType = 'cash' | 'bank' | 'mfs' | 'petty_cash';

export interface FinancialAccount {
  id: string;
  accountName: string; // e.g. 'প্রধান ক্যাশ বক্স (Showroom Cash)', 'Islami Bank Bangladesh Ltd.', 'bKash Merchant'
  accountType: FinancialAccountType;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  routingNo?: string;
  openingBalance: number;
  openingDate: string; // YYYY-MM-DD
  isActive: boolean;
  notes?: string;
}

export interface AccountTransfer {
  id: string;
  transferNumber: string; // e.g. DTC-TRF-2026-001
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  transferDate: string;
  referenceNo?: string; // Cheque #, Deposit Slip #, Trx ID
  transferredBy: string;
  notes?: string;
  createdAt: string;
}

export type LeadStatus = 'New Lead' | 'Measurement Scheduled' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost';
export type LeadSource = 'Phone Call' | 'Walk-in' | 'WhatsApp' | 'Facebook' | 'Agent Referral';

export interface LeadConversation {
  id: string;
  date: string;
  note: string;
  talkedBy?: string;
}

export interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  companyName?: string;
  source: LeadSource;
  status: LeadStatus;
  requirementNotes: string;
  estimatedValue?: number;
  assignedTo?: string;
  followUpDate?: string;
  conversations?: LeadConversation[];
  createdAt: string;
  updatedAt: string;
  quotationId?: string;
}


