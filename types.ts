
export interface Ingredient {
  id: string;
  name: string;
  pricePerKg: number;
}

export interface FormulationResult {
  composition: {
    ingredient: string;
    weightKg: number;
    cost: number;
  }[];
  totalCost: number;
  proteinLevel: number;
  energyLevel: string;
  suggestions: string[];
}

export interface VetDiagnosis {
  diagnosis: string;
  signsObserved: string[];
  firstAidSteps: string[];
  importantNotice: string;
}

export interface FinanceResult {
  productivityPercentage: number;
  costPerEgg: number;
  netProfit: number;
  revenue: number;
  analysis: string;
  improvementTips: {
    reason: string;
    solution: string;
  }[];
}

export type TransactionType = 'receita' | 'despesa';

export interface Transaction {
  id: string;
  user_email: string;
  type: TransactionType;
  item_name: string;
  qty: number;
  price_per_unit: number;
  total: number;
  date: string;
  created_at?: string;
}

export interface DailyNote {
  id: string;
  date: string;
  flockId: string;
  flockName: string;
  eggsCollected: number;
  mortality: number;
  feedConsumedKg: number;
  layingRate: number;
  feedConversion: number;
  notes: string;
}

export interface FlockResult {
  summary: string;
  estimatedLayingDate: string;
  feedConsumptionInfo: {
    dailyPerBirdGrams: number;
    monthlyTotalKg: number;
    currentFeedType: string;
  };
  nextFeedChange: {
    week: number;
    targetFeedType: string;
    description: string;
  };
  vaccinationSchedule: any[];
  biosecurityProtocols: string[];
  healthAlerts: string[];
}

export interface FlockEntry {
  id: string;
  name: string;
  quantity: number;
  ageInWeeks: number;
  arrivalDate: string;
  lineage: string;
  status: 'normal' | 'alert';
  nutritionPlan?: FlockResult;
}

export interface BiosecurityResult {
  cumulativeMortalityRate: number;
  isRedAlert: boolean;
  liveBirdsRemaining: number;
  probableCauses: string[];
  analysis: string;
  emergencyProcedures: string[];
}

export interface InventoryResult {
  totalBirds: number;
  categories: {
    category: string;
    totalCount: number;
    flocks: {
      name: string;
      quantity: number;
      age: number;
      stats?: {
        layingWeeks: number;
        remainingProductiveWeeks: number;
        replacementUrgency: string;
      };
    }[];
  }[];
  managerAnalysis: string;
}

export interface HandlingResult {
  batchName: string;
  checklist: {
    task: string;
    category: 'bedding' | 'waterers' | 'lighting' | 'disinfection';
    description: string;
  }[];
  antiStressProtocol: string[];
  shedSpecs: {
    beddingType: string;
    lightingHours: string;
  };
  expertNote: string;
}

export enum AppMode {
  DASHBOARD = "DASHBOARD",
  FLOCK_GESTION = "FLOCK_GESTION",
  NUTRITION = "NUTRITION",
  FINANCE = "FINANCE",
  SETTINGS = "SETTINGS"
}

export enum AnimalPhase {
  GALINHAS_INICIAL = "Galinhas (Pintinhos/Inicial)",
  GALINHAS_RECRIA = "Galinhas (Recria/Crescimento)",
  GALINHAS_POSTURA = "Galinhas (Postura/Produção)",
  CODORNAS_INICIAL = "Codornas (Inicial)",
  CODORNAS_POSTURA = "Codornas (Postura/Produção)"
}

export type NutritionMode = 'formular_ia' | 'racao_propria' | 'racao_comercial';

export interface SubscriptionStatus {
  isActive: boolean;
  email?: string;
  expiryDate?: string;
  tier: 'free' | 'premium' | 'admin';
}

export interface UserSettings {
  farmName: string;
  farmAddress: string;
  ownerName: string;
  document: string;
  phone: string;
  profileImage?: string;
}
