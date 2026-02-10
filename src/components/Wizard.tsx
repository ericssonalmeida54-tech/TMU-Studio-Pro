import React, { useState, useMemo } from 'react';
import {
  Hand, Grab, Fingerprint, Crosshair, LogOut, Minimize2, RotateCw,
  ArrowDownToLine, Eye, Footprints, ArrowLeft, PlusCircle, LayoutGrid,
  Search
} from 'lucide-react';
import { parseCode } from '../utils/mtmLogic';
import { Motion, MotionGroup } from '../types/types';

// Wizard Configuration Data
// Updated with new logic: Weight, Motion in Hand, Eye Travel, Leg Motion, Side Step
const H_CFG: any = {
    'R': {
        title:"Mover Mão (Reach)",
        q:[
            {l:"Distância (cm)",t:'r',id:'d',min:2,max:120,v:30}, // Extended max range
            {l:"Destino",t:'c',id:'c',o:[
                {v:'A',t:'Fixo',s:'Lugar certo'},
                {v:'B',t:'Variável',s:'Muda sempre'},
                {v:'C',t:'Misturado',s:'Em pilha'},
                {v:'D',t:'Pequeno',s:'Precisa cuidado'}
            ]},
            {l:"Mão em Movimento?",t:'c',id:'m',o:[
                {v:'',t:'Não',s:'Parada'},
                {v:'m',t:'Sim',s:'Já se movendo'}
            ]}
        ],
        g:(v:any)=>`${v.m ? 'm' : ''}R${v.d}${v.c}`
    },
    'M': {
        title:"Mover Objeto (Move)",
        q:[
            {l:"Distância (cm)",t:'r',id:'d',min:2,max:120,v:30},
            {l:"Destino",t:'c',id:'c',o:[
                {v:'A',t:'Outra mão',s:'Ou encosto'},
                {v:'B',t:'Aproximado',s:'Local incerto'},
                {v:'C',t:'Exato',s:'Encaixe'}
            ]},
            {l:"Peso (kg)",t:'r',id:'w',min:0,max:25,v:0}, // Weight Input
            {l:"Mão em Movimento?",t:'c',id:'m',o:[
                {v:'',t:'Não',s:'Parada'},
                {v:'m',t:'Sim',s:'Já se movendo'}
            ]}
        ],
        g:(v:any)=>`${v.m ? 'm' : ''}M${v.d}${v.c}${v.w > 0 ? `-${v.w}kg` : ''}`
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
                {v:'LM',t:'Mover Perna',s:'LM'},
                {v:'SS-C1',t:'Passo Lat C1',s:'<30cm'},
                {v:'SS-C2',t:'Passo Lat C2',s:'<60cm'},
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
            // Walk specifics
            {l:"Unidade",t:'c',id:'u',o:[{v:'s',t:'Passos',s:'Qtd'},{v:'m',t:'Metros',s:'Distância'}], if:(v:any)=>v.a && v.a.startsWith('W')},
            {l:"Qtde (Passos)",t:'r',id:'p',min:1,max:50,v:1,if:(v:any)=>(v.a && v.a.startsWith('W')) && (!v.u || v.u==='s')},
            {l:"Distância (Metros)",t:'r',id:'dist',min:1,max:30,v:1,if:(v:any)=>(v.a && v.a.startsWith('W')) && v.u==='m'},
            // Leg Motion specifics
            {l:"Distância (cm)",t:'r',id:'lm_dist',min:1,max:50,v:15,if:(v:any)=>v.a==='LM'}
        ],
        g:(v:any)=>{
            if(v.a && v.a.startsWith('W')){
                const steps = v.u === 'm' ? Math.ceil(v.dist / 0.75) : v.p;
                return `${steps}${v.a}`;
            }
            if(v.a === 'LM') return `LM${v.lm_dist}`;
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
            ]},
            // Eye Travel Specifics
            {l:"Distância entre Pontos (T)",t:'r',id:'et_t',min:1,max:100,v:30,if:(v:any)=>v.t==='ET'},
            {l:"Distância Olho-Objeto (D)",t:'r',id:'et_d',min:10,max:100,v:40,if:(v:any)=>v.t==='ET'}
        ],
        g:(v:any)=>v.t === 'ET' ? `ET${v.et_t}/${v.et_d}` : v.t
    }
};

interface WizardProps {
    onAdd: (m: Motion) => void;
    groups: MotionGroup[];
}

export const Wizard: React.FC<WizardProps> = ({ onAdd, groups }) => {
    const [category, setCategory] = useState<string | null>(null);
    const [params, setParams] = useState<any>({});
    const [wizFreq, setWizFreq] = useState(1);
    const [wizHand, setWizHand] = useState<'E' | 'D'>('D');
    const [viewMode, setViewMode] = useState<'std' | 'groups'>('std');
    const [searchGroup, setSearchGroup] = useState("");

    // Derived state for preview
    const generatedCode = useMemo(() => {
        if (!category || viewMode === 'groups') return '';
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
    }, [category, params, viewMode]);

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
                hand: finalHand,
                type: 'mtm'
            });
            setCategory(null);
            setWizFreq(1);
        }
    };

    const handleAddGroup = (group: MotionGroup) => {
        // Add all motions from group
        group.motions.forEach(m => {
            // Need to clone to ensure unique objects if we were using IDs,
            // but for now simple structure is fine.
            onAdd({...m});
        });
        alert(`Grupo "${group.name}" inserido com sucesso!`);
    };

    const handleBack = () => {
        setCategory(null);
        setParams({});
    }

    // Filter Groups
    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchGroup.toLowerCase()));

    // Groups View
    if (viewMode === 'groups') {
        return (
             <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setViewMode('std')} className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"><ArrowLeft size={14}/> Voltar</button>
                        <span className="font-bold text-slate-700 dark:text-white ml-auto">Meus Grupos</span>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input
                            value={searchGroup}
                            onChange={e => setSearchGroup(e.target.value)}
                            placeholder="Buscar grupo..."
                            className="w-full bg-slate-100 dark:bg-slate-700 pl-9 pr-3 py-2 rounded-lg text-sm outline-none text-slate-700 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredGroups.length === 0 ? (
                        <div className="text-center text-slate-400 py-8 italic">Nenhum grupo encontrado.</div>
                    ) : (
                        filteredGroups.map(g => (
                            <button key={g.id} onClick={() => handleAddGroup(g)} className="w-full text-left bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:shadow-md transition-all group">
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">{g.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{g.description || 'Sem descrição'}</p>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                                    <span>{g.motions.length} Movimentos</span>
                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                        {g.motions.reduce((acc, m) => acc + (m.tmu * (m.freq||1)), 0).toFixed(1)} TMU
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
             </div>
        );
    }

    // Categories UI
    if (!category) {
        return (
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-center">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full">
                        <button onClick={() => setViewMode('std')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'std' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500'}`}>MTM-1</button>
                        <button onClick={() => setViewMode('groups')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'groups' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500'}`}>Meus Grupos</button>
                    </div>
                </div>

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

             {/* Dark Preview Box */}
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
