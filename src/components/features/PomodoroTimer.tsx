
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Trees, Square, Clock, Zap, Settings2 } from 'lucide-react';
import { ActiveTimer, TimeEntry } from '../../types';
import { LanguageContext } from '../../contexts/LanguageContext';

interface PomodoroTimerProps {
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  onStartTimer: (description: string, project: string) => void;
  onStopTimer: () => void;
  isMobile?: boolean;
}

const Flowtime: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { t } = useContext(LanguageContext);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        if (mode === 'work') {
          setWorkSeconds(prev => prev + 1);
        } else {
          setBreakSeconds(prev => {
            if (prev <= 1) {
              setIsActive(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return (): void => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, mode]);

  const toggleTimer = (): void => setIsActive(!isActive);
  
  const startBreak = (): void => {
    // Standard Flowtime ratio: 1/5th of work time
    const calculatedBreak = Math.floor(workSeconds / 5);
    setBreakSeconds(calculatedBreak);
    setMode('break');
    setIsActive(true);
  };

  const startWork = (): void => {
    setMode('work');
    setWorkSeconds(0);
    setIsActive(true);
  };

  const formatTime = (s: number): string => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-full flex flex-col items-center justify-center ${isMobile ? 'gap-6 p-4' : 'gap-8 p-6'}`}>
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
        <button onClick={() => setMode('work')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'work' ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-gray-500'}`}><Zap size={16} /> {t('work')}</button>
        <button onClick={() => setMode('break')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'break' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500'}`}><Coffee size={16} /> {t('break')}</button>
      </div>

      <div className="flex flex-col items-center">
        <div className={`${isMobile ? 'text-6xl' : 'text-7xl'} font-bold text-slate-900 dark:text-white font-mono tracking-tighter`}>
          {formatTime(mode === 'work' ? workSeconds : breakSeconds)}
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mt-2">
          {mode === 'work' ? 'Flowing' : 'Resting'}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {mode === 'work' ? (
          <>
            <button onClick={toggleTimer} className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-amber-600'} text-white`}>
              {isActive ? <Pause size={isMobile ? 28 : 32} fill="currentColor" /> : <Play size={isMobile ? 28 : 32} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={startBreak} disabled={workSeconds < 60} className={`${isMobile ? 'px-4 py-2' : 'px-6 py-3'} rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider disabled:opacity-50`}>
              Take Break
            </button>
          </>
        ) : (
          <button onClick={startWork} className={`${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'} rounded-2xl bg-amber-600 text-white font-bold shadow-lg hover:bg-amber-700 transition-all`}>
            Back to Flow
          </button>
        )}
      </div>

      <div className="text-xs text-gray-400 text-center max-w-[200px]">
        Flowtime tracks your natural focus. Take a break when you feel tired; we&apos;ll calculate the rest you need.
      </div>
    </div>
  );
};

const SimpleTree: React.FC<{ progress: number }> = ({ progress }) => {
    // Progress 0 -> 1. 
    // We want tree to grow from seed (1) to full tree (0). 
    // Let's invert: 0% done = seed, 100% done (0 time left) = full tree.
    // So growth = 1 - progress.
    const growth = 1 - progress; 
    
    // Scale starts at 0.2 and goes to 1.0
    const scale = 0.2 + (growth * 0.8);
    const opacity = 0.5 + (growth * 0.5);

    return (
        <svg width="200" height="200" viewBox="0 0 100 100" className="drop-shadow-lg transition-all duration-1000" style={{ transform: `scale(${scale})`, opacity }}>
            {/* Trunk */}
            <path d="M45,100 L55,100 L55,80 L60,70 L40,70 L45,80 Z" fill="#8B4513" />
            {/* Foliage - grows with simple scale circles */}
            <circle cx="50" cy="50" r="25" fill="#22c55e" />
            <circle cx="35" cy="60" r="20" fill="#16a34a" />
            <circle cx="65" cy="60" r="20" fill="#15803d" />
            <circle cx="50" cy="30" r="20" fill="#4ade80" />
        </svg>
    )
};

const Pomodoro: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { t } = useContext(LanguageContext);
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short-break'>('focus');
  const [treesGrown, setTreesGrown] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval((): void => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            if (mode === 'focus') {
              setTreesGrown(p => p + 1);
            }
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return (): void => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTimer = (): void => setIsActive(!isActive);
  const resetTimer = (): void => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusDuration : shortBreakDuration);
  };
  const changeMode = (newMode: 'focus' | 'short-break'): void => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? focusDuration : shortBreakDuration);
  };
  const applyPreset = (focusMin: number, breakMin: number): void => {
    setFocusDuration(focusMin * 60);
    setShortBreakDuration(breakMin * 60);
    if (mode === 'focus') {
        setTimeLeft(focusMin * 60);
    } else {
        setTimeLeft(breakMin * 60);
    }
    setIsActive(false);
  };

  const formatTime = (s: number): string => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const totalDuration = mode === 'focus' ? focusDuration : shortBreakDuration;
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  return (
     <div className={`h-full flex flex-col items-center justify-center ${isMobile ? 'gap-4 p-2' : 'gap-6 p-4'} relative overflow-hidden`}>
      <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm`}>
          <Trees size={16} /> <span>{treesGrown} {isMobile ? '' : t('treesGrown')}</span>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg z-10">
        <button onClick={() => changeMode('focus')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'focus' ? 'bg-white dark:bg-slate-600 text-[var(--accent-color)] dark:text-white shadow-sm' : 'text-gray-500'}`}><Brain size={16} /> {t('focus')}</button>
        <button onClick={() => changeMode('short-break')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'short-break' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500'}`}><Coffee size={16} /> {t('break')}</button>
      </div>

      <div className="relative z-0">
        <svg width={isMobile ? "200" : "240"} height={isMobile ? "200" : "240"} className="-rotate-90">
            <circle cx={isMobile ? "100" : "120"} cy={isMobile ? "100" : "120"} r={isMobile ? "85" : "100"} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-slate-700" />
            <circle cx={isMobile ? "100" : "120"} cy={isMobile ? "100" : "120"} r={isMobile ? "85" : "100"} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * (isMobile ? 85 : 100)} strokeDashoffset={2 * Math.PI * (isMobile ? 85 : 100) * (1 - progress)} strokeLinecap="round" className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-[var(--accent-color)]' : 'text-emerald-500'}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
             {/* Gamification Tree */}
             {mode === 'focus' && isActive && (
                 <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <SimpleTree progress={progress} />
                 </div>
             )}
            <div className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-bold text-slate-900 dark:text-white font-mono relative z-10 drop-shadow-sm`}>{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-500 mt-2 font-medium bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{isActive ? (mode === 'focus' ? t('growing') : t('relaxing')) : t('paused')}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 z-10">
        <button onClick={toggleTimer} className={`${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-[var(--accent-color)]'} text-white`}>{isActive ? <Pause size={isMobile ? 20 : 24} fill="currentColor" /> : <Play size={isMobile ? 20 : 24} fill="currentColor" className="ml-1" />}</button>
        <button onClick={resetTimer} className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors`}><RotateCcw size={isMobile ? 18 : 20} /></button>
      </div>

      <div className="w-full max-w-sm pt-4 border-t border-gray-200 dark:border-slate-700/50 grid grid-cols-2 gap-2 z-10">
        <button onClick={() => applyPreset(25, 5)} className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><span className="font-semibold text-slate-700 dark:text-slate-200">{t('standard')}</span><span className="text-xs block text-gray-500">25m • 5m</span></button>
        <button onClick={() => applyPreset(50, 10)} className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><span className="font-semibold text-slate-700 dark:text-slate-200">{t('deepWork')}</span><span className="text-xs block text-gray-500">50m • 10m</span></button>
      </div>
    </div>
  )
}

const Tracker: React.FC<PomodoroTimerProps> = ({ timeEntries, activeTimer, onStartTimer, onStopTimer, isMobile }) => {
  const { t } = useContext(LanguageContext);
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('General');
  const [elapsed, setElapsed] = useState(0);
  const [rounding, setRounding] = useState<0 | 1 | 5 | 15>(0);

  useEffect(() => {
    let interval: number;
    if (activeTimer) {
      setDescription(activeTimer.description);
      setProject(activeTimer.project);
      const updateElapsed = (): void => setElapsed(Math.floor((Date.now() - activeTimer.startTime) / 1000));
      updateElapsed();
      interval = window.setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
      setDescription('');
    }
    return (): void => clearInterval(interval);
  }, [activeTimer]);

  const handleStart = (e: React.FormEvent | React.MouseEvent): void => {
    e.preventDefault();
    if (!description.trim()) return;
    onStartTimer(description, project);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const roundedTimeEntries = useMemo(() => {
    if (rounding === 0) return timeEntries;
    return timeEntries.map(entry => {
      const minutes = entry.duration / 60;
      const roundedMinutes = Math.round(minutes / rounding) * rounding;
      return { ...entry, duration: Math.max(rounding * 60, roundedMinutes * 60) };
    });
  }, [timeEntries, rounding]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/20 dark:border-black/20 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Session</span>
          <div className="flex items-center gap-2">
            <Settings2 size={12} className="text-gray-400" />
            <select 
              value={rounding} 
              onChange={(e) => setRounding(Number(e.target.value) as 0 | 1 | 5 | 15)}
              className="text-[10px] bg-transparent border-none focus:ring-0 text-gray-400 font-bold uppercase"
            >
              <option value={0}>No Rounding</option>
              <option value={1}>1m Rounding</option>
              <option value={5}>5m Rounding</option>
              <option value={15}>15m Rounding</option>
            </select>
          </div>
        </div>
        <form onSubmit={handleStart} className={`flex flex-col ${isMobile ? 'gap-2' : 'md:flex-row gap-3'} items-center bg-white dark:bg-slate-700 p-3 rounded-lg`}>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('workingOnPlaceholder')} disabled={!!activeTimer} className={`flex-1 w-full bg-transparent border-0 focus:ring-0 ${isMobile ? 'text-base' : 'text-lg'} text-slate-900 dark:text-white`} />
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <select value={project} onChange={(e) => setProject(e.target.value)} disabled={!!activeTimer} className="bg-transparent border-0 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0"><option>{t('general')}</option><option>{t('university')}</option><option>{t('work')}</option></select>
            <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-mono font-medium text-slate-900 dark:text-white`}>{formatTime(elapsed)}</div>
            <button type="button" onClick={activeTimer ? onStopTimer : handleStart} disabled={!activeTimer && !description.trim()} className={`${activeTimer ? 'bg-red-500' : 'bg-[var(--accent-color)]'} text-white p-3 rounded-lg disabled:opacity-50`}>
              {activeTimer ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {roundedTimeEntries.length > 0 ? (
          <div className="space-y-3">
            {roundedTimeEntries.map(entry => (
              <div key={entry.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{entry.description}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{entry.project}</span>
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-lg">{formatTime(entry.duration)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
            <Clock size={48} className="mb-4 opacity-20" />
            <p className="font-medium">{t('noTimeEntries')}</p>
            <p className="text-sm">{t('startTimerHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
};


const PomodoroTimer: React.FC<PomodoroTimerProps> = (props) => {
    const { t } = useContext(LanguageContext);
    const [view, setView] = useState<'pomodoro' | 'flowtime' | 'tracker'>('pomodoro');
    const { isMobile } = props;
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            <div className="p-2 flex justify-center bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                <div className="flex bg-gray-200 dark:bg-slate-700 p-1 rounded-lg overflow-x-auto no-scrollbar">
                    <button onClick={() => setView('pomodoro')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${view === 'pomodoro' ? 'bg-white dark:bg-slate-600 shadow-sm text-[var(--accent-color)] dark:text-white' : 'text-gray-500'}`}>{t('pomodoro')}</button>
                    <button onClick={() => setView('flowtime')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${view === 'flowtime' ? 'bg-white dark:bg-slate-600 shadow-sm text-[var(--accent-color)] dark:text-white' : 'text-gray-500'}`}>Flowtime</button>
                    <button onClick={() => setView('tracker')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${view === 'tracker' ? 'bg-white dark:bg-slate-600 shadow-sm text-[var(--accent-color)] dark:text-white' : 'text-gray-500'}`}>{t('tracker')}</button>
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-900 overflow-hidden">
                {view === 'pomodoro' ? <Pomodoro isMobile={isMobile} /> : view === 'flowtime' ? <Flowtime isMobile={isMobile} /> : <Tracker {...props} />}
            </div>
        </div>
    )
}

export default PomodoroTimer;
