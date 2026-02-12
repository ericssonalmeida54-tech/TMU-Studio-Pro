import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import {
  DollarSign, Activity, Zap, Clock, Info,
  Dumbbell, TrendingUp, Hand, Users, Target
} from 'lucide-react';
import { Study, Motion } from '../types/types';

interface ResultsViewProps {
    data: Study;
    setData: (d: Study) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, setData }) => {
    // --- Data Extraction & Calculation ---
    const factor = 1 + (data.tolerance / 100);
    const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor;

    const curMin = calc(data.currentMotions);
    const proMin = calc(data.proposedMotions);
    const savingMin = Math.max(0, curMin - proMin);

    // ROI State (Active Inputs)
    const roi = data.roi || { costMin: 0.688, volume: 1000, invest: 0, daysPerMonth: 22, minutesPerHour: 60 };

    // Derived Financial KPIs
    const dailyVolume = roi.volume;
    const monthlySave = savingMin * roi.costMin * dailyVolume * (roi.daysPerMonth || 22);
    const annualSave = monthlySave * 12;
    const payback = monthlySave > 0 ? (roi.invest || 0) / monthlySave : 0;
    const hoursSavedYear = (savingMin * dailyVolume * (roi.daysPerMonth || 22) * 12) / 60;

    // Capacity Gain: (Time Saved per Piece * Pieces per Day) -> No, "Capacity Gain" usually means:
    // How many MORE pieces can be made in the SAME time?
    // Current Output = Total Available Time / Current Cycle
    // New Output = Total Available Time / New Cycle
    // Gain = New - Current
    const totalDailyTime = dailyVolume * curMin; // Assuming current volume fills the day or specific shift
    // Or simply: In the time saved (savingMin * dailyVolume), how many NEW pieces can I make?
    // New Pieces = (savingMin * dailyVolume) / proMin
    const capacityGain = proMin > 0 ? (savingMin * dailyVolume) / proMin : 0;

    // Charts Data
    const cycleData = [
        { name: 'Atual', value: parseFloat(curMin.toFixed(3)), fill: '#64748b' },
        { name: 'Proposto', value: parseFloat(proMin.toFixed(3)), fill: '#10b981' }
    ];

    const getLimbData = (motions: Motion[]) => {
        const counts: any = { E: 0, D: 0, C: 0 };
        motions.forEach(m => {
            if (counts[m.hand] !== undefined) counts[m.hand] += (m.tmu * (m.freq || 1));
        });
        return [
            { name: 'Mão Esq.', value: counts.E, fill: '#3b82f6' },
            { name: 'Mão Dir.', value: counts.D, fill: '#ef4444' },
            { name: 'Corpo', value: counts.C, fill: '#64748b' }
        ].filter(x => x.value > 0);
    };
    const limbData = getLimbData(data.proposedMotions.length > 0 ? data.proposedMotions : data.currentMotions);

    // Load Analysis (>2kg)
    const heavyMotions = (data.proposedMotions.length > 0 ? data.proposedMotions : data.currentMotions)
        .filter(m => {
            if(m.code.includes('W') && m.desc.match(/(\d+)kg/)) return true; // Approximation
            // Check weight param from our new Wizard logic (e.g., M10A-5kg)
            const weightMatch = m.code.match(/-(\d+(\.\d+)?)kg/i);
            return weightMatch && parseFloat(weightMatch[1]) > 2;
        }).length;

    // Handlers for Live Inputs
    const updateRoi = (field: keyof typeof roi, val: string) => {
        const num = parseFloat(val) || 0;
        setData({ ...data, roi: { ...roi, [field]: num } });
    };

    return (
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* 1. Active Parameter Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                <Settings2Icon />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Parâmetros Financeiros</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Ajuste para recalcular o ROI instantaneamente.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <InputGroup label="Custo Minuto (R$)" value={roi.costMin} onChange={v => updateRoi('costMin', v)} icon={<DollarSign size={14}/>} />
                            <InputGroup label="Produção (Pçs/Dia)" value={roi.volume} onChange={v => updateRoi('volume', v)} icon={<Target size={14}/>} />
                            <InputGroup label="Investimento (R$)" value={roi.invest} onChange={v => updateRoi('invest', v)} icon={<TrendingUp size={14}/>} />
                        </div>
                    </div>
                </div>

                {/* 2. Impact KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Saving Anual"
                        value={`R$ ${(annualSave/1000).toFixed(1)}k`}
                        sub={`R$ ${monthlySave.toFixed(0)} / mês`}
                        icon={<DollarSign size={24}/>}
                        color="text-emerald-600"
                        bg="bg-emerald-50 dark:bg-emerald-900/20"
                    />
                    <KPICard
                        title="Horas Reduzidas"
                        value={`${hoursSavedYear.toFixed(0)} h`}
                        sub="Capacidade liberada/ano"
                        icon={<Clock size={24}/>}
                        color="text-blue-600"
                        bg="bg-blue-50 dark:bg-blue-900/20"
                    />
                    <KPICard
                        title="Ganho Capacidade"
                        value={`+${capacityGain.toFixed(0)}`}
                        sub="Peças extras por dia"
                        icon={<Zap size={24}/>}
                        color="text-purple-600"
                        bg="bg-purple-50 dark:bg-purple-900/20"
                    />
                    <KPICard
                        title="Payback"
                        value={payback > 0 ? `${payback.toFixed(1)} meses` : 'Imediato'}
                        sub={payback > 0 ? 'Retorno do Investimento' : 'Sem custo inicial'}
                        icon={<Activity size={24}/>}
                        color={payback > 12 ? 'text-orange-500' : 'text-slate-700 dark:text-white'}
                        bg={payback > 12 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-slate-100 dark:bg-slate-800'}
                    />
                </div>

                {/* 3. Technical Visual Indicators */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cycle Comparison */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-6 flex items-center gap-2">
                            <Clock size={16}/> Comparativo de Ciclo (min)
                        </h4>
                        <div className="flex-1 w-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cycleData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                                        {cycleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Limb Usage */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-6 flex items-center gap-2">
                            <Hand size={16}/> Distribuição de Esforço
                        </h4>
                        <div className="flex-1 w-full min-h-[200px] flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={limbData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%" cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                    >
                                        {limbData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-2 ml-4">
                                {limbData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.fill}}></div>
                                        <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Load/Fatigue Analysis */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                <Dumbbell size={16}/> Análise de Carga
                            </h4>
                            <div className={`p-4 rounded-xl border-l-4 ${heavyMotions > 0 ? 'bg-red-50 border-red-500 text-red-800' : 'bg-emerald-50 border-emerald-500 text-emerald-800'}`}>
                                <p className="text-3xl font-bold">{heavyMotions}</p>
                                <p className="text-xs font-bold uppercase mt-1">Movimentos &gt; 2kg</p>
                            </div>
                            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                                {heavyMotions > 0
                                    ? "Atenção: Operação com manipulação de carga significativa. Considere dispositivos de auxílio para reduzir fadiga."
                                    : "Operação leve. Nenhum movimento com carga excessiva detectado."}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Info size={14}/>
                                <span>Baseado na norma ISO 11228-1</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Helper Components ---

const InputGroup = ({ label, value, onChange, icon }: { label: string, value: number, onChange: (val: string) => void, icon: React.ReactNode }) => (
    <div className="flex flex-col">
        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
            {icon} {label}
        </label>
        <input
            type="number"
            step="0.01"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-mono font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500 outline-none w-32 transition-all hover:bg-white dark:hover:bg-slate-700"
        />
    </div>
);

const KPICard = ({ title, value, sub, icon, color, bg }: { title: string, value: string, sub: string, icon: React.ReactNode, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
            <p className={`text-xs font-medium mt-1 ${color} opacity-80`}>{sub}</p>
        </div>
    </div>
);

const Settings2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
);
