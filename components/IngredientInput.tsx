
import React from 'react';
import { Ingredient } from '../types';

interface IngredientInputProps {
  ingredient: Ingredient;
  onChange: (id: string, field: keyof Ingredient, value: string | number) => void;
  onRemove: (id: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ ingredient, onChange, onRemove }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ingrediente</label>
        <input
          type="text"
          value={ingredient.name}
          onChange={(e) => onChange(ingredient.id, 'name', e.target.value)}
          placeholder="Ex: Farelo de Soja"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div className="w-full sm:w-32">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço/kg (R$)</label>
        <input
          type="number"
          step="0.01"
          value={ingredient.pricePerKg}
          onChange={(e) => onChange(ingredient.id, 'pricePerKg', parseFloat(e.target.value))}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <button
        onClick={() => onRemove(ingredient.id)}
        className="self-end sm:self-center p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
        title="Remover ingrediente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default IngredientInput;
