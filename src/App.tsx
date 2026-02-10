// ... (imports remain the same)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, Plus, Table2, Trash2, ArrowLeft, Settings2, Wand2,
  Calculator, Info, CheckCircle, Hand, Grab, Fingerprint, Crosshair,
  LogOut, Minimize2, RotateCw, ArrowDownToLine, Eye, Footprints,
  X, Bot, PlusCircle, HelpCircle, Printer, DollarSign,
  Menu, PanelRightClose, PanelRightOpen, Scissors, ChevronUp,
  ChevronDown, BookOpen, Target, Scale, HelpCircle as HelpIcon,
  MonitorPlay, Moon, Sun, Award, FileText, Activity, Download, Upload, FileSpreadsheet,
  FolderOpen, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Pie, PieChart as RePieChart
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { parseCode, REACH_BASE, MOVE_BASE, STAT, POS_DATA, TURN_DATA, DIS_DATA } from './utils/mtmLogic';
import { analyzeErgonomics } from './utils/ergonomics';
import type { Study, Motion, MotionGroup } from './types/types';
import { Simulation } from './components/Simulation';
import MTMReferenceTable from './components/MTMReferenceTable';
import { MotionGroupManager } from './components/MotionGroupManager';
import { Editor } from './components/Editor';

const TutorialOverlay = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto print:hidden">
    <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative my-auto border border-slate-200 dark:border-slate-800">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
        <X className="w-6 h-6" />
      </button>
      <div className="mb-6 flex justify-center">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
           <Wand2 className="w-12 h-12 text-red-600 dark:text-red-500" />
        </div>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white text-center mb-2">Bem-vindo ao TMU Studio Pro</h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Sua ferramenta profissional para cronoanálise MTM-1.</p>
      <button onClick={onClose} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50">
        Começar a Usar
      </button>
    </div>
  </div>
);

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, message: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200 print:hidden">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl max-w-sm w-full border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Confirmação</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor' | 'simulation' | 'groupManager' | 'sandbox'>('dashboard');
  const [studies, setStudies] = useState<Study[]>([]);
  const [motionGroups, setMotionGroups] = useState<MotionGroup[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [dashView, setDashView] = useState<'list' | 'reference'>('list');
  const [activeTab, setActiveTab] = useState<'current' | 'proposed' | 'results' | 'config'>('current');
  const [editorData, setEditorData] = useState<Study | null>(null);
  const [wizardOpen, setWizardOpen] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
      const saved = localStorage.getItem('tmu_pro_data');
      const savedGroups = localStorage.getItem('tmu_pro_groups');
      if (saved) setStudies(JSON.parse(saved)); else setShowTutorial(true);
      if (savedGroups) setMotionGroups(JSON.parse(savedGroups));
      if (window.innerWidth < 1024) setWizardOpen(false);
  }, []);

  useEffect(() => { localStorage.setItem('tmu_pro_data', JSON.stringify(studies)); }, [studies]);
  useEffect(() => { localStorage.setItem('tmu_pro_groups', JSON.stringify(motionGroups)); }, [motionGroups]);

  useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleCreateNew = () => {
    const newStudy: Study = { id: Date.now().toString(), title: "Nova Análise", tolerance: 8, currentMotions: [], proposedMotions: [], roi: { costMin: 0.50, volume: 100, invest: 0, daysPerMonth: 22, minutesPerHour: 60, targetIncreasePct: 10 }, updatedAt: Date.now() };
    setStudies([newStudy, ...studies]); setCurrentId(newStudy.id); setEditorData(newStudy); setView('editor'); setActiveTab('current');
  };
  const handleOpenStudy = (id: string) => { const s = studies.find(x => x.id === id); if (s) { setCurrentId(id); setEditorData(JSON.parse(JSON.stringify(s))); setView('editor'); setActiveTab('current'); } };
  const handleSaveEditor = (dataToSave?: Study) => {
      // Do not save if sandbox
      if (view === 'sandbox') return;
      const data = dataToSave || editorData; if (!data || !currentId) return;
      const updated = { ...data, updatedAt: Date.now() };
      setStudies(prev => prev.map(s => s.id === currentId ? updated : s));
  };
  const handleDeleteStudy = (id: string) => { setStudies(prev => prev.filter(s => s.id !== id)); if (currentId === id) { setView('dashboard'); setCurrentId(null); } setConfirmDeleteId(null); };
  const totalSavings = useMemo(() => { return studies.reduce((acc, study) => { const factor = 1 + (study.tolerance / 100); const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor; const cur = calc(study.currentMotions); const pro = calc(study.proposedMotions); const saving = Math.max(0, cur - pro); return acc + (saving * study.roi.costMin * study.roi.volume * (study.roi.daysPerMonth || 22)); }, 0); }, [studies]);

  const handleExportJSON = () => {
      const backup = {
          studies,
          motionGroups
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "tmu_studio_full_backup_" + new Date().toISOString().split('T')[0] + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const imported = JSON.parse(evt.target?.result as string);
              // Check if it's a full backup or just studies list
              let newStudies = [];
              let newGroups = [];

              if (imported.studies) {
                  newStudies = imported.studies;
                  newGroups = imported.motionGroups || [];
              } else if (Array.isArray(imported)) {
                  newStudies = imported;
              }

              if (newStudies.length > 0) {
                  setStudies(prev => {
                      const existingIds = new Set(prev.map(s => s.id));
                      const unique = newStudies.filter((s: Study) => !existingIds.has(s.id));
                      return [...unique, ...prev];
                  });
              }

              if (newGroups.length > 0) {
                  setMotionGroups(prev => {
                      const existingIds = new Set(prev.map(g => g.id));
                      const unique = newGroups.filter((g: MotionGroup) => !existingIds.has(g.id));
                      return [...unique, ...prev];
                  });
              }

              alert("Importação concluída.");
          } catch (err) {
              alert("Erro ao ler arquivo.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  // Sandbox Mode
  const handleOpenSandbox = () => {
      const sandboxStudy: Study = {
          id: 'sandbox',
          title: "",
          tolerance: 0,
          currentMotions: [],
          proposedMotions: [],
          roi: { costMin: 0, volume: 0, invest: 0 },
          updatedAt: Date.now()
      };
      setEditorData(sandboxStudy);
      setView('sandbox');
      setActiveTab('current');
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-sans overflow-hidden print:h-auto print:overflow-visible transition-colors duration-300">
        {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
        {confirmDeleteId && <ConfirmModal isOpen={true} message="Tem certeza?" onConfirm={() => handleDeleteStudy(confirmDeleteId)} onCancel={() => setConfirmDeleteId(null)} />}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />

        {view === 'dashboard' && (
            <div className="flex h-full animate-in fade-in duration-500 relative print:hidden">
                <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-20">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-start gap-3">
                         <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-red-500/20">T</div>
                         <div><h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">TMU Studio</h1><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRO EDITION</span></div>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <button onClick={() => setDashView('list')} className={`w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl font-bold transition-all ${dashView === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><LayoutDashboard size={20} /> Dashboard</button>
                         <button onClick={() => setDashView('reference')} className={`w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl font-bold transition-all ${dashView === 'reference' ? 'bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><BookOpen size={20} /> Tabela MTM-1</button>
                         <button onClick={() => setView('groupManager')} className={`w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl font-bold transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800`}><FolderOpen size={20} /> Operações Padrão</button>
                        <button onClick={handleCreateNew} className="w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 mt-4"><Plus size={20} /> Novo Estudo</button>

                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="px-3 text-xs font-bold text-slate-400 uppercase mb-2">Dados</p>
                            <button onClick={handleExportJSON} className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Download size={16}/> Exportar Backup</button>
                            <button onClick={handleImportClick} className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Upload size={16}/> Importar Backup</button>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4"><p className="px-3 text-xs font-bold text-slate-400 uppercase mb-2">Recentes</p>{studies.slice(0, 5).map(s => (<button key={s.id} onClick={() => handleOpenStudy(s.id)} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors truncate">{s.title}</button>))}</div>
                    </nav>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
                        <button onClick={() => setShowTutorial(true)} className="flex items-center justify-start gap-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"><HelpCircle size={18} /> Ajuda</button>
                    </div>
                </aside>
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 lg:pb-8 flex flex-col">
                    {dashView === 'list' ? (
                        <>
                            <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4 shrink-0">
                                <div><h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Painel de Estudos</h2><p className="text-slate-500 dark:text-slate-400">Gestão e análise de produtividade.</p></div>
                                <div className="text-left sm:text-right bg-white dark:bg-slate-900 sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-none border-slate-100 dark:border-slate-800 shadow-sm sm:shadow-none"><p className="text-sm font-bold text-slate-400 uppercase">Economia Total (Mês)</p><p className="text-2xl font-bold text-emerald-600">{totalSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                            </header>

                            {/* Sandbox Link */}
                            <div className="mb-8">
                                <button onClick={handleOpenSandbox} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white text-left relative overflow-hidden group">
                                    <Zap className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 text-white opacity-20 group-hover:scale-110 transition-transform"/>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><MonitorPlay/> Simulador Rápido</h3>
                                    <p className="text-purple-100 max-w-xl">Acesse o editor para cálculos rápidos sem salvar no banco de dados. Ideal para testes e orçamentos.</p>
                                </button>
                            </div>

                            {studies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-80 sm:h-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed text-center p-6"><div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4"><LayoutDashboard className="w-12 h-12 text-slate-300 dark:text-slate-600" /></div><h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Nenhum estudo encontrado</h3><button onClick={handleCreateNew} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors mt-4">Criar Estudo</button></div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left min-w-[600px]"><thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 font-bold"><tr><th className="px-6 py-4">Título</th><th className="px-6 py-4 text-center">Data</th><th className="px-6 py-4 text-center">Atual (min)</th><th className="px-6 py-4 text-center">Proposto (min)</th><th className="px-6 py-4 text-center">Ganho</th><th className="px-6 py-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{studies.map(study => { const factor = 1 + (study.tolerance / 100); const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor; const c = calc(study.currentMotions); const p = calc(study.proposedMotions); const gain = c > 0 ? ((c - p) / c) * 100 : 0; return (<tr key={study.id} onClick={() => handleOpenStudy(study.id)} className="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"><td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{study.title}</td><td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 text-sm">{new Date(study.updatedAt).toLocaleDateString()}</td><td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-300">{c.toFixed(3)}</td><td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-300">{p.toFixed(3)}</td><td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-bold ${gain > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{gain > 0 ? `-${gain.toFixed(1)}%` : '-'}</span></td><td className="px-6 py-4 text-right"><button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(study.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={16} /></button></td></tr>); })}</tbody></table></div></div>
                            )}
                        </>
                    ) : ( <MTMReferenceTable /> )}
                </main>
            </div>
        )}

        {(view === 'editor' || view === 'sandbox') && editorData && (
            <Editor
                data={editorData}
                setData={setEditorData}
                onSave={handleSaveEditor}
                onBack={() => setView('dashboard')}
                onOpenSimulation={() => setView('simulation')}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                wizardOpen={wizardOpen}
                setWizardOpen={setWizardOpen}
                aiModalOpen={aiModalOpen}
                setAiModalOpen={setAiModalOpen}
                onPrint={() => window.print()}
                isSandbox={view === 'sandbox'}
                motionGroups={motionGroups}
            />
        )}

        {view === 'simulation' && editorData && (
            <Simulation study={editorData} onUpdateStudy={(updated) => { setEditorData(updated); if(view !== 'sandbox') handleSaveEditor(updated); }} onBack={() => setView(view === 'sandbox' ? 'sandbox' : 'editor')} />
        )}

        {view === 'groupManager' && (
            <MotionGroupManager
                groups={motionGroups}
                setGroups={setMotionGroups}
                onBack={() => setView('dashboard')}
            />
        )}
    </div>
  );
}
