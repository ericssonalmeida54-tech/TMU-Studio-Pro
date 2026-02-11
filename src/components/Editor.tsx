import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, CheckCircle, FileSpreadsheet, Printer, MonitorPlay,
    Calculator, Settings2, Wand2, Hand, Bot, DollarSign, X
} from 'lucide-react';
import { Study, Motion, MotionGroup } from '../types/types';
import { Wizard } from './Wizard';
import { ResultsView } from './ResultsView';
import { MotionCard, ManualInput } from './EditorComponents';
import { GoogleGenAI } from "@google/genai";
import { parseCode } from '../utils/mtmLogic';

interface EditorProps {
    data: Study;
    setData: React.Dispatch<React.SetStateAction<Study>>;
    onSave: (d?: Study) => void;
    onBack: () => void;
    onOpenSimulation: () => void;
    activeTab: 'current' | 'proposed' | 'results' | 'config';
    setActiveTab: (t: 'current' | 'proposed' | 'results' | 'config') => void;
    wizardOpen: boolean;
    setWizardOpen: (o: boolean) => void;
    aiModalOpen: boolean;
    setAiModalOpen: (o: boolean) => void;
    onPrint: () => void;
    isSandbox?: boolean;
    motionGroups: MotionGroup[];
}

export const Editor: React.FC<EditorProps> = ({
    data, setData, onSave, onBack, onOpenSimulation,
    activeTab, setActiveTab, wizardOpen, setWizardOpen,
    aiModalOpen, setAiModalOpen, onPrint, isSandbox, motionGroups
}) => {
    useEffect(() => {
        if (!isSandbox) {
            const t = setTimeout(() => { onSave(data); }, 1000);
            return () => clearTimeout(t);
        }
    }, [data, isSandbox, onSave]);

    const activeMotions = activeTab === 'current' ? data.currentMotions : data.proposedMotions;
    const factor = 1 + (data.tolerance / 100);
    const totalTMU = activeMotions.reduce((acc: number, m: Motion) => acc + (m.tmu * (m.freq || 1)), 0);
    const totalMin = totalTMU * 0.0006 * factor;

    // Calc for Print View
    const calcTotal = (arr: Motion[]) => arr.reduce((s,m)=> s + (m.tmu * (m.freq || 1)), 0);
    const curMin = calcTotal(data.currentMotions) * 0.0006 * factor;
    const proMin = calcTotal(data.proposedMotions) * 0.0006 * factor;
    const saving = Math.max(0, curMin - proMin);

    // ROI Defaults & Calculations
    const roi = data.roi || { costMin: 0.688, volume: 1000, invest: 0, daysPerMonth: 22, minutesPerHour: 60 };
    const monthlySave = saving * roi.costMin * roi.volume * (roi.daysPerMonth || 22);
    const annualSave = monthlySave * 12;
    const payback = monthlySave > 0 ? (roi.invest || 0) / monthlySave : 0;

    // Productivity
    const minutesPerHour = roi.minutesPerHour || 60;
    const curPcsH = curMin > 0 ? minutesPerHour / curMin : 0;
    const proPcsH = proMin > 0 ? minutesPerHour / proMin : 0;
    const prodIncrease = curPcsH > 0 ? ((proPcsH - curPcsH) / curPcsH) * 100 : 0;
    const hoursSavedYear = (saving * roi.volume * (roi.daysPerMonth || 22) * 12) / 60;

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
        const headers = ["Index", "Code", "Description", "Frequency", "TMU", "Hand", "Unit", "Original Value"];
        const rows = activeMotions.map((m: Motion, i: number) => [
            i + 1, m.code, m.desc, m.freq, m.tmu, m.hand, m.unit || 'TMU', m.val || ''
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

    const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon?: React.ReactNode, label?: string }) => (
        <button
          onClick={onClick}
          className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          {icon} {label}
        </button>
      );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300 print:overflow-visible relative">
            <header className={`h-16 border-b flex items-center justify-between px-3 sm:px-4 z-30 shrink-0 print:hidden ${isSandbox ? 'bg-purple-900 border-purple-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden">
                    <button onClick={onBack} className={`p-2 rounded-full transition-colors shrink-0 ${isSandbox ? 'text-purple-200 hover:bg-purple-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><ArrowLeft size={20}/></button>
                    <input
                        value={data.title}
                        onChange={(e) => setData({...data, title: e.target.value})}
                        className={`font-bold text-base sm:text-lg bg-transparent border-none p-0 focus:ring-0 w-full outline-none truncate ${isSandbox ? 'text-white placeholder-purple-300' : 'text-slate-800 dark:text-white placeholder-slate-300'}`}
                        placeholder={isSandbox ? "Simulador Rápido (Não salva)..." : "Nome da Operação..."}
                    />
                    {!isSandbox && <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shrink-0"><CheckCircle size={10} className="text-emerald-500"/> Salvo</div>}
                    {isSandbox && <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-white bg-purple-800 px-2 py-1 rounded shrink-0">Simulação</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                    <button onClick={handleExportCSV} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${isSandbox ? 'bg-purple-800 text-purple-200 hover:bg-purple-700' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`} title="Exportar CSV"><FileSpreadsheet size={16}/> <span className="hidden sm:inline">CSV</span></button>
                    <button onClick={onPrint} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${isSandbox ? 'bg-purple-800 text-purple-200 hover:bg-purple-700' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><Printer size={16}/> <span className="hidden sm:inline">Imprimir</span></button>
                    <button onClick={onOpenSimulation} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-lg ${isSandbox ? 'bg-white text-purple-900 hover:bg-gray-100' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'}`}><MonitorPlay size={16}/> <span className="hidden sm:inline">Simular</span></button>
                    <button onClick={() => setActiveTab('results')} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${isSandbox ? 'bg-purple-800 text-white hover:bg-purple-700' : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white'}`}><Calculator size={16}/> <span className="hidden sm:inline">Resultados</span></button>
                </div>
            </header>

            {/* MINIMALIST PRINT REPORT */}
            <div className="hidden print:block absolute top-0 left-0 w-full h-auto bg-white z-[9999] p-8 text-black font-sans">

                {/* Header (Minimalist) */}
                <div className="flex justify-between items-end border-b border-black pb-4 mb-4">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-tight text-black">Relatório de Tempos e Métodos</h1>
                        <p className="text-xs text-gray-600 mt-1">Norma MTM-1 • Análise Comparativa</p>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-bold">Emissão:</span> {new Date().toLocaleDateString()}</p>
                        <p><span className="font-bold">Analista:</span> {data.analyst || 'N/A'}</p>
                    </div>
                </div>

                {/* Operation Info & Summary (Compact) */}
                <div className="mb-6 border border-gray-300 rounded p-4">
                    <div className="mb-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Operação</span>
                        <h2 className="text-lg font-bold text-black leading-none">{data.title || 'Sem Título'}</h2>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <div>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">Tempo Atual</span>
                            <span className="font-mono font-bold text-base">{curMin.toFixed(3)} min</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">Tempo Proposto</span>
                            <span className="font-mono font-bold text-base">{proMin.toFixed(3)} min</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">Economia/Ano</span>
                            <span className="font-mono font-bold text-base">R$ {(annualSave/1000).toFixed(1)}k</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">Retorno</span>
                            <span className="font-mono font-bold text-base">{payback > 0 ? `${payback.toFixed(1)} m` : 'Imediato'}</span>
                        </div>
                    </div>
                </div>

                {/* Dense Comparison Tables */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Current Method */}
                    <div>
                        <div className="border-b border-black mb-2 pb-1">
                            <h3 className="font-bold text-sm uppercase">Método Atual</h3>
                        </div>
                        <table className="w-full text-[9px] border-collapse">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="py-1 text-left w-8">#</th>
                                    <th className="py-1 text-left w-12">Cód</th>
                                    <th className="py-1 text-left">Descrição</th>
                                    <th className="py-1 text-right w-12">TMU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.currentMotions.map((m, i) => (
                                    <tr key={i} className="border-b border-gray-100 break-inside-avoid">
                                        <td className="py-0.5 font-bold text-gray-500">{i+1}</td>
                                        <td className="py-0.5 font-mono text-gray-700">{m.code}</td>
                                        <td className="py-0.5 truncate max-w-[150px]">{m.desc}</td>
                                        <td className="py-0.5 text-right font-mono">{(m.tmu * (m.freq||1)).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-2 text-right border-t border-black pt-1">
                            <span className="text-[10px] font-bold">Total: {data.currentMotions.reduce((acc, m) => acc + (m.tmu*(m.freq||1)), 0).toFixed(1)} TMU</span>
                        </div>
                    </div>

                    {/* Proposed Method */}
                    <div>
                        <div className="border-b border-black mb-2 pb-1">
                            <h3 className="font-bold text-sm uppercase">Método Proposto</h3>
                        </div>
                        <table className="w-full text-[9px] border-collapse">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="py-1 text-left w-8">#</th>
                                    <th className="py-1 text-left w-12">Cód</th>
                                    <th className="py-1 text-left">Descrição</th>
                                    <th className="py-1 text-right w-12">TMU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.proposedMotions.map((m, i) => (
                                    <tr key={i} className="border-b border-gray-100 break-inside-avoid">
                                        <td className="py-0.5 font-bold text-gray-500">{i+1}</td>
                                        <td className="py-0.5 font-mono text-gray-700">{m.code}</td>
                                        <td className="py-0.5 truncate max-w-[150px]">{m.desc}</td>
                                        <td className="py-0.5 text-right font-mono">{(m.tmu * (m.freq||1)).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-2 text-right border-t border-black pt-1">
                            <span className="text-[10px] font-bold">Total: {data.proposedMotions.reduce((acc, m) => acc + (m.tmu*(m.freq||1)), 0).toFixed(1)} TMU</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                    <p className="text-[8px] text-gray-400 uppercase">TMU Studio Pro</p>
                </div>
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
                            <div className={`${wizardOpen ? 'fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-auto w-full lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none fixed right-0'} transition-all duration-300 bg-white dark:bg-slate-900 ${wizardOpen ? 'border-l border-slate-200 dark:border-slate-800' : 'border-none'} flex flex-col shadow-2xl lg:shadow-none`}><div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0"><h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Wand2 size={16} className="text-red-600"/> Assistente Visual</h3><button onClick={() => setWizardOpen(false)} className="lg:hidden p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white"><X size={20}/></button></div><div className="flex-1 overflow-y-auto"><Wizard onAdd={handleAddMotion} groups={motionGroups} /></div></div>
                        </>
                    )}
                    {activeTab === 'results' && <ResultsView data={data} setData={setData} />}
                </div>
            </div>
            {/* AI Modal would be here if I extracted it or kept it in App.tsx. I'll assume it's passed or handled.
                Wait, I need to make sure AIModal is available. It was internal in App.tsx.
                For now I'll just skip re-implementing AIModal inside Editor to keep it simple,
                or I should assume the parent handles it.
                Actually, the Editor Props has `aiModalOpen`.
                So the Editor should render it.
                I will define AIModal here or import it.
                Since I didn't extract AIModal, I will define a placeholder or move it here.
                I'll quickly duplicate the AIModal logic here to ensure it works.
            */}
            {aiModalOpen && <AIModal onClose={() => setAiModalOpen(false)} onApply={(motions) => { const newList = [...activeMotions, ...motions]; if (activeTab === 'current') setData({ ...data, currentMotions: newList }); else setData({ ...data, proposedMotions: newList }); setAiModalOpen(false); }} />}
        </div>
    );
}

// Internal AIModal for Editor (Copy-paste from App.tsx)
const AIModal = ({ onClose, onApply }: { onClose: () => void, onApply: (motions: Motion[]) => void }) => {
    // ... Simplified AI Modal to avoid too much code duplication if I can't import
    // Ideally I would extract this too.
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            const systemPrompt = `You are an expert in MTM-1. Convert description to JSON array of motions. JSON: [{ "code": "R30A", "desc": "Reach", "freq": 1, "hand": "D" }].`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { systemInstruction: systemPrompt, responseMimeType: "application/json" }
            });
            const text = response.text;
            if (!text) throw new Error("No output");
            let result = JSON.parse(text);
            if (!Array.isArray(result) && result.motions) result = result.motions;
            const validMotions: Motion[] = result.map((m: any) => {
                const p = parseCode(m.code);
                return {
                    code: p.v ? m.code.toUpperCase() : "R30A",
                    tmu: p.v ? p.t : 9.5,
                    desc: m.desc || p.d,
                    freq: m.freq || 1,
                    hand: (['E','D','C'].includes(m.hand)) ? m.hand : 'D',
                    type: 'mtm'
                };
            });
            onApply(validMotions);
        } catch (err) { setError("Falha ao gerar."); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 relative border border-slate-200 dark:border-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Assistente IA</h3>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-700 dark:text-white mb-4" placeholder="Descreva a operação..." />
                <div className="flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-slate-500">Cancelar</button><button onClick={handleGenerate} className="px-6 py-2 bg-slate-900 text-white rounded-lg">{loading ? '...' : 'Gerar'}</button></div>
            </div>
        </div>
    );
};
