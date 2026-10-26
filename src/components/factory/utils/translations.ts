import { ProductionStage, WoodType, ProductCategory, FinishType, QCStatus, PriorityLevel, UserRole } from '../types';

export const stageMeta: Record<ProductionStage, {
  en: string;
  bn: string;
  shortBn: string;
  icon: string;
  color: string;
  badgeBg: string;
  step: number;
  descriptionBn: string;
}> = {
  SEASONING: {
    en: 'Seasoning & Treatment',
    bn: 'কাঠ সিজনিং ও ট্রিটমেন্ট',
    shortBn: 'সিজনিং',
    icon: 'Flame',
    color: '#06B6D4', // cyan
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    step: 1,
    descriptionBn: 'কাঠের আর্দ্রতা (Moisture) কমানো ও কেমিক্যাল ট্রিটমেন্ট সম্পন্ন'
  },
  SIZING: {
    en: 'Planing & Sizing',
    bn: 'সাইজিং ও প্ল্যানিং',
    shortBn: 'সাইজিং',
    icon: 'Ruler',
    color: '#38BDF8', // sky
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    step: 2,
    descriptionBn: 'নির্ভুল পরিমাপে কাঠ কাটাই ও রন্ধা (Planing) ফিনিশ'
  },
  JOINERY: {
    en: 'Frame Joinery & Assembly',
    bn: 'কাঠামো ও অ্যাসেম্বলিং',
    shortBn: 'জোড়া/ফ্রেম',
    icon: 'Hammer',
    color: '#6366F1', // indigo
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    step: 3,
    descriptionBn: 'দরজার তক্তা জোড়া লাগানো বা চৌকাঠের ফ্রেম খাঁজ ও জয়েন্ট ফিটিং'
  },
  CNC_CARVING: {
    en: 'CNC & Carving Design',
    bn: 'সিএনসি / খোদাই নকশা',
    shortBn: 'নকশা/CNC',
    icon: 'Cpu',
    color: '#A855F7', // purple
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    step: 4,
    descriptionBn: 'কম্পিউটারাইজড সিএনসি রাউটার বা দক্ষ কারিগর দ্বারা নকশা খোদাই'
  },
  SANDING: {
    en: 'Sanding & Surface Prep',
    bn: 'স্যান্ডিং ও পুটিং ফিনিশ',
    shortBn: 'স্যান্ডিং',
    icon: 'Sparkles',
    color: '#EC4899', // pink
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    step: 5,
    descriptionBn: 'সিরিষ কাগজ ও ওয়াটারপ্রুফ পুটিং দিয়ে পৃষ্ঠতল মসৃণকরণ'
  },
  POLISHING: {
    en: 'Polishing & Lacquer Finish',
    bn: 'পলিশ ও ল্যাকার কোটিং',
    shortBn: 'পলিশ/রং',
    icon: 'Paintbrush',
    color: '#F59E0B', // amber
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    step: 6,
    descriptionBn: 'ডুকো/ল্যাকার স্প্রে গান কোটিং বা হ্যান্ড উড পলিশ'
  },
  QC_PACKING: {
    en: 'QC & Protective Packing',
    bn: 'কোয়ালিটি চেক ও প্যাকিং',
    shortBn: 'কিউসি ও প্যাকিং',
    icon: 'ShieldCheck',
    color: '#10B981', // emerald
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    step: 7,
    descriptionBn: 'ফাইনাল মান যাচাই এবং ফোম ও বাবল র‍্যাপ দিয়ে নিরাপদ প্যাকিং'
  },
  READY_DISPATCH: {
    en: 'Ready for Dispatch / Loading',
    bn: 'ডেলিভারির জন্য প্রস্তুত / লোডিং',
    shortBn: 'ডেলিভারি রেডি',
    icon: 'Truck',
    color: '#059669', // green
    badgeBg: 'bg-green-500/10 text-green-300 border-green-500/30',
    step: 8,
    descriptionBn: 'ট্রাক লোডিং এবং ডেলিভারি গেটপাস চালানের জন্য প্রস্তুত'
  },
  DELIVERED: {
    en: 'Delivered to Site',
    bn: 'কাস্টমারকে ডেলিভারি সম্পন্ন',
    shortBn: 'ডেলিভার্ড',
    icon: 'CheckCircle2',
    color: '#64748B', // slate
    badgeBg: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
    step: 9,
    descriptionBn: 'সাইটে সফলভাবে পৌঁছে দেওয়া ও রিসিভ কনফার্ম করা হয়েছে'
  }
};

