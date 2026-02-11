import React, { useState, useEffect } from 'react';
import {
  Play, Pause, RotateCw, MonitorPlay, AlertCircle,
  Activity, Clock, Hand, Zap, ArrowLeft, Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import type { Study, Motion } from '../types/types';
import { analyzeErgonomics } from '../utils/ergonomics';

interface SimulationProps {
  study: Study;
  onUpdateStudy: (updatedStudy: Study) => void;
  onBack: () => void;
}

export const Simulation: React.FC<SimulationProps> = ({ study, onBack }) => {
  const [activeScenario, setActiveScenario] = useState<'current' | 'proposed'>('proposed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentMotionIndex, setCurrentMotionIndex] = useState(0);

  // Real-time metrics
  const [accumulatedTMU, setAccumulatedTMU] = useState(0);
  const [activeLimb, setActiveLimb] = useState<'E'|'D'|'C'|null>(null);

  const activeMotions = activeScenario === 'current' ? study.currentMotions : study.proposedMotions;
  const totalTMU = activeMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);

  // Chart Data Preparation
  const accumulatedData = activeMotions.map((m, i) => {
      const prev = activeMotions.slice(0, i+1).reduce((acc, x) => acc + (x.tmu * (x.freq||1)), 0);
      return { name: i+1, tmu: prev };
  });

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      if (activeMotions.length === 0) { setIsPlaying(false); return; }

      const totalTimeMs = totalTMU * 30; // Scale
      const stepTime = 50;

      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { setIsPlaying(false); return 100; }
          const newProgress = prev + ((stepTime / (totalTimeMs / playbackSpeed)) * 100);

          // Determine current motion & state
          const currentTMU = (newProgress / 100) * totalTMU;
          setAccumulatedTMU(currentTMU);

          let accumTMU = 0;
          let foundIndex = -1;
          for (let i = 0; i < activeMotions.length; i++) {
             accumTMU += activeMotions[i].tmu * (activeMotions[i].freq || 1);
             if (accumTMU >= currentTMU) {
                 foundIndex = i;
                 break;
             }
          }

          if (foundIndex !== -1) {
              setCurrentMotionIndex(foundIndex);
              setActiveLimb(activeMotions[foundIndex].hand);
          }

          return newProgress;
        });
      }, stepTime);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeMotions, playbackSpeed, totalTMU]);

  const handleReset = () => {
      setIsPlaying(false);
      setProgress(0);
      setAccumulatedTMU(0);
      setCurrentMotionIndex(0);
      setActiveLimb(null);
  };

  const currentMotion = activeMotions[currentMotionIndex];
  const risk = currentMotion ? (
      (currentMotion.code.match(/-(\d+(\.\d+)?)kg/i) && parseFloat(currentMotion.code.match(/-(\d+(\.\d+)?)kg/i)![1]) > 2) ||
      (currentMotion.code.startsWith('R') && parseInt(currentMotion.code.match(/\d+/)?.[0] || '0') > 60)
  ) : false;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white animate-in fade-in transition-colors duration-300">

      {/* Top Control Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg z-20">
         <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 transition-colors"><ArrowLeft size={20}/></button>
             <div>
                 <h2 className="text-xl font-bold flex items-center gap-2"><MonitorPlay className="text-purple-400"/> Simulador Avançado</h2>
                 <div className="flex gap-2 text-xs mt-1">
                     <button onClick={() => {setActiveScenario('current'); handleReset();}} className={`px-2 py-0.5 rounded ${activeScenario === 'current' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Atual</button>
                     <button onClick={() => {setActiveScenario('proposed'); handleReset();}} className={`px-2 py-0.5 rounded ${activeScenario === 'proposed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Proposto</button>
                 </div>
             </div>
         </div>

         <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700">
                 <button onClick={handleReset} className="p-2 hover:text-white text-slate-400"><RotateCw size={18}/></button>
                 <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-full text-white shadow-lg shadow-purple-500/30 transition-transform active:scale-95">
                     {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-0.5"/>}
                 </button>
             </div>
             <div className="flex gap-1">
                 {[1, 2, 5].map(s => (
                     <button key={s} onClick={() => setPlaybackSpeed(s)} className={`px-2 py-1 text-xs font-bold rounded ${playbackSpeed === s ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{s}x</button>
                 ))}
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

          {/* LEFT: Live Action Visualization */}
          <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 -z-10"></div>

              <div className="flex-1 flex items-center justify-center">
                  {currentMotion ? (
                      <div className="relative w-full max-w-xl">
                          {/* Active Motion Card */}
                          <div className={`relative bg-slate-800/80 backdrop-blur-xl border-2 ${risk ? 'border-red-500/50 shadow-red-900/20' : 'border-purple-500/30 shadow-purple-900/20'} rounded-3xl p-8 shadow-2xl transition-all duration-300 transform scale-100`}>

                              <div className="flex justify-between items-start mb-6">
                                  <span className="px-3 py-1 bg-slate-900 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-700">Ação #{currentMotionIndex + 1}</span>
                                  {risk && <span className="flex items-center gap-1 text-red-400 text-xs font-bold uppercase animate-pulse"><AlertCircle size={14}/> Risco Detectado</span>}
                              </div>

                              <div className="text-center mb-8">
                                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">{currentMotion.desc}</h1>
                                  <p className="text-2xl font-mono text-purple-400 font-bold">{currentMotion.code}</p>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                  <div className={`p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center transition-colors ${activeLimb === 'E' ? 'bg-blue-600 border-blue-500' : 'bg-slate-900/50 opacity-50'}`}>
                                      <Hand size={24} className={activeLimb === 'E' ? 'text-white' : 'text-slate-500'} />
                                      <span className="text-[10px] font-bold uppercase mt-2">Esquerda</span>
                                  </div>
                                  <div className={`p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center transition-colors ${activeLimb === 'C' ? 'bg-slate-600 border-slate-500' : 'bg-slate-900/50 opacity-50'}`}>
                                      <Activity size={24} className={activeLimb === 'C' ? 'text-white' : 'text-slate-500'} />
                                      <span className="text-[10px] font-bold uppercase mt-2">Corpo</span>
                                  </div>
                                  <div className={`p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center transition-colors ${activeLimb === 'D' ? 'bg-red-600 border-red-500' : 'bg-slate-900/50 opacity-50'}`}>
                                      <Hand size={24} className={activeLimb === 'D' ? 'text-white' : 'text-slate-500'} />
                                      <span className="text-[10px] font-bold uppercase mt-2">Direita</span>
                                  </div>
                              </div>

                              {/* Progress Bar within Card */}
                              <div className="mt-8 relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-75" style={{width: `${(accumulatedTMU / totalTMU) * 100}%`}}></div>
                              </div>
                              <div className="flex justify-between mt-2 text-xs font-mono text-slate-400">
                                  <span>{accumulatedTMU.toFixed(1)} TMU</span>
                                  <span>{totalTMU.toFixed(1)} TMU</span>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center">
                          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 animate-bounce"><Check size={40}/></div>
                          <h2 className="text-3xl font-bold text-white">Simulação Finalizada</h2>
                          <button onClick={handleReset} className="mt-4 text-purple-400 hover:text-purple-300 font-bold">Reiniciar</button>
                      </div>
                  )}
              </div>
          </div>

          {/* RIGHT: Indicators Panel */}
          <div className="w-full lg:w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
              <div className="p-6 border-b border-slate-700">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Activity size={16}/> Métricas em Tempo Real</h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                          <span className="text-xs text-slate-500 uppercase block mb-1">Tempo Acumulado</span>
                          <span className="text-2xl font-mono font-bold text-white">{(accumulatedTMU * 0.036).toFixed(2)}s</span>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                          <span className="text-xs text-slate-500 uppercase block mb-1">Progresso</span>
                          <span className="text-2xl font-mono font-bold text-purple-400">{Math.round((accumulatedTMU / totalTMU) * 100)}%</span>
                      </div>
                  </div>

                  {/* Cumulative Chart */}
                  <div className="h-40 w-full mb-2">
                      <p className="text-xs text-slate-500 mb-2">Curva de Esforço (TMU Acumulado)</p>
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={accumulatedData}>
                              <defs>
                                  <linearGradient id="colorTmu" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px'}} itemStyle={{color: '#fff'}}/>
                              <Area type="monotone" dataKey="tmu" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTmu)" />
                              {/* Active Line */}
                              {currentMotionIndex > 0 && (
                                <ReferenceLine x={currentMotionIndex + 1} stroke="white" strokeDasharray="3 3" />
                              )}
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Clock size={16}/> Próximos Passos</h3>
                  <div className="space-y-2 opacity-60">
                      {activeMotions.slice(currentMotionIndex + 1, currentMotionIndex + 6).map((m, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/30 border border-slate-700/50">
                              <span className="text-xs font-mono text-slate-500 w-8">{currentMotionIndex + i + 2}</span>
                              <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-300 truncate">{m.desc}</p>
                                  <p className="text-[10px] text-slate-500">{m.code}</p>
                              </div>
                              <span className="text-xs font-mono text-slate-400">{m.tmu}</span>
                          </div>
                      ))}
                      {activeMotions.length > currentMotionIndex + 6 && (
                          <div className="text-center text-xs text-slate-600 mt-2">...e mais {activeMotions.length - (currentMotionIndex + 6)}</div>
                      )}
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
