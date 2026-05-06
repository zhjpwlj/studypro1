
import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import MobileAppSwitcher from './components/ui/MobileAppSwitcher';
import MenuBar from './components/layout/MenuBar';
import { appIcons } from './constants';
import Dock from './components/layout/Dock';
import Window from './components/layout/Window';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/features/Dashboard'));
const TaskList = lazy(() => import('./components/features/TaskList'));
const PomodoroTimer = lazy(() => import('./components/features/PomodoroTimer'));
const StudyRoom = lazy(() => import('./components/features/StudyRoom'));
const ChatBot = lazy(() => import('./components/features/ChatBot'));
const Settings = lazy(() => import('./components/features/Settings'));
const ConfirmationModal = lazy(() => import('./components/ui/ConfirmationModal'));
const Calculator = lazy(() => import('./components/features/Calculator'));
const Notes = lazy(() => import('./components/features/Notes'));
const Weather = lazy(() => import('./components/features/Weather'));
const Calendar = lazy(() => import('./components/features/Calendar'));
const Goals = lazy(() => import('./components/features/Goals'));
const Music = lazy(() => import('./components/features/Music'));
const Flashcards = lazy(() => import('./components/features/Flashcards'));
const Launchpad = lazy(() => import('./components/features/Launchpad'));
const Summarizer = lazy(() => import('./components/features/Summarizer'));

import { AppModule, WindowConfig, Language } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import { wallpapers, accentColors, Wallpaper, AccentColor } from './config/theme';
import { backupData } from './services/supabaseService';
import { translations } from './utils/translations';
import { LanguageContext } from './contexts/LanguageContext';
import { User } from '@supabase/supabase-js';

import { useKeyboardCommands } from './hooks/useKeyboardCommands';
import { useWindowManager } from './hooks/useWindowManager';
import { Coffee, Brain, X } from 'lucide-react';
import { useAppData } from './hooks/useAppData';
import { useAppActions } from './hooks/useAppActions';

interface AppProps {
  user: User;
  onRestoreData: (data: Record<string, unknown>) => void;
}

