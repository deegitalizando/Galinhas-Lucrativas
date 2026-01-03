
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

export type TransactionType = 'venda' | 'compra' | 'servico';

export interface CatalogItem {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  type: TransactionType;
  notes?: string;
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

export interface VaccineScheduleItem {
  week: number;
  date: string;
  vaccine: string;
  method: string;
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
  vaccinationSchedule: VaccineScheduleItem[];
  biosecurityProtocols: string[];
  healthAlerts: string[];
}

export interface BiosecurityResult {
  cumulativeMortalityRate: number;
  isRedAlert: boolean;
  liveBirdsRemaining: number;
  probableCauses: string[];
  analysis: string;
  emergencyProcedures: string[];
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

export enum AppMode {
  DASHBOARD = "DASHBOARD",
  FLOCK_GESTION = "FLOCK_GESTION",
  NUTRITION = "NUTRITION",
  HEALTH_HANDLING = "HEALTH_HANDLING",
  FINANCE = "FINANCE"
}

export enum AnimalPhase {
  GALINHAS_INICIAL = "Galinhas (Pintinhos/Inicial)",
  GALINHAS_RECRIA = "Galinhas (Recria/Crescimento)",
  GALINHAS_POSTURA = "Galinhas (Postura/Produção)",
  CODORNAS_INICIAL = "Codornas (Inicial)",
  CODORNAS_POSTURA = "Codornas (Postura/Produção)"
}

export type NutritionMode = 'formular_ia' | 'minha_formula' | 'racao_pronta';

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
