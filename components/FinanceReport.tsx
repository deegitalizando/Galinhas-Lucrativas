
import React from 'react';
import { FinanceResult } from '../types';

interface FinanceReportProps {
  report: FinanceResult;
}

const FinanceReport: React.FC<FinanceReportProps> = ({ report }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 text-white rounded-[2.5rem] p-8 shadow-xl">
          <span className="text-[10px] uppercase opacity-60 font-black tracking-widest mb-1 block">Produtividade</span>
          <p className="text-4xl font-black tracking-tighter">{report.productivityPercentage.toFixed(1)}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1 block">Custo p/ Ovo</span>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">R$ {report.costPerEgg.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1 block">Receita Bruta</span>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">R$ {report.revenue.toFixed(2)}</p>
        </div>
        <div className={`${report.netProfit >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} rounded-[2.5rem] p-8 shadow-sm border`}>
          <span className="text-[10px] uppercase font-black tracking-widest mb-1 block">Saldo Líquido</span>
          <p className="text-4xl font-black tracking-tighter">R$ {report.netProfit.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
        <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-lg uppercase tracking-tighter">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">📊</div>
          Análise de Faturamento & Eficiência
        </h4>
        <p className="text-slate-600 leading-relaxed text-lg italic font-medium">"{report.analysis}"</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter">
            <span className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">💡</span>
            Estratégias para Aumentar Lucros
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.improvementTips.map((tip, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all group">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-black text-emerald-400 opacity-50">#{(idx + 1).toString().padStart(2, '0')}</span>
                  <div>
                    <p className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-2 group-hover:scale-105 transition-transform origin-left">{tip.reason}</p>
                    <p className="text-white/80 leading-relaxed font-medium">{tip.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl">🚀</div>
      </div>
    </div>
  );
};

export default FinanceReport;
