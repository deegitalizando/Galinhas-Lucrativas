
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/utils';

interface SubscriptionGateProps {
  onUnlock: (email: string, tier: 'free' | 'premium' | 'admin') => void;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ onUnlock }) => {
  const [view, setView] = useState<'sales' | 'login'>('sales');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollToPlanos = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('planos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    
    try {
      const cleanEmail = email.toLowerCase().trim();
      let tier: 'free' | 'premium' | 'admin' = 'free';

      if (cleanEmail === 'diegocarreiroonline@gmail.com') { 
        tier = 'admin';
      } else {
        // Busca o perfil
        const { data: profile, error: dbError } = await supabase
          .from('profiles')
          .select('tier, email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (dbError) {
          const msg = getErrorMessage(dbError);
          // Erro comum: Tabela 'profiles' não existe no Supabase do usuário
          if (msg.includes("relation") && msg.includes("profiles")) {
            setError('ERRO DE BANCO: Você precisa criar a tabela "profiles" no seu painel do Supabase.');
          } else {
            setError(`Erro no Banco: ${msg}`);
          }
          setLoading(false);
          return;
        }

        if (profile) {
          tier = profile.tier as any;
        }
      }

      // Garante que o registro existe (Login automático)
      const { error: upsertError } = await supabase.from('profiles').upsert({ 
        email: cleanEmail, 
        tier: tier,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

      if (upsertError) {
        setError(`Erro ao salvar acesso: ${getErrorMessage(upsertError)}`);
        setLoading(false);
        return;
      }

      onUnlock(cleanEmail, tier);
      
    } catch (err: any) {
      setError(`Falha crítica: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'login') {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
          <button onClick={() => setView('sales')} className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">← Voltar</button>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">Acesso do Criador</h2>
          <p className="text-slate-400 text-xs mb-8">E-mail para entrar ou se cadastrar.</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input 
              type="email" 
              required 
              placeholder="seu@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-6 bg-slate-800 border border-white/5 rounded-3xl text-white font-black outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600" 
            />
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <p className="text-rose-500 text-[10px] font-black uppercase text-center leading-relaxed">
                  {error}
                </p>
                {error.includes("tabela") && (
                  <p className="text-white text-[8px] font-bold mt-2 text-center uppercase opacity-50">Dica: Rode o SQL no painel do Supabase</p>
                )}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Conectando...' : 'Liberar Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 overflow-x-hidden font-sans">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg shadow-lg">🏠</div>
          <span className="font-black uppercase tracking-tighter text-slate-900">Meu Criadouro</span>
        </div>
        <button onClick={() => setView('login')} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Entrar no App</button>
      </nav>

      <header className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-[400px] bg-indigo-400/10 blur-[100px] rounded-full -z-10"></div>
        <div className="inline-block px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          A Evolução da sua Criação
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] uppercase text-slate-900 mb-8 italic">
          Gere Renda todo mês com <br className="hidden md:block"/>
          <span className="text-indigo-600">Galinhas e Codornas</span>
        </h1>
        <p className="max-w-3xl mx-auto text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-12">
          O Meu Criadouro é o aplicativo para organizar sua criação, controlar gastos e transformar anotações soltas em lucro real.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={scrollToPlanos} className="px-12 py-6 bg-indigo-600 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-200 hover:scale-105 transition-all">Assinar Agora</button>
          <button onClick={() => setView('login')} className="text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">Já sou cliente? Acessar</button>
        </div>
      </header>

      <section id="planos" className="py-32 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="p-12 bg-white border-2 border-slate-100 rounded-[4rem]">
            <h3 className="text-xl font-black uppercase text-slate-400 mb-8">Mensal</h3>
            <p className="text-4xl font-black mb-8 tracking-tighter">R$ 19,90</p>
            <a href="https://pay.hotmart.com/L103645535K?off=xp3kiiuv" className="block w-full py-6 bg-slate-900 text-white rounded-full text-center font-black uppercase text-xs tracking-widest">Assinar</a>
          </div>
          <div className="p-12 bg-indigo-600 text-white rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-8 bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase">Mais Popular</div>
            <h3 className="text-xl font-black uppercase opacity-60 mb-8">Anual</h3>
            <p className="text-4xl font-black mb-8 tracking-tighter">R$ 199,90</p>
            <a href="https://pay.hotmart.com/L103645535K?off=xp3kiiuv" className="block w-full py-6 bg-white text-indigo-600 rounded-full text-center font-black uppercase text-xs tracking-widest shadow-xl">Assinar</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionGate;
