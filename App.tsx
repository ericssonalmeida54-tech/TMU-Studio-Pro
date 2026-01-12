import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Plus, Table2, Trash2, ArrowLeft, Settings2, Wand2, 
  Calculator, Info, CheckCircle, Hand, Grab, Fingerprint, Crosshair, 
  LogOut, Minimize2, RotateCw, ArrowDownToLine, Eye, Footprints, 
  X, Bot, PlusCircle, HelpCircle, Printer, DollarSign, 
  Menu, PanelRightClose, PanelRightOpen, Scissors, ChevronUp, 
  ChevronDown, BookOpen, Target, Scale, HelpCircle as HelpIcon,
  Moon, Sun, Play, Pause, StopCircle, Zap, Share2, Edit2, Save, Download, Upload, Copy
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Pie, PieChart as RePieChart
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { parseCode, REACH_BASE, MOVE_BASE, STAT, POS_DATA, TURN_DATA, DIS_DATA } from './utils/mtmLogic';
import type { Study, Motion } from './types';

// --- Types ---
type MotionGroup = {
  id: string;
  name: string;
  motions: Motion[];
};

// --- Sub Components ---

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
    {icon} {label}
  </button>
);

const MotionCard = ({ motion, index, onDelete }: any) => {
    let containerClass = "w-3/4 flex items-center justify-between p-3 rounded-xl border dark:border-slate-700 shadow-sm transition-all group relative fade-in mb-1 ";
    let badgeColor = "bg-slate-500";
    let typeLabel = "CORPO";

    if (motion.hand === 'E') {
        containerClass += " mr-auto bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30";
        badgeColor = "bg-blue-500";
        typeLabel = "ESQ";
    } else if (motion.hand === 'D') {
        containerClass += " ml-auto bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30";
        badgeColor = "bg-red-500";
        typeLabel = "DIR";
    } else {
        containerClass += " mx-auto bg-slate-50 dark:bg-slate-800 border-slate-200 text-center w-[95%]";
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
                        <span className="font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 px-1 rounded border border-slate-200/50 dark:border-slate-700">{typeLabel}</span>
                        <span>{motion.code}</span>
                        {motion.freq > 1 && <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400 rounded font-bold ml-1">{motion.freq}x</span>}
                    </div>
                </div>
            </div>
            <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 absolute right-2"><Trash2 size={16}/></button>
        </div>
    );
};

const ManualInput = ({ onAdd }: any) => {
    const [val, setVal] = useState("");
    const [freq, setFreq] = useState(1);
    const [hand, setHand] = useState<'E'|'D'>('D');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const p = parseCode(val);
        if (p.v) {
            onAdd({ code: val.toUpperCase(), tmu: p.t, desc: p.d, freq, hand: p.type === 'body' ? 'C' : hand });
            setVal(""); setFreq(1);
        }
    }
    return (
        <form onSubmit={handleSubmit} className="flex-1 relative flex items-center gap-2">
             <div className="flex items-center bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl w-full overflow-hidden focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                 <div className="bg-slate-100 dark:bg-slate-600 border-r border-slate-200 dark:border-slate-500 px-2 py-1 flex flex-col items-center justify-center w-14 shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Qtd</span>
                    <input type="number" min="1" value={freq} onChange={e => setFreq(parseInt(e.target.value))} className="w-full bg-transparent text-center font-bold text-sm outline-none text-slate-700 dark:text-white p-0" />
                 </div>
                 <div className="flex border-r border-slate-200 dark:border-slate-500 shrink-0">
                    <button type="button" onClick={() => setHand('E')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors border-r border-slate-100 dark:border-slate-500 ${hand === 'E' ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>E</button>
                    <button type="button" onClick={() => setHand('D')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors ${hand === 'D' ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>D</button>
                </div>
                <input value={val} onChange={(e) => setVal(e.target.value.toUpperCase())} placeholder="Código..." className="w-full h-full pl-4 pr-12 py-3 bg-transparent border-none text-sm font-mono uppercase outline-none text-slate-800 dark:text-white placeholder-slate-400" />
             </div>
             <button type="submit" className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl text-slate-600 dark:text-slate-200 transition-colors"><ArrowDownToLine size={20}/></button>
        </form>
    );
};

const H_CFG: any = {
    'R': { title:"Mover Mão (Reach)", q:[ {l:"Distância (cm)",t:'r',id:'d',min:2,max:80,v:30}, {l:"Destino",t:'c',id:'c',o:[ {v:'A',t:'Fixo',s:'Lugar certo'}, {v:'B',t:'Variável',s:'Muda sempre'}, {v:'C',t:'Misturado',s:'Em pilha'}, {v:'D',t:'Pequeno',s:'Precisa cuidado'} ]} ], g:(v:any)=>`R${v.d}${v.c}` },
    'M': { title:"Mover Objeto (Move)", q:[ {l:"Distância (cm)",t:'r',id:'d',min:2,max:80,v:30}, {l:"Destino",t:'c',id:'c',o:[ {v:'A',t:'Outra mão',s:'Ou encosto'}, {v:'B',t:'Aproximado',s:'Local incerto'}, {v:'C',t:'Exato',s:'Encaixe'} ]} ], g:(v:any)=>`M${v.d}${v.c}` },
    'G': { title:"Pegar (Grasp)", q:[ {l:"Tipo",t:'c',id:'t',o:[ {v:'G1A',t:'Fácil',s:'Isolado'}, {v:'G1B',t:'Pequeno',s:'Plano'}, {v:'G4A',t:'Em Pilha',s:'Selecionar'}, {v:'G5',t:'Apenas Tocar',s:'Contato'} ]} ], g:(v:any)=>v.t },
    'P': { title:"Posicionar", q:[ {l:"Classe",t:'c',id:'cl',o:[ {v:'1',t:'1. Solto',s:'Sem força'}, {v:'2',t:'2. Justo',s:'Leve pressão'}, {v:'3',t:'3. Firme',s:'Força'} ]}, {l:"Simetria",t:'c',id:'s',o:[ {v:'S',t:'Simétrico',s:'Qualquer lado'}, {v:'SS',t:'Semi-Sim.',s:'Certos lados'}, {v:'NS',t:'Não Sim.',s:'Lado único'} ]}, {l:"Manuseio",t:'c',id:'h',o:[ {v:'E',t:'Fácil',s:'Easy'}, {v:'D',t:'Difícil',s:'Difficult'} ]} ], g:(v:any)=>`P${v.cl}${v.s}${v.h}` },
    'B': { title:"Corpo", q:[ {l:"Ação",t:'c',id:'a',o:[ {v:'W-P',t:'Andar (Livre)',s:'W-P'}, {v:'W-PO',t:'Andar (Obs)',s:'W-PO'}, {v:'SIT',t:'Sentar',s:'SIT'}, {v:'STD',t:'Levantar',s:'STD'}, {v:'B',t:'Curvar',s:'Bend'}, {v:'AB',t:'Lev. Curvar',s:'Arise'}, {v:'S',t:'Agachar',s:'Stoop'}, {v:'AS',t:'Lev. Agachar',s:'Arise'}, {v:'KOK',t:'Ajoelhar 1',s:'KOK'}, {v:'AKOK',t:'Levantar 1',s:'AKOK'}, {v:'TBC1',t:'Girar Corpo 1',s:'Case 1'}, {v:'TBC2',t:'Girar Corpo 2',s:'Case 2'}, {v:'FM',t:'Mov. Pé',s:'<30cm'} ]}, {l:"Unidade",t:'c',id:'u',o:[{v:'s',t:'Passos',s:'Qtd'},{v:'m',t:'Metros',s:'Distância'}], if:(v:any)=>v.a && v.a.startsWith('W')}, {l:"Qtde (Passos)",t:'r',id:'p',min:1,max:50,v:1,if:(v:any)=>(v.a && v.a.startsWith('W')) && (!v.u || v.u==='s')}, {l:"Distância (Metros)",t:'r',id:'dist',min:1,max:30,v:1,if:(v:any)=>(v.a && v.a.startsWith('W')) && v.u==='m'} ], g:(v:any)=>{ if(v.a && v.a.startsWith('W')){ const steps = v.u === 'm' ? Math.ceil(v.dist / 0.75) : v.p; return `${steps}${v.a}`; } return v.a; } },
    'RL': { title:"Soltar", q:[ {l:"Tipo",t:'c',id:'t',o:[ {v:'RL1',t:'Normal',s:'Abrir dedos'}, {v:'RL2',t:'Contato',s:'Tirar contato'} ]} ], g:(v:any)=>v.t },
    'D': { title:"Separar", q:[ {l:"Classe",t:'c',id:'c',o:[ {v:'1',t:'Solto',s:'Pouca força'}, {v:'2',t:'Justo',s:'Média força'}, {v:'3',t:'Firme',s:'Muita força'} ]}, {l:"Manuseio",t:'c',id:'h',o:[ {v:'E',t:'Fácil',s:'Easy'}, {v:'D',t:'Difícil',s:'Difficult'} ]} ], g:(v:any)=>`D${v.c}${v.h}` },
    'T': { title:"Girar (Turn)", q:[ {l:"Graus",t:'r',id:'g',min:30,max:180,v:90}, {l:"Resistência",t:'c',id:'r',o:[ {v:'S',t:'Pequena',s:'< 1kg'}, {v:'M',t:'Média',s:'1-5kg'}, {v:'L',t:'Grande',s:'> 5kg'} ]} ], g:(v:any)=>`T${v.g}${v.r}` },
    'AP': { title:"Força (Pressure)", q:[ {l:"Tipo",t:'c',id:'t',o:[ {v:'APA',t:'Sem Repegar',s:'Simples'}, {v:'APB',t:'Com Repegar',s:'Complexo'} ]} ], g:(v:any)=>v.t },
    'E': { title:"Olhos", q:[ {l:"Ação",t:'c',id:'t',o:[ {v:'ET',t:'Mover Olhar',s:'Travel'}, {v:'EF',t:'Focar',s:'Examinar'} ]} ], g:(v:any)=>v.t }
};

const Wizard = ({ onAdd, motionGroups, setMotionGroups }: any) => {
    const [tab, setTab] = useState<'create'|'groups'>('create');
    const [category, setCategory] = useState<string | null>(null);
    const [params, setParams] = useState<any>({});
    const [wizFreq, setWizFreq] = useState(1);
    const [wizHand, setWizHand] = useState<'E' | 'D'>('D');
    const [editingId, setEditingId] = useState<string|null>(null);
    const [editName, setEditName] = useState("");
    
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

    const handleSelectCategory = (c: string) => { setCategory(c); setParams({}); setWizHand('D'); };
    const handleAdd = () => {
        if (preview.v) {
            onAdd({ code: generatedCode, tmu: preview.t, desc: preview.d, freq: wizFreq, hand: category === 'B' ? 'C' : wizHand });
            setCategory(null); setWizFreq(1);
        }
    };
    const handleGroupAdd = (g: MotionGroup) => g.motions.forEach(m => onAdd(m));
    const handleShare = (g: MotionGroup) => { navigator.clipboard.writeText(JSON.stringify(g)); alert("Copiado!"); };
    const handleDeleteGroup = (id: string) => setMotionGroups(motionGroups.filter((x: any) => x.id !== id));
    const handleUpdateGroup = (id: string) => { setMotionGroups(motionGroups.map((g: any) => g.id === id ? { ...g, name: editName } : g)); setEditingId(null); }

    if (tab === 'groups') {
        return (
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
                <div className="flex border-b dark:border-slate-700">
                    <button onClick={() => setTab('create')} className="flex-1 p-3 text-sm font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">Criar</button>
                    <button onClick={() => setTab('groups')} className="flex-1 p-3 text-sm font-bold text-red-600 border-b-2 border-red-600 bg-white dark:bg-slate-800">Meus Grupos</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {motionGroups.map((g: MotionGroup) => (
                        <div key={g.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border dark:border-slate-700 shadow-sm">
                            {editingId === g.id ? (
                                <div className="flex gap-2 mb-2">
                                    <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 bg-slate-100 dark:bg-slate-900 p-1 rounded text-sm dark:text-white"/>
                                    <button onClick={() => handleUpdateGroup(g.id)} className="p-1 text-green-500"><Save size={16}/></button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200">{g.name}</h4>
                                    <div className="flex gap-1">
                                        <button onClick={() => {setEditingId(g.id); setEditName(g.name);}} className="p-1 text-slate-400 hover:text-blue-500"><Edit2 size={14}/></button>
                                        <button onClick={() => handleShare(g)} className="p-1 text-slate-400 hover:text-purple-500"><Share2 size={14}/></button>
                                        <button onClick={() => handleDeleteGroup(g.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            )}
                            <div className="text-xs text-slate-500 mb-3">{g.motions.length} movimentos</div>
                            <button onClick={() => handleGroupAdd(g)} className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                                <PlusCircle size={14}/> Adicionar
                            </button>
                        </div>
                    ))}
                    <div className="mt-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                        <p className="text-xs text-slate-400 mb-2">Cole código:</p>
                        <input className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded text-xs mb-2 dark:text-white" placeholder='{"id":...}' onPaste={(e) => {
                            try {
                                const g = JSON.parse(e.clipboardData.getData('text'));
                                if (g.motions && g.name) { setMotionGroups([...motionGroups, { ...g, id: Date.now().toString() }]); e.currentTarget.value = ""; alert("Importado!"); }
                            } catch (err) { alert("Inválido"); }
                        }}/>
                    </div>
                </div>
            </div>
        )
    }

    if (!category) {
        return (
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
                <div className="flex border-b dark:border-slate-700">
                    <button onClick={() => setTab('create')} className="flex-1 p-3 text-sm font-bold text-red-600 border-b-2 border-red-600 bg-white dark:bg-slate-800">Criar</button>
                    <button onClick={() => setTab('groups')} className="flex-1 p-3 text-sm font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">Meus Grupos</button>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                    {[
                        { id: 'R', label: 'Mão Vazia', sub: 'Alcançar', icon: <Hand size={20}/>, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                        { id: 'M', label: 'Mover Objeto', sub: 'Carregar', icon: <Grab size={20}/>, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
                        { id: 'G', label: 'Pegar', sub: 'Grasp', icon: <Fingerprint size={20}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
                        { id: 'P', label: 'Posicionar', sub: 'Encaixar', icon: <Crosshair size={20}/>, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
                        { id: 'RL', label: 'Soltar', sub: 'Release', icon: <LogOut size={20}/>, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                        { id: 'D', label: 'Separar', sub: 'Disengage', icon: <Minimize2 size={20}/>, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
                        { id: 'T', label: 'Girar', sub: 'Turn', icon: <RotateCw size={20}/>, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
                        { id: 'AP', label: 'Fazer Força', sub: 'Premir (AP)', icon: <ArrowDownToLine size={20}/>, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' },
                        { id: 'E', label: 'Olhos', sub: 'Focar/Mover', icon: <Eye size={20}/>, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' },
                        { id: 'B', label: 'Corpo/Pé', sub: 'Andar/Agachar', icon: <Footprints size={20}/>, color: 'text-slate-600 bg-slate-100 dark:bg-slate-700' },
                    ].map(c => (
                        <button key={c.id} onClick={() => handleSelectCategory(c.id)} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-red-400 rounded-xl text-left shadow-sm group transition-all flex flex-col gap-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${c.color} group-hover:bg-red-600 group-hover:text-white`}>{c.icon}</div>
                            <div>
                                <span className="block font-bold text-slate-700 dark:text-slate-200 text-sm">{c.label}</span>
                                <span className="text-xs text-slate-400">{c.sub}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const cfg = H_CFG[category];
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
             <div className="p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2">
                 <button onClick={() => setCategory(null)} className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"><ArrowLeft size={14}/> Voltar</button>
                 <span className="font-bold text-slate-700 dark:text-slate-200 ml-auto">{cfg.title}</span>
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-6">
                 {cfg.q.map((q: any, i: number) => {
                     if (q.if && !q.if(params)) return null;
                     const currentVal = params[q.id] !== undefined ? params[q.id] : (q.t === 'r' ? q.v : q.o[0].v);
                     return (
                         <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{q.l}</label>
                             {q.t === 'r' ? (
                                 <div>
                                     <div className="flex justify-between mb-2 text-sm font-bold text-red-600">{currentVal}</div>
                                     <input type="range" min={q.min} max={q.max} value={currentVal} onChange={(e) => setParams({...params, [q.id]: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-red-600 cursor-pointer"/>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-2 gap-2">
                                     {q.o.map((opt: any) => {
                                         const active = currentVal === opt.v;
                                         return (
                                             <button key={opt.v} onClick={() => setParams({...params, [q.id]: opt.v})} className={`p-2 rounded border text-left transition-all ${active ? 'bg-red-50 dark:bg-red-900/30 border-red-500 ring-1 ring-red-500' : 'bg-white dark:bg-slate-800 hover:border-red-300 dark:border-slate-700'}`}>
                                                 <div className={`font-bold text-sm ${active ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{opt.t}</div>
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
             <div className="p-4 bg-slate-50 dark:bg-slate-900">
                <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 text-white shadow-lg border dark:border-slate-700">
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
                        <div className="bg-slate-800 rounded-lg flex items-center px-3 py-2 border border-slate-700 h-10 shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold mr-2">QTD</span>
                            <input type="number" value={wizFreq} min="1" onChange={(e) => setWizFreq(parseInt(e.target.value))} className="bg-transparent w-8 text-center font-bold text-white outline-none text-sm"/>
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

const ResultsView = ({ data, setData }: { data: Study, setData: (d: Study) => void }) => {
    const factor = 1 + (data.tolerance / 100);
    const calcTotal = (arr: Motion[]) => arr.reduce((s,m)=> s + (m.tmu * (m.freq || 1)), 0);
    const curT = calcTotal(data.currentMotions) * 0.0006 * factor;
    const proT = calcTotal(data.proposedMotions) * 0.0006 * factor;
    const savT = Math.max(0, curT - proT);
    const monthlySaving = savT * data.roi.costMin * data.roi.volume * (data.roi.daysPerMonth || 22);
    const yrSav = monthlySaving * 12;
    const investmentRecov = data.roi.invest > 0 && monthlySaving > 0 ? (data.roi.invest / monthlySaving) : 0;
    const impactPct = curT > 0 ? ((curT - proT) / curT) * 100 : 0;
    const diff = data.currentMotions.length - data.proposedMotions.length;
    
    const getDistribution = (motions: Motion[]) => {
        let hand = 0, body = 0;
        motions.forEach(m => {
            if(['R','M','G','P','RL','D','T'].some(c => m.code.startsWith(c))) hand += m.tmu;
            else body += m.tmu;
        });
        return [{name: 'Mãos', value: hand}, {name: 'Corpo', value: body}];
    }
    const distData = getDistribution(data.proposedMotions.length > 0 ? data.proposedMotions : data.currentMotions);
    
    const chartData = [
        { name: 'Atual', min: curT },
        { name: 'Proposto', min: proT }
    ];

    return (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><DollarSign className="text-red-600" size={18}/> Parâmetros Financeiros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo Min (R$)</label>
                            <input type="number" step="0.01" value={data.roi.costMin} onChange={e => setData({...data, roi: {...data.roi, costMin: parseFloat(e.target.value)}})} className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg text-slate-900 dark:text-white font-bold focus:border-red-500 focus:ring-0 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vol. Diário</label>
                            <input type="number" value={data.roi.volume} onChange={e => setData({...data, roi: {...data.roi, volume: parseFloat(e.target.value)}})} className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg text-slate-900 dark:text-white font-bold focus:border-red-500 focus:ring-0 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Invest. (R$)</label>
                            <input type="number" step="100" value={data.roi.invest} onChange={e => setData({...data, roi: {...data.roi, invest: parseFloat(e.target.value)}})} className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg text-slate-900 dark:text-white font-bold focus:border-red-500 focus:ring-0 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-lg">
                        <p className="text-emerald-100 text-xs font-bold uppercase">Economia Mensal</p>
                        <h2 className="text-3xl font-bold mt-1">{monthlySaving.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400 text-xs font-bold uppercase">Economia Anual</p>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{yrSav.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400 text-xs font-bold uppercase">Payback</p>
                        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {monthlySaving <= 0 && data.roi.invest > 0 ? "Infinito" : data.roi.invest === 0 ? "Imediato" : `${investmentRecov.toFixed(1)} Meses`}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {monthlySaving <= 0 && data.roi.invest > 0 ? "Sem ganho mensal" : data.roi.invest === 0 ? "Sem investimento" : `Retorno em ${(investmentRecov * 30).toFixed(0)} dias`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Comparativo de Tempo (com Tolerância)</h4>
                        <div className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                                     <XAxis type="number" hide />
                                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                     <Bar dataKey="min" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40}>
                                         {chartData.map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#3b82f6'} />
                                         ))}
                                     </Bar>
                                 </BarChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2"><Scale className="text-orange-600" size={18}/> Distribuição de Esforço</h4>
                        <div className="flex-1 flex items-center justify-center gap-8">
                             <div className="h-32 w-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie data={distData} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                            {distData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#f97316'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="text-sm space-y-2">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> <span className="font-bold text-slate-600 dark:text-slate-400">Mãos/Braços</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> <span className="font-bold text-slate-600 dark:text-slate-400">Corpo</span></div>
                             </div>
                        </div>
                    </div>
                </div>

                 <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex flex-col justify-center">
                    <h4 className="font-bold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2"><Scissors size={16}/> Análise de Eliminação</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                        {diff > 0 ? `O novo método elimina ${diff} movimentos desnecessários.` : diff === 0 ? "Quantidade de movimentos mantida." : `Novo método adiciona ${Math.abs(diff)} movimentos.`}
                    </p>
                    <div className="flex gap-8 text-sm justify-center">
                        <div className="text-center"><span className="block font-bold text-3xl text-slate-800 dark:text-white">{data.currentMotions.length}</span><span className="text-slate-500 text-xs uppercase">Atual</span></div>
                        <div className="text-center"><span className="block font-bold text-3xl text-slate-800 dark:text-white">{data.proposedMotions.length}</span><span className="text-slate-500 text-xs uppercase">Proposto</span></div>
                        <div className="text-center"><span className="block font-bold text-3xl text-red-600 dark:text-red-400">{Math.max(0, diff)}</span><span className="text-slate-500 text-xs uppercase">Eliminados</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TutorialOverlay = ({ onClose, step, onNext }: { onClose: () => void, step: number, onNext: () => void }) => {
  const steps = [
      {
          title: "Bem-vindo ao TMU Studio Pro",
          desc: "Sua ferramenta profissional para cronoanálise MTM-1. Vamos fazer um tour rápido?",
          target: null
      },
      {
          title: "1. Defina a Operação",
          desc: "Comece dando um nome para sua análise aqui no topo.",
          target: "header-title"
      },
      {
          title: "2. Adicione Movimentos",
          desc: "Use o Assistente Visual, Grupos ou digite os códigos manualmente aqui.",
          target: "motion-input-area"
      },
      {
          title: "3. Simule",
          desc: "Visualize a operação em tempo real para validar a sequência.",
          target: "simulation-btn"
      },
      {
          title: "4. Analise Resultados",
          desc: "Veja o cálculo de ROI, economia e relatórios detalhados.",
          target: "results-tab"
      }
  ];

  const current = steps[step] || steps[0];

  return (
      <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 print:hidden">
        <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative my-auto border dark:border-slate-700 transition-colors">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
          <div className="mb-6 flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
               <Wand2 className="w-12 h-12 text-red-600 dark:text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-2">{current.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8">{current.desc}</p>
          <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">Pular</button>
              <button onClick={onNext} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50">{step < steps.length - 1 ? 'Próximo' : 'Concluir'}</button>
          </div>
          <div className="flex justify-center gap-1 mt-4">
              {steps.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
              ))}
          </div>
        </div>
      </div>
  );
};

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, message: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200 print:hidden">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-sm w-full border dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Confirmação</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancelar</button>
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
            const systemPrompt = `You are an expert in MTM-1. Convert description to JSON motions. Output: [{ "code": "R30A", "desc": "...", "freq": 1, "hand": "D" }]`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash', contents: prompt,
                config: { systemInstruction: systemPrompt, responseMimeType: "application/json" }
            });
            const text = response.text;
            if (!text) throw new Error("No output generated");
            let result = JSON.parse(text);
            if (!Array.isArray(result) && result.motions) result = result.motions;
            if (!Array.isArray(result)) throw new Error("Invalid output format");
            const validMotions: Motion[] = result.map((m: any) => {
                const p = parseCode(m.code);
                return { code: p.v ? m.code.toUpperCase() : "R30A", tmu: p.v ? p.t : 9.5, desc: m.desc || p.d, freq: m.freq || 1, hand: (['E','D','C'].includes(m.hand)) ? m.hand : 'D' };
            });
            onApply(validMotions);
        } catch (err) {
            console.error(err);
            setError("Falha ao gerar códigos. Tente novamente.");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative border dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-500/30"><Bot size={24} /></div>
                    <div><h3 className="text-xl font-bold text-slate-800 dark:text-white">Assistente IA</h3><p className="text-sm text-slate-500 dark:text-slate-400">Descreva a operação.</p></div>
                </div>
                <div className="mb-4">
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Pegar..." className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-700 dark:text-slate-200 font-medium" autoFocus/>
                    {error && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><Info size={12}/> {error}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-all flex items-center gap-2 shadow-lg">{loading ? <RotateCw className="animate-spin" size={18}/> : <Wand2 size={18}/>} {loading ? '...' : 'Gerar'}</button>
                </div>
            </div>
        </div>
    );
};

const SimulationOverlay = ({ motions, onClose }: { motions: Motion[], onClose: () => void }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [speed, setSpeed] = useState(1000);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= motions.length - 1) { setIsPlaying(false); return prev; }
                    return prev + 1;
                });
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, motions.length, speed]);

    const handleRestart = () => { setCurrentIndex(-1); setIsPlaying(true); };

    return (
        <div className="fixed inset-0 z-[90] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
            <div className="w-full max-w-4xl flex-1 flex flex-col gap-8 py-8 h-full">
                <div className="text-center shrink-0">
                    <h2 className="text-3xl font-bold text-white mb-2">Simulação</h2>
                    <p className="text-slate-400">Visualize a sequência.</p>
                </div>
                <div className="flex-1 bg-slate-800/50 rounded-3xl border border-slate-700 p-6 overflow-y-auto relative scroll-smooth shadow-2xl">
                    <div className="space-y-4">
                        {motions.map((m, i) => (
                            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${i === currentIndex ? 'bg-red-600 scale-105 shadow-xl ring-2 ring-red-400 z-10' : 'bg-slate-800/50 text-slate-500 opacity-50'}`}>
                                <span className={`text-xl font-bold w-12 h-12 flex items-center justify-center rounded-lg ${i === currentIndex ? 'bg-white text-red-600' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</span>
                                <div className="flex-1">
                                    <h3 className={`text-xl font-bold ${i === currentIndex ? 'text-white' : 'text-slate-400'}`}>{m.desc}</h3>
                                    <p className={`font-mono text-sm ${i === currentIndex ? 'text-red-200' : 'text-slate-600'}`}>{m.code} • {m.hand} • {(m.tmu * m.freq).toFixed(1)} TMU</p>
                                </div>
                                {i === currentIndex && <div className="animate-pulse w-3 h-3 bg-white rounded-full"></div>}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between gap-6 shrink-0 shadow-xl">
                    <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400 uppercase">Velocidade:</span><div className="flex bg-slate-900 rounded-lg p-1"><button onClick={() => setSpeed(2000)} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${speed === 2000 ? 'bg-red-600 text-white' : 'text-slate-400'}`}>0.25x</button><button onClick={() => setSpeed(1000)} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${speed === 1000 ? 'bg-red-600 text-white' : 'text-slate-400'}`}>1x</button></div></div>
                    <div className="flex items-center gap-4"><button onClick={handleRestart} className="p-4 bg-slate-700 rounded-full text-white"><RotateCw size={24} /></button><button onClick={() => setIsPlaying(!isPlaying)} className="p-6 bg-red-600 rounded-full text-white shadow-lg">{isPlaying ? <Pause size={32} /> : <Play size={32} />}</button><button onClick={() => { setIsPlaying(false); setCurrentIndex(-1); }} className="p-4 bg-slate-700 rounded-full text-white"><StopCircle size={24} /></button></div>
                </div>
            </div>
        </div>
    );
};

const HelpTip = ({ content }: { content: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!show && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPos({ top: rect.top - 8, left: rect.left + (rect.width / 2) });
        }
        setShow(!show);
    };
    return (
      <><button ref={btnRef} type="button" onClick={toggle} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none ml-1 align-middle inline-flex" title="Ver exemplo"><HelpIcon size={14} /></button>
        {show && (<div className="fixed inset-0 z-[100] cursor-default" onClick={(e) => { e.stopPropagation(); setShow(false); }}><div className="absolute bg-slate-800 text-white text-xs p-3 rounded-xl shadow-2xl max-w-[220px] text-center animate-in fade-in zoom-in-95 duration-200 border border-slate-700 pointer-events-none" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>{content}<div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div></div></div>)}
      </>
    );
};

const MTMReferenceTable = () => {
    const EX = {
        R: { A: <span><strong>Fixo.</strong></span>, B: <span><strong>Variável.</strong></span>, C: <span><strong>Misturado.</strong></span>, D: <span><strong>Pequeno.</strong></span>, E: <span><strong>Equilíbrio.</strong></span> },
        M: { A: <span><strong>Para Outra Mão.</strong></span>, B: <span><strong>Aproximado.</strong></span>, C: <span><strong>Exato.</strong></span> },
        P: { 1: <span><strong>Solto.</strong></span>, 2: <span><strong>Justo.</strong></span>, 3: <span><strong>Firme.</strong></span>, S: <span><strong>Simétrico.</strong></span>, SS: <span><strong>Semi.</strong></span>, NS: <span><strong>Não-Sim.</strong></span> },
        T: { S: <span><strong>Pequena.</strong></span>, M: <span><strong>Média.</strong></span>, L: <span><strong>Grande.</strong></span> },
        D: { 1: <span><strong>Solto.</strong></span>, 2: <span><strong>Justo.</strong></span>, 3: <span><strong>Firme.</strong></span> },
        G: { "G1A": "Fácil.", "G1B": "Pequeno.", "G4A": "Misturado.", "G4B": "Misturado.", "G5": "Contato." }
    };
    const Cell = ({v}: {v: any}) => <td className="p-2 text-center border-r border-slate-100 dark:border-slate-700 dark:text-slate-300">{v}</td>;
    return (
        <div className="flex-1 bg-white dark:bg-slate-800 p-6 sm:p-8 overflow-y-auto animate-in fade-in transition-colors">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><BookOpen className="text-red-600"/> Tabela MTM-1</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2"><Hand size={18}/> Alcançar (R)</h3>
                    <div className="overflow-x-auto"><table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden"><thead className="bg-blue-200 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 font-bold"><tr><th className="p-2 border-r border-blue-300 dark:border-blue-800">cm</th><th className="p-2 border-r border-blue-300 dark:border-blue-800 text-center">A <HelpTip content={EX.R.A}/></th><th className="p-2 border-r border-blue-300 dark:border-blue-800 text-center">B <HelpTip content={EX.R.B}/></th><th className="p-2 border-r border-blue-300 dark:border-blue-800 text-center">C/D <HelpTip content={EX.R.C}/></th><th className="p-2 text-center">E <HelpTip content={EX.R.E}/></th></tr></thead><tbody className="text-slate-900">{[2, 6, 10, 20, 30, 40, 50, 80].map(d => { const r = REACH_BASE[d] || REACH_BASE[Object.keys(REACH_BASE).map(Number).reduce((a, b) => Math.abs(b - d) < Math.abs(a - d) ? b : a)]; return (<tr key={d} className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"><td className="p-2 font-bold border-r border-slate-100 dark:border-slate-700 dark:text-slate-200">{d}</td><Cell v={r[0]} /><Cell v={r[1]} /><Cell v={r[2]} /><Cell v={r[4]} /></tr>)})}</tbody></table></div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-orange-900 dark:text-orange-400 mb-3 flex items-center gap-2"><Grab size={18}/> Mover (M)</h3>
                    <div className="overflow-x-auto"><table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden"><thead className="bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-200 font-bold"><tr><th className="p-2 border-r border-orange-300 dark:border-orange-800">cm</th><th className="p-2 border-r border-orange-300 dark:border-orange-800 text-center">A <HelpTip content={EX.M.A}/></th><th className="p-2 border-r border-orange-300 dark:border-orange-800 text-center">B <HelpTip content={EX.M.B}/></th><th className="p-2 text-center">C <HelpTip content={EX.M.C}/></th></tr></thead><tbody className="text-slate-900">{[2, 6, 10, 20, 30, 40, 50, 80].map(d => { const r = MOVE_BASE[d] || MOVE_BASE[Object.keys(MOVE_BASE).map(Number).reduce((a, b) => Math.abs(b - d) < Math.abs(a - d) ? b : a)]; return (<tr key={d} className="border-b border-slate-100 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"><td className="p-2 font-bold border-r border-slate-100 dark:border-slate-700 dark:text-slate-200">{d}</td><Cell v={r[0]} /><Cell v={r[1]} /><Cell v={r[2]} /></tr>)})}</tbody></table></div>
                </div>
            </div>
        </div>
    );
};

function Editor({ data, setData, onSave, onBack, activeTab, setActiveTab, wizardOpen, setWizardOpen, aiModalOpen, setAiModalOpen, onPrint, motionGroups, setMotionGroups, onSimulate, showTour, tourStep }: any) {
    useEffect(() => { const t = setTimeout(() => { onSave(); }, 1000); return () => clearTimeout(t); }, [data]);

    const activeMotions = activeTab === 'current' ? data.currentMotions : data.proposedMotions;
    const factor = 1 + (data.tolerance / 100);
    const totalTMU = activeMotions.reduce((acc: number, m: Motion) => acc + (m.tmu * (m.freq || 1)), 0);
    const totalMin = totalTMU * 0.0006 * factor;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-300 print:h-auto print:overflow-visible relative">
            <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-4 z-30 shrink-0 print:hidden">
                <div id="header-title" className={`flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden transition-all duration-300 ${showTour && tourStep === 1 ? 'ring-4 ring-red-500 rounded p-1 bg-white dark:bg-slate-700 z-[101]' : ''}`}>
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors shrink-0"><ArrowLeft size={20}/></button>
                    <input value={data.title} onChange={(e) => setData({...data, title: e.target.value})} className="font-bold text-base sm:text-lg text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-slate-300 w-full outline-none truncate" placeholder="Nome da Operação..." />
                    <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded shrink-0"><CheckCircle size={10} className="text-emerald-500"/> Salvo</div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button id="simulation-btn" onClick={onSimulate} className={`p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${showTour && tourStep === 3 ? 'ring-4 ring-red-500 z-[101]' : ''}`}><Play size={16}/> <span className="hidden sm:inline">Simular</span></button>
                    <button onClick={onPrint} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"><Printer size={16}/> <span className="hidden sm:inline">Imprimir</span></button>
                    <button id="results-tab" onClick={() => setActiveTab('results')} className={`p-2 bg-slate-900 hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${showTour && tourStep === 4 ? 'ring-4 ring-red-500 z-[101]' : ''}`}><Calculator size={16}/> <span className="hidden sm:inline">Resultados</span></button>
                </div>
            </header>

            <div className="flex-1 flex flex-col print:hidden overflow-hidden">
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-start sm:justify-center shrink-0 shadow-sm z-20 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings2 size={18}/>} />
                    <TabButton active={activeTab === 'current'} onClick={() => setActiveTab('current')} label="1. Atual" />
                    <TabButton active={activeTab === 'proposed'} onClick={() => setActiveTab('proposed')} label="2. Proposto" />
                    <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="3. Resultados" />
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {(activeTab === 'current' || activeTab === 'proposed') && (
                        <>
                            <div className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="bg-white dark:bg-slate-800 px-4 sm:px-6 py-3 border-b dark:border-slate-700 flex justify-between items-center shadow-sm z-10">
                                    <div className="flex gap-2 sm:gap-4 text-xs font-medium">
                                        <div className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded border dark:border-slate-600 text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row sm:gap-1">
                                            <span>Min (+{data.tolerance}%):</span> <strong className="text-slate-900 dark:text-white">{totalMin.toFixed(4)}</strong>
                                        </div>
                                    </div>
                                    <button onClick={() => setWizardOpen(!wizardOpen)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${wizardOpen ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}><Wand2 size={16}/></button>
                                </div>
                                <div id="motion-input-area" className={`flex-1 overflow-y-auto p-2 sm:p-4 pb-48 sm:pb-32 ${showTour && tourStep === 2 ? 'ring-4 ring-red-500 z-[101] bg-white dark:bg-slate-800' : ''}`}>
                                    {activeMotions.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40"><Hand size={48} className="mb-4 text-slate-400" /><p className="text-center px-4 dark:text-slate-400">Adicione movimentos.</p></div>
                                    ) : (
                                        <div className="max-w-3xl mx-auto space-y-2">{activeMotions.map((m: Motion, i: number) => (<MotionCard key={i} motion={m} index={i} onDelete={() => { const list = [...activeMotions]; list.splice(i, 1); if (activeTab === 'current') setData({ ...data, currentMotions: list }); else setData({ ...data, proposedMotions: list }); }} />))}</div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-3 sm:p-4 z-20 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                    <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-2">
                                        <button onClick={() => setAiModalOpen(true)} className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Bot size={24} /> <span className="sm:hidden font-bold">Assistente IA</span></button>
                                        <ManualInput onAdd={(m) => { const list = [...activeMotions, m]; if (activeTab === 'current') setData({ ...data, currentMotions: list }); else setData({ ...data, proposedMotions: list }); }} />
                                    </div>
                                </div>
                            </div>
                            <div className={`${wizardOpen ? 'fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-auto w-full lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none fixed right-0'} transition-all duration-300 bg-white dark:bg-slate-800 ${wizardOpen ? 'border-l dark:border-slate-700' : 'border-none'} flex flex-col shadow-2xl lg:shadow-none`}>
                                <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0"><h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Wand2 size={16} className="text-red-600"/> Assistente Visual</h3><button onClick={() => setWizardOpen(false)} className="lg:hidden p-2 bg-slate-200 dark:bg-slate-700 rounded-full"><X size={20}/></button></div>
                                <div className="flex-1 overflow-y-auto"><Wizard onAdd={(m) => { const list = [...activeMotions, m]; if (activeTab === 'current') setData({ ...data, currentMotions: list }); else setData({ ...data, proposedMotions: list }); }} motionGroups={motionGroups} setMotionGroups={setMotionGroups} /></div>
                            </div>
                        </>
                    )}
                    {activeTab === 'results' && <ResultsView data={data} setData={setData} />}
                    {activeTab === 'config' && (
                        <div className="p-8 text-center text-slate-500">Configurações aqui...</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [studies, setStudies] = useState<Study[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [motionGroups, setMotionGroups] = useState<MotionGroup[]>([]);
  const [dashView, setDashView] = useState<'list' | 'reference'>('list');
  const [activeTab, setActiveTab] = useState<'current' | 'proposed' | 'results' | 'config'>('current');
  const [editorData, setEditorData] = useState<Study | null>(null);
  const [wizardOpen, setWizardOpen] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [simOverlayOpen, setSimOverlayOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tmu_pro_data');
    if (saved) setStudies(JSON.parse(saved)); else setShowTutorial(true);
    const savedGroups = localStorage.getItem('tmu_pro_groups');
    if (savedGroups) setMotionGroups(JSON.parse(savedGroups));
    else setMotionGroups([{ id: '1', name: 'Pegar e Posicionar (Pequeno)', motions: [ { code: 'R30C', tmu: 12.9, desc: 'Alcançar misturado', freq: 1, hand: 'D' }, { code: 'G4B', tmu: 9.1, desc: 'Pegar em pilha', freq: 1, hand: 'D' }, { code: 'M30C', tmu: 15.2, desc: 'Mover exato', freq: 1, hand: 'D' }, { code: 'P1SE', tmu: 5.6, desc: 'Posicionar P1S', freq: 1, hand: 'D' }, { code: 'RL1', tmu: 2.0, desc: 'Soltar', freq: 1, hand: 'D' } ] }]);
    const savedTheme = localStorage.getItem('tmu_pro_theme');
    if (savedTheme === 'dark') setDarkMode(true);
    if (window.innerWidth < 1024) setWizardOpen(false);
  }, []);

  useEffect(() => { localStorage.setItem('tmu_pro_data', JSON.stringify(studies)); }, [studies]);
  useEffect(() => { localStorage.setItem('tmu_pro_groups', JSON.stringify(motionGroups)); }, [motionGroups]);
  useEffect(() => { localStorage.setItem('tmu_pro_theme', darkMode ? 'dark' : 'light'); if (darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [darkMode]);

  const handleCreateNew = () => { const newStudy: Study = { id: Date.now().toString(), title: "Nova Análise", tolerance: 8, currentMotions: [], proposedMotions: [], roi: { costMin: 0.50, volume: 100, invest: 0, daysPerMonth: 22 }, updatedAt: Date.now() }; setStudies([newStudy, ...studies]); setCurrentId(newStudy.id); setEditorData(newStudy); setView('editor'); setActiveTab('current'); if (showTutorial) setTourStep(1); };
  const handleOpenStudy = (id: string) => { const s = studies.find(x => x.id === id); if (s) { setCurrentId(id); setEditorData(JSON.parse(JSON.stringify(s))); setView('editor'); setActiveTab('current'); } };
  const handleSaveEditor = () => { if (!editorData || !currentId) return; const updated = { ...editorData, updatedAt: Date.now() }; setStudies(prev => prev.map(s => s.id === currentId ? updated : s)); };
  const handleTourNext = () => { if (tourStep < 4) setTourStep(tourStep + 1); else { setShowTutorial(false); setTourStep(0); } };
  const totalSavings = useMemo(() => { return studies.reduce((acc, study) => { const factor = 1 + (study.tolerance / 100); const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor; const cur = calc(study.currentMotions); const pro = calc(study.proposedMotions); const saving = Math.max(0, cur - pro); const days = study.roi.daysPerMonth || 22; return acc + (saving * study.roi.costMin * study.roi.volume * days); }, 0); }, [studies]);

  return (
    <div className={`h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans overflow-hidden print:h-auto print:overflow-visible transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
        {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} step={tourStep} onNext={handleTourNext} />}
        {confirmDeleteId && (<ConfirmModal isOpen={true} message="Tem certeza que deseja excluir este estudo?" onConfirm={() => { setStudies(prev => prev.filter(s => s.id !== confirmDeleteId)); setConfirmDeleteId(null); }} onCancel={() => setConfirmDeleteId(null)} />)}
        {view === 'dashboard' && (
            <div className="flex h-full animate-in fade-in duration-500 relative print:hidden">
                <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col z-20 shadow-lg transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-start gap-3"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-red-500/20 shadow-lg">T</div><div><h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">TMU Studio</h1><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRO EDITION</span></div></div>
                    <nav className="flex-1 p-4 space-y-2"><button onClick={() => setDashView('list')} className={`w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl font-bold transition-all ${dashView === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}><LayoutDashboard size={20} /> Dashboard</button><button onClick={() => setDashView('reference')} className={`w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl font-bold transition-all ${dashView === 'reference' ? 'bg-slate-100 dark:bg-slate-700 text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}><BookOpen size={20} /> Tabela MTM-1</button><button onClick={handleCreateNew} className="w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 mt-4"><Plus size={20} /> Novo Estudo</button></nav>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2"><button onClick={() => setDarkMode(!darkMode)} className="flex items-center justify-start gap-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors w-full">{darkMode ? <Sun size={18} /> : <Moon size={18} />} {darkMode ? 'Modo Claro' : 'Modo Escuro'}</button><button onClick={() => { setShowTutorial(true); setTourStep(0); }} className="flex items-center justify-start gap-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors w-full"><HelpCircle size={18} /> Ajuda / Tutorial</button></div>
                </aside>
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 lg:pb-8 flex flex-col">
                    {dashView === 'list' ? (
                        <>
                            <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4 shrink-0"><div><div className="flex items-center gap-2 lg:hidden mb-2"><div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold italic">T</div><span className="font-bold text-slate-900 dark:text-white">TMU Studio Pro</span></div><h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Painel de Estudos</h2><p className="text-slate-500 dark:text-slate-400">Gestão e análise de produtividade.</p></div><div className="text-left sm:text-right bg-white dark:bg-slate-800 p-4 sm:p-0 rounded-xl border sm:border-none border-slate-100 dark:border-slate-700 shadow-sm sm:shadow-none"><p className="text-sm font-bold text-slate-400 uppercase">Economia Total (Mês)</p><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div></header>
                            {studies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-80 sm:h-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed text-center p-6"><div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-full mb-4"><LayoutDashboard className="w-12 h-12 text-slate-300 dark:text-slate-500" /></div><h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Nenhum estudo encontrado</h3><button onClick={handleCreateNew} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Criar Estudo</button></div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left min-w-[600px]"><thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-700 text-xs uppercase text-slate-400 font-bold"><tr><th className="px-6 py-4">Título</th><th className="px-6 py-4 text-center">Data</th><th className="px-6 py-4 text-center">Atual (min)</th><th className="px-6 py-4 text-center">Proposto (min)</th><th className="px-6 py-4 text-center">Ganho</th><th className="px-6 py-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{studies.map(study => { const factor = 1 + (study.tolerance / 100); const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor; const c = calc(study.currentMotions); const p = calc(study.proposedMotions); const gain = c > 0 ? ((c - p) / c) * 100 : 0; return (<tr key={study.id} onClick={() => handleOpenStudy(study.id)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"><td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{study.title}</td><td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 text-sm">{new Date(study.updatedAt).toLocaleDateString()}</td><td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-400">{c.toFixed(3)}</td><td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-400">{p.toFixed(3)}</td><td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-bold ${gain > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{gain > 0 ? `-${gain.toFixed(1)}%` : '-'}</span></td><td className="px-6 py-4 text-right"><button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(study.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button></td></tr>); })}</tbody></table></div></div>
                            )}
                        </>
                    ) : ( <MTMReferenceTable /> )}
                </main>
            </div>
        )}
        {view === 'editor' && editorData && ( <Editor data={editorData} setData={setEditorData} onSave={handleSaveEditor} onBack={() => setView('dashboard')} activeTab={activeTab} setActiveTab={setActiveTab} wizardOpen={wizardOpen} setWizardOpen={setWizardOpen} aiModalOpen={aiModalOpen} setAiModalOpen={setAiModalOpen} onPrint={() => window.print()} motionGroups={motionGroups} setMotionGroups={setMotionGroups} onSimulate={() => setSimOverlayOpen(true)} showTour={showTutorial} tourStep={tourStep} /> )}
        {simOverlayOpen && editorData && ( <SimulationOverlay motions={activeTab === 'current' ? editorData.currentMotions : editorData.proposedMotions} onClose={() => setSimOverlayOpen(false)} /> )}
    </div>
  );
}
