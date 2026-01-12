import React, { useState, useEffect } from 'react';
import {
  Play, Plus, Save, Trash2, BarChart2, Check, X,
  RotateCw, FastForward, SkipBack, MonitorPlay, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import type { Study, Motion } from '../types/types';

interface SimulationScenario {
  id: string;
  name: string;
  motions: Motion[];
  description: string;
}

interface SimulationProps {
  study: Study;
  onUpdateStudy: (updatedStudy: Study) => void;
  onBack: () => void;
}

export const Simulation: React.FC<SimulationProps> = ({ study, onUpdateStudy, onBack }) => {
  // Scenarios: Base (Current), Proposed (from study), and Custom ones
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('current');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentMotionIndex, setCurrentMotionIndex] = useState(0);
  const [showStepControls, setShowStepControls] = useState(false);

  useEffect(() => {
    // Initialize scenarios
    const baseScenarios: SimulationScenario[] = [
      {
        id: 'current',
        name: 'Método Atual',
        motions: study.currentMotions,
        description: 'Sequência original de movimentos.'
      },
      {
        id: 'proposed',
        name: 'Método Proposto',
        motions: study.proposedMotions,
        description: 'Sequência otimizada sugerida.'
      }
    ];
    // TODO: Load custom scenarios from study if we add that field later
    setScenarios(baseScenarios);
  }, [study]);

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const activeScenario = scenarios.find(s => s.id === activeScenarioId);
      if (!activeScenario || activeScenario.motions.length === 0) {
        setIsPlaying(false);
        return;
      }

      const totalTMU = activeScenario.motions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
      const totalTimeMs = totalTMU * 30; // Scale TMU to time for visualization (approx)

      const stepTime = 100 / playbackSpeed;

      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const newProgress = prev + (100 / (totalTimeMs / stepTime));

          // Determine current motion based on progress
          const currentTMU = (newProgress / 100) * totalTMU;
          let accumTMU = 0;
          let foundIndex = 0;
          for (let i = 0; i < activeScenario.motions.length; i++) {
             const m = activeScenario.motions[i];
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
  }, [isPlaying, activeScenarioId, scenarios, playbackSpeed]);

  const handlePlay = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentMotionIndex(0);
  };

  const handleStep = (direction: 'next' | 'prev') => {
    setIsPlaying(false);
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    if (!activeScenario) return;

    let newIndex = direction === 'next' ? currentMotionIndex + 1 : currentMotionIndex - 1;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= activeScenario.motions.length) newIndex = activeScenario.motions.length - 1;

    setCurrentMotionIndex(newIndex);

    // Calculate progress for this index
    const totalTMU = activeScenario.motions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
    let accumTMU = 0;
    for (let i = 0; i < newIndex; i++) {
        accumTMU += activeScenario.motions[i].tmu * (activeScenario.motions[i].freq || 1);
    }
    const newProgress = (accumTMU / totalTMU) * 100;
    setProgress(newProgress);
  };

  const calcTMU = (motions: Motion[]) => motions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
  const calcTime = (tmu: number) => (tmu * 0.0006 * (1 + study.tolerance / 100)).toFixed(4);

  const bestScenarioId = scenarios.length > 0 ? scenarios.reduce((prev, curr) =>
    calcTMU(curr.motions) < calcTMU(prev.motions) ? curr : prev
  ).id : null;

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const chartData = scenarios.map(s => ({
    name: s.name,
    tmu: calcTMU(s.motions),
    min: parseFloat(calcTime(calcTMU(s.motions))),
    isBest: s.id === bestScenarioId
  }));

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
         <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MonitorPlay className="text-purple-600"/> Simulação de Cenários
            </h2>
            <p className="text-sm text-slate-500">Compare visualmente e encontre o melhor método.</p>
         </div>
         <button onClick={onBack} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-600 transition-colors">
             Voltar
         </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Controls & List */}
          <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
             <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 mb-3 uppercase text-xs">Cenários Disponíveis</h3>
                <div className="space-y-2">
                    {scenarios.map(s => (
                        <button
                            key={s.id}
                            onClick={() => { setActiveScenarioId(s.id); handleReset(); }}
                            className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden ${activeScenarioId === s.id ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-slate-50 border-slate-200 hover:border-purple-300'}`}
                        >
                            <div className="flex justify-between items-start mb-1 relative z-10">
                                <span className={`font-bold ${activeScenarioId === s.id ? 'text-purple-900' : 'text-slate-700'}`}>{s.name}</span>
                                {s.id === bestScenarioId && <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><Check size={10}/> Melhor</span>}
                            </div>
                            <div className="text-xs text-slate-500 mb-2 relative z-10">{s.description}</div>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="font-mono font-bold text-slate-800">{calcTMU(s.motions).toFixed(1)} TMU</span>
                                <span className="text-xs font-mono text-slate-500">{calcTime(calcTMU(s.motions))} min</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Future Feature: Add Custom Scenario */}
                {/* <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2">
                    <Plus size={18}/> Criar Novo Cenário
                </button> */}
             </div>

             <div className="p-4 bg-slate-50 flex-1">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart2 size={16}/> Comparativo</h4>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{left: 0, right: 30}}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
                             <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
                             <Bar dataKey="tmu" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.isBest ? '#10b981' : '#94a3b8'} />
                                ))}
                             </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
             </div>
          </div>

          {/* Visualization Area */}
          <div className="flex-1 flex flex-col bg-slate-100 p-4 lg:p-8 overflow-y-auto">
              {activeScenario ? (
                  <div className="max-w-4xl mx-auto w-full space-y-6">

                      {/* Player Card */}
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                              <div>
                                  <h3 className="text-2xl font-bold">{activeScenario.name}</h3>
                                  <p className="text-slate-400 text-sm">Visualização em Tempo Real (Simulado)</p>
                              </div>
                              <div className="text-right">
                                  <div className="text-3xl font-mono font-bold text-purple-400">
                                      {Math.min(100, progress).toFixed(1)}%
                                  </div>
                              </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-4 bg-slate-800 w-full relative">
                              <div
                                className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300 ease-linear"
                                style={{ width: `${progress}%` }}
                              ></div>
                              {/* Markers for motions could go here */}
                          </div>

                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              {/* Controls */}
                              <div className="flex items-center gap-4 justify-center md:justify-start">
                                  <button onClick={handleReset} className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"><SkipBack size={20}/></button>
                                  <button
                                    onClick={handlePlay}
                                    className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 transition-all active:scale-95"
                                  >
                                      {isPlaying ? <span className="font-bold text-xs">PAUSE</span> : <Play fill="currentColor" size={24} className="ml-1"/>}
                                  </button>

                                  <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-bold uppercase text-slate-400">Velocidade</label>
                                      <div className="flex bg-slate-100 rounded-lg p-1">
                                          {[0.25, 0.5, 1, 2].map(s => (
                                              <button
                                                key={s}
                                                onClick={() => setPlaybackSpeed(s)}
                                                className={`px-2 py-1 text-xs font-bold rounded ${playbackSpeed === s ? 'bg-white shadow text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
                                              >
                                                  {s}x
                                              </button>
                                          ))}
                                      </div>
                                  </div>

                                  <div className="flex gap-2">
                                      <button onClick={() => handleStep('prev')} className="p-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-500 font-bold text-xs">Ant</button>
                                      <button onClick={() => handleStep('next')} className="p-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-500 font-bold text-xs">Próx</button>
                                  </div>
                              </div>

                              {/* Current Action Display */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 min-h-[100px]">
                                  {activeScenario.motions[currentMotionIndex] ? (
                                      <>
                                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 ${activeScenario.motions[currentMotionIndex].hand === 'E' ? 'bg-blue-500' : activeScenario.motions[currentMotionIndex].hand === 'D' ? 'bg-red-500' : 'bg-slate-500'}`}>
                                              {currentMotionIndex + 1}
                                          </div>
                                          <div className="flex-1">
                                              <div className="flex justify-between items-start">
                                                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Executando Agora</span>
                                                  <span className="text-[10px] font-bold text-slate-400">
                                                      {(progress / 100 * activeScenario.motions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0)).toFixed(1)} / {activeScenario.motions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0).toFixed(1)} TMU
                                                  </span>
                                              </div>
                                              <h4 className="font-bold text-slate-800 text-lg leading-tight">{activeScenario.motions[currentMotionIndex].desc}</h4>
                                              <div className="flex gap-2 mt-1">
                                                  <span className="text-xs font-mono bg-white border px-1 rounded text-slate-500">{activeScenario.motions[currentMotionIndex].code}</span>
                                                  <span className="text-xs font-mono font-bold text-slate-600">{activeScenario.motions[currentMotionIndex].tmu} TMU</span>
                                              </div>
                                          </div>
                                      </>
                                  ) : (
                                      <div className="text-slate-400 flex items-center gap-2 justify-center w-full">
                                          <Check size={20} className="text-emerald-500"/> Simulação Concluída
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* Detailed Sequence (Horizontal Scroll) */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                          <h4 className="font-bold text-slate-700 mb-4">Linha do Tempo</h4>
                          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
                              {activeScenario.motions.map((m, i) => (
                                  <div
                                    key={i}
                                    className={`shrink-0 w-32 p-3 rounded-lg border transition-all ${i === currentMotionIndex ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}
                                  >
                                      <div className="flex justify-between mb-2">
                                          <span className="text-[10px] font-bold text-slate-400">#{i+1}</span>
                                          <span className={`w-2 h-2 rounded-full ${m.hand === 'E' ? 'bg-blue-500' : m.hand === 'D' ? 'bg-red-500' : 'bg-slate-500'}`}></span>
                                      </div>
                                      <p className="text-xs font-bold text-slate-700 truncate mb-1" title={m.desc}>{m.desc}</p>
                                      <p className="text-[10px] font-mono text-slate-500">{m.code}</p>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Insights */}
                      {activeScenario.id === bestScenarioId ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
                              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                                  <Check size={24} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-emerald-900 text-lg">Este é o melhor cenário!</h4>
                                  <p className="text-emerald-700 mt-1">
                                      O cenário <strong>{activeScenario.name}</strong> apresenta a menor carga de tempo ({calcTMU(activeScenario.motions).toFixed(1)} TMU), sendo {chartData.find(c => !c.isBest) ? (100 - (calcTMU(activeScenario.motions) / calcTMU(scenarios.find(s => s.id !== activeScenario.id)?.motions || []) * 100)).toFixed(1) + '%' : ''} mais eficiente que a alternativa.
                                  </p>
                              </div>
                          </div>
                      ) : (
                           <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl flex items-start gap-4">
                              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                                  <AlertCircle size={24} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-yellow-900 text-lg">Oportunidade de Melhoria</h4>
                                  <p className="text-yellow-700 mt-1">
                                      Este cenário consome mais tempo que o ideal. Considere adotar o <strong>{scenarios.find(s => s.id === bestScenarioId)?.name}</strong> para reduzir o ciclo em {(calcTMU(activeScenario.motions) - calcTMU(scenarios.find(s => s.id === bestScenarioId)?.motions || [])).toFixed(1)} TMU.
                                  </p>
                              </div>
                          </div>
                      )}

                  </div>
              ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                      Selecione um cenário para visualizar.
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
