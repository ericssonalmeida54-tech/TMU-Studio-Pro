import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle, FileSpreadsheet, Printer,
    Calculator, Settings2, Wand2, Hand, Bot, DollarSign, X,
    Clock, Zap, AlertTriangle, TrendingDown, TrendingUp, Target
} from 'lucide-react';
import { Study, Motion, MotionGroup } from '../types/types';
import { Wizard } from './Wizard';
import { MotionCard, ManualInput } from './EditorComponents';
import { parseCode } from '../utils/mtmLogic';

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

    // Default values if missing
    const obsTime = data.observedTime || 0;
    const shiftMin = data.shiftMinutes || 480; // 8 hours default
    const costMin = data.roi.costMin || 0.50;
    const volume = data.roi.volume || 1000; // Target daily volume if MTM is hit? Or current?

    // Auto-save
    useEffect(() => {
        const t = setTimeout(() => { onSave(data); }, 1000);
        return () => clearTimeout(t);
    }, [data, onSave]);

    // MTM Calculation
    const factor = 1 + (data.tolerance / 100);
    const totalTMU = data.currentMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
    const mtmMin = totalTMU * 0.0006 * factor;

    // --- KPIs ---

    // 1. Efficiency
    // If Observed > MTM = Inefficient (<100%). If Observed < MTM = Super Efficient (>100%)
    // Wait, typical formula: Standard / Actual * 100
    // If Standard (MTM) is 1.0 min and Actual (Obs) is 2.0 min, eff = 50%. Correct.
    const efficiency = obsTime > 0 ? (mtmMin / obsTime) * 100 : 0;

    // 2. Capacity (Daily)
    const capMTM = mtmMin > 0 ? shiftMin / mtmMin : 0;
    const capReal = obsTime > 0 ? shiftMin / obsTime : 0;
    const lostPieces = Math.max(0, capMTM - capReal);

    // 3. Financial Loss
    const costMTM = mtmMin * costMin;
    const costReal = obsTime * costMin;
    const lossPerPiece = Math.max(0, costReal - costMTM);
    // Monthly Loss = Loss per piece * Actual Volume produced?
    // Or Potential Volume? Usually based on Actual Output.
    // Let's assume ROI Volume is the daily target/actual.
    const monthlyLoss = lossPerPiece * capReal * (data.roi.daysPerMonth || 22);

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

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300 print:overflow-visible relative">

            {/* Header / Inputs */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 print:hidden">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ArrowLeft size={20} className="text-slate-500"/></button>
                        <div className="w-full">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Operação</label>
                            <input
                                value={data.title}
                                onChange={(e) => setData({...data, title: e.target.value})}
                                className="w-full font-bold text-lg bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-300"
                                placeholder="Nome do estudo..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><DollarSign size={10}/> Custo Min</label>
                            <input type="number" step="0.01" value={costMin} onChange={e => setData({...data, roi: {...data.roi, costMin: parseFloat(e.target.value)}})} className="w-24 font-mono font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> T. Crono (min)</label>
                            <input type="number" step="0.001" value={obsTime} onChange={e => setData({...data, observedTime: parseFloat(e.target.value)})} className="w-24 font-mono font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> Jornada (min)</label>
                            <input type="number" value={shiftMin} onChange={e => setData({...data, shiftMinutes: parseFloat(e.target.value)})} className="w-24 font-mono font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-blue-500 text-slate-900 dark:text-white"/>
                        </div>
                        <button onClick={onPrint} className="self-end p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"><Printer size={20}/></button>
                    </div>
                </div>
            </header>

            {/* Dashboard Panel */}
            <div className="bg-slate-100 dark:bg-black/20 p-4 shrink-0 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
                    {/* 1. Times */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Clock size={14}/> Comparativo Tempo</h4>
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm"><span>Real:</span> <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{obsTime.toFixed(3)} min</span></div>
                            <div className="flex justify-between text-sm"><span>MTM:</span> <span className="font-mono font-bold text-blue-600">{mtmMin.toFixed(3)} min</span></div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                            <div className="flex justify-between text-sm font-bold text-red-500"><span>Gap:</span> <span>+{(obsTime - mtmMin).toFixed(3)} min</span></div>
                        </div>
                    </div>

                    {/* 2. Efficiency */}
                    <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${efficiency >= 100 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                        <h4 className={`text-xs font-bold uppercase flex items-center gap-2 ${efficiency >= 100 ? 'text-emerald-600' : 'text-red-600'}`}><Zap size={14}/> Eficiência</h4>
                        <div>
                            <span className={`text-4xl font-bold ${efficiency >= 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{efficiency.toFixed(1)}%</span>
                            <p className="text-[10px] opacity-70 uppercase font-bold mt-1">{efficiency >= 100 ? 'Alta Performance' : 'Abaixo do Padrão'}</p>
                        </div>
                    </div>

                    {/* 3. Capacity */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Target size={14}/> Capacidade Diária</h4>
                        <div className="mt-2">
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">{capReal.toFixed(0)}</span>
                                <span className="text-xs text-slate-400 mb-1">pçs (Real)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold mt-1">
                                <TrendingUp size={12}/> Potencial: {capMTM.toFixed(0)} pçs
                            </div>
                            <div className="text-[10px] text-red-500 font-bold mt-1">Perda: {lostPieces.toFixed(0)} pçs/dia</div>
                        </div>
                    </div>

                    {/* 4. Financial Loss */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-5"><DollarSign size={64}/></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><AlertTriangle size={14}/> Impacto Financeiro</h4>
                        <div className="mt-2">
                            <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Desperdício Mensal</span>
                            <span className="text-2xl font-bold text-red-600">R$ {monthlyLoss.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            <p className="text-[10px] text-slate-400 mt-1">Devido à ineficiência vs MTM</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* List Area */}
                <div className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10 print:hidden">
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">Total MTM: <strong className="text-slate-900 dark:text-white">{mtmMin.toFixed(4)} min</strong></div>
                            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">Total TMU: <strong className="text-slate-900 dark:text-white">{totalTMU.toFixed(1)}</strong></div>
                        </div>
                        <button onClick={() => setWizardOpen(!wizardOpen)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${wizardOpen ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}><Wand2 size={16}/> Assistente</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 pb-32 print:p-0 print:pb-0">
                        <div className="max-w-3xl mx-auto space-y-2 print:max-w-none">
                            {data.currentMotions.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center opacity-40 print:hidden">
                                    <Hand size={48} className="mb-4 text-slate-400"/>
                                    <p className="text-center px-4 text-slate-500">Adicione movimentos MTM para comparar com o tempo real.</p>
                                </div>
                            ) : (
                                data.currentMotions.map((m, i) => (
                                    <MotionCard key={i} motion={m} index={i} onDelete={() => handleRemoveMotion(i)} onMoveUp={() => handleMoveMotion(i, 'up')} onMoveDown={() => handleMoveMotion(i, 'down')}/>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-20 flex justify-center shadow-sm print:hidden">
                        <div className="w-full max-w-3xl">
                            <ManualInput onAdd={handleAddMotion} />
                        </div>
                    </div>
                </div>

                {/* Wizard Sidebar */}
                <div className={`${wizardOpen ? 'w-96 border-l' : 'w-0 opacity-0 pointer-events-none'} transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col shadow-xl print:hidden`}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Wand2 size={16} className="text-red-600"/> Assistente</h3>
                        <button onClick={() => setWizardOpen(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <Wizard onAdd={handleAddMotion} groups={motionGroups} />
                    </div>
                </div>
            </div>

            {/* PRINT TEMPLATE (Check Sheet) */}
            <div className="hidden print:block absolute top-0 left-0 w-full h-auto bg-white z-[9999] p-8 text-black font-sans">
                <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold uppercase">Folha de Verificação de Processo</h1>
                        <p className="text-sm text-gray-600">Comparativo Padrão MTM vs Tempo Real</p>
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
                            <tr key={i} className="border-b border-gray-200">
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
                    <div className="text-xs text-gray-500">TMU Studio Pro • Relatório Gerado Automaticamente</div>
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
