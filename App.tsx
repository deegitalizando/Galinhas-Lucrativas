
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Ingredient, 
  AnimalPhase, 
  FormulationResult, 
  AppMode, 
  VetDiagnosis, 
  FinanceResult, 
  FlockEntry,
  Transaction,
  CatalogItem,
  TransactionType,
  FlockResult,
  DailyNote,
  NutritionMode
} from './types';
import { DEFAULT_INGREDIENTS, ANIMAL_PHASES } from './constants';
import { calculateFormulation } from './services/geminiService';
import { diagnoseBirdHealth } from './services/veterinaryService';
import { calculateFinance } from './services/financeService';
import { registerFlock } from './services/flockService';
import IngredientInput from './components/IngredientInput';
import ResultsDisplay from './components/ResultsDisplay';
import VetReport from './components/VetReport';
import FinanceReport from './components/FinanceReport';
import FlockReport from './components/FlockReport';
import DashboardCharts, { ConsumptionEfficiencyCard, MonthlyFinanceCard } from './components/DashboardCharts';

const INITIAL_CATALOG: CatalogItem[] = [
  { id: 'cat-1', name: 'Dúzia de Ovos', unit: 'dz', basePrice: 12.00, type: 'venda' },
  { id: 'cat-2', name: 'Esterco Seco', unit: 'saco', basePrice: 15.00, type: 'venda' },
  { id: 'cat-3', name: 'Saco de Ração', unit: 'saco 40kg', basePrice: 120.00, type: 'compra' },
  { id: 'cat-4', name: 'Milho Grão', unit: 'kg', basePrice: 1.50, type: 'compra' },
];

