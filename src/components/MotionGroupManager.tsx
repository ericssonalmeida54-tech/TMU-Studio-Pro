import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Plus, Trash2, Save, Download, Upload,
  FileJson, Edit2, MoreVertical, Search, Check, X,
  FolderOpen
} from 'lucide-react';
import { MotionGroup, Motion } from '../types/types';
import { parseCode } from '../utils/mtmLogic';

interface MotionGroupManagerProps {
  groups: MotionGroup[];
  setGroups: React.Dispatch<React.SetStateAction<MotionGroup[]>>;
  onBack: () => void;
}

export const MotionGroupManager: React.FC<MotionGroupManagerProps> = ({ groups, setGroups, onBack }) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [currentGroup, setCurrentGroup] = useState<MotionGroup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CRUD Operations ---

  const handleCreateNew = () => {
    const newGroup: MotionGroup = {
      id: Date.now().toString(),
      name: "Nova Operação Padrão",
      motions: [],
      updatedAt: Date.now()
    };
    setCurrentGroup(newGroup);
    setView('edit');
  };

  const handleEdit = (group: MotionGroup) => {
    setCurrentGroup(JSON.parse(JSON.stringify(group))); // Deep copy
    setView('edit');
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este grupo?")) {
      setGroups(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleSaveCurrent = () => {
    if (!currentGroup) return;
    setGroups(prev => {
      const exists = prev.find(g => g.id === currentGroup.id);
      if (exists) {
        return prev.map(g => g.id === currentGroup.id ? { ...currentGroup, updatedAt: Date.now() } : g);
      }
      return [...prev, { ...currentGroup, updatedAt: Date.now() }];
    });
    setView('list');
  };

  // --- Import / Export ---

  const handleExportGroup = (group: MotionGroup) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(group));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `mtm_group_${group.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportGroup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const imported = JSON.parse(evt.target?.result as string);
            if (imported.motions && Array.isArray(imported.motions)) {
                // Validate/Fix ID to avoid collision
                const newGroup = { ...imported, id: Date.now().toString(), updatedAt: Date.now() };
                setGroups(prev => [...prev, newGroup]);
                alert("Grupo importado com sucesso!");
            } else {
                alert("Formato inválido.");
            }
        } catch (err) {
            alert("Erro ao ler arquivo.");
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (view === 'edit' && currentGroup) {
    return (
      <GroupEditor
        group={currentGroup}
        setGroup={setCurrentGroup}
        onSave={handleSaveCurrent}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
           <button onClick={onBack} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 mb-2 transition-colors"><ArrowLeft size={16}/> Voltar para Dashboard</button>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <FolderOpen className="text-red-600"/> Gerenciador de Operações Padrão
           </h2>
           <p className="text-slate-500 dark:text-slate-400">Crie e gerencie blocos de movimentos reutilizáveis (Macros).</p>
        </div>
        <div className="flex gap-2">
           <input type="file" ref={fileInputRef} onChange={handleImportGroup} className="hidden" accept=".json" />
           <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"><Upload size={18}/> Importar Grupo</button>
           <button onClick={handleCreateNew} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20"><Plus size={18}/> Novo Grupo</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
            <FolderOpen size={48} className="mb-4 opacity-50"/>
            <p>Nenhum grupo de movimentos criado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
               <div key={group.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group-card relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xl">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleExportGroup(group)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Exportar JSON"><Download size={16}/></button>
                      <button onClick={() => handleEdit(group)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(group.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 truncate">{group.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 overflow-hidden text-ellipsis">{group.description || "Sem descrição..."}</p>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span>{group.motions.length} Movimentos</span>
                    <span>{group.motions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0).toFixed(1)} TMU</span>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Internal Editor Component ---

const GroupEditor: React.FC<{ group: MotionGroup, setGroup: (g: MotionGroup) => void, onSave: () => void, onCancel: () => void }> = ({ group, setGroup, onSave, onCancel }) => {
    const [code, setCode] = useState("");
    const [desc, setDesc] = useState("");
    const [freq, setFreq] = useState(1);
    const [manualMode, setManualMode] = useState(false); // For custom non-MTM entries

    // Process Time Inputs
    const [isProcess, setIsProcess] = useState(false);
    const [procVal, setProcVal] = useState(0);
    const [procUnit, setProcUnit] = useState<'tmu'|'sec'|'min'|'cmin'>('sec');

    const totalTMU = group.motions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();

        if (isProcess) {
            // Process/Machine Time Logic
            if (!desc) return;
            let tmu = 0;
            switch(procUnit) {
                case 'tmu': tmu = procVal; break;
                case 'sec': tmu = procVal * 27.778; break;
                case 'min': tmu = procVal * 1666.67; break;
                case 'cmin': tmu = procVal * 16.667; break;
            }

            const newMotion: Motion = {
                code: "PROC",
                tmu: tmu,
                desc: desc,
                freq: freq,
                hand: 'C',
                type: 'process',
                unit: procUnit,
                val: procVal
            };
            setGroup({ ...group, motions: [...group.motions, newMotion] });
            setDesc(""); setProcVal(0); setFreq(1);
            return;
        }

        // Standard MTM Logic
        const p = parseCode(code);
        if (p.v) {
            setGroup({ ...group, motions: [...group.motions, {
                code: code.toUpperCase(),
                tmu: p.t,
                desc: p.d,
                freq: freq,
                hand: p.type === 'body' ? 'C' : 'D', // Simplified hand logic for now
                type: 'mtm'
            }]});
            setCode(""); setFreq(1);
        } else {
            alert("Código inválido!");
        }
    };

    const removeMotion = (idx: number) => {
        setGroup({ ...group, motions: group.motions.filter((_, i) => i !== idx) });
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-6 shrink-0">
                 <div className="flex items-center gap-4">
                     <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-500"/></button>
                     <div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Grupo</h2>
                         <p className="text-slate-500 text-sm">Defina a sequência de movimentos.</p>
                     </div>
                 </div>
                 <button onClick={onSave} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"><Save size={18}/> Salvar Grupo</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                 {/* Left Panel: Settings & Input */}
                 <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                     <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Grupo</label>
                         <input value={group.name} onChange={e => setGroup({...group, name: e.target.value})} className="w-full text-lg font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none focus:border-red-500 text-slate-800 dark:text-white" placeholder="Ex: Pegar Parafuso" />

                         <label className="block text-xs font-bold text-slate-400 uppercase mt-4 mb-1">Descrição (Opcional)</label>
                         <textarea value={group.description || ''} onChange={e => setGroup({...group, description: e.target.value})} className="w-full text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-3 outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 ring-red-500 min-h-[80px] text-slate-700 dark:text-slate-300" placeholder="Detalhes sobre esta operação..." />
                     </div>

                     <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Plus size={16} className="text-red-500"/> Adicionar Movimento</h4>

                         <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                             <button onClick={() => setIsProcess(false)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isProcess ? 'bg-white dark:bg-slate-700 shadow text-red-600 dark:text-white' : 'text-slate-500'}`}>MTM-1 Padrão</button>
                             <button onClick={() => setIsProcess(true)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isProcess ? 'bg-white dark:bg-slate-700 shadow text-red-600 dark:text-white' : 'text-slate-500'}`}>Processo/Máquina</button>
                         </div>

                         <form onSubmit={handleAdd} className="space-y-4">
                             {isProcess ? (
                                 <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição da Operação</label>
                                        <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 ring-red-500 text-sm font-medium text-slate-800 dark:text-white" placeholder="Ex: Costura Reta" required />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tempo</label>
                                            <input type="number" step="0.01" value={procVal} onChange={e => setProcVal(parseFloat(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 ring-red-500 text-sm font-bold text-slate-800 dark:text-white" />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Unidade</label>
                                            <select value={procUnit} onChange={e => setProcUnit(e.target.value as any)} className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm font-bold text-slate-800 dark:text-white">
                                                <option value="sec">Seg</option>
                                                <option value="min">Min</option>
                                                <option value="cmin">cMin</option>
                                                <option value="tmu">TMU</option>
                                            </select>
                                        </div>
                                    </div>
                                 </>
                             ) : (
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Código MTM-1</label>
                                     <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 ring-red-500 font-mono text-lg font-bold text-slate-800 dark:text-white" placeholder="Ex: R30A" autoFocus />
                                 </div>
                             )}

                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                     <span className="text-xs font-bold text-slate-400 uppercase">Qtd</span>
                                     <input type="number" min="1" value={freq} onChange={e => setFreq(parseInt(e.target.value))} className="w-12 bg-transparent text-center font-bold outline-none text-slate-800 dark:text-white" />
                                 </div>
                                 <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md shadow-red-500/30 transition-all flex items-center gap-2"><Plus size={16}/> Adicionar</button>
                             </div>
                         </form>
                     </div>
                 </div>

                 {/* Right Panel: Motion List */}
                 <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                     <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                         <h3 className="font-bold text-slate-700 dark:text-white">Sequência ({group.motions.length})</h3>
                         <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                             <span className="text-xs font-bold text-slate-400 uppercase mr-2">Total TMU</span>
                             <span className="font-mono font-bold text-slate-800 dark:text-white">{totalTMU.toFixed(1)}</span>
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-2 space-y-2">
                         {group.motions.length === 0 && <div className="text-center p-8 text-slate-400 italic">Nenhum movimento adicionado.</div>}
                         {group.motions.map((m, i) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl transition-all group">
                                 <div className="flex items-center gap-4">
                                     <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300">{i+1}</span>
                                     <div>
                                         <div className="font-bold text-slate-700 dark:text-white text-sm">{m.desc}</div>
                                         <div className="flex items-center gap-2">
                                             <span className={`text-[10px] font-bold px-1.5 rounded ${m.type === 'process' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>{m.code}</span>
                                             {m.freq > 1 && <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-1.5 rounded">{m.freq}x</span>}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{(m.tmu * (m.freq || 1)).toFixed(1)}</span>
                                     <button onClick={() => removeMotion(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
}