export const woodTypeLabels: Record<WoodType, { en: string; bn: string; code: string; color: string }> = {
  CTG_TEAK: { en: 'Chittagong Teak (Segun)', bn: 'চিটাগাং সেগুন কাঠ', code: 'CTG-T', color: '#D97706' },
  BURMA_TEAK: { en: 'Burma Teak', bn: 'বার্মা টিক কাঠ', code: 'BRM-T', color: '#B45309' },
  GAMARI: { en: 'Gamari Wood', bn: 'গামারি কাঠ', code: 'GMR', color: '#FBBF24' },
  MAHOGANY: { en: 'Solid Mahogany', bn: 'মেহগনি কাঠ (সিজনড)', code: 'MHG', color: '#991B1B' },
  GORJON: { en: 'Gorjon Hardwood', bn: 'গর্জন কাঠ', code: 'GRJ', color: '#78350F' },
  RED_OAK: { en: 'American Red Oak', bn: 'আমেরিকান রেড ওক', code: 'OAK', color: '#C2410C' },
  FLUSH_BOARD: { en: 'Waterproof Flush Door', bn: 'ওয়াটারপ্রুফ ফ্লাশ ডোর', code: 'FLS', color: '#3B82F6' },
  MALAYSIAN_PROCESSED: { en: 'Malaysian Processed Wood', bn: 'মালয়েশিয়ান প্রসেসড কাঠ', code: 'MLY', color: '#0D9488' }
};

export const productCategoryLabels: Record<ProductCategory, { en: string; bn: string }> = {
  DOOR_SOLID: { en: 'Solid Wood Door (একপাল্লা)', bn: 'সলিড কাঠের পাল্লা' },
  DOOR_DOUBLE: { en: 'Double Main Door (দোপাল্লা)', bn: 'ডাবল মেইন ডোর' },
  DOOR_FLUSH: { en: 'Flush / Veneered Door', bn: 'ফ্লাশ / ভিনিয়ার্ড পাল্লা' },
  FRAME_CHOUKHAT: { en: 'Door Frame (কাঠের চৌকাঠ)', bn: 'কাঠের মজবুত চৌকাঠ' },
  CABINET_FURNITURE: { en: 'Cabinet / Custom Furniture', bn: 'ক্যাবিনেট ও ফার্নিচার' },
  SLIDING_PARTITION: { en: 'Sliding Partition Door', bn: 'স্লাইডিং পার্টিশন ডোর' }
};

export const finishTypeLabels: Record<FinishType, { en: string; bn: string }> = {
  LACQUER_GLOSS: { en: 'High Gloss Lacquer', bn: 'হাই-গ্লস ল্যাকার পলিশ' },
  LACQUER_MATT: { en: 'Matt Finish Lacquer', bn: 'ম্যাট ল্যাকার পলিশ' },
  PU_COATING: { en: 'Polyurethane (PU) Coat', bn: 'পিইউ ওয়াটারপ্রুফ কোটিং' },
  DUCO_PAINT: { en: 'Duco Paint (Automotive)', bn: 'ডুকো পেইন্ট' },
  HAND_POLISH: { en: 'Traditional Hand Polish', bn: 'ঐতিহ্যবাহী হ্যান্ড পালিশ' },
  RAW_UNPOLISHED: { en: 'Raw Seasoned (No Polish)', bn: 'আনপলিশড / কাঁচা কাঠ' }
};

export const priorityLabels: Record<PriorityLevel, { en: string; bn: string; badge: string }> = {
  NORMAL: { en: 'Standard', bn: 'সাধারণ', badge: 'bg-slate-700/50 text-slate-300 border-slate-600/50' },
  URGENT: { en: 'Urgent', bn: 'জরুরি', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
  CRITICAL: { en: 'Top Priority (VIP)', bn: 'টপ প্রায়োরিটি (ভিআইপি)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse' }
};

export const roleLabels: Record<UserRole, { en: string; bn: string; color: string }> = {
  PRODUCTION_MANAGER: { en: 'Production Manager', bn: 'প্রোডাকশন ম্যানেজার', color: 'text-cyan-400' },
  FACTORY_SUPERVISOR: { en: 'Floor Supervisor', bn: 'ফ্লোর সুপারভাইজার', color: 'text-amber-400' },
  LOGISTICS_MANAGER: { en: 'Dispatch & Delivery Incharge', bn: 'ডেলিভারি ও চালান ইনচার্জ', color: 'text-emerald-400' },
  EXECUTIVE_ADMIN: { en: 'Managing Director (Admin)', bn: 'ম্যানেজিং ডিরেক্টর / মালিক', color: 'text-purple-400' }
};
