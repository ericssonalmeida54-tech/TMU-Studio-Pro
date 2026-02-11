import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Printer, Settings2, Wand2, Hand, X,
    Clock, Zap, AlertTriangle, TrendingUp, Target, DollarSign,
    List, BarChart2
} from 'lucide-react';
import { Study, Motion, MotionGroup } from '../types/types';
import { Wizard } from './Wizard';
import { MotionCard, ManualInput } from './EditorComponents';

interface SingleStudyProps {
    data: Study;
    setData: React.Dispatch<React.SetStateAction<Study>>;
    onSave: (d?: Study) => void;
    onBack: () => void;
    wizardOpen: boolean;
    setWizardOpen: (o: boolean) => void;
    motionGroups: MotionGroup[];
    onPrint: () => void;
}

export const SingleStudy: React.FC<SingleStudyProps> = ({
    data, setData, onSave, onBack,
    wizardOpen, setWizardOpen, motionGroups, onPrint
}) => {
    // Tabs state
    const [activeTab, setActiveTab] = useState<'config' | 'motions' | 'results'>('motions');

    // Default values if missing
    const obsTime = data.observedTime || 0;
    const shiftMin = data.shiftMinutes || 480; // 8 hours default
    const costMin = data.roi.costMin || 0.50;
    const volume = data.roi.volume || 1000;

    // Auto-save
    useEffect(() => {
        const t = setTimeout(() => { onSave(data); }, 1000);
        return () => clearTimeout(t);
    }, [data, onSave]);

    // MTM Calculation
    const factor = 1 + (data.tolerance / 100);
    const totalTMU = data.currentMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
    const mtmMin = totalTMU * 0.0006 * factor;

    // --- KPIs Calculations ---
    // Safe calculation for efficiency to avoid Infinity/NaN
    const efficiency = obsTime > 0 ? (mtmMin / obsTime) * 100 : 0;
    const capMTM = mtmMin > 0 ? shiftMin / mtmMin : 0;
    const capReal = obsTime > 0 ? shiftMin / obsTime : 0;
    const lostPieces = Math.max(0, capMTM - capReal);
    const costMTM = mtmMin * costMin;
    const costReal = obsTime * costMin;
    const lossPerPiece = Math.max(0, costReal - costMTM);
    // Assuming monthly volume based on daily capacity real * days
    const daysPerMonth = data.roi.daysPerMonth || 22;
    const monthlyLoss = lossPerPiece * capReal * daysPerMonth;

    const handleAddMotion = (motion: Motion) => {
        const newList = [...data.currentMotions, motion];
        setData({ ...data, currentMotions: newList });
    };
    const handleRemoveMotion = (idx: number) => {
        const newList = data.currentMotions.filter((_, i) => i !== idx);
        setData({ ...data, currentMotions: newList });
    };
    const handleMoveMotion = (index: number, direction: 'up' | 'down') => {
        const list = [...data.currentMotions];
        if (direction === 'up' && index > 0) { [list[index], list[index - 1]] = [list[index - 1], list[index]]; }
        else if (direction === 'down' && index < list.length - 1) { [list[index], list[index + 1]] = [list[index + 1], list[index]]; }
        setData({ ...data, currentMotions: list });
    };

    const TabButton = ({ id, label, icon }: { id: any, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === id ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300 print:overflow-visible relative">

            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 print:hidden">
                <div className="flex items-center justify-between p-4 pb-0">
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ArrowLeft size={20} className="text-slate-500"/></button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">{data.title || 'Estudo Individual'}</h1>
                            <p className="text-xs text-slate-500 font-medium">Análise Comparativa (MTM vs Real)</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <button onClick={onPrint} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"><Printer size={20}/></button>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex px-4 gap-4 overflow-x-auto">
                    <TabButton id="config" label="Configuração" icon={<Settings2 size={16}/>} />
                    <TabButton id="motions" label="Movimentos" icon={<List size={16}/>} />
                    <TabButton id="results" label="Resultados" icon={<BarChart2 size={16}/>} />
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex relative">

                {/* A. Config Tab */}
                {activeTab === 'config' && (
                    <div className="flex-1 p-6 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><Settings2 className="text-red-600"/> Parâmetros do Estudo</h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Título da Operação</label>
                                        <input value={data.title} onChange={(e) => setData({...data, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-red-500 font-bold text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Analista Responsável</label>
                                        <input value={data.analyst || ''} onChange={(e) => setData({...data, analyst: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-red-500 font-medium text-slate-900 dark:text-white" placeholder="Nome..." />
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Dados Financeiros & Turno</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Custo Minuto (R$)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                            <input type="number" step="0.01" value={costMin} onChange={e => setData({...data, roi: {...data.roi, costMin: parseFloat(e.target.value)}})} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-red-500 font-mono font-bold text-slate-900 dark:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jornada (min/dia)</label>
                                        <input type="number" value={shiftMin} onChange={e => setData({...data, shiftMinutes: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-red-500 font-mono font-bold text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tolerância (%)</label>
                                        <div className="flex items-center gap-3">
                                            <input type="range" min="0" max="30" step="0.5" value={data.tolerance} onChange={(e) => setData({...data, tolerance: parseFloat(e.target.value)})} className="flex-1 h-2 bg-slate-200 rounded-lg accent-red-600 cursor-pointer" />
                                            <span className="font-mono font-bold text-lg w-12 text-right">{data.tolerance}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* B. Motions Tab */}
                {activeTab === 'motions' && (
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/50">
                            {/* Summary Bar */}
                            <div className="bg-white dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
                                <div className="flex gap-6 text-sm font-medium">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">Total MTM</span>
                                        <strong className="text-2xl text-slate-900 dark:text-white font-mono">{mtmMin.toFixed(4)} <span className="text-xs font-sans text-slate-400">min</span></strong>
                                    </div>
                                    <div className="hidden sm:flex items-baseline gap-2">
                                        <span className="text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">TMU</span>
                                        <strong className="text-lg text-slate-700 dark:text-slate-300 font-mono">{totalTMU.toFixed(1)}</strong>
                                    </div>
                                </div>
                                <button onClick={() => setWizardOpen(!wizardOpen)} className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-bold text-sm ${wizardOpen ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                    <Wand2 size={16}/> Assistente
                                </button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
                                <div className="max-w-3xl mx-auto space-y-2">
                                    {data.currentMotions.length === 0 ? (
                                        <div className="h-64 flex flex-col items-center justify-center opacity-40">
                                            <Hand size={48} className="mb-4 text-slate-400"/>
                                            <p className="text-center px-4 text-slate-500 font-medium">Adicione movimentos à sequência.</p>
                                        </div>
                                    ) : (
                                        data.currentMotions.map((m, i) => (
                                            <MotionCard key={i} motion={m} index={i} onDelete={() => handleRemoveMotion(i)} onMoveUp={() => handleMoveMotion(i, 'up')} onMoveDown={() => handleMoveMotion(i, 'down')}/>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Manual Input */}
                            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-20 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="w-full max-w-3xl">
                                    <ManualInput onAdd={handleAddMotion} />
                                </div>
                            </div>
                        </div>

                        {/* Wizard Sidebar */}
                        <div className={`${wizardOpen ? 'w-80 lg:w-96 border-l' : 'w-0 opacity-0 pointer-events-none'} transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-30`}>
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                                <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Wand2 size={16} className="text-red-600"/> Assistente</h3>
                                <button onClick={() => setWizardOpen(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <Wizard onAdd={handleAddMotion} groups={motionGroups} />
                            </div>
                        </div>
                    </div>
                )}

                {/* C. Results Tab */}
                {activeTab === 'results' && (
                    <div className="flex-1 p-6 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-50 dark:bg-slate-950">
                        <div className="max-w-6xl mx-auto space-y-6">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Time Comparison */}
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Clock size={16}/> Comparativo Tempo</h4>
                                    <div className="mt-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-bold">Real (Min)</span>
                                            {/* Input Moved Here */}
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={obsTime}
                                                onChange={e => setData({...data, observedTime: parseFloat(e.target.value)})}
                                                className="w-24 font-mono font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white text-right"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Padrão MTM</span>
                                            <span className="font-mono font-bold text-blue-600">{mtmMin.toFixed(3)} m</span>
                                        </div>
                                        <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-slate-400">Desvio</span>
                                                <span className={`font-mono font-bold text-lg ${obsTime > mtmMin ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {obsTime > mtmMin ? '+' : ''}{(obsTime - mtmMin).toFixed(3)} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Efficiency */}
                                <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${efficiency >= 100 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-xs font-bold uppercase flex items-center gap-2 ${efficiency >= 100 ? 'text-emerald-700' : 'text-red-700'}`}><Zap size={16}/> Eficiência</h4>
                                        <div className={`p-2 rounded-lg ${efficiency >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {efficiency >= 100 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <span className={`text-4xl font-bold ${efficiency >= 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{isNaN(efficiency) ? '0.0' : efficiency.toFixed(1)}%</span>
                                        <p className="text-xs opacity-70 uppercase font-bold mt-1">{efficiency >= 100 ? 'Meta Atingida' : 'Abaixo da Meta'}</p>
                                    </div>
                                </div>

                                {/* Financial Impact */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><DollarSign size={16}/> Impacto Mensal</h4>
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><AlertTriangle size={20}/></div>
                                    </div>
                                    <div className="mt-4">
                                        <span className={`text-3xl font-bold ${monthlyLoss > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {monthlyLoss > 0 ? '-' : '+'} R$ {Math.abs(monthlyLoss).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold">{monthlyLoss > 0 ? 'Desperdício Estimado' : 'Economia Estimada'}</p>
                                    </div>
                                </div>

                                {/* Capacity Gap */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Target size={16}/> Capacidade (Pçs/Dia)</h4>
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600"><Clock size={20}/></div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-medium text-slate-500">Real</span>
                                            <span className="text-xl font-bold text-slate-900 dark:text-white">{isFinite(capReal) ? capReal.toFixed(0) : '0'}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-medium text-blue-600">Ideal (MTM)</span>
                                            <span className="text-xl font-bold text-blue-600">{isFinite(capMTM) ? capMTM.toFixed(0) : '0'}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <span className={`text-xs font-bold ${lostPieces > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                Diferença: {lostPieces > 0 ? `-${lostPieces.toFixed(0)} pçs` : `+${Math.abs(lostPieces).toFixed(0)} pçs`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Audit Table Placeholder - Could be added here if requested, but dashboard is key */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                                <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-2">Relatório de Auditoria</h3>
                                <p className="text-blue-600 dark:text-blue-400 text-sm">Use o botão de imprimir para gerar a Folha de Verificação oficial com todos os dados acima.</p>
                            </div>

                        </div>
                    </div>
                )}

            </div>

            {/* PRINT TEMPLATE (Check Sheet) - Always available in DOM for window.print() */}
            <div className="hidden print:block absolute top-0 left-0 w-full h-auto bg-white z-[9999] p-8 text-black font-sans">
                <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold uppercase">Folha de Verificação de Processo</h1>
                        <p className="text-sm text-gray-600">Auditoria de Tempos: Padrão MTM vs Real</p>
                    </div>
                    <div className="text-right text-xs">
                        <p><strong>Data:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Estudo:</strong> {data.title}</p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-4 gap-4 border border-gray-300 p-4 rounded text-sm">
                    <div><span className="block font-bold text-gray-500 uppercase text-[10px]">Analista</span> {data.analyst || '-'}</div>
                    <div><span className="block font-bold text-gray-500 uppercase text-[10px]">Tempo Crono</span> {obsTime.toFixed(3)} min</div>
                    <div><span className="block font-bold text-gray-500 uppercase text-[10px]">Tempo MTM</span> {mtmMin.toFixed(3)} min</div>
                    <div><span className="block font-bold text-gray-500 uppercase text-[10px]">Eficiência</span> {efficiency.toFixed(1)}%</div>
                </div>

                <div className="mb-6 grid grid-cols-3 gap-4">
                     <div className="p-2 border border-gray-200 rounded">
                         <span className="block text-[8px] uppercase font-bold text-gray-400">Capacidade Real</span>
                         <span className="font-bold text-lg">{isFinite(capReal) ? capReal.toFixed(0) : '0'} pçs/dia</span>
                     </div>
                     <div className="p-2 border border-gray-200 rounded">
                         <span className="block text-[8px] uppercase font-bold text-gray-400">Perda Diária</span>
                         <span className="font-bold text-lg text-red-600">{lostPieces.toFixed(0)} pçs</span>
                     </div>
                     <div className="p-2 border border-gray-200 rounded">
                         <span className="block text-[8px] uppercase font-bold text-gray-400">Impacto Mensal</span>
                         <span className="font-bold text-lg text-red-600">R$ {monthlyLoss.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                     </div>
                </div>

                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="py-2 text-left w-10">#</th>
                            <th className="py-2 text-left w-20">Código</th>
                            <th className="py-2 text-left">Descrição da Atividade</th>
                            <th className="py-2 text-center w-16">Freq</th>
                            <th className="py-2 text-right w-20">TMU</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.currentMotions.map((m, i) => (
                            <tr key={i} className="border-b border-gray-200 break-inside-avoid">
                                <td className="py-2 font-bold text-gray-500">{i+1}</td>
                                <td className="py-2 font-mono">{m.code}</td>
                                <td className="py-2">{m.desc}</td>
                                <td className="py-2 text-center">{m.freq}</td>
                                <td className="py-2 text-right font-mono">{(m.tmu * (m.freq||1)).toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-8 border-t-2 border-black pt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">TMU Studio Pro • Relatório de Auditoria</div>
                    <div className="text-right">
                        <p className="font-bold text-lg">Total MTM: {totalTMU.toFixed(1)} TMU ({mtmMin.toFixed(4)} min)</p>
                        <p className={`text-sm font-bold ${efficiency < 100 ? 'text-red-600' : 'text-green-600'}`}>
                            Desvio: {(obsTime - mtmMin).toFixed(3)} min ({efficiency.toFixed(1)}% Efic.)
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};
