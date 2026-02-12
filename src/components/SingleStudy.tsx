import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle, FileSpreadsheet, Printer, MonitorPlay,
    Calculator, Settings2, Wand2, Hand, X, Calendar, Clock
} from 'lucide-react';
import { Study, Motion, MotionGroup } from '../types/types';
import { Wizard } from './Wizard';
import { MotionCard, ManualInput } from './EditorComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

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
    // We only use 'currentMotions' for Single Study (Observed vs Standard)
    const [activeTab, setActiveTab] = useState<'motions' | 'results' | 'config'>('motions');

    useEffect(() => {
        const t = setTimeout(() => { onSave(data); }, 1000);
        return () => clearTimeout(t);
    }, [data, onSave]);

    // Calculations
    const factor = 1 + (data.tolerance / 100);
    const totalTMU = data.currentMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
    const stdTimeMin = totalTMU * 0.0006 * factor;
    const obsTimeMin = data.observedTime || 0;

    // Efficiency Calculation
    // If Observed Time is provided, calculate Efficiency = Standard / Observed
    // If Observed < Standard, Efficiency > 100% (Good/Fast) or < 100% (Slow)?
    // Usually: Efficiency = (Standard Time / Actual Time) * 100
    const efficiency = obsTimeMin > 0 ? (stdTimeMin / obsTimeMin) * 100 : 0;

    // Production Potential
    // Pieces per Hour (Standard)
    const pcsPerHourStd = stdTimeMin > 0 ? 60 / stdTimeMin : 0;
    // Pieces per Hour (Observed)
    const pcsPerHourObs = obsTimeMin > 0 ? 60 / obsTimeMin : 0;

    const handleAddMotion = (motion: Motion) => {
        setData({ ...data, currentMotions: [...data.currentMotions, motion] });
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

    const handleExportCSV = () => {
        const headers = ["Index", "Code", "Description", "Frequency", "TMU", "Hand", "Unit", "Original Value"];
        const rows = data.currentMotions.map((m, i) => [
            i + 1, m.code, m.desc, m.freq, m.tmu, m.hand, m.unit || 'TMU', m.val || ''
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `single_study_${data.title}.csv`);
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
             <header className="h-16 border-b flex items-center justify-between px-3 sm:px-4 z-30 shrink-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 print:hidden">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden">
                    <button onClick={onBack} className="p-2 rounded-full transition-colors shrink-0 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft size={20}/></button>
                    <input
                        value={data.title}
                        onChange={(e) => setData({...data, title: e.target.value})}
                        className="font-bold text-base sm:text-lg bg-transparent border-none p-0 focus:ring-0 w-full outline-none truncate text-slate-800 dark:text-white placeholder-slate-300"
                        placeholder="Nome do Estudo..."
                    />
                    <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shrink-0"><CheckCircle size={10} className="text-emerald-500"/> Salvo</div>
                    <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-white bg-blue-600 px-2 py-1 rounded shrink-0">Individual</div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button onClick={handleExportCSV} className="p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" title="Exportar CSV"><FileSpreadsheet size={16}/> <span className="hidden sm:inline">CSV</span></button>
                    <button onClick={onPrint} className="p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><Printer size={16}/> <span className="hidden sm:inline">Imprimir</span></button>
                    <button onClick={() => setActiveTab('results')} className="p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white"><Calculator size={16}/> <span className="hidden sm:inline">Resultados</span></button>
                </div>
            </header>

            {/* PRINT LAYOUT (Check Sheet Style) */}
            <div className="hidden print:block absolute top-0 left-0 w-full h-auto bg-white z-[9999] p-8 text-black font-sans">
                <div className="border border-black mb-4">
                    <div className="flex border-b border-black">
                        <div className="w-1/4 p-2 border-r border-black flex items-center justify-center font-bold text-xl uppercase tracking-widest bg-gray-100">
                            Check Sheet
                        </div>
                        <div className="w-3/4 p-2">
                             <div className="flex justify-between mb-2">
                                 <div><span className="text-[10px] font-bold uppercase block text-gray-500">Operação:</span> <span className="font-bold text-lg">{data.title}</span></div>
                                 <div><span className="text-[10px] font-bold uppercase block text-gray-500">Data:</span> <span className="font-bold">{new Date().toLocaleDateString()}</span></div>
                             </div>
                             <div className="flex justify-between">
                                 <div><span className="text-[10px] font-bold uppercase block text-gray-500">Analista:</span> <span className="font-bold">{data.analyst || 'N/A'}</span></div>
                                 <div><span className="text-[10px] font-bold uppercase block text-gray-500">Tempo Padrão:</span> <span className="font-bold font-mono text-lg">{stdTimeMin.toFixed(4)} min</span></div>
                             </div>
                        </div>
                    </div>
                    <div className="flex text-xs text-center font-bold bg-gray-200 border-b border-black">
                        <div className="w-10 py-1 border-r border-black">#</div>
                        <div className="w-16 py-1 border-r border-black">Cód</div>
                        <div className="flex-1 py-1 border-r border-black text-left pl-2">Descrição da Atividade</div>
                        <div className="w-10 py-1 border-r border-black">Freq</div>
                        <div className="w-16 py-1 border-r border-black">TMU</div>
                        <div className="w-16 py-1">Total</div>
                    </div>
                    {data.currentMotions.map((m, i) => (
                        <div key={i} className="flex text-[10px] border-b border-gray-300 break-inside-avoid last:border-b-0">
                            <div className="w-10 py-1 border-r border-gray-300 text-center font-bold text-gray-500">{i+1}</div>
                            <div className="w-16 py-1 border-r border-gray-300 text-center font-mono">{m.code}</div>
                            <div className="flex-1 py-1 border-r border-gray-300 pl-2 truncate">{m.desc}</div>
                            <div className="w-10 py-1 border-r border-gray-300 text-center">{m.freq}</div>
                            <div className="w-16 py-1 border-r border-gray-300 text-right pr-2 font-mono">{m.tmu.toFixed(1)}</div>
                            <div className="w-16 py-1 text-right pr-2 font-mono font-bold">{(m.tmu * (m.freq||1)).toFixed(1)}</div>
                        </div>
                    ))}
                     <div className="flex text-xs font-bold bg-gray-100 border-t border-black">
                        <div className="flex-1 py-1 text-right pr-2 uppercase">Total TMU:</div>
                        <div className="w-16 py-1 text-right pr-2">{totalTMU.toFixed(1)}</div>
                    </div>
                    <div className="flex text-xs font-bold bg-gray-100 border-t border-gray-300">
                         <div className="flex-1 py-1 text-right pr-2 uppercase">Tempo Padrão (min):</div>
                        <div className="w-16 py-1 text-right pr-2">{stdTimeMin.toFixed(4)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border border-black p-2 mt-4 break-inside-avoid">
                     <div>
                         <h4 className="font-bold uppercase mb-2 border-b border-gray-300 pb-1">Resultados de Eficiência</h4>
                         <div className="flex justify-between py-1 border-b border-gray-100"><span>Tempo Observado:</span> <span className="font-mono font-bold">{obsTimeMin.toFixed(4)} min</span></div>
                         <div className="flex justify-between py-1 border-b border-gray-100"><span>Eficiência Real:</span> <span className="font-mono font-bold">{efficiency.toFixed(1)}%</span></div>
                         <div className="flex justify-between py-1"><span>Produção (Pçs/h):</span> <span className="font-mono font-bold">{pcsPerHourStd.toFixed(1)}</span></div>
                     </div>
                     <div>
                         <h4 className="font-bold uppercase mb-2 border-b border-gray-300 pb-1">Notas</h4>
                         <p className="italic text-gray-500">Tolerância aplicada: {data.tolerance}%</p>
                         <p className="italic text-gray-500 mt-1">Este documento é confidencial e de propriedade exclusiva.</p>
                     </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col print:hidden overflow-hidden">
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-start sm:justify-center shrink-0 shadow-sm z-20 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings2 size={18}/>} />
                    <TabButton active={activeTab === 'motions'} onClick={() => setActiveTab('motions')} label="Movimentos (Padrão)" />
                    <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="Resultados & Eficiência" />
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Config Tab */}
                    {activeTab === 'config' && (
                        <div className="flex-1 p-4 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><Settings2 className="text-blue-600"/> Configurações do Estudo</h2>
                                <div className="space-y-6">
                                    <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome do Analista</label><input value={data.analyst || ''} onChange={(e) => setData({...data, analyst: e.target.value})} placeholder="Ex: João Silva" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 ring-blue-500 font-medium outline-none text-slate-900 dark:text-white" /></div>
                                    <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tolerância (%)</label><div className="flex items-center gap-4"><input type="range" min="0" max="30" step="0.5" value={data.tolerance} onChange={(e) => setData({...data, tolerance: parseFloat(e.target.value)})} className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-blue-600" /><span className="font-mono font-bold text-xl w-16 text-right text-slate-800 dark:text-white">{data.tolerance}%</span></div></div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Clock size={16}/> Dados Observados (Cronometragem)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tempo Médio Observado (min)</label><input type="number" step="0.001" value={obsTimeMin || ''} onChange={(e) => setData({...data, observedTime: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg font-mono font-bold" placeholder="0.000"/></div>
                                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jornada de Trabalho (min)</label><input type="number" value={data.shiftMinutes || 480} onChange={(e) => setData({...data, shiftMinutes: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg font-mono font-bold" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Motions Tab (Editor Style) */}
                    {activeTab === 'motions' && (
                        <>
                             <div className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
                                    <div className="flex gap-2 sm:gap-4 text-xs font-medium">
                                        <div className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:gap-1"><span>Min (+{data.tolerance}%):</span> <strong className="text-slate-900 dark:text-white">{stdTimeMin.toFixed(4)}</strong></div>
                                        <div className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hidden sm:flex gap-1"><span>TMU Base:</span> <strong className="text-slate-900 dark:text-white">{totalTMU.toFixed(1)}</strong></div>
                                    </div>
                                    <button onClick={() => setWizardOpen(!wizardOpen)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${wizardOpen ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`} title="Assistente"><Wand2 size={16}/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 sm:p-4 pb-48 sm:pb-32">
                                    {data.currentMotions.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                                            <Hand size={48} className="mb-4 text-slate-400" />
                                            <p className="text-center px-4 text-slate-500">Adicione movimentos usando a barra abaixo ou o Assistente.</p>
                                        </div>
                                    ) : (
                                        <div className="max-w-3xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {data.currentMotions.map((m, i) => (
                                                <MotionCard key={i} motion={m} index={i} onDelete={() => handleRemoveMotion(i)} onMoveUp={() => handleMoveMotion(i, 'up')} onMoveDown={() => handleMoveMotion(i, 'down')}/>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 z-20 flex justify-center shadow-sm">
                                    <div className="w-full max-w-3xl">
                                        <ManualInput onAdd={handleAddMotion} />
                                    </div>
                                </div>
                            </div>
                            <div className={`${wizardOpen ? 'fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-auto w-full lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none fixed right-0'} transition-all duration-300 bg-white dark:bg-slate-900 ${wizardOpen ? 'border-l border-slate-200 dark:border-slate-800' : 'border-none'} flex flex-col shadow-2xl lg:shadow-none`}>
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Wand2 size={16} className="text-blue-600"/> Assistente Visual</h3>
                                    <button onClick={() => setWizardOpen(false)} className="lg:hidden p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white"><X size={20}/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <Wizard onAdd={handleAddMotion} groups={motionGroups} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Results Tab */}
                    {activeTab === 'results' && (
                        <div className="flex-1 p-4 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                             <div className="max-w-4xl mx-auto space-y-6">
                                {/* Header Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={64}/></div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Tempo Padrão (Calculado)</h3>
                                        <div className="text-3xl font-bold text-slate-800 dark:text-white">{stdTimeMin.toFixed(4)} <span className="text-sm font-medium text-slate-500">min</span></div>
                                        <div className="text-xs font-mono text-slate-400 mt-1">{totalTMU.toFixed(1)} TMU (+{data.tolerance}%)</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><MonitorPlay size={64}/></div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Tempo Observado (Real)</h3>
                                        <div className="text-3xl font-bold text-slate-800 dark:text-white">{obsTimeMin > 0 ? obsTimeMin.toFixed(4) : '-'} <span className="text-sm font-medium text-slate-500">min</span></div>
                                        <div className="text-xs text-slate-400 mt-1">{obsTimeMin > 0 ? 'Cronometragem manual' : 'Não informado'}</div>
                                    </div>
                                    <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${efficiency >= 100 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : (efficiency > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800')}`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle size={64}/></div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Eficiência Operacional</h3>
                                        <div className={`text-3xl font-bold ${efficiency >= 100 ? 'text-emerald-600 dark:text-emerald-400' : (efficiency > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white')}`}>{efficiency > 0 ? efficiency.toFixed(1) : '-'} <span className="text-sm font-medium">%</span></div>
                                        <div className="text-xs text-slate-400 mt-1">Meta: 100%</div>
                                    </div>
                                </div>

                                {/* Comparison Chart */}
                                {obsTimeMin > 0 && (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Comparativo: Padrão vs Observado</h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[
                                                    { name: 'Padrão (MTM)', val: stdTimeMin, fill: '#3b82f6' }, // Blue
                                                    { name: 'Observado', val: obsTimeMin, fill: '#ef4444' } // Red
                                                ]} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                                                    <XAxis type="number" unit=" min" />
                                                    <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12}} />
                                                    <Tooltip
                                                        cursor={{fill: 'transparent'}}
                                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                    />
                                                    <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                                                        {
                                                            [
                                                                { name: 'Padrão (MTM)', val: stdTimeMin, fill: '#3b82f6' },
                                                                { name: 'Observado', val: obsTimeMin, fill: '#ef4444' }
                                                            ].map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))
                                                        }
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
