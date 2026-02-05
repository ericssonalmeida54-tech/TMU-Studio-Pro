// ... (imports remain the same)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, Plus, Table2, Trash2, ArrowLeft, Settings2, Wand2,
  Calculator, Info, CheckCircle, Hand, Grab, Fingerprint, Crosshair,
  LogOut, Minimize2, RotateCw, ArrowDownToLine, Eye, Footprints,
  X, Bot, PlusCircle, HelpCircle, Printer, DollarSign,
  Menu, PanelRightClose, PanelRightOpen, Scissors, ChevronUp,
  ChevronDown, BookOpen, Target, Scale, HelpCircle as HelpIcon,
  MonitorPlay, Moon, Sun, Award, FileText, Activity, Download, Upload, FileSpreadsheet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Pie, PieChart as RePieChart
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { parseCode, REACH_BASE, MOVE_BASE, STAT, POS_DATA, TURN_DATA, DIS_DATA } from './utils/mtmLogic';
import { analyzeErgonomics } from './utils/ergonomics';
import type { Study, Motion } from './types/types';
import { Simulation } from './components/Simulation';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="flex gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg h-fit text-blue-600 dark:text-blue-400 shrink-0"><LayoutDashboard size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Biblioteca</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie todos os seus estudos e veja o resumo de ganhos.</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg h-fit text-emerald-600 dark:text-emerald-400 shrink-0"><Calculator size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Cálculo de ROI</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Comparação automática entre método atual e proposto.</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg h-fit text-purple-600 dark:text-purple-400 shrink-0"><Bot size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Assistente IA</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Descreva a operação em texto ou voz para gerar códigos automaticamente.</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg h-fit text-orange-600 dark:text-orange-400 shrink-0"><Table2 size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Tabela de Referência</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Acesse a tabela MTM completa diretamente no Dashboard.</p>
            </div>
        </div>
      </div>

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