const App: React.FC = () => {
  // --- Navigation & Context State ---
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [financeSubMode, setFinanceSubMode] = useState<'caixa' | 'catalogo' | 'relatorio'>('caixa');
  const [flockSubMode, setFlockSubMode] = useState<'lista' | 'novo' | 'diario'>('lista');
  const [nutritionMode, setNutritionMode] = useState<NutritionMode>('formular_ia');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // --- Global App State ---
  const [catalog, setCatalog] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventoryFlocks, setInventoryFlocks] = useState<FlockEntry[]>([
    { id: '1', name: 'Lote A - 2024', quantity: 150, ageInWeeks: 22, arrivalDate: '2024-10-01', lineage: 'ISA Brown', status: 'normal' },
  ]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);

  // --- Sync Form Dates with Global Selected Date ---
  useEffect(() => {
    if (!editingNoteId) {
      setPostureForm(prev => ({ ...prev, date: selectedDate }));
    }
    if (!editingTransactionId) {
      setTransForm(prev => ({ ...prev, date: selectedDate }));
    }
  }, [selectedDate]);

  // --- Form States ---
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [catalogForm, setCatalogForm] = useState({ name: '', unit: '', price: 0, type: 'venda' as TransactionType });

  const [editingFlockId, setEditingFlockId] = useState<string | null>(null);
  const [flockForm, setFlockForm] = useState({ name: '', qty: 100, age: 1, lineage: 'ISA Brown', date: selectedDate });
  const [loadingFlockInfo, setLoadingFlockInfo] = useState(false);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [selectedFlockId, setSelectedFlockId] = useState<string>(inventoryFlocks[0]?.id || '');
  const [postureForm, setPostureForm] = useState({ eggs: 0, mortality: 0, notes: '', date: selectedDate });
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [phase, setPhase] = useState<AnimalPhase>(AnimalPhase.GALINHAS_POSTURA);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [nutritionResult, setNutritionResult] = useState<FormulationResult | null>(null);
  const [manualFormula, setManualFormula] = useState<{name: string, weight: number}[]>([]);
  const [readyFeed, setReadyFeed] = useState({ price: 120, weight: 40 });

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [transForm, setTransForm] = useState({ itemId: '', qty: 1, date: selectedDate });
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [financeResult, setFinanceResult] = useState<FinanceResult | null>(null);

  // --- Computed Metrics (Daily & Monthly) ---
  const dashboardData = useMemo(() => {
    const today = selectedDate;
    const currentMonthPrefix = today.slice(0, 7); // YYYY-MM

    // Daily Filters
    const dayTransactions = transactions.filter(t => t.date === today);
    const dayNotes = dailyNotes.filter(n => n.date === today);

    // Monthly Filters
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonthPrefix));
    const monthNotes = dailyNotes.filter(n => n.date.startsWith(currentMonthPrefix));

    // Daily Stats
    const dailyRevenue = dayTransactions.filter(t => t.type === 'venda').reduce((acc, t) => acc + t.total, 0);
    const dailyCosts = dayTransactions.filter(t => t.type !== 'venda').reduce((acc, t) => acc + t.total, 0);
    const dailyEggs = dayNotes.reduce((acc, n) => acc + n.eggsCollected, 0);
    const dailyFeedKg = dayNotes.reduce((acc, n) => acc + n.feedConsumedKg, 0);
    const dailyProfit = dailyRevenue - dailyCosts;

    // Monthly Stats
    const monthlyRevenue = monthTransactions.filter(t => t.type === 'venda').reduce((acc, t) => acc + t.total, 0);
    const monthlyCosts = monthTransactions.filter(t => t.type !== 'venda').reduce((acc, t) => acc + t.total, 0);
    const monthlyEggs = monthNotes.reduce((acc, n) => acc + n.eggsCollected, 0);
    const monthlyFeedKg = monthNotes.reduce((acc, n) => acc + n.feedConsumedKg, 0);

    // Efficiency Metrics
    const avgLayingRate = dayNotes.length > 0 
      ? (dayNotes.reduce((acc, n) => acc + n.layingRate, 0) / dayNotes.length).toFixed(1)
      : "0.0";
    
    const costPerEgg = dailyEggs > 0 ? (dailyCosts / dailyEggs) : 0;

    return { 
      daily: { revenue: dailyRevenue, costs: dailyCosts, profit: dailyProfit, eggs: dailyEggs, feedKg: dailyFeedKg, costPerEgg, layingRate: avgLayingRate },
      monthly: { revenue: monthlyRevenue, costs: monthlyCosts, eggs: monthlyEggs, feedKg: monthlyFeedKg }
    };
  }, [transactions, dailyNotes, selectedDate]);

  // --- HANDLERS ---
  
  const handleAddPostureRecord = () => {
    const flock = inventoryFlocks.find(f => f.id === selectedFlockId);
    if (!flock) return alert("Selecione um lote válido.");

    if (postureForm.eggs > flock.quantity) {
      alert(`⚠️ ERRO DE CONSISTÊNCIA\n\nA quantidade de ovos (${postureForm.eggs}) excede a quantidade de aves vivas (${flock.quantity}).`);
      return;
    }

    const layingRate = flock.quantity > 0 ? (postureForm.eggs / flock.quantity) * 100 : 0;
    const dailyGrams = flock.nutritionPlan?.feedConsumptionInfo.dailyPerBirdGrams || 115;
    const estimatedFeed = (flock.quantity * dailyGrams) / 1000;

    if (editingNoteId) {
      setDailyNotes(dailyNotes.map(n => n.id === editingNoteId ? {
        ...n,
        date: postureForm.date,
        flockId: flock.id,
        flockName: flock.name,
        eggsCollected: postureForm.eggs,
        mortality: postureForm.mortality,
        layingRate: parseFloat(layingRate.toFixed(1)),
        notes: postureForm.notes
      } : n));
      setEditingNoteId(null);
      alert("Registro de postura atualizado!");
    } else {
      const newNote: DailyNote = {
        id: Math.random().toString(36).substr(2, 9),
        date: postureForm.date,
        flockId: flock.id,
        flockName: flock.name,
        eggsCollected: postureForm.eggs,
        mortality: postureForm.mortality,
        feedConsumedKg: estimatedFeed,
        layingRate: parseFloat(layingRate.toFixed(1)),
        feedConversion: postureForm.eggs > 0 ? estimatedFeed / (postureForm.eggs / 12) : 0,
        notes: postureForm.notes
      };
      setDailyNotes([newNote, ...dailyNotes]);
      if (postureForm.mortality > 0) {
        setInventoryFlocks(inventoryFlocks.map(f => f.id === flock.id ? { ...f, quantity: Math.max(0, f.quantity - postureForm.mortality) } : f));
      }
      alert(`Postura registrada com sucesso!`);
    }
    setPostureForm({ eggs: 0, mortality: 0, notes: '', date: selectedDate });
  };

  const startEditDailyNote = (note: DailyNote) => {
    setEditingNoteId(note.id);
    setSelectedFlockId(note.flockId);
    setPostureForm({
      eggs: note.eggsCollected,
      mortality: note.mortality,
      notes: note.notes,
      date: note.date
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteDailyNote = (id: string) => {
    if (window.confirm("Deseja remover este registro de postura permanentemente?")) {
      setDailyNotes(dailyNotes.filter(n => n.id !== id));
      if (editingNoteId === id) {
        setEditingNoteId(null);
        setPostureForm({ eggs: 0, mortality: 0, notes: '', date: selectedDate });
      }
    }
  };

  const handleSaveFlock = async () => {
    if (!flockForm.name || flockForm.qty <= 0) return alert("Preencha o nome e quantidade.");
    
    setLoadingFlockInfo(true);
    try {
      const nutritionPlan = await registerFlock(flockForm.date, flockForm.lineage, flockForm.qty, flockForm.age);
      
      if (editingFlockId) {
        setInventoryFlocks(inventoryFlocks.map(f => f.id === editingFlockId ? { 
          ...f, 
          name: flockForm.name, 
          quantity: flockForm.qty, 
          ageInWeeks: flockForm.age, 
          lineage: flockForm.lineage, 
          arrivalDate: flockForm.date,
          nutritionPlan
        } : f));
        setEditingFlockId(null);
        alert("Lote e Plano Nutricional atualizados com sucesso!");
      } else {
        const newFlock: FlockEntry = {
          id: Math.random().toString(36).substr(2, 9),
          name: flockForm.name,
          quantity: flockForm.qty,
          ageInWeeks: flockForm.age,
          lineage: flockForm.lineage,
          arrivalDate: flockForm.date,
          status: 'normal',
          nutritionPlan
        };
        setInventoryFlocks([...inventoryFlocks, newFlock]);
        alert("Novo lote cadastrado!");
      }
      setFlockForm({ name: '', qty: 100, age: 1, lineage: 'ISA Brown', date: selectedDate });
      setFlockSubMode('lista');
    } catch (e) {
      alert("Erro ao processar plano nutricional.");
    } finally {
      setLoadingFlockInfo(false);
    }
  };

  const startEditFlock = (f: FlockEntry) => {
    setEditingFlockId(f.id);
    setFlockForm({
      name: f.name,
      qty: f.quantity,
      age: f.ageInWeeks,
      lineage: f.lineage,
      date: f.arrivalDate
    });
    setFlockSubMode('novo');
  };

  const deleteFlock = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este lote?")) {
      setInventoryFlocks(inventoryFlocks.filter(f => f.id !== id));
    }
  };

  const handleSaveCatalogItem = () => {
    if (!catalogForm.name || catalogForm.price <= 0) return alert("Preencha o nome e um preço válido.");
    if (editingCatalogId) {
      setCatalog(catalog.map(item => item.id === editingCatalogId ? { ...item, ...catalogForm, basePrice: catalogForm.price } : item));
      setEditingCatalogId(null);
    } else {
      const newItem: CatalogItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: catalogForm.name,
        unit: catalogForm.unit,
        basePrice: catalogForm.price,
        type: catalogForm.type
      };
      setCatalog([...catalog, newItem]);
    }
    setCatalogForm({ name: '', unit: '', price: 0, type: 'venda' });
  };

  const startEditCatalog = (item: CatalogItem) => {
    setEditingCatalogId(item.id);
    setCatalogForm({ name: item.name, unit: item.unit, price: item.basePrice, type: item.type });
  };

  const deleteCatalogItem = (id: string) => {
    if (window.confirm("Deseja remover este item?")) {
      setCatalog(catalog.filter(i => i.id !== id));
    }
  };

  const handleCalculateNutrition = async () => {
    setLoadingNutrition(true);
    try {
      const res = await calculateFormulation(ingredients, phase);
      setNutritionResult(res);
    } catch (e) { console.error(e); } finally { setLoadingNutrition(false); }
  };

  const handleRunFinanceIA = async () => {
    setLoadingFinance(true);
    try {
      const currentFlockTotal = inventoryFlocks.reduce((acc, f) => acc + f.quantity, 0);
      const eggSellingPrice = catalog.find(c => c.id === 'cat-1')?.basePrice || 12;
      const res = await calculateFinance(currentFlockTotal, dashboardData.daily.eggs, dashboardData.daily.costs, eggSellingPrice);
      setFinanceResult(res);
    } catch (e) { console.error(e); } finally { setLoadingFinance(false); }
  };

  const handleSaveTransaction = () => {
    const item = catalog.find(i => i.id === transForm.itemId);
    if (!item) return alert("Selecione um item.");
    const total = item.basePrice * transForm.qty;
    if (editingTransactionId) {
      setTransactions(transactions.map(t => t.id === editingTransactionId ? { ...t, date: transForm.date, itemId: item.id, itemName: item.name, qty: transForm.qty, unit: item.unit, pricePerUnit: item.basePrice, total, type: item.type } : t));
      setEditingTransactionId(null);
    } else {
      const newTrans: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: transForm.date,
        itemId: item.id,
        itemName: item.name,
        qty: transForm.qty,
        unit: item.unit,
        pricePerUnit: item.basePrice,
        total,
        type: item.type
      };
      setTransactions([newTrans, ...transactions]);
    }
    setTransForm({ itemId: '', qty: 1, date: selectedDate });
  };

  const startEditTransaction = (t: Transaction) => {
    setEditingTransactionId(t.id);
    setTransForm({ itemId: t.itemId, qty: t.qty, date: t.date });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm("Deseja excluir este lançamento?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-[#F8FAFC] font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl shadow-lg">🐔</div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Galinhas Lucrativas</h1>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-slate-50 px-2 py-0.5 mt-1 rounded-lg border border-indigo-100 outline-none cursor-pointer w-fit"
            />
          </div>
        </div>
      </header>

      {/* BOTTOM NAVIGATION - RESPONSIVE TABS */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-2 md:py-3 z-[100] flex justify-around shadow-[0_-10px_25px_-10px_rgba(0,0,0,0.1)]">
        {[
          { id: AppMode.DASHBOARD, label: 'Resumo', icon: '🏠' },
          { id: AppMode.FLOCK_GESTION, label: 'Lotes', icon: '🐓' },
          { id: AppMode.NUTRITION, label: 'Ração', icon: '🌽' },
          { id: AppMode.FINANCE, label: 'Finanças', icon: '💰' },
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setMode(tab.id as AppMode)} 
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-2xl transition-all duration-300 ${mode === tab.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-2xl md:text-3xl">{tab.icon}</span>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10">
        
        {/* DASHBOARD - RELATÓRIOS AVANÇADOS */}
        {mode === AppMode.DASHBOARD && (
          <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">Inteligência de Negócio</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <div className="bg-white p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm">
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ovos Hoje</p>
                <p className="text-2xl md:text-4xl font-black text-indigo-600 tracking-tighter">{dashboardData.daily.eggs}</p>
              </div>
              <div className="bg-white p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm">
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxa de Postura</p>
                <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{dashboardData.daily.layingRate}%</p>
              </div>
              <div className="bg-white p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm">
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consumo Ração</p>
                <p className="text-2xl md:text-4xl font-black text-amber-600 tracking-tighter">{dashboardData.daily.feedKg.toFixed(1)} <span className="text-xs">kg</span></p>
              </div>
              <div className="bg-emerald-50 p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-emerald-100 shadow-sm col-span-1">
                <p className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Lucro Dia</p>
                <p className="text-2xl md:text-4xl font-black text-emerald-700 tracking-tighter">R$ {dashboardData.daily.profit.toFixed(0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              <div className="lg:col-span-7 space-y-6 md:space-y-8">
                <MonthlyFinanceCard 
                  revenue={dashboardData.monthly.revenue} 
                  costs={dashboardData.monthly.costs} 
                />
                
                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm">
                  <DashboardCharts type="pie" revenue={dashboardData.daily.revenue} costs={dashboardData.daily.costs} />
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6 md:space-y-8">
                <ConsumptionEfficiencyCard 
                  feedKg={dashboardData.daily.feedKg} 
                  totalEggs={dashboardData.daily.eggs} 
                  costPerEgg={dashboardData.daily.costPerEgg}
                />

                <div className="bg-indigo-600 p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-xl relative overflow-hidden group cursor-pointer hover:bg-indigo-700 transition-colors" onClick={() => { setMode(AppMode.FINANCE); setFinanceSubMode('relatorio'); }}>
                  <div className="relative z-10">
                    <h3 className="text-[9px] md:text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Consultoria Avançada</h3>
                    <p className="text-xl md:text-2xl font-black leading-tight mb-4 tracking-tighter">Gere seu relatório detalhado de eficiência IA.</p>
                    <div className="flex items-center gap-2 text-indigo-200 font-bold text-sm">
                      Acessar análise <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">📊</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOCK GESTION */}
        {mode === AppMode.FLOCK_GESTION && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-1.5 p-1 bg-white border border-slate-200 rounded-3xl w-full md:w-fit mx-auto shadow-sm overflow-x-auto no-scrollbar">
               {[
                 { id: 'lista', label: 'Plantel', icon: '📋' },
                 { id: 'novo', label: editingFlockId ? 'Editar' : 'Novo', icon: editingFlockId ? '✎' : '➕' },
                 { id: 'diario', label: 'Postura', icon: '🥚' }
               ].map(sub => (
                 <button key={sub.id} onClick={() => {
                   setFlockSubMode(sub.id as any);
                   if (sub.id !== 'novo') setEditingFlockId(null);
                 }} className={`flex-1 md:flex-none py-2 md:py-3 px-4 md:px-6 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${flockSubMode === sub.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                   {sub.label}
                 </button>
               ))}
            </div>

            {flockSubMode === 'lista' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {inventoryFlocks.map(flock => (
                  <div key={flock.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">🐓</div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{flock.name}</h3>
                      <div className="flex gap-2 relative z-10">
                        <button onClick={() => startEditFlock(flock)} className="p-2 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm" title="Editar Lote">✎</button>
                        <button onClick={() => deleteFlock(flock.id)} className="p-2 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-50 transition-colors shadow-sm" title="Excluir Lote">✕</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                       <div className="bg-slate-50 p-4 md:p-5 rounded-3xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Aves</p>
                          <p className="text-lg md:text-xl font-black text-indigo-600">{flock.quantity}</p>
                       </div>
                       <div className="bg-slate-50 p-4 md:p-5 rounded-3xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Idade</p>
                          <p className="text-lg md:text-xl font-black text-slate-800">{flock.ageInWeeks} sem</p>
                       </div>
                    </div>
                    {flock.nutritionPlan && (
                      <div className="bg-indigo-50/50 p-5 md:p-6 rounded-3xl border border-indigo-100 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[8px] font-black text-indigo-400 uppercase mb-3 tracking-widest">Nutrição Atual</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center"><span className="text-[9px] md:text-[10px] font-bold text-slate-600">Tipo:</span><span className="text-[10px] md:text-xs font-black text-indigo-700 uppercase">{flock.nutritionPlan.feedConsumptionInfo.currentFeedType}</span></div>
                            <div className="flex justify-between items-center"><span className="text-[9px] md:text-[10px] font-bold text-slate-600">Consumo/Dia:</span><span className="text-xs md:text-sm font-black text-slate-900">{flock.nutritionPlan.feedConsumptionInfo.dailyPerBirdGrams}g</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {flockSubMode === 'novo' && (
              <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm space-y-6 md:space-y-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase text-center">{editingFlockId ? 'Editar Lote' : 'Novo Lote'}</h2>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-4">Nome do Lote</label>
                      <input type="text" placeholder="Ex: Lote B - 2024" value={flockForm.name} onChange={e => setFlockForm({...flockForm, name: e.target.value})} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-4">Quantidade</label>
                        <input type="number" value={flockForm.qty} onChange={e => setFlockForm({...flockForm, qty: parseInt(e.target.value) || 0})} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-4">Idade (Semanas)</label>
                        <input type="number" value={flockForm.age} onChange={e => setFlockForm({...flockForm, age: parseInt(e.target.value) || 0})} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-4">Linhagem</label>
                      <input type="text" value={flockForm.lineage} onChange={e => setFlockForm({...flockForm, lineage: e.target.value})} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none" />
                   </div>
                   <button onClick={handleSaveFlock} disabled={loadingFlockInfo} className="w-full py-6 md:py-8 bg-slate-900 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl hover:bg-black transition-all">
                      {loadingFlockInfo ? 'Analisando...' : 'Salvar e Gerar Plano IA'}
                   </button>
                </div>
              </div>
            )}

            {flockSubMode === 'diario' && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm space-y-6 md:space-y-8">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase text-center">Registro de Postura</h2>
                  <div className="space-y-4">
                    <input type="date" value={postureForm.date} onChange={e => setPostureForm({...postureForm, date: e.target.value})} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none focus:ring-2 focus:ring-indigo-500" />
                    <select value={selectedFlockId} onChange={e => setSelectedFlockId(e.target.value)} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none appearance-none">
                      {inventoryFlocks.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Ovos" value={postureForm.eggs} onChange={e => setPostureForm({...postureForm, eggs: parseInt(e.target.value) || 0})} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black" />
                      <input type="number" placeholder="Mortes" value={postureForm.mortality} onChange={e => setPostureForm({...postureForm, mortality: parseInt(e.target.value) || 0})} className="w-full p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black text-rose-500" />
                    </div>
                    <button onClick={handleAddPostureRecord} className="w-full py-6 md:py-8 bg-slate-900 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl">Salvar Diário</button>
                  </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Histórico Recente</h3>
                   <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                      {dailyNotes.length > 0 ? dailyNotes.map(note => (
                        <div key={note.id} className="p-4 md:p-5 border border-slate-100 rounded-2xl md:rounded-3xl flex justify-between items-center bg-slate-50/50 hover:bg-white transition-all group">
                           <div>
                              <p className="font-black text-slate-900 text-sm md:text-base">{note.flockName}</p>
                              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{note.date.split('-').reverse().join('/')}</p>
                           </div>
                           <div className="flex items-center gap-4 md:gap-6">
                              <div className="text-center"><p className="text-lg md:text-xl font-black text-indigo-600">{note.eggsCollected}</p><p className="text-[8px] font-black text-slate-400 uppercase">Ovos</p></div>
                              <button onClick={() => deleteDailyNote(note.id)} className="p-2 text-rose-400 opacity-60 md:opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-lg">✕</button>
                           </div>
                        </div>
                      )) : <p className="text-center py-10 opacity-30 uppercase font-black text-xs">Sem registros</p>}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NUTRITION */}
        {mode === AppMode.NUTRITION && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex gap-1.5 p-1 bg-white border border-slate-200 rounded-3xl w-full md:w-fit mx-auto shadow-sm overflow-x-auto no-scrollbar">
               {[
                 { id: 'formular_ia', label: '🤖 IA Nutri', icon: '🤖' },
                 { id: 'minha_formula', label: '✍️ Receita', icon: '✍️' },
                 { id: 'racao_pronta', label: '🛍️ Comercial', icon: '🛍️' }
               ].map(sub => (
                 <button key={sub.id} onClick={() => setNutritionMode(sub.id as any)} className={`flex-1 md:flex-none py-2 md:py-3 px-4 md:px-6 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${nutritionMode === sub.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                   {sub.label}
                 </button>
               ))}
            </div>

            {nutritionMode === 'formular_ia' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                <div className="lg:col-span-5 bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm space-y-6 md:space-y-8">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">Mix Nutricional IA</h2>
                  <div className="space-y-3">
                    {ingredients.map(ing => (
                      <IngredientInput key={ing.id} ingredient={ing} onRemove={id => setIngredients(ingredients.filter(i => i.id !== id))} onChange={(id, f, v) => setIngredients(ingredients.map(i => i.id === id ? {...i, [f]: v} : i))} />
                    ))}
                    <button onClick={() => setIngredients([...ingredients, { id: Math.random().toString(), name: '', pricePerKg: 0 }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[9px] md:text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50">Adicionar Insumo</button>
                  </div>
                  <button onClick={handleCalculateNutrition} disabled={loadingNutrition} className="w-full py-6 md:py-8 bg-emerald-600 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl transition-all">
                    {loadingNutrition ? 'Analisando...' : 'Calcular Mix Ideal'}
                  </button>
                </div>
                <div className="lg:col-span-7">
                  {nutritionResult ? <ResultsDisplay result={nutritionResult} /> : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 py-16 md:py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] md:rounded-[4rem]">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6">🌽</div>
                      <p className="font-black uppercase tracking-widest text-[10px] md:text-xs max-w-xs">Otimize custos com IA nutricional.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {nutritionMode === 'minha_formula' && (
              <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter text-center uppercase">Minha Receita</h2>
                <div className="space-y-4">
                  {manualFormula.length === 0 && <p className="text-center text-slate-400 italic text-sm py-4">Sua receita está vazia.</p>}
                  {manualFormula.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" placeholder="Ingrediente" value={item.name} onChange={e => {
                        const next = [...manualFormula];
                        next[idx].name = e.target.value;
                        setManualFormula(next);
                      }} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl font-black outline-none" />
                      <input type="number" placeholder="kg" value={item.weight} onChange={e => {
                        const next = [...manualFormula];
                        next[idx].weight = parseFloat(e.target.value) || 0;
                        setManualFormula(next);
                      }} className="w-20 md:w-24 p-4 bg-slate-50 border border-slate-200 rounded-xl font-black outline-none" />
                      <button onClick={() => setManualFormula(manualFormula.filter((_, i) => i !== idx))} className="p-3 text-rose-400">✕</button>
                    </div>
                  ))}
                  <button onClick={() => setManualFormula([...manualFormula, {name: '', weight: 0}])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400">Adicionar</button>
                  <button onClick={() => alert("Receita Salva!")} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest">Salvar</button>
                </div>
              </div>
            )}

            {nutritionMode === 'racao_pronta' && (
              <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter text-center uppercase">Comercial</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Preço do Saco (R$)</label>
                    <input type="number" value={readyFeed.price} onChange={e => setReadyFeed({...readyFeed, price: parseFloat(e.target.value) || 0})} className="w-full p-5 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Peso (kg)</label>
                    <input type="number" value={readyFeed.weight} onChange={e => setReadyFeed({...readyFeed, weight: parseFloat(e.target.value) || 0})} className="w-full p-5 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] font-black outline-none" />
                  </div>
                </div>
                <div className="bg-emerald-50 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] text-center border border-emerald-100 shadow-inner">
                  <p className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Custo Real por Quilo</p>
                  <p className="text-4xl md:text-6xl font-black text-emerald-800 tracking-tighter">R$ {(readyFeed.price / (readyFeed.weight || 1)).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINANCE */}
        {mode === AppMode.FINANCE && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-1.5 p-1 bg-white border border-slate-200 rounded-3xl w-full md:w-fit mx-auto shadow-sm overflow-x-auto no-scrollbar">
               {[
                 { id: 'caixa', label: 'Caixa', icon: '📝' },
                 { id: 'catalogo', label: 'Catálogo', icon: '🏷️' },
                 { id: 'relatorio', label: '📊 Consultoria', icon: '📊' }
               ].map(sub => (
                 <button key={sub.id} onClick={() => setFinanceSubMode(sub.id as any)} className={`flex-1 md:flex-none py-2 md:py-3 px-4 md:px-6 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubMode === sub.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                   {sub.label}
                 </button>
               ))}
            </div>

            {financeSubMode === 'caixa' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <div className="lg:col-span-5 bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Lançamento</h2>
                  <div className="space-y-4">
                    <input type="date" value={transForm.date} onChange={e => setTransForm({...transForm, date: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-black outline-none" />
                    <select value={transForm.itemId} onChange={e => setTransForm({...transForm, itemId: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-black outline-none appearance-none">
                      <option value="">O que aconteceu?</option>
                      {catalog.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <input type="number" value={transForm.qty} onChange={e => setTransForm({...transForm, qty: parseFloat(e.target.value) || 0})} placeholder="Quantidade" className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-black outline-none" />
                    <button onClick={handleSaveTransaction} className="w-full py-5 md:py-6 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Confirmar</button>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-sm h-[400px] md:h-[500px] overflow-y-auto no-scrollbar">
                   <div className="p-6 md:p-8 space-y-4">
                      {transactions.filter(t => t.date === selectedDate).map(t => (
                        <div key={t.id} className="p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                          <div className="min-w-0 flex-1 mr-2">
                            <p className="font-black text-slate-900 truncate text-sm md:text-base">{t.itemName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{t.qty} {t.unit}</p>
                          </div>
                          <div className="flex items-center gap-3 md:gap-4">
                            <p className={`text-base md:text-xl font-black whitespace-nowrap ${t.type === 'venda' ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {t.total.toFixed(2)}</p>
                            <button onClick={() => deleteTransaction(t.id)} className="p-2 text-rose-400 opacity-60 md:opacity-0 group-hover:opacity-100 transition-all">✕</button>
                          </div>
                        </div>
                      ))}
                      {transactions.filter(t => t.date === selectedDate).length === 0 && <p className="text-center py-20 opacity-30 font-black uppercase text-xs">Sem movimentos</p>}
                   </div>
                </div>
              </div>
            )}

            {financeSubMode === 'catalogo' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <div className="lg:col-span-5 bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{editingCatalogId ? 'Editar' : 'Novo Item'}</h2>
                  <div className="space-y-4">
                    <input type="text" placeholder="Nome" value={catalogForm.name} onChange={e => setCatalogForm({...catalogForm, name: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-black outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Unid." value={catalogForm.unit} onChange={e => setCatalogForm({...catalogForm, unit: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-black" />
                      <input type="number" placeholder="Preço" value={catalogForm.price} onChange={e => setCatalogForm({...catalogForm, price: parseFloat(e.target.value) || 0})} className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-black" />
                    </div>
                    <select value={catalogForm.type} onChange={e => setCatalogForm({...catalogForm, type: e.target.value as any})} className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-black outline-none">
                      <option value="venda">Receita (Venda)</option>
                      <option value="compra">Custo (Compra)</option>
                    </select>
                    <button onClick={handleSaveCatalogItem} className="w-full py-5 md:py-6 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                      {editingCatalogId ? 'Salvar' : 'Adicionar'}
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm max-h-[500px] overflow-y-auto no-scrollbar">
                  {catalog.map(item => (
                    <div key={item.id} className="p-4 md:p-5 border border-slate-100 rounded-2xl md:rounded-3xl flex justify-between items-center mb-2 group hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 flex-1 mr-2"><p className="font-black text-slate-800 truncate text-sm md:text-base">{item.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</p></div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <p className="text-base md:text-lg font-black text-slate-900 whitespace-nowrap">R$ {item.basePrice.toFixed(2)}</p>
                        <button onClick={() => startEditCatalog(item)} className="p-2 text-indigo-500">✎</button>
                        <button onClick={() => deleteCatalogItem(item.id)} className="p-2 text-rose-400">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {financeSubMode === 'relatorio' && (
              <div className="space-y-6 md:space-y-8">
                 <button onClick={handleRunFinanceIA} disabled={loadingFinance} className="w-full py-6 md:py-8 bg-indigo-600 text-white rounded-2xl md:rounded-[2rem] font-black uppercase text-xs md:text-sm tracking-widest shadow-2xl">
                    {loadingFinance ? 'Consultando IA...' : 'Analisar Desempenho Biológico'}
                 </button>
                 {financeResult && <FinanceReport report={financeResult} />}
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="max-w-6xl mx-auto mt-10 md:mt-20 p-6 md:p-10 text-center border-t border-slate-100 opacity-30 pb-10">
         <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">Galinhas Lucrativas • Gestão de Alta Performance</p>
      </footer>
    </div>
  );
};

export default App;
