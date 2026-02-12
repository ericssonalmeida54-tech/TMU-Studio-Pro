import React, { useState } from 'react';
import {
  ChevronUp, ChevronDown, Trash2, ArrowDownToLine,
  Plus, Check, X
} from 'lucide-react';
import { Motion } from '../types/types';
import { parseCode } from '../utils/mtmLogic';

interface MotionCardProps {
    motion: Motion;
    index: number;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export const MotionCard: React.FC<MotionCardProps> = ({ motion, index, onDelete, onMoveUp, onMoveDown }) => {
    let containerClass = "w-3/4 flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all group relative fade-in mb-1";
    let badgeColor = "bg-slate-500";
    let typeLabel = "CORPO";

    if (motion.type === 'process') {
         containerClass += " mx-auto bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30 text-center w-[95%]";
         badgeColor = "bg-purple-500";
         typeLabel = "PROC";
    } else if (motion.hand === 'E') {
        containerClass += " mr-auto bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30";
        badgeColor = "bg-blue-500";
        typeLabel = "ESQ";
    } else if (motion.hand === 'D') {
        containerClass += " ml-auto bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30";
        badgeColor = "bg-red-500";
        typeLabel = "DIR";
    } else {
        containerClass += " mx-auto bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-center w-[95%]";
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
                    <span className="font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/30 px-1 rounded border border-slate-200/50 dark:border-slate-700">{typeLabel}</span>
                    <span>{motion.code}</span>
                    {motion.type === 'process' && (
                        <span className="text-[10px] text-purple-600 dark:text-purple-400">
                           ({motion.val} {motion.unit})
                        </span>
                    )}
                    {motion.freq > 1 && <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded font-bold ml-1">{motion.freq}x</span>}
                </div>
            </div>
        </div>

        <div className={`flex items-center gap-2 ${motion.hand === 'C' ? 'absolute right-4' : ''}`}>
            <div className="text-right mr-2">
                <span className="font-mono text-slate-600 dark:text-slate-300 font-bold block">{(motion.tmu * (motion.freq || 1)).toFixed(1)}</span>
            </div>

            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onMoveUp} className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ChevronUp size={14}/></button>
                <button onClick={onMoveDown} className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ChevronDown size={14}/></button>
            </div>

            <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
            </button>
        </div>
    </div>
  );
};

interface ManualInputProps {
    onAdd: (m: Motion) => void;
}

export const ManualInput: React.FC<ManualInputProps> = ({ onAdd }) => {
    const [val, setVal] = useState("");
    const [error, setError] = useState(false);
    const [freq, setFreq] = useState(1);
    const [hand, setHand] = useState<'E'|'D'>('D');

    // Process Mode
    const [mode, setMode] = useState<'mtm' | 'process'>('mtm');
    const [procDesc, setProcDesc] = useState("");
    const [procVal, setProcVal] = useState(0);
    const [procUnit, setProcUnit] = useState<'tmu'|'sec'|'min'|'cmin'>('sec');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'process') {
             if (!procDesc) return;
             let tmu = 0;
             switch(procUnit) {
                case 'tmu': tmu = procVal; break;
                case 'sec': tmu = procVal * 27.778; break;
                case 'min': tmu = procVal * 1666.67; break;
                case 'cmin': tmu = procVal * 16.667; break;
             }
             onAdd({
                 code: "PROC",
                 tmu: tmu,
                 desc: procDesc,
                 freq: freq,
                 hand: 'C',
                 type: 'process',
                 unit: procUnit,
                 val: procVal
             });
             setProcDesc(""); setProcVal(0); setFreq(1); setMode('mtm');
             return;
        }

        const p = parseCode(val);
        if (p.v) {
            onAdd({
                code: val.toUpperCase(),
                tmu: p.t,
                desc: p.d,
                freq: freq,
                hand: p.type === 'body' ? 'C' : hand,
                type: 'mtm'
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
        <form onSubmit={handleSubmit} className="flex-1 relative flex flex-col sm:flex-row items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
                <button type="button" onClick={() => setMode('mtm')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${mode === 'mtm' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>MTM</button>
                <button type="button" onClick={() => setMode('process')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${mode === 'process' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 dark:text-purple-400' : 'text-slate-500'}`}>PROC</button>
            </div>

            {mode === 'mtm' ? (
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full overflow-hidden focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                    <div className="bg-slate-100 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600 px-2 py-1 flex flex-col items-center justify-center w-14 shrink-0">
                        <span className="text-[10px] text-slate-400 dark:text-slate-300 font-bold uppercase">Qtd</span>
                        <input type="number" min="1" value={freq} onChange={e => setFreq(parseInt(e.target.value))} className="w-full bg-transparent text-center font-bold text-sm outline-none text-slate-700 dark:text-white p-0" />
                    </div>

                    <div className="flex border-r border-slate-200 dark:border-slate-600 shrink-0">
                        <button type="button" onClick={() => setHand('E')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors border-r border-slate-100 dark:border-slate-600 ${hand === 'E' ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>E</button>
                        <button type="button" onClick={() => setHand('D')} className={`w-8 h-full flex items-center justify-center text-xs font-bold transition-colors ${hand === 'D' ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>D</button>
                    </div>

                    <input
                        value={val}
                        onChange={(e) => setVal(e.target.value.toUpperCase())}
                        placeholder={error ? "Inválido" : "Código..."}
                        className={`w-full h-full pl-4 pr-12 py-3 bg-transparent border-none text-sm font-mono uppercase outline-none text-slate-800 dark:text-white ${error ? 'placeholder-red-400' : 'placeholder-slate-400'}`}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-2 w-full">
                     <input value={procDesc} onChange={e => setProcDesc(e.target.value)} placeholder="Descrição da Operação..." className="flex-1 px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium text-slate-800 dark:text-white" autoFocus />
                     <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shrink-0 w-32">
                        <input type="number" value={procVal} onChange={e => setProcVal(parseFloat(e.target.value))} className="w-16 px-2 py-3 bg-transparent text-center font-bold text-sm outline-none text-slate-800 dark:text-white" placeholder="0" />
                        <select value={procUnit} onChange={e => setProcUnit(e.target.value as any)} className="w-16 bg-slate-100 dark:bg-slate-700 text-xs font-bold outline-none border-l border-slate-200 dark:border-slate-600 py-3 px-1 text-slate-600 dark:text-slate-300">
                             <option value="sec">Seg</option>
                             <option value="min">Min</option>
                             <option value="cmin">cMin</option>
                             <option value="tmu">TMU</option>
                        </select>
                     </div>
                </div>
            )}

            <button type="submit" className={`p-3 rounded-xl text-white transition-colors shadow-lg ${mode === 'mtm' ? 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800' : 'bg-purple-600 hover:bg-purple-700'}`}>
                <ArrowDownToLine size={20} />
            </button>
        </form>
    );
};
