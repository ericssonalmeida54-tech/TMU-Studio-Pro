import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Pie, PieChart as RePieChart
} from 'recharts';
import { Activity, DollarSign, Hand, Info } from 'lucide-react';
import { Study, Motion } from '../types/types';
import { analyzeErgonomics } from '../utils/ergonomics';

interface ResultsViewProps {
    data: Study;
    setData: (d: Study) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, setData }) => {
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
