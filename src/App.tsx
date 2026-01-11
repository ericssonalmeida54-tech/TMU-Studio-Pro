import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Plus, Table2, Trash2, ArrowLeft, Settings2, Wand2, 
  Calculator, Info, CheckCircle, Hand, Grab, Fingerprint, Crosshair, 
  LogOut, Minimize2, RotateCw, ArrowDownToLine, Eye, Footprints, 
  X, Bot, PlusCircle, HelpCircle, Printer, DollarSign, 
  Menu, PanelRightClose, PanelRightOpen, Scissors, ChevronUp, 
  ChevronDown, BookOpen, Target, Scale, HelpCircle as HelpIcon,
  MonitorPlay
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Pie, PieChart as RePieChart
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { parseCode, REACH_BASE, MOVE_BASE, STAT, POS_DATA, TURN_DATA, DIS_DATA } from './utils/mtmLogic';
import type { Study, Motion } from './types/types';
import { Simulation } from './components/Simulation';

// --- Components ---

const TutorialOverlay = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto print:hidden">
    <div className="bg-white max-w-2xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative my-auto">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
        <X className="w-6 h-6" />
      </button>
      <div className="mb-6 flex justify-center">
        <div className="bg-red-100 p-4 rounded-full">
           <Wand2 className="w-12 h-12 text-red-600" />
        </div>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-2">Bem-vindo ao TMU Studio Pro</h2>
      <p className="text-slate-500 text-center mb-8">Sua ferramenta profissional para cronoanálise MTM-1.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="flex gap-4">
            <div className="bg-blue-50 p-3 rounded-lg h-fit text-blue-600 shrink-0"><LayoutDashboard size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800">Biblioteca</h4>
                <p className="text-sm text-slate-500">Gerencie todos os seus estudos e veja o resumo de ganhos.</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-emerald-50 p-3 rounded-lg h-fit text-emerald-600 shrink-0"><Calculator size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800">Cálculo de ROI</h4>
                <p className="text-sm text-slate-500">Comparação automática entre método atual e proposto.</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-purple-50 p-3 rounded-lg h-fit text-purple-600 shrink-0"><Bot size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800">Assistente IA</h4>
                <p className="text-sm text-slate-500">Descreva a operação em texto ou voz para gerar códigos automaticamente.</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-orange-50 p-3 rounded-lg h-fit text-orange-600 shrink-0"><Table2 size={20}/></div>
            <div>
                <h4 className="font-bold text-slate-800">Tabela de Referência</h4>
                <p className="text-sm text-slate-500">Acesse a tabela MTM completa diretamente no Dashboard.</p>
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
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmação</h3>
                <p className="text-slate-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
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
            
            const systemPrompt = `You are an expert in MTM-1 (Methods-Time Measurement). 
            Convert the user's operation description into a JSON array of motions.
            
            Output JSON format:
            [
              { "code": "R30A", "desc": "Reach 30cm to object", "freq": 1, "hand": "D" }
            ]
            
            Guidelines:
            - Use standard MTM-1 codes (R, M, G, P, RL, D, T, B, etc).
            - Estimate distances if not provided (default 30cm).
            - 'hand' should be 'E' (Left), 'D' (Right), or 'C' (Body).
            - 'freq' is frequency count.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json"
                }
            });

            const text = response.text;
            if (!text) throw new Error("No output generated");

            let result = JSON.parse(text);
            if (!Array.isArray(result) && result.motions) {
                result = result.motions;
            }

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
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-500/30">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Assistente IA</h3>
                        <p className="text-sm text-slate-500">Descreva a operação para gerar a sequência MTM.</p>
                    </div>
                </div>

                <div className="mb-4">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Pegar uma arruela na caixa a 30cm e montar no parafuso à frente."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-700 font-medium"
                        autoFocus
                    />
                    {error && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><Info size={12}/> {error}</p>}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading || !prompt.trim()}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                        {loading ? <RotateCw className="animate-spin" size={18}/> : <Wand2 size={18}/>}
                        {loading ? 'Processando...' : 'Gerar Códigos'}
                    </button>
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
            setPos({ 
                top: rect.top - 8, 
                left: rect.left + (rect.width / 2) 
            });
        }
        setShow(!show);
    };

    return (
      <>
        <button 
            ref={btnRef}
            type="button"
            onClick={toggle} 
            className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none ml-1 align-middle inline-flex"
            title="Ver exemplo"
        >
          <HelpIcon size={14} />
        </button>
        {show && (
            <div className="fixed inset-0 z-[100] cursor-default" onClick={(e) => { e.stopPropagation(); setShow(false); }}>
                <div 
                    className="absolute bg-slate-800 text-white text-xs p-3 rounded-xl shadow-2xl max-w-[220px] text-center animate-in fade-in zoom-in-95 duration-200 border border-slate-700 pointer-events-none"
                    style={{ 
                        top: pos.top, 
                        left: pos.left, 
                        transform: 'translate(-50%, -100%)' 
                    }}
                >
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div>
                </div>
            </div>
        )}
      </>
    );
};

const MTMReferenceTable = () => {
    const EX = {
        R: {
            A: <span><strong>Objeto em Local Fixo.</strong><br/>Ex: Pegar o volante do carro ou um botão no painel. Movimento automático.</span>,
            B: <span><strong>Objeto em Local Variável.</strong><br/>Ex: Pegar uma caneta isolada sobre a mesa. Local muda a cada ciclo.</span>,
            C: <span><strong>Misturado c/ Outros.</strong><br/>Ex: Pegar um parafuso dentro de uma caixa cheia. Requer busca e seleção.</span>,
            D: <span><strong>Objeto Muito Pequeno.</strong><br/>Ex: Pegar uma agulha ou arruela fina em superfície plana. Requer cuidado.</span>,
            E: <span><strong>Para Equilíbrio.</strong><br/>Ex: Mover a mão apenas para se preparar para o próximo movimento.</span>
        },
        M: {
            A: <span><strong>Para Outra Mão/Parada.</strong><br/>Ex: Passar peça da mão direita para a esquerda ou empurrar contra um encosto.</span>,
            B: <span><strong>Local Aproximado.</strong><br/>Ex: Colocar uma peça pronta em uma caixa de saída ou deixar a ferramenta na mesa.</span>,
            C: <span><strong>Local Exato.</strong><br/>Ex: Levar a chave até a fechadura ou a peça até o dispositivo de montagem.</span>
        },
        P: {
            1: <span><strong>Solto (Sem pressão).</strong><br/>Ex: Colocar lápis no porta-lápis. A gravidade faz o trabalho.</span>,
            2: <span><strong>Justo (Leve pressão).</strong><br/>Ex: Fechar tampa de caneta ou encaixar plugue na tomada.</span>,
            3: <span><strong>Firme (Muita pressão).</strong><br/>Ex: Colocar rolha em garrafa ou encaixe de interferência.</span>,
            S: <span><strong>Simétrico.</strong><br/>Peça encaixa em qualquer posição (Ex: Esfera, cilindro sem lado).</span>,
            SS: <span><strong>Semi-Simétrico.</strong><br/>Peça encaixa em algumas posições (Ex: Retângulo, hexágono).</span>,
            NS: <span><strong>Não-Simétrico.</strong><br/>Peça só encaixa em UMA posição (Ex: Chave na fechadura).</span>
        },
        T: {
            S: <span><strong>Pequena (&lt; 1kg).</strong><br/>Ex: Girar a mão vazia ou com uma caneta.</span>,
            M: <span><strong>Média (1 a 5kg).</strong><br/>Ex: Girar uma garrafa cheia ou ferramenta média.</span>,
            L: <span><strong>Grande (&gt; 5kg).</strong><br/>Ex: Girar um volante pesado ou caixa carregada.</span>
        },
        D: {
            1: <span><strong>Solto (Recuo Curto).</strong><br/>Ex: Tirar chave da fechadura. Movimento fluido.</span>,
            2: <span><strong>Justo (Recuo Médio).</strong><br/>Ex: Tirar tampa de caneta apertada. Há uma leve resistência.</span>,
            3: <span><strong>Firme (Recuo Longo).</strong><br/>Ex: Desencaixar peças presas sob pressão. O recuo é visível.</span>
        },
        G: {
            "G1A": "Pegar objeto fácil e isolado (fechar dedos).",
            "G1B": "Pegar objeto muito pequeno/plano na mesa (ex: moeda).",
            "G4A": "Pegar objeto misturado (ex: parafuso na caixa) >25mm.",
            "G4B": "Pegar objeto misturado entre 6mm e 25mm.",
            "G5": "Tocar/Contato. Apenas encostar sem fechar a mão."
        }
    };

    return (
        <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="text-red-600"/> Tabela MTM-1 (Referência Completa)
            </h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
                {/* Reach Table */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><Hand size={18}/> Alcançar (R) - TMU</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                            <thead className="bg-blue-200 text-blue-900 font-bold">
                                <tr>
                                    <th className="p-2 border-r border-blue-300">cm</th>
                                    <th className="p-2 border-r border-blue-300 text-center">A <HelpTip content={EX.R.A}/></th>
                                    <th className="p-2 border-r border-blue-300 text-center">B <HelpTip content={EX.R.B}/></th>
                                    <th className="p-2 border-r border-blue-300 text-center">C/D <HelpTip content={EX.R.C}/></th>
                                    <th className="p-2 text-center">E <HelpTip content={EX.R.E}/></th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-900">
                                {[2, 6, 10, 20, 30, 40, 50, 80].map(d => {
                                    const r = REACH_BASE[d] || REACH_BASE[Object.keys(REACH_BASE).map(Number).reduce((a, b) => Math.abs(b - d) < Math.abs(a - d) ? b : a)];
                                    return (
                                        <tr key={d} className="border-b border-slate-100 hover:bg-blue-50">
                                            <td className="p-2 font-bold border-r border-slate-100">{d}</td>
                                            <td className="p-2 text-center border-r border-slate-100">{r[0]}</td>
                                            <td className="p-2 text-center border-r border-slate-100">{r[1]}</td>
                                            <td className="p-2 text-center border-r border-slate-100">{r[2]}</td>
                                            <td className="p-2 text-center">{r[4]}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Move Table */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2"><Grab size={18}/> Mover (M) - TMU</h3>
                    <div className="overflow-x-auto">
                         <table className="w-full text-xs text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                            <thead className="bg-orange-200 text-orange-900 font-bold">
                                <tr>
                                    <th className="p-2 border-r border-orange-300">cm</th>
                                    <th className="p-2 border-r border-orange-300 text-center">A <HelpTip content={EX.M.A}/></th>
                                    <th className="p-2 border-r border-orange-300 text-center">B <HelpTip content={EX.M.B}/></th>
                                    <th className="p-2 text-center">C <HelpTip content={EX.M.C}/></th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-900">
                                {[2, 6, 10, 20, 30, 40, 50, 80].map(d => {
                                    const r = MOVE_BASE[d] || MOVE_BASE[Object.keys(MOVE_BASE).map(Number).reduce((a, b) => Math.abs(b - d) < Math.abs(a - d) ? b : a)];
                                    return (
                                        <tr key={d} className="border-b border-slate-100 hover:bg-orange-50">
                                            <td className="p-2 font-bold border-r border-slate-100">{d}</td>
                                            <td className="p-2 text-center border-r border-slate-100">{r[0]}</td>
                                            <td className="p-2 text-center border-r border-slate-100">{r[1]}</td>
                                            <td className="p-2 text-center">{r[2]}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-2 p-2 bg-orange-100 rounded text-[10px] text-orange-900 font-medium">
                        * Adicionar Peso: TMU = (TMU Base × Fator) + Constante.
                    </div>
                </div>

                {/* Turn Table */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2"><RotateCw size={18}/> Girar (T) - TMU</h3>
                    <div className="overflow-x-auto">
                         <table className="w-full text-xs text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                            <thead className="bg-yellow-200 text-yellow-900 font-bold">
                                <tr>
                                    <th className="p-2 border-r border-yellow-300">Graus</th>
                                    <th className="p-2 border-r border-yellow-300 text-center">S <HelpTip content={EX.T.S}/></th>
                                    <th className="p-2 border-r border-yellow-300 text-center">M <HelpTip content={EX.T.M}/></th>
                                    <th className="p-2 text-center">L <HelpTip content={EX.T.L}/></th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-900">
                                {[30, 45, 60, 90, 120, 180].map(d => {
                                    const r = TURN_DATA[d];
                                    return (
                                        <tr key={d} className="border-b border-slate-100 hover:bg-yellow-50">
                                            <td className="p-2 font-bold border-r border-slate-100">{d}°</td>
                                            <td className="p-2 text-center border-r border-slate-100">{r[0]}</td>
                                            <td className="p-2 text-center border-r border-slate-100">{r[1]}</td>
                                            <td className="p-2 text-center">{r[2]}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Position Table */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-teal-900 mb-3 flex items-center gap-2"><Crosshair size={18}/> Posicionar (P) - TMU</h3>
                    <div className="overflow-x-auto">
                         <table className="w-full text-xs text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                            <thead className="bg-teal-200 text-teal-900 font-bold">
                                <tr>
                                    <th className="p-2 border-r border-teal-300">Classe</th>
                                    <th className="p-2 border-r border-teal-300 text-center">S <HelpTip content={EX.P.S}/></th>
                                    <th className="p-2 border-r border-teal-300 text-center">SS <HelpTip content={EX.P.SS}/></th>
                                    <th className="p-2 text-center">NS <HelpTip content={EX.P.NS}/></th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-900">
                                {['1', '2', '3'].map(c => {
                                    const getPE = (s: string) => POS_DATA[`P${c}${s}`]?.E;
                                    const helpKey = c as keyof typeof EX.P;
                                    return (
                                        <tr key={c} className="border-b border-slate-100 hover:bg-teal-50">
                                            <td className="p-2 border-r border-slate-100 font-bold flex items-center gap-1">P{c} <HelpTip content={EX.P[helpKey]}/></td>
                                            <td className="p-2 text-center border-r border-slate-100">{getPE('S')}</td>
                                            <td className="p-2 text-center border-r border-slate-100">{getPE('SS')}</td>
                                            <td className="p-2 text-center">{getPE('NS')}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <p className="text-[10px] text-teal-800 mt-2 font-medium px-1">*Valores para Manuseio Fácil (E). Difícil (D) tem valores maiores.</p>
                    </div>
                </div>

                 {/* Grasp Table */}
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2"><Fingerprint size={18}/> Pegar (G)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(STAT).filter(([k]) => k.startsWith('G')).map(([k, v]) => (
                            <div key={k} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center hover:border-purple-400 hover:shadow-sm transition-all">
                                <div className="flex flex-col">
                                    <span className="font-bold text-purple-900 text-sm">{k}</span>
                                    <span className="text-slate-600 leading-tight">{v.d}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-slate-800 text-sm">{v.t}</span>
                                    {EX.G[k as keyof typeof EX.G] && <HelpTip content={EX.G[k as keyof typeof EX.G]} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Release & Disengage & Others */}
                <div className="space-y-6">
                    {/* Disengage */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Minimize2 size={18}/> Separar (D)</h3>
                        <table className="w-full text-xs text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-4">
                            <thead className="bg-indigo-200 text-indigo-900 font-bold">
                                <tr>
                                    <th className="p-2 border-r border-indigo-300">Classe</th>
                                    <th className="p-2 border-r border-indigo-300 text-center">Fácil (E)</th>
                                    <th className="p-2 text-center">Difícil (D)</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-900">
                                {['1', '2', '3'].map(c => {
                                  const helpKey = Number(c) as keyof typeof EX.D;
                                  return (
                                    <tr key={c} className="border-b border-slate-100 hover:bg-indigo-50">
                                        <td className="p-2 border-r border-slate-100 font-bold flex items-center gap-1">D{c} <HelpTip content={EX.D[helpKey]}/></td>
                                        <td className="p-2 text-center border-r border-slate-100">{DIS_DATA[c]?.E ?? '-'}</td>
                                        <td className="p-2 text-center">{DIS_DATA[c]?.D ?? '-'}</td>
                                    </tr>
                                  )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Eye & Force */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Eye size={18}/> Olhos e Força</h3>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                            {Object.entries(STAT).filter(([k]) => ['EF','ET','APA','APB','RL1','RL2'].includes(k)).map(([k, v]) => (
                                <div key={k} className="bg-white p-2.5 rounded border border-slate-200 flex justify-between items-center hover:bg-slate-50">
                                    <div>
                                        <span className="font-bold text-slate-900 mr-2">{k}</span>
                                        <span className="text-slate-700">{v.d}</span>
                                    </div>
                                    <span className="font-mono font-black text-slate-800">{v.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Body Table */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Footprints size={18}/> Corpo e Perna</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(STAT).filter(([k]) => !k.startsWith('G') && !k.startsWith('RL') && !k.startsWith('A') && !k.startsWith('E')).map(([k, v]) => (
                            <div key={k} className="bg-white p-2.5 rounded border border-slate-200 flex justify-between items-center hover:border-slate-400 transition-all">
                                <div>
                                    <span className="font-bold text-slate-900 mr-2">{k}</span>
                                    <span className="text-slate-700 truncate max-w-[120px] inline-block align-bottom">{v.d}</span>
                                </div>
                                <span className="font-mono font-black text-slate-800">{v.t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor' | 'simulation'>('dashboard');
  const [studies, setStudies] = useState<Study[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Dashboard Sub-Views
  const [dashView, setDashView] = useState<'list' | 'reference'>('list');
  
  // Editor State
  const [activeTab, setActiveTab] = useState<'current' | 'proposed' | 'results' | 'config'>('current');
  const [editorData, setEditorData] = useState<Study | null>(null);
  const [wizardOpen, setWizardOpen] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Init
  useEffect(() => {
    const saved = localStorage.getItem('tmu_pro_data');
    if (saved) {
      setStudies(JSON.parse(saved));
    } else {
        setShowTutorial(true);
    }
    
    // Auto-close wizard on mobile init
    if (window.innerWidth < 1024) {
        setWizardOpen(false);
    }
  }, []);

  // Save Effect
  useEffect(() => {
    localStorage.setItem('tmu_pro_data', JSON.stringify(studies));
  }, [studies]);

  const handleCreateNew = () => {
    const newStudy: Study = {
      id: Date.now().toString(),
      title: "Nova Análise",
      tolerance: 8,
      currentMotions: [],
      proposedMotions: [],
      roi: { costMin: 0.50, volume: 100, invest: 0, daysPerMonth: 22 },
      updatedAt: Date.now()
    };
    setStudies([newStudy, ...studies]);
    setCurrentId(newStudy.id);
    setEditorData(newStudy);
    setView('editor');
    setActiveTab('current');
  };

  const handleOpenStudy = (id: string) => {
    const s = studies.find(x => x.id === id);
    if (s) {
      setCurrentId(id);
      setEditorData(JSON.parse(JSON.stringify(s))); // Deep copy
      setView('editor');
      setActiveTab('current');
    }
  };

  const handleSaveEditor = (dataToSave?: Study) => {
    const data = dataToSave || editorData;
    if (!data || !currentId) return;
    const updated = { ...data, updatedAt: Date.now() };
    setStudies(prev => prev.map(s => s.id === currentId ? updated : s));
  };

  const handleDeleteStudy = (id: string) => {
      setStudies(prev => prev.filter(s => s.id !== id));
      if (currentId === id) {
          setView('dashboard');
          setCurrentId(null);
      }
      setConfirmDeleteId(null);
  }

  // Calculated values for Dashboard
  const totalSavings = useMemo(() => {
    return studies.reduce((acc, study) => {
        const factor = 1 + (study.tolerance / 100);
        const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor;
        const cur = calc(study.currentMotions);
        const pro = calc(study.proposedMotions);
        const saving = Math.max(0, cur - pro);
        const days = study.roi.daysPerMonth || 22;
        const money = saving * study.roi.costMin * study.roi.volume * days;
        return acc + money;
    }, 0);
  }, [studies]);

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden print:h-auto print:overflow-visible">
        {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
        
        {confirmDeleteId && (
            <ConfirmModal 
                isOpen={true} 
                message="Tem certeza que deseja excluir este estudo? Esta ação não pode ser desfeita."
                onConfirm={() => handleDeleteStudy(confirmDeleteId)}
                onCancel={() => setConfirmDeleteId(null)}
            />
        )}

        {view === 'dashboard' && (
            <div className="flex h-full animate-in fade-in duration-500 relative print:hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col z-20 shadow-lg">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-start gap-3">
                         <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-red-500/20 shadow-lg">T</div>
                         <div>
                             <h1 className="text-xl font-bold text-slate-900 leading-none">TMU Studio</h1>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRO EDITION</span>
                         </div>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <button onClick={() => setDashView('list')} className={`w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl font-bold transition-all ${dashView === 'list' ? 'bg-slate-100 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <LayoutDashboard size={20} /> Dashboard
                        </button>
                         <button onClick={() => setDashView('reference')} className={`w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl font-bold transition-all ${dashView === 'reference' ? 'bg-slate-100 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <BookOpen size={20} /> Tabela MTM-1
                        </button>
                        <button onClick={handleCreateNew} className="w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 mt-4">
                            <Plus size={20} /> Novo Estudo
                        </button>
                        <div className="pt-8 border-t border-slate-100 mt-4">
                            <p className="px-3 text-xs font-bold text-slate-400 uppercase mb-2">Recentes</p>
                            {studies.slice(0, 5).map(s => (
                                <button key={s.id} onClick={() => handleOpenStudy(s.id)} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors truncate">
                                    {s.title}
                                </button>
                            ))}
                        </div>
                    </nav>
                    <div className="p-4 border-t border-slate-100">
                        <button onClick={() => setShowTutorial(true)} className="flex items-center justify-start gap-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors">
                            <HelpCircle size={18} /> Ajuda / Tutorial
                        </button>
                    </div>
                </aside>
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 lg:pb-8 flex flex-col">
                    {dashView === 'list' ? (
                        <>
                            <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4 shrink-0">
                                <div>
                                    <div className="flex items-center gap-2 lg:hidden mb-2">
                                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold italic">T</div>
                                        <span className="font-bold text-slate-900">TMU Studio Pro</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Painel de Estudos</h2>
                                    <p className="text-slate-500">Gestão e análise de produtividade.</p>
                                </div>
                                <div className="text-left sm:text-right bg-white sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-none border-slate-100 shadow-sm sm:shadow-none">
                                    <p className="text-sm font-bold text-slate-400 uppercase">Economia Total (Mês)</p>
                                    <p className="text-2xl font-bold text-emerald-600">{totalSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            </header>

                            {studies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-80 sm:h-96 bg-white rounded-3xl border border-slate-200 border-dashed text-center p-6">
                                     <div className="bg-slate-50 p-6 rounded-full mb-4">
                                         <LayoutDashboard className="w-12 h-12 text-slate-300" />
                                     </div>
                                     <h3 className="text-xl font-bold text-slate-700">Nenhum estudo encontrado</h3>
                                     <p className="text-slate-500 mb-6">Comece criando sua primeira análise MTM.</p>
                                     <button onClick={handleCreateNew} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Criar Estudo</button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[600px]">
                                            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-400 font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Título</th>
                                                    <th className="px-6 py-4 text-center">Data</th>
                                                    <th className="px-6 py-4 text-center">Atual (min)</th>
                                                    <th className="px-6 py-4 text-center">Proposto (min)</th>
                                                    <th className="px-6 py-4 text-center">Ganho</th>
                                                    <th className="px-6 py-4 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {studies.map(study => {
                                                    const factor = 1 + (study.tolerance / 100);
                                                    const calc = (m: Motion[]) => m.reduce((s, x) => s + (x.tmu * (x.freq || 1)), 0) * 0.0006 * factor;
                                                    const c = calc(study.currentMotions);
                                                    const p = calc(study.proposedMotions);
                                                    const gain = c > 0 ? ((c - p) / c) * 100 : 0;
                                                    
                                                    return (
                                                        <tr key={study.id} onClick={() => handleOpenStudy(study.id)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                                            <td className="px-6 py-4 font-bold text-slate-800">{study.title}</td>
                                                            <td className="px-6 py-4 text-center text-slate-500 text-sm">{new Date(study.updatedAt).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4 text-center font-mono text-slate-600">{c.toFixed(3)}</td>
                                                            <td className="px-6 py-4 text-center font-mono text-slate-600">{p.toFixed(3)}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${gain > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {gain > 0 ? `-${gain.toFixed(1)}%` : '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(study.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <MTMReferenceTable />
                    )}
                </main>

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button onClick={() => setDashView('list')} className={`flex flex-col items-center p-2 ${dashView === 'list' ? 'text-red-600' : 'text-slate-400'}`}>
                        <LayoutDashboard size={24} />
                        <span className="text-[10px] font-bold mt-1">Home</span>
                    </button>
                    <button onClick={() => setDashView('reference')} className={`flex flex-col items-center p-2 ${dashView === 'reference' ? 'text-red-600' : 'text-slate-400'}`}>
                        <BookOpen size={24} />
                        <span className="text-[10px] font-bold mt-1">Ref</span>
                    </button>
                    <button onClick={handleCreateNew} className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-800 -mt-6">
                        <div className="bg-red-600 text-white p-3 rounded-full shadow-lg shadow-red-600/30">
                            <Plus size={28} />
                        </div>
                        <span className="text-[10px] font-bold mt-1">Novo</span>
                    </button>
                    <button onClick={() => setShowTutorial(true)} className="flex flex-col items-center p-2 text-slate-400">
                        <HelpCircle size={24} />
                        <span className="text-[10px] font-bold mt-1">Ajuda</span>
                    </button>
                </div>
            </div>
        )}

        {view === 'editor' && editorData && (
            <Editor 
                data={editorData} 
                setData={setEditorData} 
                onSave={handleSaveEditor} 
                onBack={() => setView('dashboard')}
                onOpenSimulation={() => setView('simulation')}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                wizardOpen={wizardOpen}
                setWizardOpen={setWizardOpen}
                aiModalOpen={aiModalOpen}
                setAiModalOpen={setAiModalOpen}
                onPrint={() => window.print()}
            />
        )}

        {view === 'simulation' && editorData && (
            <Simulation
                study={editorData}
                onUpdateStudy={(updated) => {
                    setEditorData(updated);
                    handleSaveEditor(updated);
                }}
                onBack={() => setView('editor')}
            />
        )}
    </div>
  );
}

// --- Editor Components ---

function Editor({ data, setData, onSave, onBack, onOpenSimulation, activeTab, setActiveTab, wizardOpen, setWizardOpen, aiModalOpen, setAiModalOpen, onPrint }: any) {
    useEffect(() => {
        const t = setTimeout(() => { onSave(); }, 1000);
        return () => clearTimeout(t);
    }, [data]);

    const activeMotions = activeTab === 'current' ? data.currentMotions : data.proposedMotions;
    const factor = 1 + (data.tolerance / 100);
    const totalTMU = activeMotions.reduce((acc: number, m: Motion) => acc + (m.tmu * (m.freq || 1)), 0);
    const totalMin = totalTMU * 0.0006 * factor;

    // Full Report Calculation Variables
    const calcTotal = (arr: Motion[]) => arr.reduce((s,m)=> s + (m.tmu * (m.freq || 1)), 0);
    const curMin = calcTotal(data.currentMotions) * 0.0006 * factor;
    const proMin = calcTotal(data.proposedMotions) * 0.0006 * factor;
    const saving = Math.max(0, curMin - proMin);
    const savingPct = curMin > 0 ? ((curMin - proMin)/curMin)*100 : 0;

    const handleAddMotion = (motion: Motion) => {
        const newList = [...activeMotions, motion];
        if (activeTab === 'current') setData({ ...data, currentMotions: newList });
        else setData({ ...data, proposedMotions: newList });
    };

    const handleRemoveMotion = (idx: number) => {
        const newList = activeMotions.filter((_: any, i: number) => i !== idx);
        if (activeTab === 'current') setData({ ...data, currentMotions: newList });
        else setData({ ...data, proposedMotions: newList });
    };

    const handleMoveMotion = (index: number, direction: 'up' | 'down') => {
        const list = [...activeMotions];
        if (direction === 'up' && index > 0) {
            [list[index], list[index - 1]] = [list[index - 1], list[index]];
        } else if (direction === 'down' && index < list.length - 1) {
            [list[index], list[index + 1]] = [list[index + 1], list[index]];
        }
        
        if (activeTab === 'current') setData({ ...data, currentMotions: list });
        else setData({ ...data, proposedMotions: list });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300 print:h-auto print:overflow-visible relative">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 z-30 shrink-0 print:hidden">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors shrink-0"><ArrowLeft size={20}/></button>
                    <input 
                        value={data.title} 
                        onChange={(e) => setData({...data, title: e.target.value})}
                        className="font-bold text-base sm:text-lg text-slate-800 bg-transparent border-none p-0 focus:ring-0 placeholder-slate-300 w-full outline-none truncate" 
                        placeholder="Nome da Operação..." 
                    />
                    <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded shrink-0">
                        <CheckCircle size={10} className="text-emerald-500"/> Salvo
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button onClick={onPrint} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors">
                        <Printer size={16}/> <span className="hidden sm:inline">Imprimir</span>
                    </button>
                    <button onClick={onOpenSimulation} className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-purple-500/20">
                        <MonitorPlay size={16}/> <span className="hidden sm:inline">Simular</span>
                    </button>
                    <button onClick={() => setActiveTab('results')} className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors">
                        <Calculator size={16}/> <span className="hidden sm:inline">Resultados</span>
                    </button>
                </div>
            </header>

            {/* FULL REPORT PRINT VIEW */}
            <div className="hidden print:block bg-white p-8 w-full print:overflow-visible h-auto">
                <div className="mb-8 border-b-2 border-red-600 pb-4">
                    <h1 className="text-3xl font-black text-red-600 uppercase italic tracking-tighter">TMU Studio Pro</h1>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{data.title || 'Relatório de Estudo MTM-1'}</h2>
                            <p className="text-sm text-slate-500">Gerado em {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Tolerância Aplicada</p>
                            <p className="text-lg font-mono font-bold text-slate-700">{data.tolerance}%</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Método Atual</p>
                        <p className="text-2xl font-mono font-bold text-slate-700">{curMin.toFixed(4)} <span className="text-sm text-slate-400">min</span></p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Método Proposto</p>
                        <p className="text-2xl font-mono font-bold text-slate-700">{proMin.toFixed(4)} <span className="text-sm text-slate-400">min</span></p>
                    </div>
                    <div className={`p-4 rounded-xl border ${saving > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-xs font-bold uppercase mb-1 ${saving > 0 ? 'text-emerald-600' : 'text-red-600'}`}>Ganho Estimado</p>
                        <p className={`text-2xl font-mono font-bold ${saving > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{savingPct.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Detalhamento: Atual</h3>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-300">
                                    <th className="p-2 text-left">#</th>
                                    <th className="p-2 text-left">Cód</th>
                                    <th className="p-2 text-left">Desc</th>
                                    <th className="p-2 text-right">TMU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.currentMotions.map((m: Motion, i: number) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="p-2 font-bold text-slate-500">{i+1}</td>
                                        <td className="p-2 font-mono font-bold">{m.code}</td>
                                        <td className="p-2 truncate max-w-[150px]">{m.desc}</td>
                                        <td className="p-2 text-right font-mono">{(m.tmu * (m.freq||1)).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Detalhamento: Proposto</h3>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-300">
                                    <th className="p-2 text-left">#</th>
                                    <th className="p-2 text-left">Cód</th>
                                    <th className="p-2 text-left">Desc</th>
                                    <th className="p-2 text-right">TMU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.proposedMotions.map((m: Motion, i: number) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="p-2 font-bold text-slate-500">{i+1}</td>
                                        <td className="p-2 font-mono font-bold">{m.code}</td>
                                        <td className="p-2 truncate max-w-[150px]">{m.desc}</td>
                                        <td className="p-2 text-right font-mono">{(m.tmu * (m.freq||1)).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 break-inside-avoid">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Projeção Financeira</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div><span className="block text-slate-400 text-xs uppercase">Custo Minuto</span> <strong>R$ {data.roi.costMin.toFixed(2)}</strong></div>
                        <div><span className="block text-slate-400 text-xs uppercase">Volume/Dia</span> <strong>{data.roi.volume}</strong></div>
                        <div><span className="block text-slate-400 text-xs uppercase">Dias/Mês</span> <strong>{data.roi.daysPerMonth || 22}</strong></div>
                        <div><span className="block text-slate-400 text-xs uppercase">Economia/Mês</span> <strong className="text-emerald-600">R$ {(saving * data.roi.costMin * data.roi.volume * (data.roi.daysPerMonth || 22)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></div>
                    </div>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex flex-col print:hidden overflow-hidden">
                <div className="bg-white border-b border-slate-200 flex justify-start sm:justify-center shrink-0 shadow-sm z-20 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings2 size={18}/>} />
                    <TabButton active={activeTab === 'current'} onClick={() => setActiveTab('current')} label="1. Atual" />
                    <TabButton active={activeTab === 'proposed'} onClick={() => setActiveTab('proposed')} label="2. Proposto" />
                    <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="3. Resultados" />
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {activeTab === 'config' && (
                        <div className="flex-1 p-4 sm:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border shadow-sm">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings2 className="text-red-600"/> Configurações</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tolerância (%)</label>
                                        <div className="flex items-center gap-4">
                                            <input type="range" min="0" max="30" step="0.5" 
                                                value={data.tolerance} 
                                                onChange={(e) => setData({...data, tolerance: parseFloat(e.target.value)})}
                                                className="flex-1 h-2 bg-slate-200 rounded-lg accent-red-600"
                                            />
                                            <span className="font-mono font-bold text-xl w-16 text-right">{data.tolerance}%</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Dias por Mês (Base de Cálculo)</label>
                                        <input 
                                            type="number" 
                                            value={data.roi.daysPerMonth || 22} 
                                            onChange={(e) => setData({...data, roi: {...data.roi, daysPerMonth: parseFloat(e.target.value)}})}
                                            className="w-full px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-2 ring-red-500 font-mono font-bold outline-none"
                                        />
                                        <p className="text-xs text-slate-400 mt-2">Usado para calcular a economia mensal e anual.</p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm border border-blue-100 flex gap-2">
                                        <Info size={18} className="shrink-0"/>
                                        <p>Ajuste os parâmetros financeiros na aba "Resultados" para cálculo de ROI.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'current' || activeTab === 'proposed') && (
                        <>
                            <div className="flex-1 flex flex-col relative bg-slate-50/50">
                                <div className="bg-white px-4 sm:px-6 py-3 border-b flex justify-between items-center shadow-sm z-10">
                                    <div className="flex gap-2 sm:gap-4 text-xs font-medium">
                                        <div className="px-2 sm:px-3 py-1 bg-slate-100 rounded border text-slate-600 flex flex-col sm:flex-row sm:gap-1">
                                            <span>Min (+{data.tolerance}%):</span> <strong className="text-slate-900">{totalMin.toFixed(4)}</strong>
                                        </div>
                                        <div className="px-2 sm:px-3 py-1 bg-slate-100 rounded border text-slate-600 hidden sm:flex gap-1">
                                            <span>TMU Base:</span> <strong className="text-slate-900">{totalTMU.toFixed(1)}</strong>
                                        </div>
                                    </div>
                                    {/* Universal Toggle Button for Wizard */}
                                    <button onClick={() => setWizardOpen(!wizardOpen)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${wizardOpen ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`} title={wizardOpen ? "Fechar Assistente" : "Abrir Assistente"}>
                                        <Wand2 size={16}/>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 sm:p-4 pb-48 sm:pb-32">
                                    {activeMotions.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                                            <Hand size={48} className="mb-4 text-slate-400" />
                                            <p className="text-center px-4">Adicione movimentos usando a barra abaixo ou o Assistente.</p>
                                        </div>
                                    ) : (
                                        <div className="max-w-3xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {activeMotions.map((m: Motion, i: number) => (
                                                <MotionCard 
                                                    key={i} 
                                                    motion={m} 
                                                    index={i} 
                                                    onDelete={() => handleRemoveMotion(i)} 
                                                    onMoveUp={() => handleMoveMotion(i, 'up')}
                                                    onMoveDown={() => handleMoveMotion(i, 'down')}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-3 sm:p-4 z-20 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                    <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-2">
                                        <button onClick={() => setAiModalOpen(true)} className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                            <Bot size={24} /> <span className="sm:hidden font-bold">Assistente IA</span>
                                        </button>
                                        <ManualInput onAdd={handleAddMotion} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Wizard Slide-over (Mobile: Fullscreen / Desktop: Side) */}
                            <div className={`${wizardOpen ? 'fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-auto w-full lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none fixed right-0'} transition-all duration-300 bg-white ${wizardOpen ? 'border-l' : 'border-none'} border-slate-200 flex flex-col shadow-2xl lg:shadow-none`}>
                                <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Wand2 size={16} className="text-red-600"/> Assistente Visual</h3>
                                    <button onClick={() => setWizardOpen(false)} className="lg:hidden p-2 bg-slate-200 rounded-full hover:bg-slate-300"><X size={20}/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <Wizard onAdd={handleAddMotion} />
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'results' && (
                        <ResultsView data={data} setData={setData} />
                    )}
                </div>
            </div>
            
            {aiModalOpen && <AIModal onClose={() => setAiModalOpen(false)} onApply={(motions) => { 
                const newList = [...activeMotions, ...motions];
                if (activeTab === 'current') setData({ ...data, currentMotions: newList });
                else setData({ ...data, proposedMotions: newList });
                setAiModalOpen(false);
            }} />}
        </div>
    );
}

// --- Sub Components ---

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon?: React.ReactNode, label?: string }) => (
  <button 
    onClick={onClick} 
    className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
  >
    {icon} {label}
  </button>
);

const MotionCard = ({ motion, index, onDelete, onMoveUp, onMoveDown }: { motion: Motion, index: number, onDelete: () => void, onMoveUp: () => void, onMoveDown: () => void }) => {
    let containerClass = "w-3/4 flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all group relative fade-in mb-1";
    let badgeColor = "bg-slate-500";
    let typeLabel = "CORPO";

    if (motion.hand === 'E') {
        containerClass += " mr-auto bg-blue-50 border-blue-100";
        badgeColor = "bg-blue-500";
        typeLabel = "ESQ";
    } else if (motion.hand === 'D') {
        containerClass += " ml-auto bg-red-50 border-red-100";
        badgeColor = "bg-red-500";
        typeLabel = "DIR";
    } else {
        containerClass += " mx-auto bg-slate-50 border-slate-200 text-center w-[95%]";
        badgeColor = "bg-slate-500";
        typeLabel = "CORPO";
    }

  return (
    <div className={containerClass}>
        <div className={`flex items-center gap-3 ${motion.hand === 'C' ? 'justify-center w-full' : ''}`}>
            <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-md text-white ${badgeColor} shrink-0`}>{index + 1}</span>
            <div className={motion.hand === 'C' ? 'flex flex-col items-center' : ''}>
                <div className="text-sm font-bold text-slate-700 leading-tight">{motion.desc}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2 justify-center">
                    <span className="font-bold text-slate-500 bg-white/50 px-1 rounded border border-slate-200/50">{typeLabel}</span>
                    <span>{motion.code}</span>
                    {motion.freq > 1 && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold ml-1">{motion.freq}x</span>}
                </div>
            </div>
        </div>
        
        <div className={`flex items-center gap-2 ${motion.hand === 'C' ? 'absolute right-4' : ''}`}>
            <div className="text-right mr-2">
                <span className="font-mono text-slate-600 font-bold block">{(motion.tmu * (motion.freq || 1)).toFixed(1)}</span>
            </div>
            
            {/* Reorder Controls */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onMoveUp} className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded"><ChevronUp size={14}/></button>
                <button onClick={onMoveDown} className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded"><ChevronDown size={14}/></button>
            </div>
            
            <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
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
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl w-full overflow-hidden focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                <div className="bg-slate-100 border-r border-slate-200 px-2 py-1 flex flex-col items-center justify-center w-14 shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Qtd</span>
                    <input type="number" min="1" value={freq} onChange={e => setFreq(parseInt(e.target.value))} className="w-full bg-transparent text-center font-bold text-sm outline-none text-slate-700 p-0" />
                </div>
                
                <div className="flex border-r border-slate-200 shrink-0">
                    <button type="button" onClick={() => setHand('E')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors border-r border-slate-100 ${hand === 'E' ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}>E</button>
                    <button type="button" onClick={() => setHand('D')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors ${hand === 'D' ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}>D</button>
                </div>

                <input 
                    value={val}
                    onChange={(e) => setVal(e.target.value.toUpperCase())}
                    placeholder={error ? "Inválido" : "Código..."}
                    className={`w-full h-full pl-4 pr-12 py-3 bg-transparent border-none text-sm font-mono uppercase outline-none ${error ? 'placeholder-red-400' : ''}`}
                />
            </div>
            
            <button type="submit" className="p-3 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-600 transition-colors">
                <ArrowDownToLine size={20} />
            </button>
        </form>
    );
};

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
            <div className="flex flex-col h-full bg-slate-50">
                <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                    {[
                        { id: 'R', label: 'Mão Vazia', sub: 'Alcançar', icon: <Hand size={20}/>, color: 'text-blue-600 bg-blue-50' },
                        { id: 'M', label: 'Mover Objeto', sub: 'Carregar', icon: <Grab size={20}/>, color: 'text-orange-600 bg-orange-50' },
                        { id: 'G', label: 'Pegar', sub: 'Grasp', icon: <Fingerprint size={20}/>, color: 'text-purple-600 bg-purple-50' },
                        { id: 'P', label: 'Posicionar', sub: 'Encaixar', icon: <Crosshair size={20}/>, color: 'text-teal-600 bg-teal-50' },
                        { id: 'RL', label: 'Soltar', sub: 'Release', icon: <LogOut size={20}/>, color: 'text-red-600 bg-red-50' },
                        { id: 'D', label: 'Separar', sub: 'Disengage', icon: <Minimize2 size={20}/>, color: 'text-indigo-600 bg-indigo-50' },
                        { id: 'T', label: 'Girar', sub: 'Turn', icon: <RotateCw size={20}/>, color: 'text-yellow-600 bg-yellow-50' },
                        { id: 'AP', label: 'Fazer Força', sub: 'Premir (AP)', icon: <ArrowDownToLine size={20}/>, color: 'text-pink-600 bg-pink-50' },
                        { id: 'E', label: 'Olhos', sub: 'Focar/Mover', icon: <Eye size={20}/>, color: 'text-cyan-600 bg-cyan-50' },
                        { id: 'B', label: 'Corpo/Pé', sub: 'Andar/Agachar', icon: <Footprints size={20}/>, color: 'text-slate-600 bg-slate-100' },
                    ].map(c => (
                        <button key={c.id} onClick={() => handleSelectCategory(c.id)} className="p-4 bg-white border border-slate-100 hover:border-red-400 rounded-xl text-left shadow-sm group transition-all flex flex-col gap-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${c.color} group-hover:bg-red-600 group-hover:text-white`}>{c.icon}</div>
                            <div>
                                <span className="block font-bold text-slate-700 text-sm">{c.label}</span>
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
        <div className="flex flex-col h-full bg-slate-50">
             <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-2">
                 <button onClick={handleBack} className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"><ArrowLeft size={14}/> Voltar</button>
                 <span className="font-bold text-slate-700 ml-auto">{cfg.title}</span>
             </div>

             <div className="flex-1 p-4 overflow-y-auto space-y-6">
                 {cfg.q.map((q: any, i: number) => {
                     // Check conditions
                     if (q.if && !q.if(params)) return null;
                     
                     const currentVal = params[q.id] !== undefined ? params[q.id] : (q.t === 'r' ? q.v : q.o[0].v);

                     return (
                         <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{q.l}</label>
                             
                             {q.t === 'r' ? (
                                 <div>
                                     <div className="flex justify-between mb-2 text-sm font-bold text-red-600">{currentVal}</div>
                                     <input 
                                        type="range" min={q.min} max={q.max} value={currentVal} 
                                        onChange={(e) => setParams({...params, [q.id]: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-lg accent-red-600 cursor-pointer"
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
                                                className={`p-2 rounded border text-left transition-all ${active ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-white hover:border-red-300'}`}
                                             >
                                                 <div className={`font-bold text-sm ${active ? 'text-red-700' : 'text-slate-700'}`}>{opt.t}</div>
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

             {/* Dark Preview Box from Reference */}
             <div className="p-4 bg-slate-50">
                <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg">
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

    // Advanced Metrics
    const unitsPerHour = proT > 0 ? 60 / proT : 0;
    const costPerUnit = proT * data.roi.costMin;
    
    // Distribution Data
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

    const cC = data.currentMotions.length;
    const pC = data.proposedMotions.length;
    const diff = cC - pC;

    return (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Finance Inputs & Main Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign className="text-red-600" size={18}/> Parâmetros Financeiros</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo Min (R$)</label>
                                <input type="number" step="0.01" value={data.roi.costMin} onChange={e => setData({...data, roi: {...data.roi, costMin: parseFloat(e.target.value)}})} className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-lg text-slate-900 font-bold focus:border-red-500 focus:ring-0 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vol. Diário</label>
                                <input type="number" value={data.roi.volume} onChange={e => setData({...data, roi: {...data.roi, volume: parseFloat(e.target.value)}})} className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-lg text-slate-900 font-bold focus:border-red-500 focus:ring-0 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Invest. (R$)</label>
                                <input type="number" step="100" value={data.roi.invest} onChange={e => setData({...data, roi: {...data.roi, invest: parseFloat(e.target.value)}})} className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-lg text-slate-900 font-bold focus:border-red-500 focus:ring-0 outline-none" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-right italic">*Considerando {data.roi.daysPerMonth || 22} dias úteis/mês.</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Impacto de Melhoria</p>
                            <div className="flex items-end gap-2">
                                <h2 className={`text-5xl font-black tracking-tighter ${impactPct < 0 ? 'text-red-400' : 'text-white'}`}>{impactPct.toFixed(1)}%</h2>
                                <span className={`text-sm font-medium mb-2 ${impactPct < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{impactPct < 0 ? 'de aumento' : 'de redução'}</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2 mt-4 overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${impactPct < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${Math.max(0, Math.min(100, Math.abs(impactPct)))}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* Savings & Payback */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                        <p className="text-emerald-100 text-xs font-bold uppercase">Economia Mensal</p>
                        <h2 className="text-3xl font-bold mt-1">{monthlySaving.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-slate-400 text-xs font-bold uppercase">Economia Anual</p>
                        <h2 className="text-3xl font-bold text-slate-800 mt-1">{yrSav.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-slate-400 text-xs font-bold uppercase">Payback</p>
                        <h2 className="text-3xl font-bold text-blue-600 mt-1">
                            {monthlySaving <= 0 && data.roi.invest > 0 ? "Infinito" : data.roi.invest === 0 ? "Imediato" : `${investmentRecov.toFixed(1)} Meses`}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {monthlySaving <= 0 && data.roi.invest > 0 ? "Sem ganho mensal" : data.roi.invest === 0 ? "Sem investimento" : `Retorno em ${(investmentRecov * 30).toFixed(0)} dias`}
                        </p>
                    </div>
                </div>

                {/* NEW: Production Insights (KPIs) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Target className="text-purple-600" size={18}/> KPIs de Produção (Proposto)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <span className="block text-purple-600 text-xs font-bold uppercase mb-1">Capacidade</span>
                                <span className="block text-3xl font-bold text-purple-900">{unitsPerHour.toFixed(0)}</span>
                                <span className="text-xs text-purple-400">peças/hora</span>
                            </div>
                             <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="block text-blue-600 text-xs font-bold uppercase mb-1">Custo Ind.</span>
                                <span className="block text-3xl font-bold text-blue-900">R$ {costPerUnit.toFixed(4)}</span>
                                <span className="text-xs text-blue-400">por peça</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Scale className="text-orange-600" size={18}/> Distribuição de Esforço</h4>
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
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> <span className="font-bold text-slate-600">Mãos/Braços ({(distData[0].value / (distData[0].value+distData[1].value || 1) * 100).toFixed(0)}%)</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> <span className="font-bold text-slate-600">Corpo ({(distData[1].value / (distData[0].value+distData[1].value || 1) * 100).toFixed(0)}%)</span></div>
                             </div>
                        </div>
                    </div>
                </div>
                
                {/* Comparison Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-4">Comparativo de Tempo (com Tolerância)</h4>
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
                    
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex flex-col justify-center">
                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><Scissors size={16}/> Análise de Eliminação</h4>
                        <p className="text-sm text-orange-700 mb-4">
                            {diff > 0 ? `O novo método elimina ${diff} movimentos desnecessários (redução de desperdício).` : diff === 0 ? "Quantidade de movimentos mantida." : `Novo método adiciona ${Math.abs(diff)} movimentos.`}
                        </p>
                        <div className="flex gap-8 text-sm justify-center">
                            <div className="text-center"><span className="block font-bold text-3xl text-slate-800">{cC}</span><span className="text-slate-500 text-xs uppercase">Atual</span></div>
                            <div className="text-center"><span className="block font-bold text-3xl text-slate-800">{pC}</span><span className="text-slate-500 text-xs uppercase">Proposto</span></div>
                            <div className="text-center"><span className="block font-bold text-3xl text-red-600">{Math.max(0, diff)}</span><span className="text-slate-500 text-xs uppercase">Eliminados</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};