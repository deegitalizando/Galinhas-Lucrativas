
import React from 'react';
import { FlockResult } from '../types';

interface FlockReportProps {
  report: FlockResult;
}

const FlockReport: React.FC<FlockReportProps> = ({ report }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-violet-600 text-white rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-medium opacity-90 mb-1">Previsão de Postura</h3>
        <p className="text-3xl font-bold">{report.estimatedLayingDate}</p>
        <p className="text-sm mt-2 opacity-80">{report.summary}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Cronograma Sanitário Dinâmico
          </h4>
        </div>
        <div className="divide-y divide-slate-50">
          {report.vaccinationSchedule.map((item, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center font-bold text-xs">
                  {item.date.split('-').reverse().slice(0, 2).join('/')}
                </div>
                <div>
                  <p className="font-bold text-slate-700">{item.vaccine}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Semana {item.week} • {item.method}</p>
                </div>
              </div>
              <div className="text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
        <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
          Protocolos de Biosseguridade
        </h4>
        <ul className="space-y-2">
          {report.biosecurityProtocols.map((protocol, idx) => (
            <li key={idx} className="flex items-start gap-2 text-emerald-900 text-xs font-medium">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              {protocol}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
        <h4 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Alertas de Saúde
        </h4>
        <ul className="space-y-3">
          {report.healthAlerts.map((alert, idx) => (
            <li key={idx} className="flex items-start gap-2 text-rose-900 text-sm">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              {alert}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FlockReport;
