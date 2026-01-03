
import React from 'react';
import { HandlingResult } from '../types';

interface HandlingReportProps {
  report: HandlingResult;
}

const HandlingReport: React.FC<HandlingReportProps> = ({ report }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bedding': return '🛏️';
      case 'waterers': return '💧';
      case 'lighting': return '💡';
      case 'disinfection': return '🧼';
      default: return '📋';
    }
  };

  const categories = ['disinfection', 'bedding', 'waterers', 'lighting'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-emerald-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-1">Guia de Transferência</h3>
          <p className="text-4xl font-black">Lote: {report.batchName}</p>
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <span className="block text-[10px] uppercase opacity-70">Tipo de Cama</span>
              <span className="text-lg font-bold">{report.shedSpecs.beddingType}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <span className="block text-[10px] uppercase opacity-70">Iluminação</span>
              <span className="text-lg font-bold">{report.shedSpecs.lightingHours}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
          <h4 className="text-xl font-black text-slate-800">Checklist Pré-Alojamento</h4>
        </div>
        <div className="p-8 space-y-8">
          {categories.map(cat => {
            const items = report.checklist.filter(i => i.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(cat)}</span>
                  <h5 className="font-black text-slate-400 uppercase text-xs tracking-widest">
                    {cat === 'bedding' ? 'Cama' : cat === 'waterers' ? 'Hidratação' : cat === 'lighting' ? 'Ambiência' : 'Vazio Sanitário'}
                  </h5>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors group">
                      <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex-shrink-0 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                        <svg className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{item.task}</p>
                        <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8">
        <h4 className="text-xl font-black text-amber-900 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          Manejo Antiestresse (Dia da Mudança)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.antiStressProtocol.map((step, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-amber-100 flex items-start gap-3 shadow-sm">
              <span className="font-black text-amber-500">#{(idx + 1).toString().padStart(2, '0')}</span>
              <p className="text-sm text-amber-800 font-medium leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-slate-900 rounded-[2.5rem] text-slate-300">
        <p className="text-sm italic leading-relaxed">
          <span className="font-black text-emerald-400 uppercase text-xs block mb-2 tracking-widest">Dica do Gestor</span>
          {report.expertNote}
        </p>
      </div>
    </div>
  );
};

export default HandlingReport;