const App: React.FC<AppProps> = ({ user, onRestoreData }) => {
  const [isMobileLayout, setIsMobileLayout] = useState(window.innerWidth < 768);
  const [isClassicMode, setIsClassicMode] = usePersistentState<boolean>('focusflow-classic-mode', false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isStageManagerEnabled, setIsStageManagerEnabled] = usePersistentState<boolean>('focusflow-stage-manager', false);

  useEffect((): (() => void) => {
    const handleResize = (): void => {
      setIsMobileLayout(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return (): void => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    windows, setWindows, activeWindowId, isClosingWindow,
    openWindow, focusWindow, closeWindow, minimizeWindow, toggleMaximize,
    tileWindows
  } = useWindowManager();

  const {
    projects, setProjects, tasks, setTasks, timeEntries, setTimeEntries,
    activeTimer, setActiveTimer, notes, setNotes, events, setEvents,
    goals, setGoals, classes, setClasses, decks, setDecks
  } = useAppData();

  const [isDarkMode, setIsDarkMode] = usePersistentState<boolean>('focusflow-theme-dark', true);
  const [accentColor, setAccentColor] = usePersistentState<string>('focusflow-theme-accent', accentColors[0]?.hex || '#ef4444');
  const [wallpaper, setWallpaper] = usePersistentState<string>('focusflow-theme-wallpaper', 'deep_space');
  const [language, setLanguage] = usePersistentState<Language>('focusflow-language', 'en');

  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [showBreakNudge, setShowBreakNudge] = useState(false);
  const [showProcrastinationPrompt, setShowProcrastinationPrompt] = useState(false);
  const [lastBreakTime, setLastBreakTime] = useState(Date.now());

  const {
    handleStartTimer, handleStopTimer, handleAddNote, handleUpdateNote, handleDeleteNote,
    handleAddEvent, handleDeleteEvent, handleAddGoal, handleToggleGoal, handleDeleteGoal,
    handleAddClass, handleDeleteClass, handleAddDeck, handleDeleteDeck, handleAddCard,
    handleUpdateCard, handleDeleteCard, handleAiAction
  } = useAppActions({
    projects, setProjects, tasks, setTasks, timeEntries, setTimeEntries,
    activeTimer, setActiveTimer, notes, setNotes, events, setEvents,
    goals, setGoals, classes, setClasses, decks, setDecks, setWindows,
    onRestoreData, accentColors
  });

  const updateWindowState = useCallback((appId: AppModule, updates: Partial<WindowConfig>): void => {
    setWindows((prev: WindowConfig[]) => prev.map((w: WindowConfig) => w.id === appId ? { ...w, ...updates } : w));
  }, [setWindows]);

  useEffect((): void => {
    if (isMobileLayout && !activeWindowId) {
       openWindow(AppModule.DASHBOARD);
    }
  }, [isMobileLayout, activeWindowId, openWindow]);
  
  const handleCloseAll = (): void => setWindows([]);

  const getAllData = useCallback((): Record<string, unknown> => ({
      projects, tasks, timeEntries, notes, events, goals, classes, decks,
      settings: { isDarkMode, accentColor, wallpaper, language },
      windows,
  }), [projects, tasks, timeEntries, notes, events, goals, classes, decks, isDarkMode, accentColor, wallpaper, windows, language]);

  const backupTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect((): (() => void) => {
    if (backupTimerRef.current) clearTimeout(backupTimerRef.current);
    
    backupTimerRef.current = setTimeout((): void => {
      backupData(user, getAllData()).catch(err => console.error("Auto-sync failed:", err));
    }, 30000); // 30 seconds debounce for auto-sync

    return (): void => {
      if (backupTimerRef.current) clearTimeout(backupTimerRef.current);
    };
  }, [getAllData, user]);

  useEffect((): void => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect((): void => {
    const selectedColor = accentColors.find((c: AccentColor) => c.hex === accentColor) || { hex: accentColor, hoverHex: accentColor };
    document.documentElement.style.setProperty('--accent-color', selectedColor.hex);
    document.documentElement.style.setProperty('--accent-color-hover', selectedColor.hoverHex);
  }, [accentColor]);

  const currentWallpaper = useMemo(() => wallpapers.find((w: Wallpaper) => w.id === wallpaper) || wallpapers[0] || { id: '', lightUrl: '', darkUrl: '', category: '' }, [wallpaper]);
  const isLiveWallpaper = wallpaper.startsWith('live:');
  const liveVideoId = isLiveWallpaper ? wallpaper.split(':')[1] : null;

  const handleExportData = (): void => {
      const allData = getAllData();
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studypro_backup_${new Date().toISOString().split('T')[0] || 'backup'}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File): void => {
      const reader = new FileReader();
      reader.onload = (e): void => {
          try {
              const data = JSON.parse(e.target?.result as string) as Record<string, unknown>;
              onRestoreData(data);
              alert('Data imported successfully!');
          } catch (err) {
              console.error('Import failed:', err);
              alert('Failed to import data. Please check the file format.');
          }
      };
      reader.readAsText(file);
  };

  // Keyboard Commands
  useKeyboardCommands({
    'n': () => {
      // Focus task input if possible
      const input = document.querySelector('input[placeholder*="Add"]') as HTMLInputElement;
      if (input) input.focus();
    },
    's': () => {
      if (activeTimer) handleStopTimer();
      else if (tasks.length > 0) handleStartTimer(tasks[0].title, tasks[0].project || 'General');
    },
    'p': () => {
      if (windows.find(w => w.id === AppModule.POMODORO)) {
        if (activeWindowId === AppModule.POMODORO) {
          closeWindow(AppModule.POMODORO);
        } else {
          focusWindow(AppModule.POMODORO);
        }
      } else {
        openWindow(AppModule.POMODORO);
      }
    },
    'ctrl+f': () => {
      const search = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      if (search) search.focus();
    },
    'escape': () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  });

  // Break Nudges & Procrastination Intervention
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Break Nudge: every 60 mins of active work
      if (activeTimer && (now - lastBreakTime > 60 * 60 * 1000)) {
        setShowBreakNudge(true);
        setLastBreakTime(now);
      }

      // Procrastination Prompt: if active task has been running for > 2 hours
      if (activeTimer && (now - activeTimer.startTime > 2 * 60 * 60 * 1000)) {
        setShowProcrastinationPrompt(true);
      }
    }, 60000); // Check every minute

    return (): void => clearInterval(interval);
  }, [activeTimer, lastBreakTime]);

  const handleWipeData = (): void => {
      localStorage.clear();
      window.location.reload();
  };
  
  const t = (key: string): string => {
    const lang = language as keyof typeof translations;
    const dict = translations[lang] || translations['en'];
    return (dict as Record<string, string>)[key] || (translations['en'] as Record<string, string>)[key] || key;
  };

  const renderAppModule = (appId: AppModule): React.ReactNode => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-full w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      }>
        {((): React.ReactNode => {
          const render = (): React.ReactNode => {
            switch (appId) {
              case AppModule.DASHBOARD: return <Dashboard tasks={tasks} projects={projects} setProjects={setProjects} timeEntries={timeEntries} events={events} classes={classes} goals={goals} isMobile={isMobileLayout} />;
              case AppModule.TASKS: return <TaskList tasks={tasks} projects={projects} setTasks={setTasks} setProjects={setProjects} isMobile={isMobileLayout} />;
              case AppModule.POMODORO: return <PomodoroTimer timeEntries={timeEntries} activeTimer={activeTimer} onStartTimer={handleStartTimer} onStopTimer={handleStopTimer} isMobile={isMobileLayout} />;
              case AppModule.SOCIAL: return <StudyRoom isMobile={isMobileLayout} />;
              case AppModule.CHAT: return <ChatBot projects={projects} onAiAction={handleAiAction} isMobile={isMobileLayout} />;
              case AppModule.SETTINGS: return <Settings onExportData={handleExportData} onImportData={handleImportData} onWipeData={(): void => setIsWipeModalOpen(true)} getAllData={getAllData} onRestoreData={onRestoreData} user={user} isDarkMode={isDarkMode} onToggleDarkMode={(): void => setIsDarkMode(p => !p)} accentColor={accentColor} onSetAccentColor={setAccentColor} wallpaper={wallpaper} onSetWallpaper={setWallpaper} projects={projects} setProjects={setProjects} isMobile={isMobileLayout} isClassicMode={isClassicMode} onToggleClassicMode={(): void => setIsClassicMode(p => !p)} isFocusMode={isFocusMode} onToggleFocusMode={(): void => setIsFocusMode(p => !p)} isStageManagerEnabled={isStageManagerEnabled} onToggleStageManager={(): void => setIsStageManagerEnabled(p => !p)} />;
              case AppModule.CALCULATOR: return <Calculator isMobile={isMobileLayout} />;
              case AppModule.NOTES: return <Notes notes={notes} onAddNote={handleAddNote} onUpdateNote={handleUpdateNote} onDeleteNote={handleDeleteNote} isMobile={isMobileLayout} />;
              case AppModule.WEATHER: return <Weather isMobile={isMobileLayout} />;
              case AppModule.CALENDAR: return <Calendar events={events} tasks={tasks} classes={classes} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} onAddClass={handleAddClass} onDeleteClass={handleDeleteClass} isMobile={isMobileLayout} />;
              case AppModule.GOALS: return <Goals goals={goals} onAddGoal={handleAddGoal} onToggleGoal={handleToggleGoal} onDeleteGoal={handleDeleteGoal} isMobile={isMobileLayout} />;
              case AppModule.MUSIC: return <Music isMobile={isMobileLayout} />;
              case AppModule.FLASHCARDS: return <Flashcards decks={decks} onAddDeck={handleAddDeck} onDeleteDeck={handleDeleteDeck} onAddCard={handleAddCard} onUpdateCard={handleUpdateCard} onDeleteCard={handleDeleteCard} isMobile={isMobileLayout} />;
              case AppModule.SUMMARIZER: return <Summarizer isMobile={isMobileLayout} />;
              default: return null;
            }
          };
          return render();
        })()}
      </Suspense>
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <div
        className="h-screen w-screen bg-cover bg-center transition-all duration-500 font-sans overflow-hidden relative"
        style={!isLiveWallpaper ? { backgroundImage: `url(${isDarkMode ? currentWallpaper.darkUrl : currentWallpaper.lightUrl})` } : {}}
        >
        {/* Productivity Support Overlays */}
        {showBreakNudge && (
          <div className="fixed bottom-20 right-8 z-[100] animate-in slide-in-from-right-full duration-500">
            <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl max-w-sm flex gap-4 items-start">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Coffee size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Time for a break?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You&apos;ve been working hard for over an hour. A 5-minute stretch can boost your focus.</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowBreakNudge(false)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold">Take Break</button>
                  <button onClick={() => setShowBreakNudge(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm font-bold">Later</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showProcrastinationPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl max-w-md w-full border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl text-amber-600 dark:text-amber-400">
                  <Brain size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feeling stuck?</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                You&apos;ve been on this task for a while. Sometimes we procrastinate because the next step feels too big.
                <br /><br />
                <span className="font-bold text-amber-600 dark:text-amber-400 italic">&quot;What is the smallest, easiest next step you can take right now?&quot;</span>
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setShowProcrastinationPrompt(false)} className="w-full py-4 rounded-2xl bg-amber-600 text-white font-bold text-lg shadow-lg hover:bg-amber-700 transition-all">I&apos;ve got this</button>
                <button onClick={() => setShowProcrastinationPrompt(false)} className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold">Break it down further</button>
              </div>
            </div>
          </div>
        )}
        {isLiveWallpaper && liveVideoId && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <iframe
                    className="absolute top-1/2 left-1/2 w-[177.777vh] h-[56.25vw] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                    src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${liveVideoId}&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0&playsinline=1`}
                    title="Live Wallpaper"
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
            </div>
        )}

        {isMobileLayout || isClassicMode ? (
          <div className="flex h-full w-full overflow-hidden">
            {isClassicMode && !isMobileLayout && !isFocusMode && (
              <aside className="w-16 flex flex-col items-center py-4 bg-white/10 backdrop-blur-xl border-r border-white/10 z-50">
                <div className="mb-8 p-2 bg-accent rounded-xl shadow-lg shadow-accent/20">
                  <Brain size={24} className="text-white" />
                </div>
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar px-2">
                  {Object.values(AppModule).map((moduleId) => {
                    const Icon = appIcons[moduleId];
                    const isActive = activeWindowId === moduleId;
                    return (
                      <button
                        key={moduleId}
                        onClick={() => openWindow(moduleId)}
                        className={`p-3 rounded-xl transition-all duration-300 group relative ${
                          isActive 
                            ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-110' 
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                        title={t(moduleId.toLowerCase() as keyof typeof translations['en'])}
                      >
                        {Icon && <Icon size={20} />}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                        )}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] translate-x-2 group-hover:translate-x-0 transition-all">
                          {t(moduleId.toLowerCase() as keyof typeof translations['en'])}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
              {!isFocusMode && (
                <MenuBar
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={(): void => setIsDarkMode(p => !p)}
                  onNewTask={(): void => openWindow(AppModule.TASKS)}
                  onOpenPreferences={(): void => openWindow(AppModule.SETTINGS)}
                  onCloseWindow={activeWindowId ? (): void => closeWindow(activeWindowId) : (): void => {}}
                  onMinimizeWindow={activeWindowId ? (): void => minimizeWindow(activeWindowId) : (): void => {}}
                  onToggleMaximize={activeWindowId ? (): void => toggleMaximize(activeWindowId) : (): void => {}}
                  onCloseAll={handleCloseAll}
                  onTileWindows={tileWindows}
                  windows={windows}
                  activeWindowId={activeWindowId}
                  onFocusWindow={focusWindow}
                />
              )}
              <main className="flex-1 overflow-hidden relative">
                {activeWindowId ? (
                  <div className={`absolute inset-0 w-full h-full ${isMobileLayout ? 'bg-white/90 dark:bg-slate-900/90' : 'bg-white/70 dark:bg-slate-900/70'} backdrop-blur-md overflow-hidden`}>
                     {renderAppModule(activeWindowId)}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-500">
                    {t('noAppOpen')}
                  </div>
                )}
                {isFocusMode && !isMobileLayout && (
                  <button 
                    onClick={() => setIsFocusMode(false)}
                    className="fixed top-4 right-4 z-[200] p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 hover:opacity-100 transition-opacity"
                    title="Exit Focus Mode"
                  >
                    <X size={20} />
                  </button>
                )}
              </main>
              {!isFocusMode && (
                isMobileLayout ? (
                  <MobileAppSwitcher
                    openWindows={windows}
                    onLaunch={openWindow}
                    onFocus={focusWindow}
                    t={t}
                  />
                ) : !isClassicMode ? (
                  <Dock
                    openWindows={windows}
                    onLaunch={openWindow}
                    onFocus={focusWindow}
                    onToggleLaunchpad={(): void => setIsLaunchpadOpen(p => !p)}
                  />
                ) : null
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            {!isFocusMode && (
              <MenuBar
                isDarkMode={isDarkMode}
                onToggleDarkMode={(): void => setIsDarkMode(p => !p)}
                onNewTask={(): void => openWindow(AppModule.TASKS)}
                onOpenPreferences={(): void => openWindow(AppModule.SETTINGS)}
                onCloseWindow={activeWindowId ? (): void => closeWindow(activeWindowId) : (): void => {}}
                onMinimizeWindow={activeWindowId ? (): void => minimizeWindow(activeWindowId) : (): void => {}}
                onToggleMaximize={activeWindowId ? (): void => toggleMaximize(activeWindowId) : (): void => {}}
                onCloseAll={handleCloseAll}
                onTileWindows={tileWindows}
                windows={windows}
                activeWindowId={activeWindowId}
                onFocusWindow={focusWindow}
              />
            )}

            <div className="flex flex-1 overflow-hidden relative">
              {isStageManagerEnabled && !isMobileLayout && !isFocusMode && (

                <aside className="w-40 flex flex-col gap-4 p-4 overflow-y-auto no-scrollbar z-40">
                  {windows.map((config) => {
                    const Icon = appIcons[config.id];
                    const isActive = activeWindowId === config.id;
                    return (
                      <button
                        key={config.id}
                        onClick={() => focusWindow(config.id)}
                        className={`w-full aspect-video rounded-lg bg-white/10 backdrop-blur-md border transition-all duration-300 flex flex-col items-center justify-center gap-2 group relative ${
                          isActive 
                            ? 'border-accent shadow-lg shadow-accent/20 scale-105 z-10' 
                            : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-accent text-white' : 'bg-white/10 text-white'}`}>
                          {Icon && <Icon size={20} />}
                        </div>
                        <span className="text-[10px] font-medium text-white truncate w-full px-2 text-center">
                          {t(config.id.toLowerCase() as keyof typeof translations['en'])}
                        </span>
                        {isActive && (
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full" />
                        )}
                      </button>
                    );
                  })}
                </aside>
              )}

              <main className="flex-1 relative">
                <div className="relative h-full w-full">
                  {windows.map(config => (
                    <Window
                      key={config.id}
                      config={{ ...config, isClosing: isClosingWindow === config.id }}
                      onClose={(): void => closeWindow(config.id)}
                      onMinimize={(): void => minimizeWindow(config.id)}
                      onToggleMaximize={(): void => toggleMaximize(config.id)}
                      onFocus={(): void => focusWindow(config.id)}
                      onUpdate={(updates: Partial<WindowConfig>): void => updateWindowState(config.id, updates)}
                    >
                      {renderAppModule(config.id)}
                    </Window>
                  ))}
                </div>
              </main>
            </div>

            {!isFocusMode && (
              <Dock
                  openWindows={windows}
                  onLaunch={openWindow}
                  onFocus={focusWindow}
                  onToggleLaunchpad={(): void => setIsLaunchpadOpen(p => !p)}
              />
            )}

            {isFocusMode && !isMobileLayout && (
              <button 
                onClick={() => setIsFocusMode(false)}
                className="fixed top-4 right-4 z-[200] p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 hover:opacity-100 transition-opacity"
                title="Exit Focus Mode"
              >
                <X size={20} />
              </button>
            )}

            {isLaunchpadOpen && (
            <Launchpad 
                onLaunch={openWindow} 
                onClose={(): void => setIsLaunchpadOpen(false)}
                appIcons={appIcons}
                appNames={Object.fromEntries(Object.values(AppModule).map(id => [id, t(id.toLowerCase() as keyof typeof translations['en'])]))}
            />
        )}
        
            <ConfirmationModal
                isOpen={isWipeModalOpen}
                onClose={(): void => setIsWipeModalOpen(false)}
                onConfirm={handleWipeData}
                title={t('wipeData')}
                message={t('wipeDataConfirm')}
                confirmText={t('wipeData')}
            />
          </div>
        )}
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
