
import React from 'react';
import { VetDiagnosis } from '../types';

interface VetReportProps {
  report: VetDiagnosis;
}

const VetReport: React.FC<VetReportProps> = ({ report }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-rose-600 text-white rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-medium opacity-90 mb-1">Diagnóstico Provável</h3>
        <p className="text-3xl font-bold">{report.diagnosis}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Sinais Observados
          </h4>
          <ul className="space-y-2">
            {report.signsObserved.map((sign, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-300 flex-shrink-0" />
                {sign}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Primeiros 30 Minutos
          </h4>
          <ul className="space-y-3">
            {report.firstAidSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-emerald-900 text-sm leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-800 text-slate-300 rounded-2xl p-6 text-sm italic">
        <p className="flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {report.importantNotice}
        </p>
      </div>
    </div>
  );
};

export default VetReport;
