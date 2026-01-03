
import React from 'react';
import { InventoryResult } from '../types';

interface InventoryReportProps {
  report: InventoryResult;
}

const InventoryReport: React.FC<InventoryReportProps> = ({ report }) => {
  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mobile-First population overview */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl flex items-center justify-between border-4 border-slate-800">
        <div>
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Censo Ativo da Granja</h3>
          <p className="text-5xl font-black">{report.totalBirds.toLocaleString()} <span className="text-sm font-bold opacity-40 uppercase ml-2 tracking-tighter">unid</span></p>
        </div>
        <div className="hidden sm:block opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {report.categories.map((cat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col group hover:border-indigo-200 transition-all">
            <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">{cat.category}</h4>
              <span className="bg-white border border-slate-200 text-slate-700 text-[10px] px-3 py-1 rounded-full font-black">
                {cat.totalCount} AVES
              </span>
            </div>
            
            {/* Desktop View: List / Mobile View: Cards */}
            <div className="p-6 space-y-4 flex-1">
              {cat.flocks.length === 0 ? (
                <p className="text-slate-400 text-xs italic text-center py-4">Nenhum lote nesta fase.</p>
              ) : (
                cat.flocks.map((flock, fIdx) => (
                  <div key={fIdx} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4 hover:bg-white transition-all shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-slate-900 text-lg">{flock.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{flock.quantity} aves • {flock.age} semanas</p>
                      </div>
                      {flock.stats?.replacementUrgency && (
                        <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg border tracking-tighter ${getUrgencyColor(flock.stats.replacementUrgency)}`}>
                          Urge: {flock.stats.replacementUrgency}
                        </span>
                      )}
                    </div>
                    
                    {flock.stats && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/50">
                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-100">
                          <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Ciclo Postura</span>
                          <span className="text-sm font-black text-indigo-600">{flock.stats.layingWeeks} sem</span>
                        </div>
                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-100">
                          <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Útil Restante</span>
                          <span className="text-sm font-black text-emerald-600">{flock.stats.remainingProductiveWeeks} sem</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-widest opacity-60 mb-1">Análise Estratégica IA</h4>
            <p className="text-xl font-bold leading-relaxed">{report.managerAnalysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;
