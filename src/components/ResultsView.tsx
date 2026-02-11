import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Pie, PieChart as RePieChart
} from 'recharts';
import { Activity, DollarSign, Hand, Info, Play, Pause, RotateCw, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { Study, Motion } from '../types/types';
import { analyzeErgonomics } from '../utils/ergonomics';

interface ResultsViewProps {
    data: Study;
    setData: (d: Study) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, setData }) => {
    // --- Calculations ---
    const factor = 1 + (data.tolerance / 100);
    const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor;
    const c = calc(data.currentMotions);
    const p = calc(data.proposedMotions);

    const safeC = isNaN(c) ? 0 : c;
    const safeP = isNaN(p) ? 0 : p;

    const saving = Math.max(0, safeC - safeP);

    const roi = data.roi || { costMin: 0.688, volume: 1000, invest: 0, daysPerMonth: 22, minutesPerHour: 60 };
    const monthlySave = saving * roi.costMin * roi.volume * (roi.daysPerMonth || 22);
    const annualSave = monthlySave * 12;
    const payback = monthlySave > 0 ? (roi.invest || 0) / monthlySave : 0;

    const minutesPerHour = roi.minutesPerHour || 60;
    const curPcsH = safeC > 0 ? minutesPerHour / safeC : 0;
    const proPcsH = safeP > 0 ? minutesPerHour / safeP : 0;
    const prodIncrease = curPcsH > 0 ? ((proPcsH - curPcsH) / curPcsH) * 100 : 0;
    const hoursSavedYear = (saving * roi.volume * (roi.daysPerMonth || 22) * 12) / 60;

    const chartData = [ { name: 'Atual', time: parseFloat(safeC.toFixed(3)), fill: '#64748b' }, { name: 'Proposto', time: parseFloat(safeP.toFixed(3)), fill: '#dc2626' }, ];

    // --- Simulation Player State ---
    const [activeScenario, setActiveScenario] = useState<'current' | 'proposed'>('proposed');
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentMotionIndex, setCurrentMotionIndex] = useState(0);

    const activeMotions = activeScenario === 'current' ? data.currentMotions : data.proposedMotions;

    // Simulation Effect
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            if (activeMotions.length === 0) {
                setIsPlaying(false);
                return;
            }

            const totalTMU = activeMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
            const totalTimeMs = totalTMU * 30; // Scale TMU to Ms for visuals
            const stepTime = 50; // Update every 50ms

            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    const increment = (stepTime / (totalTimeMs / playbackSpeed)) * 100;
                    const newProgress = prev + increment;

                    // Update Current Motion Index
                    const currentTMU = (newProgress / 100) * totalTMU;
                    let accumTMU = 0;
                    let foundIndex = 0;
                    for (let i = 0; i < activeMotions.length; i++) {
                        const m = activeMotions[i];
                        accumTMU += m.tmu * (m.freq || 1);
                        if (accumTMU >= currentTMU) {
                            foundIndex = i;
                            break;
                        }
                    }
                    setCurrentMotionIndex(foundIndex);

                    return newProgress;
                });
            }, stepTime);
        }
        return () => clearInterval(interval);
    }, [isPlaying, activeMotions, playbackSpeed]);

    const handlePlayPause = () => {
        if (progress >= 100) setProgress(0);
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentMotionIndex(0);
    };

    // --- Sub Components ---
    const getLimbData = (motions: Motion[]) => {
        const counts: any = { E: 0, D: 0, C: 0 };
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

    const BarChartIcon = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
    );

    return (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* 1. Simulation Player (Dark/Modern) */}
                <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative text-white">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-10">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
                        {/* Left: Controls & Info */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => { setActiveScenario('current'); handleReset(); }} className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${activeScenario === 'current' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-500 hover:text-white'}`}>Atual</button>
                                        <button onClick={() => { setActiveScenario('proposed'); handleReset(); }} className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${activeScenario === 'proposed' ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-500 hover:text-white'}`}>Proposto</button>
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight text-white">{data.title || 'Simulação'}</h3>
                                    <p className="text-slate-400 text-sm">Visualização em tempo real</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                        {Math.min(100, progress).toFixed(0)}<span className="text-lg text-slate-600">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={handleReset} className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"><RotateCw size={20}/></button>
                                <button onClick={handlePlayPause} className="p-4 rounded-full bg-white hover:bg-slate-200 text-slate-900 shadow-lg shadow-white/10 transition-all active:scale-95">
                                    {isPlaying ? <Pause fill="currentColor" size={24}/> : <Play fill="currentColor" size={24} className="ml-1"/>}
                                </button>
                                <div className="flex bg-slate-800 rounded-lg p-1">
                                    {[1, 2, 5].map(s => (
                                        <button key={s} onClick={() => setPlaybackSpeed(s)} className={`px-3 py-1 text-xs font-bold rounded transition-colors ${playbackSpeed === s ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{s}x</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Active Motion Card */}
                        <div className="w-full md:w-80 shrink-0">
                            {activeMotions[currentMotionIndex] ? (
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 p-2 text-[10px] font-bold uppercase rounded-bl-xl ${activeMotions[currentMotionIndex].hand === 'E' ? 'bg-blue-600/20 text-blue-400' : activeMotions[currentMotionIndex].hand === 'D' ? 'bg-red-600/20 text-red-400' : 'bg-slate-600/20 text-slate-400'}`}>
                                        {activeMotions[currentMotionIndex].hand === 'E' ? 'Mão Esquerda' : activeMotions[currentMotionIndex].hand === 'D' ? 'Mão Direita' : 'Corpo'}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ação #{currentMotionIndex + 1}</p>
                                    <h4 className="text-lg font-bold text-white leading-tight mb-2">{activeMotions[currentMotionIndex].desc}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">{activeMotions[currentMotionIndex].code}</span>
                                        <span className="font-mono text-sm text-slate-400">{activeMotions[currentMotionIndex].tmu} TMU</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 bg-slate-800/30 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 gap-2">
                                    <CheckCircle size={20} className="text-emerald-500"/> Ciclo Concluído
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Business KPIs (Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400"><Clock size={20}/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Novo Tempo</span>
                        </div>
                        <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white">{safeP.toFixed(3)} <span className="text-sm font-sans text-slate-400">min</span></p>
                        <p className="text-xs text-emerald-600 font-bold mt-1">-{saving.toFixed(3)} min/peça</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400"><DollarSign size={20}/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Economia/Ano</span>
                        </div>
                        <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white">R$ {(annualSave/1000).toFixed(1)}k</p>
                        <p className="text-xs text-slate-500 mt-1">ROI {payback > 0 ? `${payback.toFixed(1)} meses` : 'Imediato'}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400"><Zap size={20}/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Produtividade</span>
                        </div>
                        <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white">+{prodIncrease.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500 mt-1">{curPcsH.toFixed(0)} ➔ {proPcsH.toFixed(0)} pçs/h</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400"><Activity size={20}/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Horas Ganhas</span>
                        </div>
                        <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white">{hoursSavedYear.toFixed(0)} <span className="text-sm font-sans text-slate-400">h/ano</span></p>
                        <p className="text-xs text-slate-500 mt-1">Capacidade extra</p>
                    </div>
                </div>

                {/* 3. Charts & Ergonomics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-80"><h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><BarChartIcon className="w-4 h-4"/> Comparativo de Tempo</h3><div className="flex-1 w-full min-h-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top: 20, right: 30, left: 0, bottom: 5}}><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(3)} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}} itemStyle={{color: '#fff'}} labelStyle={{color: '#94a3b8'}} /><Bar dataKey="time" radius={[6, 6, 0, 0]} barSize={50} animationDuration={1000}>{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart></ResponsiveContainer></div></div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                         <h3 className="font-bold text-slate-700 dark:text-white mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500"/> Análise Ergonômica</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Atual</p>
                                <div className="flex justify-center gap-4">
                                    <div><span className="block text-xl font-bold text-red-500">{curRisks.high}</span><span className="text-[10px] text-slate-400">Alto</span></div>
                                    <div><span className="block text-xl font-bold text-orange-500">{curRisks.medium}</span><span className="text-[10px] text-slate-400">Médio</span></div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Proposto</p>
                                <div className="flex justify-center gap-4">
                                    <div><span className={`block text-xl font-bold ${proRisks.high < curRisks.high ? 'text-emerald-500' : 'text-red-500'}`}>{proRisks.high}</span><span className="text-[10px] text-slate-400">Alto</span></div>
                                    <div><span className={`block text-xl font-bold ${proRisks.medium < curRisks.medium ? 'text-emerald-500' : 'text-orange-500'}`}>{proRisks.medium}</span><span className="text-[10px] text-slate-400">Médio</span></div>
                                </div>
                            </div>
                         </div>
                         <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-600 dark:text-blue-300 flex items-center gap-2">
                            <Info size={16} className="shrink-0"/>
                            <span>Redução de {curRisks.high - proRisks.high} riscos altos detectada.</span>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
