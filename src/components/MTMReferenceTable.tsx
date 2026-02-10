import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { REACH_BASE, MOVE_BASE, TURN_DATA, POS_DATA, DIS_DATA, STAT } from '../utils/mtmLogic';

const MTMReferenceTable = () => {
    const [tab, setTab] = useState<'R'|'M'|'T'|'G'|'P'>('R');

    const TabButton = ({ id, label }: { id: any, label: string }) => (
        <button
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-bold border-t-2 border-x border-b-0 rounded-t-lg transition-colors ${tab === id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:text-blue-600'}`}
        >
            {label}
        </button>
    );

    const TableHeader = ({ children }: { children: React.ReactNode }) => (
        <th className="border border-slate-300 dark:border-slate-600 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 font-bold text-center">{children}</th>
    );

    const TableCell = ({ children, bold = false }: { children: React.ReactNode, bold?: boolean }) => (
        <td className={`border border-slate-300 dark:border-slate-600 px-2 py-1 text-center ${bold ? 'font-bold bg-slate-50 dark:bg-slate-800/50' : ''}`}>{children}</td>
    );

    const renderTable = () => {
        if (tab === 'R') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-600">
                        <thead>
                            <tr>
                                <TableHeader>Dist (cm)</TableHeader>
                                <TableHeader>A</TableHeader>
                                <TableHeader>B</TableHeader>
                                <TableHeader>C / D</TableHeader>
                                <TableHeader>E</TableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                            {Object.entries(REACH_BASE).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                                <tr key={k} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10">
                                    <TableCell bold>{k}</TableCell>
                                    <TableCell>{v[0]}</TableCell>
                                    <TableCell>{v[1]}</TableCell>
                                    <TableCell>{v[2]}</TableCell>
                                    <TableCell>{v[4]}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-2 text-xs text-slate-500 italic">
                        * A: Mão para obj. fixo; B: Mão para obj. var.; C/D: Misturado/Pequeno; E: Equilíbrio.
                    </div>
                </div>
            );
        }
        if (tab === 'M') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-600">
                        <thead>
                            <tr>
                                <TableHeader>Dist (cm)</TableHeader>
                                <TableHeader>A</TableHeader>
                                <TableHeader>B</TableHeader>
                                <TableHeader>C</TableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                            {Object.entries(MOVE_BASE).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                                <tr key={k} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10">
                                    <TableCell bold>{k}</TableCell>
                                    <TableCell>{v[0]}</TableCell>
                                    <TableCell>{v[1]}</TableCell>
                                    <TableCell>{v[2]}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <div className="mt-2 text-xs text-slate-500 italic">
                        * A: Para outra mão/encosto; B: Aproximado; C: Exato.
                    </div>
                </div>
            );
        }
        if (tab === 'T') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-600">
                        <thead>
                            <tr>
                                <TableHeader>Graus (°)</TableHeader>
                                <TableHeader>S (Pequena)</TableHeader>
                                <TableHeader>M (Média)</TableHeader>
                                <TableHeader>L (Grande)</TableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                            {Object.entries(TURN_DATA).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                                <tr key={k} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10">
                                    <TableCell bold>{k}</TableCell>
                                    <TableCell>{v[0]}</TableCell>
                                    <TableCell>{v[1]}</TableCell>
                                    <TableCell>{v[2]}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (tab === 'P') {
             return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold mb-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 pb-1">Posicionar (P)</h4>
                        <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-600">
                            <thead><tr><TableHeader>Código</TableHeader><TableHeader>TMU (E)</TableHeader><TableHeader>TMU (D)</TableHeader></tr></thead>
                            <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                {Object.entries(POS_DATA).map(([k, v]: any) => (
                                    <tr key={k} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10"><TableCell bold>{k}</TableCell><TableCell>{v.E}</TableCell><TableCell>{v.D}</TableCell></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 pb-1">Separar (D)</h4>
                        <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-600">
                            <thead><tr><TableHeader>Classe</TableHeader><TableHeader>TMU (E)</TableHeader><TableHeader>TMU (D)</TableHeader></tr></thead>
                            <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                {Object.entries(DIS_DATA).map(([k, v]: any) => (
                                    <tr key={k} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10"><TableCell bold>D{k}</TableCell><TableCell>{v.E}</TableCell><TableCell>{v.D}</TableCell></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             )
        }
        // G/RL/Other Static
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['G', 'RL', 'AP', 'E', 'B', 'W'].map(prefix => (
                    <div key={prefix} className="mb-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-sm">
                        <h4 className="font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-2 border-b border-slate-200 dark:border-slate-600 text-xs uppercase">
                            {prefix === 'G' ? 'Pegar (Grasp)' : prefix === 'RL' ? 'Soltar (Release)' : prefix === 'AP' ? 'Força (Apply Pressure)' : prefix === 'E' ? 'Olhos (Eye)' : 'Corpo (Body)'}
                        </h4>
                        <table className="w-full text-xs">
                             <thead><tr><th className="px-2 py-1 text-left bg-slate-50 dark:bg-slate-800 text-slate-500">Cod</th><th className="px-2 py-1 text-left bg-slate-50 dark:bg-slate-800 text-slate-500">Desc</th><th className="px-2 py-1 text-right bg-slate-50 dark:bg-slate-800 text-slate-500">TMU</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Object.entries(STAT).filter(([k]) => k.startsWith(prefix) || (prefix === 'B' && !k.startsWith('G') && !k.startsWith('RL') && !k.startsWith('AP') && !k.startsWith('E') && !k.startsWith('W') && k !== 'FMP' && k !== 'FM') || (prefix === 'W' && k.startsWith('W'))).map(([k, v]) => (
                                    <tr key={k} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10">
                                        <td className="px-2 py-1 font-bold font-mono text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{k}</td>
                                        <td className="px-2 py-1 text-slate-600 dark:text-slate-400">{v.d}</td>
                                        <td className="px-2 py-1 text-right font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">{v.t}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 bg-white dark:bg-slate-950 p-6 sm:p-8 overflow-y-auto animate-in fade-in flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="text-blue-600"/>
                <span>Tabela de Referência MTM-1</span>
            </h2>

            <div className="flex gap-1 overflow-x-auto pb-0 mb-0 border-b border-slate-200 dark:border-slate-800">
                {[
                    {id: 'R', l: 'Alcançar (R)'}, {id: 'M', l: 'Mover (M)'},
                    {id: 'T', l: 'Girar (T)'}, {id: 'P', l: 'Posicionar (P/D)'},
                    {id: 'G', l: 'Outros (G/RL/Corpo)'}
                ].map(x => (
                    <TabButton key={x.id} id={x.id} label={x.l} />
                ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl shadow-inner">
                {renderTable()}
            </div>
        </div>
    );
};

export default MTMReferenceTable;
