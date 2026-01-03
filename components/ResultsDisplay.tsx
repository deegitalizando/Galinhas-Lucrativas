
import React from 'react';
import { FormulationResult } from '../types';

interface ResultsDisplayProps {
  result: FormulationResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-medium opacity-90">Custo Total (100kg)</h3>
            <p className="text-4xl font-bold">R$ {result.totalCost.toFixed(2)}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="block text-xs uppercase opacity-80">Proteína Bruta</span>
              <span className="text-xl font-semibold">{result.proteinLevel}%</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="block text-xs uppercase opacity-80">Energia</span>
              <span className="text-xl font-semibold">{result.energyLevel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h4 className="font-semibold text-slate-800">Composição da Mistura</h4>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-6 py-4">Ingrediente</th>
              <th className="px-6 py-4">Quantidade (kg)</th>
              <th className="px-6 py-4">Custo Parcial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {result.composition.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{item.ingredient}</td>
                <td className="px-6 py-4">{item.weightKg.toFixed(2)} kg</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">R$ {item.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 text-amber-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h4 className="font-bold">Sugestões do Especialista IA</h4>
        </div>
        <ul className="space-y-2">
          {result.suggestions.map((suggestion, idx) => (
            <li key={idx} className="flex items-start gap-2 text-amber-900 text-sm">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;
