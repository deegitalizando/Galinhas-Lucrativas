
import React, { useState } from 'react';

interface AdDisplayProps {
  adText: string;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ adText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(adText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-amber-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium opacity-90 mb-1">Seu Anúncio está Pronto!</h3>
        <p className="text-xl font-medium leading-relaxed">Pronto para bombar no WhatsApp</p>
      </div>

      <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 shadow-sm relative group">
        <div className="whitespace-pre-wrap text-slate-700 font-medium text-lg leading-relaxed mb-12">
          {adText}
        </div>
        
        <button
          onClick={handleCopy}
          className={`absolute bottom-6 right-6 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            copied ? 'bg-emerald-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copiar Texto
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 items-center">
        <div className="bg-amber-100 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-bold">Dica:</span> Poste no seu status por volta das 08h ou 18h, quando as pessoas estão mais conectadas!
        </p>
      </div>
    </div>
  );
};

export default AdDisplay;
