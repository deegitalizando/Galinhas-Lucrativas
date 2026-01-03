
import { Ingredient, AnimalPhase } from './types';

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Milho Grão', pricePerKg: 1.20 },
  { id: '2', name: 'Farelo de Soja', pricePerKg: 2.80 },
  { id: '3', name: 'Núcleo Mineral/Vit.', pricePerKg: 4.50 },
  { id: '4', name: 'Calcário Calcítico', pricePerKg: 0.60 },
  { id: '5', name: 'Sal Comum', pricePerKg: 0.90 }
];

export const ANIMAL_PHASES = Object.values(AnimalPhase);
