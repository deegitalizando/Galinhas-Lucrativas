
import React from 'react';
import { BiosecurityResult } from '../types';

interface BiosecurityReportProps {
  report: BiosecurityResult;
}

const BiosecurityReport: React.FC<BiosecurityReportProps> = ({ report }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {report.isRedAlert && (
        <div className="bg-rose-600 text-white rounded-2xl p-6 shadow-xl border-4 border-rose-400 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Alerta Vermelho: Emergência Sanitária</h3>
          </div>
          <p className="font-medium opacity-90">A perda diária excedeu o limite de segurança de 2%. Ação imediata necessária.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Mortalidade Acumulada</span>
          <p className={`text-4xl font-bold ${report.isRedAlert ? 'text-rose-600' : 'text-slate-800'}`}>
            {report.cumulativeMortalityRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Aves Vivas Restantes</span>
          <p className="text-4xl font-bold text-emerald-600">{report.liveBirdsRemaining}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-3">Análise do Especialista</h4>
        <p className="text-slate-600 leading-relaxed italic">{report.analysis}</p>
      </div>

      {report.isRedAlert && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
            <h4 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Causas Prováveis
            </h4>
            <ul className="space-y-2">
              {report.probableCauses.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2 text-rose-900 text-sm font-medium">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zM10 5a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Medidas de Emergência
            </h4>
            <ul className="space-y-2">
              {report.emergencyProcedures.map((proc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-emerald-900 text-sm font-medium">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {proc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiosecurityReport;
