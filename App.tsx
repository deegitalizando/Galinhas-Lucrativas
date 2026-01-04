
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AppMode, 
  FlockEntry, 
  DailyNote, 
  SubscriptionStatus, 
  UserSettings, 
  Ingredient, 
  AnimalPhase, 
  FormulationResult, 
  Transaction, 
  NutritionMode, 
  FlockResult 
} from './types';
import { supabase } from './lib/supabase';
import { getErrorMessage } from './lib/utils';
import { calculateFormulation } from './services/geminiService';
import { registerFlock as generateFlockPlan } from './services/flockService';
import { DEFAULT_INGREDIENTS, ANIMAL_PHASES } from './constants';

// Componentes
import IngredientInput from './components/IngredientInput';
import ResultsDisplay from './components/ResultsDisplay';
import SubscriptionGate from './components/SubscriptionGate';
import FlockReport from './components/FlockReport';
import AdDisplay from './components/AdDisplay';
import { MonthlyFinanceCard, ConsumptionEfficiencyCard } from './components/DashboardCharts';
import { generateEggAd } from './services/adService';

const DEFAULT_CATEGORIES = {
  receita: ['Venda de Ovos', 'Venda de Aves', 'Venda de Esterco', 'Outros'],
  despesa: ['Ração', 'Medicamentos', 'Mão de Obra', 'Energia Elétrica', 'Água', 'Manutenção', 'Transporte', 'Outros']
};

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddFlock, setShowAddFlock] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [financeFilter, setFinanceFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [customCategories, setCustomCategories] = useState<{receita: string[], despesa: string[]}>(() => {
    const saved = localStorage.getItem('gl_custom_cats');
    return saved ? JSON.parse(saved) : { receita: [], despesa: [] };
  });

  const [transType, setTransType] = useState<'receita' | 'despesa'>('receita');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [subStatus, setSubStatus] = useState<SubscriptionStatus>(() => {
    try {
      const saved = localStorage.getItem('gl_sub_status');
      if (!saved) return { isActive: false, tier: 'free' };
      return JSON.parse(saved);
    } catch { return { isActive: false, tier: 'free' }; }
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    farmName: 'Meu Criadouro', 
    farmAddress: '', 
    ownerName: 'Produtor', 
    document: '', 
    phone: '',
    profileImage: ''
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [inventoryFlocks, setInventoryFlocks] = useState<FlockEntry[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [selectedPhase, setSelectedPhase] = useState<AnimalPhase>(AnimalPhase.GALINHAS_POSTURA);
  const [formulationResult, setFormulationResult] = useState<FormulationResult | null>(null);
  const [adResult, setAdResult] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [daysElapsed, setDaysElapsed] = useState(1);
  const [quickInput, setQuickInput] = useState('');

  // Estados para Ração Comercial
  const [nutritionMode, setNutritionMode] = useState<NutritionMode>('formular_ia');
  const [commercialBagPrice, setCommercialBagPrice] = useState<number>(0);
  const [commercialBagWeight, setCommercialBagWeight] = useState<number>(50);

  useEffect(() => {
    if (subStatus.isActive && subStatus.email) loadUserData(subStatus.email);
    else setInitializing(false);
  }, [subStatus.isActive, subStatus.email]);

  useEffect(() => {
    localStorage.setItem('gl_custom_cats', JSON.stringify(customCategories));
  }, [customCategories]);

  const loadUserData = async (email: string) => {
    setInitializing(true);
    setDbError(null);
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
      if (profile) {
        setUserSettings({
          farmName: profile.farm_name || 'Meu Criadouro',
          farmAddress: profile.farm_address || '',
          ownerName: profile.owner_name || 'Produtor',
          document: profile.document || '',
          phone: profile.phone || '',
          profileImage: profile.profile_image || ''
        });
        if (profile.created_at) {
          const joined = new Date(profile.created_at);
          const diff = Math.floor((new Date().getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
          setDaysElapsed((diff % 30) + 1);
        }
      }

      const { data: flocks } = await supabase.from('flocks').select('*').eq('user_email', email);
      setInventoryFlocks((flocks || []).map(f => ({
        id: f.id, name: f.name, quantity: f.quantity, ageInWeeks: f.age_in_weeks,
        arrivalDate: f.arrival_date, lineage: f.lineage, nutritionPlan: f.nutrition_plan, status: 'normal'
      })));

      const { data: trans } = await supabase.from('transactions').select('*').eq('user_email', email).order('date', { ascending: false });
      setTransactions(trans || []);

      const { data: notes } = await supabase.from('daily_notes').select('*').eq('user_email', email).order('date', { ascending: false });
      setDailyNotes((notes || []).map(n => ({
        id: n.id, date: n.date, flockId: n.flock_id, flockName: 'Geral', eggsCollected: n.eggs_collected, mortality: n.mortality, feedConsumedKg: 0, layingRate: 0, feedConversion: 0, notes: n.notes || ''
      })));

    } catch (e) { 
      setDbError(getErrorMessage(e));
    } finally { 
      setInitializing(false); 
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          farm_name: userSettings.farmName,
          farm_address: userSettings.farmAddress,
          owner_name: userSettings.ownerName,
          phone: userSettings.phone,
          profile_image: userSettings.profileImage,
          updated_at: new Date().toISOString()
        })
        .eq('email', subStatus.email);

      if (error) throw error;
      setIsEditingProfile(false);
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      alert("Erro ao salvar: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserSettings(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessQuickInput = () => {
    if (!quickInput.trim()) return;
    const lines = quickInput.split('\n');
    const newIngredients = [...ingredients];
    let updated = false;
    lines.forEach(line => {
      const match = line.match(/([a-zA-Z\s]+)[\s:]+(\d+[.,]\d+)/);
      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2].replace(',', '.'));
        const index = newIngredients.findIndex(i => i.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(i.name.toLowerCase()));
        if (index !== -1) {
          newIngredients[index] = { ...newIngredients[index], pricePerKg: price };
          updated = true;
        } else {
          newIngredients.push({ id: Math.random().toString(36).substr(2, 9), name, pricePerKg: price });
          updated = true;
        }
      }
    });
    if (updated) {
      setIngredients(newIngredients);
      setQuickInput('');
      alert("Preços atualizados!");
    } else {
      alert("Formato: 'Milho 1.50'");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Deseja realmente excluir?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await loadUserData(subStatus.email!);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCategory = () => {
    if (!newCatName.trim()) return;
    setCustomCategories(prev => ({
      ...prev,
      [transType]: [...new Set([...prev[transType], newCatName.trim()])]
    }));
    setNewCatName('');
    setIsAddingNewCat(false);
  };

  const allCategories = useMemo(() => ({
    receita: [...DEFAULT_CATEGORIES.receita, ...customCategories.receita],
    despesa: [...DEFAULT_CATEGORIES.despesa, ...customCategories.despesa]
  }), [customCategories]);

  const financeStats = useMemo(() => {
    const totalReceitas = transactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + Number(t.total), 0);
    const totalDespesas = transactions.filter(t => t.type === 'despesa').reduce((acc, t) => acc + Number(t.total), 0);
    return { receitas: totalReceitas, despesas: totalDespesas, saldo: totalReceitas - totalDespesas };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (financeFilter === 'todos') return transactions;
    return transactions.filter(t => t.type === financeFilter);
  }, [transactions, financeFilter]);

  const handleLogout = () => {
    localStorage.removeItem('gl_sub_status');
    setSubStatus({ isActive: false, tier: 'free' });
  };

  if (initializing) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-black animate-pulse uppercase tracking-[0.5em] text-[10px]">🏠 Inicializando...</div>;
  if (!subStatus.isActive) return <SubscriptionGate onUnlock={(email, tier) => { setSubStatus({ isActive: true, email, tier }); localStorage.setItem('gl_sub_status', JSON.stringify({ isActive: true, email, tier })); }} />;

  return (
    <div className="min-h-screen pb-32 bg-slate-50 font-sans selection:bg-indigo-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl shadow-lg overflow-hidden border border-slate-100 text-white font-black">
              {userSettings.profileImage ? <img src={userSettings.profileImage} className="w-full h-full object-cover" /> : "🏠"}
            </div>
            <div>
              <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">{userSettings.farmName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{subStatus.tier} • {daysElapsed}/30 DIAS</p>
              </div>
            </div>
          </div>
          {(mode === AppMode.DASHBOARD || mode === AppMode.FLOCK_GESTION) && (
            <button onClick={() => setShowAddNote(true)} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all animate-in fade-in slide-in-from-right-4">Produção diária</button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {dbError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            {dbError}
          </div>
        )}

        {mode === AppMode.DASHBOARD && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Resumo Diário</h2>
              <div className="flex gap-2">
                <button onClick={() => { setTransType('receita'); setShowAddTransaction(true); }} className="bg-emerald-100 text-emerald-600 p-2 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm">+ Receita</button>
                <button onClick={() => { setTransType('despesa'); setShowAddTransaction(true); }} className="bg-rose-100 text-rose-600 p-2 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm">+ Despesa</button>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase shadow-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Ovos Coletados</p>
                <p className="text-4xl font-black text-indigo-600 tracking-tighter">{dailyNotes.filter(n => n.date === selectedDate).reduce((acc, n) => acc + n.eggsCollected, 0)}</p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Baixas</p>
                <p className="text-4xl font-black text-rose-500 tracking-tighter">{dailyNotes.filter(n => n.date === selectedDate).reduce((acc, n) => acc + n.mortality, 0)}</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl text-center md:col-span-2 relative overflow-hidden flex flex-col justify-center">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1 z-10">Plantel Total</p>
                <p className="text-4xl font-black text-white tracking-tighter z-10">{inventoryFlocks.reduce((acc, f) => acc + f.quantity, 0)}</p>
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">🐔</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MonthlyFinanceCard revenue={financeStats.receitas} costs={financeStats.despesas} />
              <ConsumptionEfficiencyCard feedKg={0} totalEggs={dailyNotes.filter(n => n.date === selectedDate).reduce((acc, n) => acc + n.eggsCollected, 0)} costPerEgg={0} />
            </div>

            <div className="pt-10 flex flex-col items-center">
              <button 
                onClick={async () => {
                  setLoading(true);
                  const ad = await generateEggAd("Caipira Orgânico");
                  setAdResult(ad);
                  setLoading(false);
                }}
                className="group relative flex items-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-xl transition-all"
              >
                <span className="text-2xl">📢</span>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Marketing IA</p>
                  <p className="font-black uppercase tracking-tighter italic">Gerar Anúncio WhatsApp</p>
                </div>
              </button>
              {adResult && <div className="mt-8 w-full"><AdDisplay adText={adResult} /></div>}
            </div>
          </div>
        )}

        {mode === AppMode.FINANCE && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Financeiro</h2>
                <p className="text-slate-400 font-black uppercase text-[8px] tracking-widest mt-2">Gestão de Entradas e Saídas</p>
              </div>
              <button onClick={() => { setTransType('receita'); setShowAddTransaction(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform">+ Nova Transação</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <span className="text-[9px] font-black uppercase opacity-60 tracking-widest mb-1 block">Receitas</span>
                <p className="text-4xl font-black tracking-tighter">R$ {financeStats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-rose-500 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <span className="text-[9px] font-black uppercase opacity-60 tracking-widest mb-1 block">Despesas</span>
                <p className="text-4xl font-black tracking-tighter">R$ {financeStats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <span className="text-[9px] font-black uppercase opacity-60 tracking-widest mb-1 block">Saldo</span>
                <p className="text-4xl font-black tracking-tighter">R$ {financeStats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-6">
                {[
                  { id: 'todos', label: 'Todas' },
                  { id: 'receita', label: 'Receitas' },
                  { id: 'despesa', label: 'Despesas' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setFinanceFilter(tab.id as any)} className={`px-6 py-4 font-black uppercase text-[9px] tracking-widest relative ${financeFilter === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    {tab.label}
                    {financeFilter === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-5">Data</th>
                      <th className="px-8 py-5">Tipo</th>
                      <th className="px-8 py-5">Item</th>
                      <th className="px-8 py-5 text-right">Qtd</th>
                      <th className="px-8 py-5 text-right">Vlr Unit</th>
                      <th className="px-8 py-5 text-right">Total</th>
                      <th className="px-8 py-5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.length === 0 ? (
                      <tr><td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-black uppercase text-[10px]">Nenhum registro encontrado</td></tr>
                    ) : (
                      filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5 font-bold text-slate-600 text-xs">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-tighter ${t.type === 'receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{t.type}</span>
                          </td>
                          <td className="px-8 py-5 font-black text-slate-700 text-[10px] uppercase">{t.item_name}</td>
                          <td className="px-8 py-5 text-right text-slate-500 font-bold">{t.qty}</td>
                          <td className="px-8 py-5 text-right text-slate-500 font-bold">R$ {Number(t.price_per_unit).toFixed(2)}</td>
                          <td className={`px-8 py-5 text-right font-black text-sm ${t.type === 'receita' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            R$ {Number(t.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {mode === AppMode.FLOCK_GESTION && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Meus Lotes</h2>
              <button onClick={() => setShowAddFlock(true)} className="bg-slate-900 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">+ Novo Lote</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryFlocks.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white border border-dashed border-slate-300 rounded-[2.5rem]">
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Nenhum lote registrado</p>
                </div>
              ) : (
                inventoryFlocks.map(flock => (
                  <div key={flock.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{flock.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{flock.lineage}</p>
                      </div>
                      <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase">{flock.ageInWeeks} SEM</div>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">👤 {flock.quantity} Aves</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {mode === AppMode.NUTRITION && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-600 leading-none">Nutrição</h2>
            
            <div className="flex border-b border-slate-200 bg-white rounded-t-[2rem] px-6 pt-4">
              {[
                { id: 'racao_propria', label: 'Ração Própria' },
                { id: 'formular_ia', label: 'Formulação do App' },
                { id: 'racao_comercial', label: 'Ração Comercial' },
              ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setNutritionMode(tab.id as NutritionMode)} 
                  className={`px-6 py-4 font-black uppercase text-[9px] tracking-widest relative ${nutritionMode === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.label}
                  {nutritionMode === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
              ))}
            </div>

            {nutritionMode === 'racao_comercial' ? (
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8 animate-in zoom-in-95">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor da Saca (R$)</label>
                    <input 
                      type="number" 
                      value={commercialBagPrice} 
                      onChange={e => setCommercialBagPrice(Number(e.target.value))} 
                      className="w-full p-4 bg-slate-50 border-2 border-orange-400 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-orange-100 transition-all" 
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Peso da Saca (Kg)</label>
                    <input 
                      type="number" 
                      value={commercialBagWeight} 
                      onChange={e => setCommercialBagWeight(Number(e.target.value))} 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-400 transition-all" 
                      placeholder="50"
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100 flex flex-col items-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Valor Calculado por Kg</p>
                   <p className="text-6xl font-black text-indigo-600 tracking-tighter">
                     R$ {commercialBagWeight > 0 ? (commercialBagPrice / commercialBagWeight).toFixed(2) : "0.00"}
                   </p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <textarea 
                    value={quickInput} 
                    onChange={(e) => setQuickInput(e.target.value)} 
                    placeholder="Cole os preços aqui. Ex: Milho 1.30, Soja 2.90..." 
                    className="w-full p-8 bg-slate-900 text-indigo-300 rounded-[2.5rem] font-bold text-sm border-4 border-slate-800 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 min-h-[140px]" 
                  />
                  {quickInput.trim() && (
                    <button 
                      onClick={handleProcessQuickInput}
                      className="absolute bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-transform"
                    >
                      Processar Lista
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fase Alvo</p>
                      <select value={selectedPhase} onChange={e => setSelectedPhase(e.target.value as AnimalPhase)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-xs uppercase outline-none focus:ring-2 focus:ring-indigo-500">
                        {ANIMAL_PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {nutritionMode === 'formular_ia' && (
                        <button onClick={async () => { setLoading(true); const res = await calculateFormulation(ingredients, selectedPhase); setFormulationResult(res); setLoading(false); }} disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-50">
                          {loading ? 'Consultando IA...' : 'Formular com IA'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="lg:col-span-8 space-y-4">
                    <div className="space-y-3">
                      {ingredients.map(ing => (
                        <IngredientInput key={ing.id} ingredient={ing} onRemove={id => setIngredients(ingredients.filter(i => i.id !== id))} onChange={(id, f, v) => setIngredients(ingredients.map(i => i.id === id ? {...i, [f]: v} : i))} />
                      ))}
                    </div>
                  </div>
                </div>
                {formulationResult && nutritionMode === 'formular_ia' && <ResultsDisplay result={formulationResult} />}
              </>
            )}
          </div>
        )}

        {mode === AppMode.SETTINGS && (
          <div className="max-w-xl mx-auto space-y-8 pt-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Configurações</h2>
               {!isEditingProfile && (
                 <button onClick={() => setIsEditingProfile(true)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest underline decoration-2 underline-offset-4">Editar Perfil</button>
               )}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 flex flex-col items-center">
              <div 
                className={`w-32 h-32 bg-slate-900 rounded-[3rem] flex items-center justify-center text-5xl shadow-2xl text-white overflow-hidden border-4 border-white relative group ${isEditingProfile ? 'cursor-pointer' : ''}`}
                onClick={() => isEditingProfile && fileInputRef.current?.click()}
              >
                {userSettings.profileImage ? (
                  <img src={userSettings.profileImage} className="w-full h-full object-cover" />
                ) : (
                  "👨‍🌾"
                )}
                {isEditingProfile && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-black uppercase text-[8px]">Alterar Foto</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="w-full space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Criatório</label>
                    <input 
                      value={userSettings.farmName} 
                      onChange={e => setUserSettings(prev => ({ ...prev, farmName: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsável</label>
                    <input 
                      value={userSettings.ownerName} 
                      onChange={e => setUserSettings(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço / Localização</label>
                    <input 
                      value={userSettings.farmAddress} 
                      onChange={e => setUserSettings(prev => ({ ...prev, farmAddress: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contato / WhatsApp</label>
                    <input 
                      value={userSettings.phone} 
                      onChange={e => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                    <button type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center w-full space-y-6">
                  <div className="space-y-1">
                    <p className="font-black text-2xl text-slate-900 uppercase tracking-tighter">{userSettings.farmName}</p>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{userSettings.ownerName}</p>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-4 border border-slate-100">
                     <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Localização</span>
                       <p className="text-xs font-bold text-slate-700">{userSettings.farmAddress || 'Não informado'}</p>
                     </div>
                     <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">WhatsApp</span>
                       <p className="text-xs font-bold text-indigo-600">{userSettings.phone || 'Não informado'}</p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
               <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Plano & Assinatura</h3>
                 <span className="bg-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">ATIVO</span>
               </div>
               <div className="space-y-2">
                  <p className="text-2xl font-black tracking-tighter leading-tight uppercase italic">{subStatus.tier} Premium</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                    Faltam <span className="text-white">{30 - daysElapsed} dias</span> para finalizar sua assinatura.
                  </p>
               </div>
               <div className="space-y-4 pt-2">
                  <button 
                    onClick={() => window.open('https://hotmart.com/pt-br/club/login', '_blank')}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg"
                  >
                    Gerenciar na Hotmart
                  </button>
                  <button 
                    onClick={() => { if(confirm("Deseja realmente cancelar sua assinatura? Você perderá acesso às funcionalidades premium.")) window.open('https://help.hotmart.com/pt-BR/article/como-cancelar-uma-assinatura/115002183968', '_blank'); }}
                    className="w-full text-center text-[9px] font-black text-slate-500 hover:text-rose-500 uppercase tracking-widest transition-colors py-2"
                  >
                    Cancelar Assinatura
                  </button>
               </div>
            </div>

            {!isEditingProfile && (
              <button onClick={handleLogout} className="w-full py-5 bg-rose-50 text-rose-600 rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-rose-100 hover:bg-rose-100 transition-colors">Sair da Conta</button>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-2 py-4 flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 rounded-t-[2.5rem]">
        {[
          { id: AppMode.DASHBOARD, label: 'Início', icon: '🏠' },
          { id: AppMode.FLOCK_GESTION, label: 'Lotes', icon: '🐣' },
          { id: AppMode.NUTRITION, label: 'Ração', icon: '🌽' },
          { id: AppMode.FINANCE, label: 'Financeiro', icon: '💰' },
          { id: AppMode.SETTINGS, label: 'Perfil', icon: '⚙️' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setMode(tab.id as AppMode)} className={`flex flex-col items-center flex-1 py-2 rounded-2xl transition-all ${mode === tab.id ? 'text-indigo-600 bg-indigo-50 font-black scale-110 shadow-sm' : 'text-slate-400'}`}>
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[7px] uppercase font-black tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL DE TRANSAÇÃO */}
      {showAddTransaction && (
        <div className="fixed inset-0 z-[1001] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Nova Transação</h2>
              <button onClick={() => setShowAddTransaction(false)} className="text-slate-400 text-2xl hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (loading) return;
              setLoading(true);
              try {
                const fd = new FormData(e.currentTarget);
                const qty = Number(fd.get('qty') || 1);
                const unitPrice = Number(fd.get('price'));
                const itemName = fd.get('item_name') as string || (fd.get('category') as string);
                
                const payload = {
                  user_email: subStatus.email!,
                  type: transType,
                  item_name: itemName,
                  qty: qty,
                  price_per_unit: unitPrice,
                  total: qty * unitPrice,
                  date: fd.get('date') as string
                };

                const { error } = await supabase.from('transactions').insert([payload]);
                if (error) throw error;
                setShowAddTransaction(false);
                await loadUserData(subStatus.email!);
              } catch (err) {
                alert(getErrorMessage(err));
              } finally {
                setLoading(false);
              }
            }} className="p-8 space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipo</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setTransType('receita')} className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${transType === 'receita' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-white text-slate-400 opacity-60'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <span className="font-black uppercase text-[10px] tracking-widest">Receita</span>
                  </button>
                  <button type="button" onClick={() => setTransType('despesa')} className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${transType === 'despesa' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 bg-white text-slate-400 opacity-60'}`}>
                    <svg className="w-6 h-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <span className="font-black uppercase text-[10px] tracking-widest">Despesa</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Categoria</label>
                  <button type="button" onClick={() => setIsAddingNewCat(!isAddingNewCat)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">+ Nova</button>
                </div>
                {isAddingNewCat ? (
                  <div className="flex gap-2">
                    <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="NOME DA CATEGORIA" className="flex-1 p-4 bg-white border-2 border-indigo-400 rounded-2xl font-bold text-slate-700 outline-none" />
                    <button type="button" onClick={handleAddNewCategory} className="bg-indigo-600 text-white px-4 rounded-2xl font-black uppercase text-[10px]">OK</button>
                  </div>
                ) : (
                  <select name="category" required className="w-full p-4 bg-white border-2 border-orange-400 rounded-2xl font-bold text-slate-700 outline-none">
                    <option value="">Selecione uma categoria</option>
                    {allCategories[transType].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor (R$)</label>
                <input name="price" type="number" step="0.01" required placeholder="0" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-400" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Data</label>
                <input name="date" type="date" required className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Descrição</label>
                <textarea name="description" placeholder="Detalhes sobre a transação..." className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-medium text-slate-600 outline-none min-h-[80px] resize-none" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddTransaction(false)} className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                <button type="submit" disabled={loading} className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all ${transType === 'receita' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {loading ? 'Processando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PRODUÇÃO DIÁRIA */}
      {showAddNote && (
        <div className="fixed inset-0 z-[1001] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 mb-6">Registrar Produção Diária</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const { error } = await supabase.from('daily_notes').insert({ 
                user_email: subStatus.email, 
                date: fd.get('date'), 
                eggs_collected: parseInt(fd.get('eggs') as string), 
                mortality: parseInt(fd.get('mortality') as string) 
              });
              if (!error) { setShowAddNote(false); loadUserData(subStatus.email!); }
              else alert(getErrorMessage(error));
            }} className="space-y-4">
              <input name="date" type="date" required className="w-full p-4 bg-slate-50 border rounded-xl font-black text-xs uppercase" defaultValue={new Date().toISOString().split('T')[0]} />
              <div className="grid grid-cols-2 gap-4">
                <input name="eggs" type="number" required placeholder="OVOS" className="w-full p-5 bg-slate-50 border rounded-xl font-black text-xl text-center" />
                <input name="mortality" type="number" required placeholder="MORTES" className="w-full p-5 bg-slate-50 border rounded-xl font-black text-xl text-center" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Salvar Registro</button>
              <button type="button" onClick={() => setShowAddNote(false)} className="w-full text-slate-400 font-black uppercase text-[9px] tracking-widest mt-4">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE LOTE */}
      {showAddFlock && (
        <div className="fixed inset-0 z-[1001] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 mb-6 text-center">Novo Lote</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const fd = new FormData(e.currentTarget);
              const plan = await generateFlockPlan(fd.get('arrival') as string, fd.get('lineage') as string, Number(fd.get('qty')), Number(fd.get('age')));
              const { error } = await supabase.from('flocks').insert({ 
                user_email: subStatus.email, name: fd.get('name'), quantity: Number(fd.get('qty')), age_in_weeks: Number(fd.get('age')), arrival_date: fd.get('arrival'), lineage: fd.get('lineage'), nutrition_plan: plan 
              });
              if (!error) { setShowAddFlock(false); loadUserData(subStatus.email!); }
              else alert(getErrorMessage(error));
              setLoading(false);
            }} className="space-y-4">
              <input name="name" placeholder="NOME DO LOTE" required className="w-full p-4 bg-slate-50 border rounded-xl font-black text-xs uppercase" />
              <div className="grid grid-cols-2 gap-4">
                <input name="qty" type="number" placeholder="AVES" required className="w-full p-4 bg-slate-50 border rounded-xl font-black text-xs uppercase" />
                <input name="age" type="number" placeholder="SEMANAS" required className="w-full p-4 bg-slate-50 border rounded-xl font-black text-xs uppercase" />
              </div>
              <input name="lineage" placeholder="RAÇA / LINHAGEM" required className="w-full p-4 bg-slate-50 border rounded-xl font-black text-xs uppercase" />
              <input name="arrival" type="date" required className="w-full p-4 bg-slate-50 border rounded-xl font-black text-xs uppercase" defaultValue={new Date().toISOString().split('T')[0]} />
              <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-50">{loading ? 'Gerando Plano IA...' : 'Criar Lote'}</button>
              <button type="button" onClick={() => setShowAddFlock(false)} className="w-full text-slate-400 font-black uppercase text-[9px] tracking-widest mt-4">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
