import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, MonitorPlay,
  AlertCircle, Check, Search, RotateCw,
  ChevronRight, Activity
} from 'lucide-react';
import type { Study, Motion } from '../types/types';
import { analyzeErgonomics } from '../utils/ergonomics';

interface DetailedAnalysisProps {
  study: Study;
  onUpdateStudy: (updatedStudy: Study) => void;
  onBack: () => void;
}

export const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ study, onUpdateStudy, onBack }) => {
  const [activeScenario, setActiveScenario] = useState<'current' | 'proposed'>('proposed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentMotionIndex, setCurrentMotionIndex] = useState<number | null>(null);

  const activeMotions = activeScenario === 'current' ? study.currentMotions : study.proposedMotions;
  const listRef = useRef<HTMLDivElement>(null);

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      if (activeMotions.length === 0) { setIsPlaying(false); return; }

      const totalTMU = activeMotions.reduce((acc, m) => acc + (m.tmu * (m.freq || 1)), 0);
      const totalTimeMs = totalTMU * 30;
      const stepTime = 50;

      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { setIsPlaying(false); return 100; }
          const newProgress = prev + ((stepTime / (totalTimeMs / playbackSpeed)) * 100);

          // Determine current motion
          const currentTMU = (newProgress / 100) * totalTMU;
          let accumTMU = 0;
          let foundIndex = -1;
          for (let i = 0; i < activeMotions.length; i++) {
             accumTMU += activeMotions[i].tmu * (activeMotions[i].freq || 1);
             if (accumTMU >= currentTMU) { foundIndex = i; break; }
          }
          setCurrentMotionIndex(foundIndex);

          // Auto-scroll to active item
          if (foundIndex !== -1 && listRef.current) {
              const el = listRef.current.children[foundIndex] as HTMLElement;
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          return newProgress;
        });
      }, stepTime);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeMotions, playbackSpeed]);

  const handlePlayPause = () => {
      if (progress >= 100) setProgress(0);
      setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentMotionIndex(null);
  };

  // Helper to check risk
  const getRiskInfo = (m: Motion) => {
      const isHeavy = m.code.match(/-(\d+(\.\d+)?)kg/i) && parseFloat(m.code.match(/-(\d+(\.\d+)?)kg/i)![1]) > 2;
      const isLongReach = m.code.startsWith('R') && parseInt(m.code.match(/\d+/)?.[0] || '0') > 60;

      if (isHeavy) return { color: 'bg-red-50 border-red-200 text-red-700', label: 'Carga > 2kg' };
      if (isLongReach) return { color: 'bg-yellow-50 border-yellow-200 text-yellow-700', label: 'Alcance > 60cm' };
      return null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in transition-colors duration-300">

      {/* Header / Playback Control */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm z-20 shrink-0">
         <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Search className="text-purple-600 dark:text-purple-400"/> Análise Detalhada (Lupa)
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Inspeção passo-a-passo e detecção de riscos.</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => {setActiveScenario('current'); handleReset();}} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeScenario === 'current' ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>Atual</button>
                <button onClick={() => {setActiveScenario('proposed'); handleReset();}} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeScenario === 'proposed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>Proposto</button>
                <button onClick={onBack} className="ml-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 transition-colors">
                    Voltar
                </button>
            </div>
         </div>

         {/* Timeline Player */}
         <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
             <button onClick={handleReset} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"><RotateCw size={18}/></button>
             <button onClick={handlePlayPause} className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 transition-all active:scale-95">
                 {isPlaying ? <Pause fill="currentColor" size={18}/> : <Play fill="currentColor" size={18} className="ml-0.5"/>}
             </button>

             <div className="flex-1 relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
             </div>

             <div className="flex gap-1">
                 {[1, 2, 5].map(s => (
                     <button key={s} onClick={() => setPlaybackSpeed(s)} className={`px-2 py-1 text-xs font-bold rounded ${playbackSpeed === s ? 'bg-white dark:bg-slate-600 shadow text-purple-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>{s}x</button>
                 ))}
             </div>
         </div>
      </div>

      {/* Detailed Inspection List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950">
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-2">Código</div>
                  <div className="col-span-4">Descrição</div>
                  <div className="col-span-2 text-right">Tempo</div>
                  <div className="col-span-2 text-center">Risco</div>
                  <div className="col-span-1 text-center">Membro</div>
              </div>

              <div ref={listRef} className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeMotions.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">Nenhum movimento registrado.</div>
                  ) : (
                      activeMotions.map((m, i) => {
                          const isActive = i === currentMotionIndex;
                          const risk = getRiskInfo(m);
                          const totalTMU = m.tmu * (m.freq || 1);
                          const timeSec = totalTMU * 0.036; // 1 TMU = 0.036 sec

                          return (
                              <div key={i} className={`grid grid-cols-12 items-center p-4 transition-all duration-300 ${isActive ? 'bg-purple-50 dark:bg-purple-900/20 shadow-inner ring-1 ring-purple-200 dark:ring-purple-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                  <div className="col-span-1 text-center font-bold text-slate-400">{i + 1}</div>
                                  <div className="col-span-2 font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit text-sm border border-slate-200 dark:border-slate-700">{m.code}</div>
                                  <div className="col-span-4 text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-4" title={m.desc}>{m.desc}</div>
                                  <div className="col-span-2 text-right">
                                      <div className="font-bold text-slate-800 dark:text-white font-mono">{totalTMU.toFixed(1)} <span className="text-[10px] text-slate-400">TMU</span></div>
                                      <div className="text-xs text-slate-400">{timeSec.toFixed(2)}s</div>
                                  </div>
                                  <div className="col-span-2 flex justify-center">
                                      {risk ? (
                                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${risk.color}`}>
                                              <AlertCircle size={10}/> {risk.label}
                                          </span>
                                      ) : (
                                          <span className="text-slate-300 dark:text-slate-700">-</span>
                                      )}
                                  </div>
                                  <div className="col-span-1 flex justify-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${m.hand === 'E' ? 'bg-blue-500' : m.hand === 'D' ? 'bg-red-500' : 'bg-slate-500'}`} title={m.hand === 'E' ? 'Esquerda' : m.hand === 'D' ? 'Direita' : 'Corpo'}>
                                          {m.hand}
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
