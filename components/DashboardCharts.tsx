
import React from 'react';
import { DailyNote } from '../types';

interface DashboardChartsProps {
  type: 'bar' | 'pie';
  revenue: number;
  costs: number;
}

export const ConsumptionEfficiencyCard: React.FC<{ feedKg: number, totalEggs: number, costPerEgg: number }> = ({ feedKg, totalEggs, costPerEgg }) => {
  const feedPerDozen = totalEggs > 0 ? (feedKg / (totalEggs / 12)).toFixed(2) : "0.00";
  
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-700 h-full flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🌾</div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest break-words leading-tight">Consumo vs Produtividade</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Ração/Dúzia</p>
            <p className="text-xl font-black text-slate-900">{feedPerDozen}<span className="text-[10px] text-slate-400 ml-1">kg</span></p>
          </div>
          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Custo/Ovo</p>
            <p className="text-xl font-black text-indigo-600">R$ {costPerEgg.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="relative pt-4">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-[8px] font-black inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
              Eficiência Biológica
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black inline-block text-emerald-600">
              {totalEggs > 0 ? 'Otimizado' : 'Aguardando Dados'}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-100">
          <div style={{ width: totalEggs > 0 ? "85%" : "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000"></div>
        </div>
      </div>
    </div>
  );
};

export const MonthlyFinanceCard: React.FC<{ revenue: number, costs: number }> = ({ revenue, costs }) => {
  const profit = revenue - costs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Fluxo Financeiro Mensal</h4>
            <p className="text-3xl font-black tracking-tighter">Acumulado {new Date().toLocaleString('pt-BR', { month: 'long' })}</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Margem</p>
            <p className="text-lg font-black">{margin.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase">Receitas Totais</p>
            <p className="text-4xl font-black text-emerald-400 tracking-tighter">R$ {revenue.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase">Custos Totais</p>
            <p className="text-4xl font-black text-rose-400 tracking-tighter">R$ {costs.toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Resultado Líquido</p>
              <p className={`text-5xl font-black tracking-tighter ${profit >= 0 ? 'text-white' : 'text-rose-500'}`}>
                R$ {profit.toLocaleString()}
              </p>
            </div>
            <div className="pb-2 text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase">Status do Mês</p>
              <p className={`text-xs font-black uppercase ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profit >= 0 ? '● Lucrativo' : '● Atenção'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ revenue, costs }) => {
  const total = revenue + costs;
  const revPercentage = total > 0 ? (revenue / total) * 100 : 0;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (revPercentage / 100) * circumference;

  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-10 animate-in fade-in zoom-in-95 duration-700 w-full overflow-hidden">
      <div className="relative w-48 h-48 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="24" />
          <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#f43f5e" strokeWidth="24" strokeDasharray={circumference} strokeDashoffset={0} strokeLinecap="round" />
          <circle
            cx="100" cy="100" r={radius} fill="transparent" stroke="#10b981" strokeWidth="24"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-4xl font-black text-slate-900 tracking-tighter">
            {revPercentage.toFixed(0)}%
          </p>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Eficiência</p>
        </div>
      </div>
      
      <div className="space-y-6 flex-1 w-full min-w-0">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center md:text-left">Composição de Fluxo do Dia</h4>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">💸</div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">Receitas</p>
                <p className="text-[10px] text-slate-400 font-bold">{revPercentage.toFixed(1)}% do total</p>
              </div>
            </div>
            <p className="font-black text-emerald-600 whitespace-nowrap ml-2">R$ {revenue.toFixed(2)}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">🛒</div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">Custos</p>
                <p className="text-[10px] text-slate-400 font-bold">{(100-revPercentage).toFixed(1)}% do total</p>
              </div>
            </div>
            <p className="font-black text-rose-600 whitespace-nowrap ml-2">R$ {costs.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
