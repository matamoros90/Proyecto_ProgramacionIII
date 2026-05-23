// ─── Componentes de Hardware ─────────────────────────────────────────────────

export type ComponentType =
  | 'cpu' | 'gpu' | 'ram' | 'motherboard'
  | 'psu' | 'storage' | 'case' | 'cooling' | 'peripheral';

export interface Component {
  id: string;
  type: ComponentType;
  name: string;
  brand: string;
  model: string;
  price: number;
  image?: string;
  inStock: boolean;
  stock: number;
  performanceScore: number;
  tdp?: number;
  // CPU-specific
  socket?: string;
  cores?: number;
  threads?: number;
  baseClockGHz?: number;
  boostClockGHz?: number;
  // GPU-specific
  vramGB?: number;
  // RAM-specific
  ramType?: string;
  capacity?: number;
  speedMHz?: number;
  // Motherboard-specific
  formFactor?: string;
  maxRam?: number;
  // PSU-specific
  wattage?: number;
  efficiency?: string;
  // Storage-specific
  storageType?: string;
  capacityGB?: number;
  readMBps?: number;
  // Case-specific
  caseType?: string;
  // Cooling-specific
  maxTdp?: number;
  coolingType?: string;
}

// ─── Build de PC ──────────────────────────────────────────────────────────────

export type PcCategory =
  | 'gaming' | 'programming' | 'graphic_design'
  | 'video_editing' | 'office' | 'streaming' | 'student';

export interface Build {
  cpu?: Component;
  gpu?: Component;
  ram?: Component;
  motherboard?: Component;
  psu?: Component;
  storage?: Component;
  case?: Component;
  cooling?: Component;
  peripheral?: Component;
}

export interface SavedBuild {
  id: string;
  userId: string;
  name: string;
  category: PcCategory;
  build: Build;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Validación y Compatibilidad ──────────────────────────────────────────────

export interface CompatibilityIssue {
  type: 'error' | 'warning';
  component: string;
  message: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  summary: {
    totalWatts: number;
    recommendedPsu: number;
    totalPrice: number;
    componentCount: number;
  };
}

// ─── Recomendación ────────────────────────────────────────────────────────────

export interface RecommendationResult {
  category: PcCategory;
  budget: number;
  build: Build;
  alternatives: Record<ComponentType, Component[]>;
  validation: CompatibilityResult;
  repairLog: string[];
  summary: {
    totalPrice: number;
    remaining: number;
    performanceScore: number;
    componentCount: number;
  };
}

// ─── Cotizaciones ─────────────────────────────────────────────────────────────

export type QuoteStatus =
  | 'draft' | 'confirmed' | 'in_review' | 'ready'
  | 'accepted' | 'payment_submitted' | 'payment_verified' | 'rejected';

export interface Quote {
  id: string;
  userId: string;
  vendorId?: string;
  build: Build;
  totalPrice: number;
  category: PcCategory;
  notes: string;
  status: QuoteStatus;
  deliveryAddress?: string;
  deliveryDepartment?: string;
  paymentMethod?: 'card' | 'bank_transfer';
  paymentData?: { last4?: string; bankRef?: string };
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string;
  acceptedAt?: string;
  paymentSubmittedAt?: string;
  paymentVerifiedAt?: string;
}

// ─── Órdenes de Ensamblaje ────────────────────────────────────────────────────

export type OrderState =
  | 'pending' | 'components_ready' | 'assembling'
  | 'software_install' | 'testing' | 'ready'
  | 'delivered' | 'cancelled';

export interface StateHistoryEntry {
  state: OrderState;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  userId: string;
  quoteId: string;
  build: Build;
  totalPrice: number;
  category: PcCategory;
  state: OrderState;
  stateHistory: StateHistoryEntry[];
  notes: string;
  technicianId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Usuario ──────────────────────────────────────────────────────────────────

export interface SavedCard {
  brand: 'visa' | 'mastercard' | 'other';
  last4: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'client' | 'admin' | 'vendor' | 'technician';
  fcmTokens: string[];
  address?: string;
  savedCard?: SavedCard;
  createdAt: string;
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  category: ComponentType | 'general';
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  order: number;
  published: boolean;
  createdAt: string;
}

// ─── Navegación ───────────────────────────────────────────────────────────────

export type RootStackParams = {
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(tabs)': undefined;
  'builder/budget': undefined;
  'builder/custom': undefined;
  'builder/[category]': { category: PcCategory };
  'order/[id]': { id: string };
  'admin/dashboard': undefined;
};
