import React, { useState } from 'react';
import {
    ArrowLeft, Plus, Trash2, Save, FolderOpen, Target, Clock,
    CheckCircle, List, BarChart3, Edit2, Download, Upload
} from 'lucide-react';
import { Study, ProcessModel } from '../types/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';

interface ModelManagerProps {
    models: ProcessModel[];
    setModels: React.Dispatch<React.SetStateAction<ProcessModel[]>>;
    studies: Study[];
    onBack: () => void;
}

export const ModelManager: React.FC<ModelManagerProps> = ({ models, setModels, studies, onBack }) => {
    const [view, setView] = useState<'list' | 'edit' | 'results'>('list');
    const [currentModel, setCurrentModel] = useState<ProcessModel | null>(null);

    // --- CRUD ---

    const handleCreateNew = () => {
        const newModel: ProcessModel = {
            id: Date.now().toString(),
            title: "Novo Modelo de Processo",
            description: "",
            studyIds: [],
            updatedAt: Date.now()
        };
        setCurrentModel(newModel);
        setView('edit');
    };

    const handleEdit = (model: ProcessModel) => {
        setCurrentModel(JSON.parse(JSON.stringify(model)));
        setView('edit');
    };

    const handleViewResults = (model: ProcessModel) => {
        setCurrentModel(model);
        setView('results');
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este modelo?")) {
            setModels(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleSaveCurrent = () => {
        if (!currentModel) return;
        setModels(prev => {
            const exists = prev.find(m => m.id === currentModel.id);
            if (exists) {
                return prev.map(m => m.id === currentModel.id ? { ...currentModel, updatedAt: Date.now() } : m);
            }
            return [...prev, { ...currentModel, updatedAt: Date.now() }];
        });
        setView('list');
    };

    if (view === 'edit' && currentModel) {
        return (
            <ModelEditor
                model={currentModel}
                setModel={setCurrentModel}
                studies={studies}
                onSave={handleSaveCurrent}
                onCancel={() => setView('list')}
            />
        );
    }

    if (view === 'results' && currentModel) {
        return (
            <ModelResults
                model={currentModel}
                studies={studies}
                onBack={() => setView('list')}
            />
        );
    }

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 flex flex-col h-full overflow-hidden">
             <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <button onClick={onBack} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 mb-2 transition-colors"><ArrowLeft size={16}/> Voltar para Dashboard</button>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FolderOpen className="text-blue-600"/> Modelos de Processo
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Agrupe estudos individuais em linhas de produção ou células.</p>
                </div>
                <button onClick={handleCreateNew} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"><Plus size={18}/> Novo Modelo</button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {models.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
                        <FolderOpen size={48} className="mb-4 opacity-50"/>
                        <p>Nenhum modelo de processo criado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {models.map(model => (
                             <div key={model.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                                        {model.title.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleViewResults(model)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Ver Resultados"><BarChart3 size={16}/></button>
                                        <button onClick={() => handleEdit(model)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDelete(model.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 truncate">{model.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 overflow-hidden text-ellipsis">{model.description || "Sem descrição..."}</p>
                                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <span>{model.studyIds.length} Etapas</span>
                                    <span>{new Date(model.updatedAt).toLocaleDateString()}</span>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Model Editor ---

const ModelEditor: React.FC<{ model: ProcessModel, setModel: (m: ProcessModel) => void, studies: Study[], onSave: () => void, onCancel: () => void }> = ({ model, setModel, studies, onSave, onCancel }) => {
    // Filter only Single Studies
    const singleStudies = studies.filter(s => s.type === 'single');

    const toggleStudy = (id: string) => {
        if (model.studyIds.includes(id)) {
            setModel({ ...model, studyIds: model.studyIds.filter(sid => sid !== id) });
        } else {
            setModel({ ...model, studyIds: [...model.studyIds, id] });
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 shrink-0">
                 <div className="flex items-center gap-4">
                     <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-500"/></button>
                     <div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Modelo</h2>
                         <p className="text-slate-500 text-sm">Defina as etapas do processo.</p>
                     </div>
                 </div>
                 <button onClick={onSave} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"><Save size={18}/> Salvar Modelo</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título do Modelo</label>
                         <input value={model.title} onChange={e => setModel({...model, title: e.target.value})} className="w-full text-lg font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none focus:border-blue-500 text-slate-800 dark:text-white" placeholder="Ex: Linha de Montagem A" />

                         <label className="block text-xs font-bold text-slate-400 uppercase mt-4 mb-1">Descrição</label>
                         <textarea value={model.description || ''} onChange={e => setModel({...model, description: e.target.value})} className="w-full text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-3 outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 ring-blue-500 min-h-[80px] text-slate-700 dark:text-slate-300" placeholder="Detalhes sobre este processo..." />

                         <label className="block text-xs font-bold text-slate-400 uppercase mt-4 mb-1">Target Cycle Time (Takt) - Opcional</label>
                         <input type="number" step="0.001" value={model.targetCycleTime || ''} onChange={e => setModel({...model, targetCycleTime: parseFloat(e.target.value)})} className="w-full text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-3 outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 ring-blue-500 font-mono font-bold text-slate-700 dark:text-white" placeholder="0.000 min" />
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-700 dark:text-white">Selecione os Estudos Individuais (Etapas)</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                         {singleStudies.length === 0 && <div className="text-center p-8 text-slate-400 italic">Nenhum estudo individual disponível. Crie um primeiro.</div>}
                         {singleStudies.map(study => {
                             const isSelected = model.studyIds.includes(study.id);
                             const factor = 1 + (study.tolerance / 100);
                             const tmu = study.currentMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
                             const min = tmu * 0.0006 * factor;

                             return (
                                 <div key={study.id} onClick={() => toggleStudy(study.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-blue-300'}`}>
                                     <div className="flex items-center gap-4">
                                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                                             <CheckCircle size={14} fill="currentColor" />
                                         </div>
                                         <div>
                                             <div className="font-bold text-slate-700 dark:text-white text-sm">{study.title}</div>
                                             <div className="text-xs text-slate-400">{new Date(study.updatedAt).toLocaleDateString()}</div>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <span className="font-mono font-bold text-slate-600 dark:text-slate-300 block">{min.toFixed(4)} min</span>
                                         <span className="text-[10px] text-slate-400 uppercase">{tmu.toFixed(1)} TMU</span>
                                     </div>
                                 </div>
                             );
                         })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Model Results ---

const ModelResults: React.FC<{ model: ProcessModel, studies: Study[], onBack: () => void }> = ({ model, studies, onBack }) => {
    // Get selected studies in order (if we stored order, but currently generic list. Assuming selection order or default filter order)
    // Actually `studyIds` is an array, so it preserves order of addition if managed right, but toggle logic might mess it.
    // Ideally we should allow reordering. For now, we filter studies based on ID list.
    const selectedStudies = model.studyIds
        .map(id => studies.find(s => s.id === id))
        .filter((s): s is Study => !!s);

    // Calculations
    const totalTimeMin = selectedStudies.reduce((acc, s) => {
        const factor = 1 + (s.tolerance / 100);
        const tmu = s.currentMotions.reduce((mAcc, m) => mAcc + (m.tmu * (m.freq || 1)), 0);
        return acc + (tmu * 0.0006 * factor);
    }, 0);

    const totalObservedMin = selectedStudies.reduce((acc, s) => acc + (s.observedTime || 0), 0);
    const avgEfficiency = selectedStudies.length > 0
        ? selectedStudies.reduce((acc, s) => {
             const factor = 1 + (s.tolerance / 100);
             const std = s.currentMotions.reduce((mAcc, m) => mAcc + (m.tmu * (m.freq || 1)), 0) * 0.0006 * factor;
             const obs = s.observedTime || 0;
             return acc + (obs > 0 ? (std/obs)*100 : 0);
          }, 0) / selectedStudies.length
        : 0;

    // Bottleneck Analysis
    const maxTime = Math.max(...selectedStudies.map(s => {
        const factor = 1 + (s.tolerance / 100);
        return s.currentMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0) * 0.0006 * factor;
    }));
    const capacity = maxTime > 0 ? 60 / maxTime : 0; // Pcs/h based on bottleneck

    return (
         <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-6 shrink-0 print:hidden">
                 <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-500"/></button>
                     <div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resultados Consolidados</h2>
                         <p className="text-slate-500 text-sm">Análise do Modelo: {model.title}</p>
                     </div>
                 </div>
                 <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"><List size={18}/> Imprimir Relatório</button>
             </div>

            {/* PRINT HEADER */}
            <div className="hidden print:block mb-8 border-b border-black pb-4">
                <h1 className="text-2xl font-bold uppercase">Relatório de Processo Consolidado</h1>
                <p>Modelo: {model.title}</p>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Tempo Total (Lead Time)</h3>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">{totalTimeMin.toFixed(4)} <span className="text-sm font-medium text-slate-500">min</span></div>
                    <div className="text-xs font-mono text-slate-400 mt-1">{selectedStudies.length} Etapas</div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Capacidade (Gargalo)</h3>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{capacity.toFixed(1)} <span className="text-sm font-medium text-slate-500">pçs/h</span></div>
                    <div className="text-xs text-slate-400 mt-1">Baseado no maior ciclo ({maxTime.toFixed(3)} min)</div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Eficiência Média</h3>
                    <div className={`text-3xl font-bold ${avgEfficiency >= 95 ? 'text-emerald-600' : 'text-yellow-600'}`}>{avgEfficiency.toFixed(1)} <span className="text-sm font-medium">%</span></div>
                    <div className="text-xs text-slate-400 mt-1">Média das eficiências individuais</div>
                 </div>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                     <h3 className="font-bold text-slate-800 dark:text-white">Detalhamento por Etapa (Gráfico de Balanceamento)</h3>
                 </div>
                 <div className="flex-1 p-6">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={selectedStudies.map(s => {
                             const factor = 1 + (s.tolerance / 100);
                             const val = s.currentMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0) * 0.0006 * factor;
                             return {
                                 name: s.title,
                                 time: val,
                                 isBottleneck: Math.abs(val - maxTime) < 0.0001
                             };
                         })} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} tick={{ fontSize: 10 }} />
                            <YAxis unit=" min" />
                            <Tooltip
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            {model.targetCycleTime && (
                                <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} y={model.targetCycleTime} stroke="red" />
                            )}
                            <Bar dataKey="time" name="Tempo Padrão">
                                {selectedStudies.map((s, index) => {
                                     const factor = 1 + (s.tolerance / 100);
                                     const val = s.currentMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0) * 0.0006 * factor;
                                     const isBottleneck = Math.abs(val - maxTime) < 0.0001;
                                     return <Cell key={`cell-${index}`} fill={isBottleneck ? '#ef4444' : '#3b82f6'} />;
                                })}
                            </Bar>
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
             </div>
         </div>
    );
};