const AIModal = ({ onClose, onApply }: { onClose: () => void, onApply: (motions: Motion[]) => void }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemPrompt = `You are an expert in MTM-1 (Methods-Time Measurement). Convert the user's operation description into a JSON array of motions. Output JSON format: [{ "code": "R30A", "desc": "Reach 30cm to object", "freq": 1, "hand": "D" }]. Guidelines: Use standard MTM-1 codes. Estimate distances if not provided (default 30cm). 'hand' should be 'E' (Left), 'D' (Right), or 'C' (Body). 'freq' is frequency count.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { systemInstruction: systemPrompt, responseMimeType: "application/json" }
            });
            const text = response.text;
            if (!text) throw new Error("No output generated");
            let result = JSON.parse(text);
            if (!Array.isArray(result) && result.motions) result = result.motions;
            if (!Array.isArray(result)) throw new Error("Invalid output format");
            const validMotions: Motion[] = result.map((m: any) => {
                const p = parseCode(m.code);
                return {
                    code: p.v ? m.code.toUpperCase() : "R30A",
                    tmu: p.v ? p.t : 9.5,
                    desc: m.desc || p.d,
                    freq: m.freq || 1,
                    hand: (['E','D','C'].includes(m.hand)) ? m.hand : 'D'
                };
            });
            onApply(validMotions);
        } catch (err) {
            console.error(err);
            setError("Falha ao gerar códigos. Verifique sua conexão ou tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative border border-slate-200 dark:border-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-500/30"><Bot size={24} /></div>
                    <div><h3 className="text-xl font-bold text-slate-800 dark:text-white">Assistente IA</h3><p className="text-sm text-slate-500 dark:text-slate-400">Descreva a operação para gerar a sequência MTM.</p></div>
                </div>
                <div className="mb-4">
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Pegar uma arruela..." className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-700 dark:text-slate-200 font-medium" autoFocus />
                    {error && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><Info size={12}/> {error}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg">{loading ? <RotateCw className="animate-spin" size={18}/> : <Wand2 size={18}/>}{loading ? 'Processando...' : 'Gerar Códigos'}</button>
                </div>
            </div>
        </div>
    );
};

const HelpTip = ({ content }: { content: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const toggle = (e: React.MouseEvent) => { e.stopPropagation(); if (!show && btnRef.current) { const rect = btnRef.current.getBoundingClientRect(); setPos({ top: rect.top - 8, left: rect.left + (rect.width / 2) }); } setShow(!show); };
    return ( <> <button ref={btnRef} type="button" onClick={toggle} className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none ml-1 align-middle inline-flex" title="Ver exemplo"><HelpIcon size={14} /></button> {show && ( <div className="fixed inset-0 z-[100] cursor-default" onClick={(e) => { e.stopPropagation(); setShow(false); }}> <div className="absolute bg-slate-800 text-white text-xs p-3 rounded-xl shadow-2xl max-w-[220px] text-center animate-in fade-in zoom-in-95 duration-200 border border-slate-700 pointer-events-none" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}> {content} <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div> </div> </div> )} </> );
};

const MTMReferenceTable = () => {
    const [tab, setTab] = useState<'R'|'M'|'T'|'G'|'P'>('R');

    const renderTable = () => {
        if (tab === 'R') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                            <tr><th className="px-4 py-2">Dist (cm)</th><th>A</th><th>B</th><th>C/D</th><th>E</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {Object.entries(REACH_BASE).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                                <tr key={k} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-2 font-bold">{k}</td>
                                    <td>{v[0]}</td><td>{v[1]}</td><td>{v[2]}</td><td>{v[4]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (tab === 'M') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                            <tr><th className="px-4 py-2">Dist (cm)</th><th>A</th><th>B</th><th>C</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {Object.entries(MOVE_BASE).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                                <tr key={k} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-2 font-bold">{k}</td>
                                    <td>{v[0]}</td><td>{v[1]}</td><td>{v[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (tab === 'T') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                            <tr><th className="px-4 py-2">Graus (°)</th><th>S (Pequena)</th><th>M (Média)</th><th>L (Grande)</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {Object.entries(TURN_DATA).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                                <tr key={k} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-2 font-bold">{k}</td>
                                    <td>{v[0]}</td><td>{v[1]}</td><td>{v[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (tab === 'P') {
             return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold mb-2 text-slate-700 dark:text-slate-300">Posicionar (P)</h4>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400"><tr><th className="px-4 py-2">Código</th><th>TMU (E)</th><th>TMU (D)</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Object.entries(POS_DATA).map(([k, v]: any) => (
                                    <tr key={k}><td className="px-4 py-2 font-bold">{k}</td><td>{v.E}</td><td>{v.D}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-slate-700 dark:text-slate-300">Separar (D)</h4>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400"><tr><th className="px-4 py-2">Classe</th><th>TMU (E)</th><th>TMU (D)</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Object.entries(DIS_DATA).map(([k, v]: any) => (
                                    <tr key={k}><td className="px-4 py-2 font-bold">D{k}</td><td>{v.E}</td><td>{v.D}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             )
        }
        // G/RL/Other Static
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['G', 'RL', 'AP', 'E', 'B', 'W'].map(prefix => (
                    <div key={prefix} className="mb-4">
                        <h4 className="font-bold mb-2 text-slate-700 dark:text-slate-300 border-b dark:border-slate-700 pb-1">
                            {prefix === 'G' ? 'Pegar (Grasp)' : prefix === 'RL' ? 'Soltar (Release)' : prefix === 'AP' ? 'Força (Apply Pressure)' : prefix === 'E' ? 'Olhos (Eye)' : 'Corpo (Body)'}
                        </h4>
                        <table className="w-full text-xs text-left">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Object.entries(STAT).filter(([k]) => k.startsWith(prefix) || (prefix === 'B' && !k.startsWith('G') && !k.startsWith('RL') && !k.startsWith('AP') && !k.startsWith('E') && !k.startsWith('W') && k !== 'FMP' && k !== 'FM') || (prefix === 'W' && k.startsWith('W'))).map(([k, v]) => (
                                    <tr key={k}><td className="px-2 py-1 font-bold font-mono text-slate-600 dark:text-slate-400">{k}</td><td className="px-2 py-1">{v.d}</td><td className="px-2 py-1 text-right font-bold">{v.t}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 bg-white dark:bg-slate-900 p-6 sm:p-8 overflow-y-auto animate-in fade-in flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><BookOpen className="text-red-600"/> Tabela MTM-1 (Referência)</h2>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                {[
                    {id: 'R', l: 'Alcançar (R)'}, {id: 'M', l: 'Mover (M)'},
                    {id: 'T', l: 'Girar (T)'}, {id: 'P', l: 'Posicionar (P/D)'},
                    {id: 'G', l: 'Outros (G/RL/Corpo)'}
                ].map(x => (
                    <button
                        key={x.id}
                        onClick={() => setTab(x.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${tab === x.id ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        {x.l}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {renderTable()}
            </div>
        </div>
    );
}

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor' | 'simulation'>('dashboard');
  const [studies, setStudies] = useState<Study[]>([]);
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

  useEffect(() => { const saved = localStorage.getItem('tmu_pro_data'); if (saved) setStudies(JSON.parse(saved)); else setShowTutorial(true); if (window.innerWidth < 1024) setWizardOpen(false); }, []);
  useEffect(() => { localStorage.setItem('tmu_pro_data', JSON.stringify(studies)); }, [studies]);

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
  const handleSaveEditor = (dataToSave?: Study) => { const data = dataToSave || editorData; if (!data || !currentId) return; const updated = { ...data, updatedAt: Date.now() }; setStudies(prev => prev.map(s => s.id === currentId ? updated : s)); };
  const handleDeleteStudy = (id: string) => { setStudies(prev => prev.filter(s => s.id !== id)); if (currentId === id) { setView('dashboard'); setCurrentId(null); } setConfirmDeleteId(null); };
  const totalSavings = useMemo(() => { return studies.reduce((acc, study) => { const factor = 1 + (study.tolerance / 100); const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor; const cur = calc(study.currentMotions); const pro = calc(study.proposedMotions); const saving = Math.max(0, cur - pro); return acc + (saving * study.roi.costMin * study.roi.volume * (study.roi.daysPerMonth || 22)); }, 0); }, [studies]);

  const handleExportJSON = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studies));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "tmu_studio_backup_" + new Date().toISOString().split('T')[0] + ".json");
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
              if (Array.isArray(imported)) {
                  setStudies(prev => {
                      const existingIds = new Set(prev.map(s => s.id));
                      const newStudies = imported.filter((s: Study) => !existingIds.has(s.id));
                      return [...newStudies, ...prev];
                  });
                  alert(`${imported.length} estudos verificados. Importação concluída.`);
              }
          } catch (err) {
              alert("Erro ao ler arquivo. Certifique-se que é um backup válido.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
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

        {view === 'editor' && editorData && (
            <Editor data={editorData} setData={setEditorData} onSave={handleSaveEditor} onBack={() => setView('dashboard')} onOpenSimulation={() => setView('simulation')} activeTab={activeTab} setActiveTab={setActiveTab} wizardOpen={wizardOpen} setWizardOpen={setWizardOpen} aiModalOpen={aiModalOpen} setAiModalOpen={setAiModalOpen} onPrint={() => window.print()} />
        )}

        {view === 'simulation' && editorData && (
            <Simulation study={editorData} onUpdateStudy={(updated) => { setEditorData(updated); handleSaveEditor(updated); }} onBack={() => setView('editor')} />
        )}
    </div>
  );
}

function Editor({ data, setData, onSave, onBack, onOpenSimulation, activeTab, setActiveTab, wizardOpen, setWizardOpen, aiModalOpen, setAiModalOpen, onPrint }: any) {
    useEffect(() => { const t = setTimeout(() => { onSave(); }, 1000); return () => clearTimeout(t); }, [data]);

    const activeMotions = activeTab === 'current' ? data.currentMotions : data.proposedMotions;
    const factor = 1 + (data.tolerance / 100);
    const totalTMU = activeMotions.reduce((acc: number, m: Motion) => acc + (m.tmu * (m.freq || 1)), 0);
    const totalMin = totalTMU * 0.0006 * factor;

    // Calculation Logic
    const calcTotal = (arr: Motion[]) => arr.reduce((s,m)=> s + (m.tmu * (m.freq || 1)), 0);
    const curMin = calcTotal(data.currentMotions) * 0.0006 * factor;
    const proMin = calcTotal(data.proposedMotions) * 0.0006 * factor;
    const saving = Math.max(0, curMin - proMin);

    const roi = data.roi || { costMin: 0.50, volume: 100, invest: 0, daysPerMonth: 22, minutesPerHour: 60 };
    const monthlySave = saving * roi.costMin * roi.volume * (roi.daysPerMonth || 22);
    const payback = monthlySave > 0 ? (roi.invest || 0) / monthlySave : 0;

    // Productivity Calculation (Pieces/Hour)
    const minutesPerHour = roi.minutesPerHour || 60;
    const curPcsH = curMin > 0 ? minutesPerHour / curMin : 0;
    const proPcsH = proMin > 0 ? minutesPerHour / proMin : 0;
    const prodIncrease = curPcsH > 0 ? ((proPcsH - curPcsH) / curPcsH) * 100 : 0;

    const handleAddMotion = (motion: Motion) => {
        const newList = [...activeMotions, motion];
        if (activeTab === 'current') setData({ ...data, currentMotions: newList }); else setData({ ...data, proposedMotions: newList });
    };
    const handleRemoveMotion = (idx: number) => {
        const newList = activeMotions.filter((_: any, i: number) => i !== idx);
        if (activeTab === 'current') setData({ ...data, currentMotions: newList }); else setData({ ...data, proposedMotions: newList });
    };
    const handleMoveMotion = (index: number, direction: 'up' | 'down') => {
        const list = [...activeMotions];
        if (direction === 'up' && index > 0) { [list[index], list[index - 1]] = [list[index - 1], list[index]]; }
        else if (direction === 'down' && index < list.length - 1) { [list[index], list[index + 1]] = [list[index + 1], list[index]]; }
        if (activeTab === 'current') setData({ ...data, currentMotions: list }); else setData({ ...data, proposedMotions: list });
    };

    const handleExportCSV = () => {
        const headers = ["Index", "Code", "Description", "Frequency", "TMU", "Hand"];
        const rows = activeMotions.map((m: Motion, i: number) => [
            i + 1, m.code, m.desc, m.freq, m.tmu, m.hand
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `tmu_analysis_${data.title}_${activeTab}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300 print:h-auto print:overflow-visible relative">
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 z-30 shrink-0 print:hidden">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors shrink-0"><ArrowLeft size={20}/></button>
                    <input value={data.title} onChange={(e) => setData({...data, title: e.target.value})} className="font-bold text-base sm:text-lg text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-slate-300 w-full outline-none truncate" placeholder="Nome da Operação..." />
                    <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shrink-0"><CheckCircle size={10} className="text-emerald-500"/> Salvo</div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button onClick={handleExportCSV} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors" title="Exportar CSV"><FileSpreadsheet size={16}/> <span className="hidden sm:inline">CSV</span></button>
                    <button onClick={onPrint} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"><Printer size={16}/> <span className="hidden sm:inline">Imprimir</span></button>
                    <button onClick={onOpenSimulation} className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-purple-500/20"><MonitorPlay size={16}/> <span className="hidden sm:inline">Simular</span></button>
                    <button onClick={() => setActiveTab('results')} className="p-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"><Calculator size={16}/> <span className="hidden sm:inline">Resultados</span></button>
                </div>
            </header>

            {/* FULL REPORT PRINT VIEW (Keep light mode for print) */}
            <div className="hidden print:block fixed inset-0 z-[100] bg-white text-black p-8 overflow-visible h-auto">
                <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-8">
                    <div><h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Relatório de Análise Operacional</h1><p className="text-sm text-slate-600 mt-1">Método MTM-1 (Methods-Time Measurement)</p></div>
                    <div className="text-right"><p className="text-xs text-slate-500 uppercase">Data de Emissão</p><p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div><p className="text-xs text-slate-500 uppercase mb-1">Operação</p><p className="font-bold text-lg text-slate-900">{data.title || 'Sem Título'}</p></div>
                    <div><p className="text-xs text-slate-500 uppercase mb-1">Analista Responsável</p><p className="font-bold text-lg text-slate-900">{data.analyst || 'Não Informado'}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 break-inside-avoid"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Método Atual</p><p className="text-2xl font-mono font-bold text-slate-700">{curMin.toFixed(3)} <span className="text-sm text-slate-400">min</span></p></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 break-inside-avoid"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Método Proposto</p><p className="text-2xl font-mono font-bold text-slate-700">{proMin.toFixed(3)} <span className="text-sm text-slate-400">min</span></p></div>
                    <div className={`p-4 rounded-xl border break-inside-avoid ${saving > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}><p className={`text-xs font-bold uppercase mb-1 ${saving > 0 ? 'text-emerald-600' : 'text-red-600'}`}>Aumento Produtividade</p><p className={`text-2xl font-mono font-bold ${saving > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{prodIncrease.toFixed(1)}%</p></div>
                </div>
                {/* ... (Rest of print view same as before, ensures light mode) */}
                 <div className="grid grid-cols-4 gap-4 mb-8 break-inside-avoid">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200"><p className="text-[10px] font-bold text-slate-400 uppercase">Redução de Tempo</p><p className="text-lg font-bold text-slate-800">{(curMin - proMin).toFixed(3)} min</p></div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200"><p className="text-[10px] font-bold text-slate-400 uppercase">Horas Ganhas/Ano</p><p className="text-lg font-bold text-slate-800">{((curMin - proMin) * roi.volume * (roi.daysPerMonth || 22) * 12 / 60).toFixed(1)} h</p></div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200"><p className="text-[10px] font-bold text-slate-400 uppercase">Peças/Hora (Novo)</p><p className="text-lg font-bold text-slate-800">{proPcsH.toFixed(0)}</p></div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200"><p className="text-[10px] font-bold text-slate-400 uppercase">Retorno (Payback)</p><p className="text-lg font-bold text-slate-800">{(roi.invest || 0) > 0 ? `${payback.toFixed(1)} meses` : '-'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Detalhamento: Atual</h3>
                        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 border-b border-slate-300"><th className="p-2 text-left">#</th><th className="p-2 text-left">Cód</th><th className="p-2 text-left">Desc</th><th className="p-2 text-right">TMU</th></tr></thead><tbody>{data.currentMotions.map((m: Motion, i: number) => (<tr key={i} className="border-b border-slate-100 break-inside-avoid"><td className="p-2 font-bold text-slate-500">{i+1}</td><td className="p-2 font-mono font-bold">{m.code}</td><td className="p-2 truncate max-w-[150px]">{m.desc}</td><td className="p-2 text-right font-mono">{(m.tmu * (m.freq||1)).toFixed(1)}</td></tr>))}</tbody></table>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Detalhamento: Proposto</h3>
                        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 border-b border-slate-300"><th className="p-2 text-left">#</th><th className="p-2 text-left">Cód</th><th className="p-2 text-left">Desc</th><th className="p-2 text-right">TMU</th></tr></thead><tbody>{data.proposedMotions.map((m: Motion, i: number) => (<tr key={i} className="border-b border-slate-100 break-inside-avoid"><td className="p-2 font-bold text-slate-500">{i+1}</td><td className="p-2 font-mono font-bold">{m.code}</td><td className="p-2 truncate max-w-[150px]">{m.desc}</td><td className="p-2 text-right font-mono">{(m.tmu * (m.freq||1)).toFixed(1)}</td></tr>))}</tbody></table>
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 break-inside-avoid mb-8">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Projeção Financeira</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div><span className="block text-slate-400 text-xs uppercase">Custo Minuto</span> <strong>R$ {roi.costMin.toFixed(2)}</strong></div>
                        <div><span className="block text-slate-400 text-xs uppercase">Volume/Dia</span> <strong>{roi.volume}</strong></div>
                        <div><span className="block text-slate-400 text-xs uppercase">Dias/Mês</span> <strong>{roi.daysPerMonth || 22}</strong></div>
                        <div><span className="block text-slate-400 text-xs uppercase">Economia/Mês</span> <strong className="text-emerald-600">R$ {monthlySave.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></div>
                    </div>
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 text-center border-t border-slate-200 bg-white"><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Desenvolvido por CSSN</p></div>
            </div>

            <div className="flex-1 flex flex-col print:hidden overflow-hidden">
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-start sm:justify-center shrink-0 shadow-sm z-20 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings2 size={18}/>} />
                    <TabButton active={activeTab === 'current'} onClick={() => setActiveTab('current')} label="1. Atual" />
                    <TabButton active={activeTab === 'proposed'} onClick={() => setActiveTab('proposed')} label="2. Proposto" />
                    <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="3. Resultados" />
                </div>
                <div className="flex-1 flex overflow-hidden relative">
                    {activeTab === 'config' && (
                        <div className="flex-1 p-4 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><Settings2 className="text-red-600"/> Configurações</h2>
                                <div className="space-y-6">
                                    <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome do Analista</label><input value={data.analyst || ''} onChange={(e) => setData({...data, analyst: e.target.value})} placeholder="Ex: João Silva" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 ring-red-500 font-medium outline-none text-slate-900 dark:text-white" /></div>
                                    <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tolerância (%)</label><div className="flex items-center gap-4"><input type="range" min="0" max="30" step="0.5" value={data.tolerance} onChange={(e) => setData({...data, tolerance: parseFloat(e.target.value)})} className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-red-600" /><span className="font-mono font-bold text-xl w-16 text-right text-slate-800 dark:text-white">{data.tolerance}%</span></div></div>
                                    <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dias por Mês (Base de Cálculo)</label><input type="number" value={roi.daysPerMonth || 22} onChange={(e) => setData({...data, roi: {...roi, daysPerMonth: parseFloat(e.target.value)}})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 ring-red-500 font-mono font-bold outline-none text-slate-900 dark:text-white" /></div>
                                    <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Minutos Produtivos por Hora</label><input type="number" value={roi.minutesPerHour ?? 60} onChange={(e) => setData({...data, roi: {...roi, minutesPerHour: parseFloat(e.target.value)}})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 ring-red-500 font-mono font-bold outline-none text-slate-900 dark:text-white" /></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {(activeTab === 'current' || activeTab === 'proposed') && (
                        <>
                            <div className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
                                    <div className="flex gap-2 sm:gap-4 text-xs font-medium">
                                        <div className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:gap-1"><span>Min (+{data.tolerance}%):</span> <strong className="text-slate-900 dark:text-white">{totalMin.toFixed(3)}</strong></div>
                                        <div className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hidden sm:flex gap-1"><span>TMU Base:</span> <strong className="text-slate-900 dark:text-white">{totalTMU.toFixed(1)}</strong></div>
                                    </div>
                                    <button onClick={() => setWizardOpen(!wizardOpen)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${wizardOpen ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`} title="Assistente"><Wand2 size={16}/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 sm:p-4 pb-48 sm:pb-32">{activeMotions.length === 0 ? (<div className="h-full flex flex-col items-center justify-center opacity-40"><Hand size={48} className="mb-4 text-slate-400" /><p className="text-center px-4 text-slate-500">Adicione movimentos usando a barra abaixo ou o Assistente.</p></div>) : (<div className="max-w-3xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">{activeMotions.map((m: Motion, i: number) => (<MotionCard key={i} motion={m} index={i} onDelete={() => handleRemoveMotion(i)} onMoveUp={() => handleMoveMotion(i, 'up')} onMoveDown={() => handleMoveMotion(i, 'down')}/>))}</div>)}</div>
                                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 z-20 flex justify-center shadow-sm"><div className="w-full max-w-3xl flex flex-col sm:flex-row gap-2"><button onClick={() => setAiModalOpen(true)} className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Bot size={24} /> <span className="sm:hidden font-bold">Assistente IA</span></button><ManualInput onAdd={handleAddMotion} /></div></div>
                            </div>
                            <div className={`${wizardOpen ? 'fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-auto w-full lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none fixed right-0'} transition-all duration-300 bg-white dark:bg-slate-900 ${wizardOpen ? 'border-l border-slate-200 dark:border-slate-800' : 'border-none'} flex flex-col shadow-2xl lg:shadow-none`}><div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0"><h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Wand2 size={16} className="text-red-600"/> Assistente Visual</h3><button onClick={() => setWizardOpen(false)} className="lg:hidden p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white"><X size={20}/></button></div><div className="flex-1 overflow-y-auto"><Wizard onAdd={handleAddMotion} /></div></div>
                        </>
                    )}
                    {activeTab === 'results' && <ResultsView data={data} setData={setData} />}
                </div>
            </div>
            {aiModalOpen && <AIModal onClose={() => setAiModalOpen(false)} onApply={(motions) => { const newList = [...activeMotions, ...motions]; if (activeTab === 'current') setData({ ...data, currentMotions: newList }); else setData({ ...data, proposedMotions: newList }); setAiModalOpen(false); }} />}
        </div>
    );
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon?: React.ReactNode, label?: string }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
  >
    {icon} {label}
  </button>
);

const MotionCard = ({ motion, index, onDelete, onMoveUp, onMoveDown }: { motion: Motion, index: number, onDelete: () => void, onMoveUp: () => void, onMoveDown: () => void }) => {
    let containerClass = "w-3/4 flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all group relative fade-in mb-1";
    let badgeColor = "bg-slate-500";
    let typeLabel = "CORPO";

    if (motion.hand === 'E') {
        containerClass += " mr-auto bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30";
        badgeColor = "bg-blue-500";
        typeLabel = "ESQ";
    } else if (motion.hand === 'D') {
        containerClass += " ml-auto bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30";
        badgeColor = "bg-red-500";
        typeLabel = "DIR";
    } else {
        containerClass += " mx-auto bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-center w-[95%]";
        badgeColor = "bg-slate-500";
        typeLabel = "CORPO";
    }

  return (
    <div className={containerClass}>
        <div className={`flex items-center gap-3 ${motion.hand === 'C' ? 'justify-center w-full' : ''}`}>
            <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-md text-white ${badgeColor} shrink-0`}>{index + 1}</span>
            <div className={motion.hand === 'C' ? 'flex flex-col items-center' : ''}>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{motion.desc}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2 justify-center">
                    <span className="font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/30 px-1 rounded border border-slate-200/50 dark:border-slate-700">{typeLabel}</span>
                    <span>{motion.code}</span>
                    {motion.freq > 1 && <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded font-bold ml-1">{motion.freq}x</span>}
                </div>
            </div>
        </div>

        <div className={`flex items-center gap-2 ${motion.hand === 'C' ? 'absolute right-4' : ''}`}>
            <div className="text-right mr-2">
                <span className="font-mono text-slate-600 dark:text-slate-300 font-bold block">{(motion.tmu * (motion.freq || 1)).toFixed(1)}</span>
            </div>

            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onMoveUp} className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ChevronUp size={14}/></button>
                <button onClick={onMoveDown} className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ChevronDown size={14}/></button>
            </div>

            <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
            </button>
        </div>
    </div>
  );
};

const ManualInput = ({ onAdd }: { onAdd: (m: Motion) => void }) => {
    const [val, setVal] = useState("");
    const [error, setError] = useState(false);
    const [freq, setFreq] = useState(1);
    const [hand, setHand] = useState<'E'|'D'>('D');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const p = parseCode(val);
        if (p.v) {
            onAdd({
                code: val.toUpperCase(),
                tmu: p.t,
                desc: p.d,
                freq: freq,
                hand: p.type === 'body' ? 'C' : hand
            });
            setVal("");
            setFreq(1);
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex-1 relative flex items-center gap-2">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full overflow-hidden focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                <div className="bg-slate-100 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600 px-2 py-1 flex flex-col items-center justify-center w-14 shrink-0">
                    <span className="text-[10px] text-slate-400 dark:text-slate-300 font-bold uppercase">Qtd</span>
                    <input type="number" min="1" value={freq} onChange={e => setFreq(parseInt(e.target.value))} className="w-full bg-transparent text-center font-bold text-sm outline-none text-slate-700 dark:text-white p-0" />
                </div>

                <div className="flex border-r border-slate-200 dark:border-slate-600 shrink-0">
                    <button type="button" onClick={() => setHand('E')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors border-r border-slate-100 dark:border-slate-600 ${hand === 'E' ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>E</button>
                    <button type="button" onClick={() => setHand('D')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors ${hand === 'D' ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>D</button>
                </div>

                <input
                    value={val}
                    onChange={(e) => setVal(e.target.value.toUpperCase())}
                    placeholder={error ? "Inválido" : "Código..."}
                    className={`w-full h-full pl-4 pr-12 py-3 bg-transparent border-none text-sm font-mono uppercase outline-none text-slate-800 dark:text-white ${error ? 'placeholder-red-400' : 'placeholder-slate-400'}`}
                />
            </div>

            <button type="submit" className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-slate-600 dark:text-slate-200 transition-colors">
                <ArrowDownToLine size={20} />
            </button>
        </form>
    );
};

const ResultsView = ({ data, setData }: { data: Study, setData: (d: Study) => void }) => {
    const factor = 1 + (data.tolerance / 100);
    const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor;
    const c = calc(data.currentMotions);
    const p = calc(data.proposedMotions);

    const safeC = isNaN(c) ? 0 : c;
    const safeP = isNaN(p) ? 0 : p;

    const saving = Math.max(0, safeC - safeP);

    const roi = data.roi || { costMin: 0.50, volume: 100, invest: 0, daysPerMonth: 22, minutesPerHour: 60 };
    const monthlySave = saving * roi.costMin * roi.volume * (roi.daysPerMonth || 22);
    const payback = monthlySave > 0 ? (roi.invest || 0) / monthlySave : 0;

    const minutesPerHour = roi.minutesPerHour || 60;
    const curPcsH = safeC > 0 ? minutesPerHour / safeC : 0;
    const proPcsH = safeP > 0 ? minutesPerHour / safeP : 0;
    const prodIncrease = curPcsH > 0 ? ((proPcsH - curPcsH) / curPcsH) * 100 : 0;

    const chartData = [ { name: 'Atual', time: parseFloat(safeC.toFixed(3)), fill: '#64748b' }, { name: 'Proposto', time: parseFloat(safeP.toFixed(3)), fill: '#dc2626' }, ];

    const getLimbData = (motions: Motion[]) => {
        const counts = { E: 0, D: 0, C: 0 };
        motions.forEach(m => { if (counts[m.hand] !== undefined) counts[m.hand] += (m.tmu * (m.freq || 1)); });
        return [ { name: 'Esquerda', value: counts.E, fill: '#3b82f6' }, { name: 'Direita', value: counts.D, fill: '#ef4444' }, { name: 'Corpo', value: counts.C, fill: '#64748b' } ].filter(x => x.value > 0);
    };
    const limbDataCurrent = getLimbData(data.currentMotions);
    const limbDataProposed = getLimbData(data.proposedMotions);

    const countRisks = (motions: Motion[]) => {
        let high = 0, medium = 0;
        motions.forEach(m => {
            const res = analyzeErgonomics(m);
            if (res.riskLevel === 'High') high++;
            if (res.riskLevel === 'Medium') medium++;
        });
        return { high, medium };
    };
    const curRisks = countRisks(data.currentMotions);
    const proRisks = countRisks(data.proposedMotions);

    return (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Tempo Atual</p><p className="text-3xl font-mono font-bold text-slate-700 dark:text-slate-200">{safeC.toFixed(3)} <span className="text-sm">min</span></p></div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Tempo Proposto</p><p className="text-3xl font-mono font-bold text-slate-700 dark:text-slate-200">{safeP.toFixed(3)} <span className="text-sm">min</span></p></div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${prodIncrease > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><p className="text-xs font-bold text-slate-400 uppercase mb-2">Aumento Produtividade</p><p className={`text-3xl font-mono font-bold ${prodIncrease > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{prodIncrease.toFixed(1)}%</p></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-80"><h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Comparativo de Tempo</h3><div className="flex-1 w-full min-h-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top: 20, right: 30, left: 0, bottom: 5}}><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(3)} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}} itemStyle={{color: '#fff'}} labelStyle={{color: '#94a3b8'}} /><Bar dataKey="time" radius={[6, 6, 0, 0]} barSize={50} animationDuration={1000}>{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart></ResponsiveContainer></div></div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-80"><h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Hand className="w-4 h-4"/> Uso dos Membros (Atual vs Proposto)</h3><div className="flex-1 w-full min-h-0 flex"><div className="flex-1"><p className="text-center text-xs font-bold text-slate-400 mb-2">Atual</p><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={limbDataCurrent} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} stroke="none">{limbDataCurrent.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Pie><Tooltip contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}}/></RePieChart></ResponsiveContainer></div><div className="flex-1"><p className="text-center text-xs font-bold text-slate-400 mb-2">Proposto</p><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={limbDataProposed} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} stroke="none">{limbDataProposed.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Pie><Tooltip contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}}/></RePieChart></ResponsiveContainer></div></div></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                         <h3 className="font-bold text-slate-700 dark:text-white mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500"/> Análise Ergonômica</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">Atual</p>
                                <div className="flex justify-around">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-red-500">{curRisks.high}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Alto Risco</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-orange-500">{curRisks.medium}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Médio Risco</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">Proposto</p>
                                <div className="flex justify-around">
                                    <div className="text-center">
                                        <span className={`block text-2xl font-bold ${proRisks.high < curRisks.high ? 'text-emerald-500' : 'text-red-500'}`}>{proRisks.high}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Alto Risco</span>
                                    </div>
                                    <div className="text-center">
                                        <span className={`block text-2xl font-bold ${proRisks.medium < curRisks.medium ? 'text-emerald-500' : 'text-orange-500'}`}>{proRisks.medium}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Médio Risco</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                         <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-600 dark:text-blue-300 flex items-center gap-2">
                            <Info size={16} className="shrink-0"/>
                            <span>Redução de riscos ergonômicos melhora a qualidade de vida e reduz fadiga.</span>
                         </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><h3 className="font-bold text-slate-700 dark:text-white mb-6 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Calculadora ROI</h3><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Custo Minuto (R$)</label><input type="number" step="0.01" value={roi.costMin} onChange={(e) => setData({...data, roi: {...roi, costMin: parseFloat(e.target.value)}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold text-slate-700 dark:text-white focus:ring-2 ring-red-500 outline-none" /></div><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Peças/Dia</label><input type="number" value={roi.volume} onChange={(e) => setData({...data, roi: {...roi, volume: parseFloat(e.target.value)}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold text-slate-700 dark:text-white focus:ring-2 ring-red-500 outline-none" /></div></div><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Investimento (R$)</label><input type="number" step="100" value={roi.invest || 0} onChange={(e) => setData({...data, roi: {...roi, invest: parseFloat(e.target.value)}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold text-slate-700 dark:text-white focus:ring-2 ring-red-500 outline-none" placeholder="0.00" /></div><div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2"><div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500 dark:text-slate-400">Economia Mensal</span><span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg">{monthlySave.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div><div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500 dark:text-slate-400">Economia Anual</span><span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg">{(monthlySave * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>{(roi.invest || 0) > 0 && (<div className="flex justify-between items-center mt-2 p-2 bg-slate-100/50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"><span className="text-sm font-bold text-slate-600 dark:text-slate-300">Retorno (Payback)</span><span className={`font-mono font-bold text-lg ${payback > 12 ? 'text-red-500' : 'text-emerald-600'}`}>{payback.toFixed(1)} meses</span></div>)}</div></div></div>
                </div>
            </div>
        </div>
    );
};

// ... (Sub Components)
const BarChart2 = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
);

// --- WIZARD CONFIGURATION ---
const H_CFG: any = {
    'R': {
        title:"Mover Mão (Reach)",
        q:[
            {l:"Distância (cm)",t:'r',id:'d',min:2,max:80,v:30},
            {l:"Destino",t:'c',id:'c',o:[
                {v:'A',t:'Fixo',s:'Lugar certo'},
                {v:'B',t:'Variável',s:'Muda sempre'},
                {v:'C',t:'Misturado',s:'Em pilha'},
                {v:'D',t:'Pequeno',s:'Precisa cuidado'}
            ]}
        ],
        g:(v:any)=>`R${v.d}${v.c}`
    },
    'M': {
        title:"Mover Objeto (Move)",
        q:[
            {l:"Distância (cm)",t:'r',id:'d',min:2,max:80,v:30},
            {l:"Destino",t:'c',id:'c',o:[
                {v:'A',t:'Outra mão',s:'Ou encosto'},
                {v:'B',t:'Aproximado',s:'Local incerto'},
                {v:'C',t:'Exato',s:'Encaixe'}
            ]}
        ],
        g:(v:any)=>`M${v.d}${v.c}`
    },
    'G': {
        title:"Pegar (Grasp)",
        q:[
            {l:"Tipo",t:'c',id:'t',o:[
                {v:'G1A',t:'Fácil',s:'Isolado'},
                {v:'G1B',t:'Pequeno',s:'Plano'},
                {v:'G4A',t:'Em Pilha',s:'Selecionar'},
                {v:'G5',t:'Apenas Tocar',s:'Contato'}
            ]}
        ],
        g:(v:any)=>v.t
    },
    'P': {
        title:"Posicionar",
        q:[
            {l:"Classe",t:'c',id:'cl',o:[
                {v:'1',t:'1. Solto',s:'Sem força'},
                {v:'2',t:'2. Justo',s:'Leve pressão'},
                {v:'3',t:'3. Firme',s:'Força'}
            ]},
            {l:"Simetria",t:'c',id:'s',o:[
                {v:'S',t:'Simétrico',s:'Qualquer lado'},
                {v:'SS',t:'Semi-Sim.',s:'Certos lados'},
                {v:'NS',t:'Não Sim.',s:'Lado único'}
            ]},
            {l:"Manuseio",t:'c',id:'h',o:[
                {v:'E',t:'Fácil',s:'Easy'},
                {v:'D',t:'Difícil',s:'Difficult'}
            ]}
        ],
        g:(v:any)=>`P${v.cl}${v.s}${v.h}`
    },
    'B': {
        title:"Corpo",
        q:[
            {l:"Ação",t:'c',id:'a',o:[
                {v:'W-P',t:'Andar (Livre)',s:'W-P'},
                {v:'W-PO',t:'Andar (Obs)',s:'W-PO'},
                {v:'SIT',t:'Sentar',s:'SIT'},
                {v:'STD',t:'Levantar',s:'STD'},
                {v:'B',t:'Curvar',s:'Bend'},
                {v:'AB',t:'Lev. Curvar',s:'Arise'},
                {v:'S',t:'Agachar',s:'Stoop'},
                {v:'AS',t:'Lev. Agachar',s:'Arise'},
                {v:'KOK',t:'Ajoelhar 1',s:'KOK'},
                {v:'AKOK',t:'Levantar 1',s:'AKOK'},
                {v:'TBC1',t:'Girar Corpo 1',s:'Case 1'},
                {v:'TBC2',t:'Girar Corpo 2',s:'Case 2'},
                {v:'FM',t:'Mov. Pé',s:'<30cm'}
            ]},
            {l:"Unidade",t:'c',id:'u',o:[{v:'s',t:'Passos',s:'Qtd'},{v:'m',t:'Metros',s:'Distância'}], if:(v:any)=>v.a && v.a.startsWith('W')},
            {l:"Qtde (Passos)",t:'r',id:'p',min:1,max:50,v:1,if:(v:any)=>(v.a && v.a.startsWith('W')) && (!v.u || v.u==='s')},
            {l:"Distância (Metros)",t:'r',id:'dist',min:1,max:30,v:1,if:(v:any)=>(v.a && v.a.startsWith('W')) && v.u==='m'}
        ],
        g:(v:any)=>{
            if(v.a && v.a.startsWith('W')){
                const steps = v.u === 'm' ? Math.ceil(v.dist / 0.75) : v.p;
                return `${steps}${v.a}`;
            }
            return v.a;
        }
    },
    'RL': {
        title:"Soltar",
        q:[
            {l:"Tipo",t:'c',id:'t',o:[
                {v:'RL1',t:'Normal',s:'Abrir dedos'},
                {v:'RL2',t:'Contato',s:'Tirar contato'}
            ]}
        ],
        g:(v:any)=>v.t
    },
    'D': {
        title:"Separar",
        q:[
            {l:"Classe",t:'c',id:'c',o:[
                {v:'1',t:'Solto',s:'Pouca força'},
                {v:'2',t:'Justo',s:'Média força'},
                {v:'3',t:'Firme',s:'Muita força'}
            ]},
            {l:"Manuseio",t:'c',id:'h',o:[
                {v:'E',t:'Fácil',s:'Easy'},
                {v:'D',t:'Difícil',s:'Difficult'}
            ]}
        ],
        g:(v:any)=>`D${v.c}${v.h}`
    },
    'T': {
        title:"Girar (Turn)",
        q:[
            {l:"Graus",t:'r',id:'g',min:30,max:180,v:90},
            {l:"Resistência",t:'c',id:'r',o:[
                {v:'S',t:'Pequena',s:'< 1kg'},
                {v:'M',t:'Média',s:'1-5kg'},
                {v:'L',t:'Grande',s:'> 5kg'}
            ]}
        ],
        g:(v:any)=>`T${v.g}${v.r}`
    },
    'AP': {
        title:"Força (Pressure)",
        q:[
            {l:"Tipo",t:'c',id:'t',o:[
                {v:'APA',t:'Sem Repegar',s:'Simples'},
                {v:'APB',t:'Com Repegar',s:'Complexo'}
            ]}
        ],
        g:(v:any)=>v.t
    },
    'E': {
        title:"Olhos",
        q:[
            {l:"Ação",t:'c',id:'t',o:[
                {v:'ET',t:'Mover Olhar',s:'Travel'},
                {v:'EF',t:'Focar',s:'Examinar'}
            ]}
        ],
        g:(v:any)=>v.t
    }
};

const Wizard = ({ onAdd }: { onAdd: (m: Motion) => void }) => {
    // ... (Hooks remain same) ...
    const [category, setCategory] = useState<string | null>(null);
    const [params, setParams] = useState<any>({});
    const [wizFreq, setWizFreq] = useState(1);
    const [wizHand, setWizHand] = useState<'E' | 'D'>('D');

    // Derived state for preview
    const generatedCode = useMemo(() => {
        if (!category) return '';
        try {
            const cfg = H_CFG[category];
            const merged = { ...params };
            if(cfg.q) {
                cfg.q.forEach((q: any) => {
                    if (merged[q.id] === undefined) {
                        if (q.if && !q.if(merged)) return;
                        merged[q.id] = q.t === 'r' ? q.v : q.o[0].v;
                    }
                });
            }
            const res = cfg.g(merged);
            return res === undefined || res === null ? '' : String(res);
        } catch(e) { return ''; }
    }, [category, params]);

    const preview = useMemo(() => parseCode(generatedCode), [generatedCode]);

    const handleSelectCategory = (c: string) => {
        setCategory(c);
        setParams({}); // Reset params
        setWizHand('D'); // Default right
    };

    const handleAdd = () => {
        if (preview.v) {
            const finalHand = category === 'B' ? 'C' : wizHand;
            onAdd({
                code: generatedCode,
                tmu: preview.t,
                desc: preview.d,
                freq: wizFreq,
                hand: finalHand
            });
            setCategory(null);
            setWizFreq(1);
        }
    };

    const handleBack = () => {
        setCategory(null);
        setParams({});
    }

    // Categories UI
    if (!category) {
        return (
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
                <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                    {[
                        { id: 'R', label: 'Mão Vazia', sub: 'Alcançar', icon: <Hand size={20}/>, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
                        { id: 'M', label: 'Mover Objeto', sub: 'Carregar', icon: <Grab size={20}/>, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400' },
                        { id: 'G', label: 'Pegar', sub: 'Grasp', icon: <Fingerprint size={20}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400' },
                        { id: 'P', label: 'Posicionar', sub: 'Encaixar', icon: <Crosshair size={20}/>, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400' },
                        { id: 'RL', label: 'Soltar', sub: 'Release', icon: <LogOut size={20}/>, color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' },
                        { id: 'D', label: 'Separar', sub: 'Disengage', icon: <Minimize2 size={20}/>, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' },
                        { id: 'T', label: 'Girar', sub: 'Turn', icon: <RotateCw size={20}/>, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400' },
                        { id: 'AP', label: 'Fazer Força', sub: 'Premir (AP)', icon: <ArrowDownToLine size={20}/>, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' },
                        { id: 'E', label: 'Olhos', sub: 'Focar/Mover', icon: <Eye size={20}/>, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-400' },
                        { id: 'B', label: 'Corpo/Pé', sub: 'Andar/Agachar', icon: <Footprints size={20}/>, color: 'text-slate-600 bg-slate-100/50' },
                    ].map(c => (
                        <button key={c.id} onClick={() => handleSelectCategory(c.id)} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-red-400 rounded-xl text-left shadow-sm group transition-all flex flex-col gap-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${c.color} group-hover:bg-red-600 group-hover:text-white`}>{c.icon}</div>
                            <div>
                                <span className="block font-bold text-slate-700 dark:text-white text-sm">{c.label}</span>
                                <span className="text-xs text-slate-400">{c.sub}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Config UI
    const cfg = H_CFG[category];
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center gap-2">
                 <button onClick={handleBack} className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"><ArrowLeft size={14}/> Voltar</button>
                 <span className="font-bold text-slate-700 dark:text-white ml-auto">{cfg.title}</span>
             </div>

             <div className="flex-1 p-4 overflow-y-auto space-y-6">
                 {cfg.q.map((q: any, i: number) => {
                     // Check conditions
                     if (q.if && !q.if(params)) return null;

                     const currentVal = params[q.id] !== undefined ? params[q.id] : (q.t === 'r' ? q.v : q.o[0].v);

                     return (
                         <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{q.l}</label>

                             {q.t === 'r' ? (
                                 <div>
                                     <div className="flex justify-between mb-2 text-sm font-bold text-red-600 dark:text-red-400">{currentVal}</div>
                                     <input
                                        type="range" min={q.min} max={q.max} value={currentVal}
                                        onChange={(e) => setParams({...params, [q.id]: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-red-600 cursor-pointer"
                                     />
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-2 gap-2">
                                     {q.o.map((opt: any) => {
                                         const active = currentVal === opt.v;
                                         return (
                                             <button
                                                key={opt.v}
                                                onClick={() => setParams({...params, [q.id]: opt.v})}
                                                className={`p-2 rounded border text-left transition-all ${active ? 'bg-red-50 dark:bg-red-900/30 border-red-500 ring-1 ring-red-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-red-300'}`}
                                             >
                                                 <div className={`font-bold text-sm ${active ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-white'}`}>{opt.t}</div>
                                                 <div className={`text-xs ${active ? 'text-red-400' : 'text-slate-400'}`}>{opt.s}</div>
                                             </button>
                                         )
                                     })}
                                 </div>
                             )}
                         </div>
                     );
                 })}
             </div>

             {/* Dark Preview Box (Already dark, but container needs check) */}
             <div className="p-4 bg-slate-50 dark:bg-slate-900">
                <div className="bg-slate-900 dark:bg-black rounded-xl p-4 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs text-slate-400 uppercase font-bold block">Ação Resultante</span>
                            <span className="text-sm font-medium text-white leading-tight">{preview.d || '...'}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-yellow-400">{preview.v ? preview.t.toFixed(1) : '0.0'}</span>
                            <span className="text-xs text-slate-500 block">TMU</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        {category !== 'B' && (
                            <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                                <button onClick={() => setWizHand('E')} className={`w-8 h-10 flex items-center justify-center text-xs font-bold transition-colors ${wizHand === 'E' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>E</button>
                                <button onClick={() => setWizHand('D')} className={`w-8 h-10 flex items-center justify-center text-xs font-bold transition-colors border-l border-slate-700 ${wizHand === 'D' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>D</button>
                            </div>
                        )}

                        <div className="bg-slate-800 rounded-lg flex items-center px-3 py-2 border border-slate-700 h-10 shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold mr-2">QTD</span>
                            <input
                                type="number" value={wizFreq} min="1"
                                onChange={(e) => setWizFreq(parseInt(e.target.value))}
                                className="bg-transparent w-8 text-center font-bold text-white outline-none text-sm"
                            />
                        </div>

                        <button onClick={handleAdd} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold h-10 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/50">
                            Adicionar <PlusCircle size={16}/>
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};
