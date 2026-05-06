
import React, { useState, useEffect, useContext } from 'react';
import { Database, Cloud, Loader2, User as UserIcon, Globe, Palette, Sun, Moon, Check, Info, Upload, Key, Plus, X, Trash2, Layers, Share2, Github, Calendar as CalendarIcon, HardDrive, Target } from 'lucide-react';
import { backupData, restoreData, getLastSyncTime, signOut } from '../../services/supabaseService';
import ConfirmationModal from '../ui/ConfirmationModal';
import { LanguageContext } from '../../contexts/LanguageContext';
import { Language } from '../../types';
import { wallpapers, wallpaperCategories, accentColors, Wallpaper, AccentColor } from '../../config/theme';
import { User } from '@supabase/supabase-js';

interface SettingsProps {
  onExportData: () => void;
  onImportData: (file: File) => void;
  onWipeData: () => void;
  getAllData: () => Record<string, unknown>;
  onRestoreData: (data: Record<string, unknown>) => void;
  user: User;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  accentColor: string;
  onSetAccentColor: (color: string) => void;
  wallpaper: string;
  onSetWallpaper: (wallpaperId: string) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  isMobile?: boolean;
  isClassicMode?: boolean;
  onToggleClassicMode?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isStageManagerEnabled?: boolean;
  onToggleStageManager?: () => void;
}

// Settings component for managing application preferences
const Settings: React.FC<SettingsProps> = (props) => {
  const { onExportData, onImportData, onWipeData, getAllData, onRestoreData, user, isDarkMode, onToggleDarkMode, accentColor, onSetAccentColor, wallpaper, onSetWallpaper, projects, setProjects, isMobile, isClassicMode, onToggleClassicMode, isFocusMode, onToggleFocusMode, isStageManagerEnabled, onToggleStageManager } = props;
  const [activeTab, setActiveTab] = useState('general');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectColor, setEditingProjectColor] = useState('');

  const handleUpdateProject = (id: string): void => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: editingProjectName, color: editingProjectColor } : p));
    setEditingProjectId(null);
  };

  const handleDeleteProject = (id: string): void => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleAddProject = (): void => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: 'New Project',
      color: accentColor
    };
    setProjects(prev => [...prev, newProject]);
    setEditingProjectId(newProject.id);
    setEditingProjectName(newProject.name);
    setEditingProjectColor(newProject.color);
  };

  useEffect(() => {
    setHasApiKey(!!localStorage.getItem('geminiApiKey'));
  }, []);

  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('geminiApiKey') || '');

  const handleSaveApiKey = (): void => {
    const key = apiKeyInput.trim();
    if (key) {
      localStorage.setItem('geminiApiKey', key);
      setHasApiKey(true);
    } else {
      localStorage.removeItem('geminiApiKey');
      setHasApiKey(false);
    }
  };
  
  const { language, setLanguage, t } = useContext(LanguageContext);
  
  const [activeWallpaperCategory, setActiveWallpaperCategory] = useState(wallpaperCategories[0]);

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) onImportData(file);
  };

  const fetchLastSync = async (): Promise<void> => {
    try {
        const time = await getLastSyncTime();
        setLastSynced(time ? new Date(time).toLocaleString() : 'Never');
    } catch {
        setLastSynced('Could not retrieve status');
    }
  };

  useEffect(() => {
    if (activeTab === 'sync' && !lastSynced) fetchLastSync();
  }, [activeTab, lastSynced]);

  const handleBackup = async (): Promise<void> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
        const { error } = await backupData(user, getAllData());
        if (error) throw error;
        await fetchLastSync();
    } catch (error: unknown) {
        setSyncError(`Backup failed: ${(error as Error).message}`);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleRestore = async (): Promise<void> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
        const { data, error } = await restoreData(user);
        if (error) throw error;
        if (data) onRestoreData(data as Record<string, unknown>);
        else setSyncError("No backup found to restore.");
    } catch (error: unknown) {
        setSyncError(`Restore failed: ${(error as Error).message}`);
    } finally {
        setIsSyncing(false);
    }
  };
  
  const handleSignOut = async (): Promise<void> => { await signOut(); };

  const renderGeneralTab = (): React.ReactNode => (
     <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('generalSettings')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe size={20} />
                    <div>
                        <h4 className="font-semibold">{t('language')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('selectLanguage')}</p>
                    </div>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5">
                    <option value="en">English</option>
                    <option value="jp">日本語</option>
                    <option value="cn">中文</option>
                    <option value="es">Español</option>
                </select>
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('systemInfo')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700/50 space-y-3">
             <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Info size={18} className="text-accent" />
                <span className="font-medium">{t('versionLabel')}</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs">1.0.0</span>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-7">&quot;{t('geminiCode')}&quot;</p>
             <button 
               onClick={() => setIsHistoryModalOpen(true)}
               className="ml-7 text-xs text-accent hover:underline flex items-center gap-1"
             >
               <Info size={12} />
               {t('changeHistory')}
             </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('localData')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('importDataTitle')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('importDataDesc')}</p>
              </div>
              <label className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-2">
                <Upload size={16} />
                <span>{t('importButton')}</span>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImportData} 
                />
              </label>
            </div>
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('export')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('exportDataDesc')}</p>
              </div>
              <button onClick={onExportData} className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">{t('exportButton')}</button>
            </div>
             <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold text-red-500">{t('wipeData')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('wipeDataDesc')}</p>
              </div>
              <button onClick={onWipeData} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">{t('wipeData')}</button>
            </div>
          </div>
        </section>
      </div>
  );

  const renderAppearanceTab = (): React.ReactNode => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('appearanceTitle')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={20}/> : <Sun size={20}/>}
                  <div>
                    <h4 className="font-semibold">{t('interfaceTheme')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('interfaceThemeDesc')}</p>
                  </div>
              </div>
              <button onClick={onToggleDarkMode} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-medium">{isDarkMode ? t('dark') : t('light')}</button>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                  <Layers size={20}/>
                  <div>
                    <h4 className="font-semibold">{t('classicMode')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('classicModeDesc')}</p>
                  </div>
              </div>
              <button 
                onClick={onToggleClassicMode} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isClassicMode ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                {isClassicMode ? t('enabled') : t('disabled')}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                  <Target size={20}/>
                  <div>
                    <h4 className="font-semibold">{t('focusMode')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('focusModeDesc')}</p>
                  </div>
              </div>
              <button 
                onClick={onToggleFocusMode} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFocusMode ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                {isFocusMode ? t('enabled') : t('disabled')}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                  <Layers size={20}/>
                  <div>
                    <h4 className="font-semibold">{t('stageManager')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stageManagerDesc')}</p>
                  </div>
              </div>
              <button 
                onClick={onToggleStageManager} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isStageManagerEnabled ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                {isStageManagerEnabled ? t('enabled') : t('disabled')}
              </button>
            </div>
            <div className="pt-4 first:pt-0">
              <h4 className="font-semibold mb-3">{t('accentColor')}</h4>
              <div className="flex flex-wrap gap-4 items-center">
                  {accentColors.map((color: AccentColor) => (
                    <button key={color.name} onClick={() => onSetAccentColor(color.hex)} className="w-8 h-8 rounded-full transition-transform transform hover:scale-110 flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                      {accentColor === color.hex && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                  <input type="color" value={accentColor} onChange={e => onSetAccentColor(e.target.value)} className="w-10 h-10 p-0 border-none rounded-full cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/20" />
              </div>
            </div>
          </div>
        </section>
        <section>
            <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('wallpaperTitle')}</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
                <div className="flex flex-wrap gap-2 mb-4">
                  {wallpaperCategories.map((cat: string) => (
                      <button key={cat} onClick={() => setActiveWallpaperCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeWallpaperCategory === cat ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2">
                    {wallpapers.filter((w: Wallpaper) => w.category === activeWallpaperCategory).map((wp: Wallpaper) => (
                        <button key={wp.id} onClick={() => onSetWallpaper(wp.id)} className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors relative group ${wallpaper === wp.id ? 'border-accent' : 'border-transparent hover:border-gray-400'}`}>
                            <img src={isDarkMode ? wp.darkUrl : wp.lightUrl} alt={wp.id} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {wallpaper === wp.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Check size={24} className="text-white"/></div>}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    </div>
  );
  
  const renderSyncTab = (): React.ReactNode => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('accountTitle')}</h3>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserIcon size={18} />
                    <div>
                        <h4 className="font-semibold">{t('loggedInAsTitle')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut} className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700">{t('logOutButton')}</button>
            </div>
           </div>
        </section>
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('cloudSyncTitle')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
             <div className="text-sm pt-4 first:pt-0">
                <p className="text-gray-500 dark:text-gray-400">{t('cloudSyncDesc')}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('lastSyncedLabel')} <span className="font-semibold text-slate-700 dark:text-slate-300">{lastSynced || 'Loading...'}</span></p>
                {syncError && <p className="text-red-500 mt-1">{syncError}</p>}
             </div>
             <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('forceBackupTitle')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('forceBackupDesc')}</p>
              </div>
              <button onClick={handleBackup} disabled={isSyncing} className="w-28 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center">
                {isSyncing ? <Loader2 className="animate-spin" size={18}/> : t('backupButton')}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('forceRestoreTitle')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('forceRestoreDesc')}</p>
              </div>
              <button onClick={() => setIsRestoreModalOpen(true)} disabled={isSyncing} className="w-28 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center">
                 {isSyncing ? <Loader2 className="animate-spin" size={18}/> : t('restoreButton')}
              </button>
            </div>
          </div>
        </section>
    </div>
  );

  const renderAIConfigTab = (): React.ReactNode => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('aiConfig')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4">
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Key size={20} className={hasApiKey ? "text-emerald-500" : "text-amber-500"} />
                    <div>
                        <h4 className="font-semibold">{t('apiKeyRequired')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {hasApiKey ? t('apiKeyActive') : "No API key selected. AI features may be limited."}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter Gemini API Key..."
                    className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button 
                    onClick={handleSaveApiKey} 
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover flex items-center gap-2"
                  >
                    Save
                  </button>
                </div>
             </div>
             <div className="pt-4 border-t border-gray-100 dark:border-slate-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  To use advanced AI features, you must enter a valid Gemini API key. It will be stored locally in your browser.
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <Info size={12} />
                  Get an API Key
                </a>
             </div>
          </div>
        </section>
    </div>
  );

  const renderProjectsTab = (): React.ReactNode => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('manageProjects')}</h3>
            <button 
              onClick={handleAddProject}
              className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover flex items-center gap-2"
            >
              <Plus size={16} />
              {t('newEntry')}
            </button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/50 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700/50">
            {projects.map(project => (
              <div key={project.id} className="p-4 flex items-center justify-between group">
                {editingProjectId === project.id ? (
                  <div className="flex-1 flex items-center gap-4">
                    <input 
                      type="color" 
                      value={editingProjectColor} 
                      onChange={e => setEditingProjectColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={editingProjectName} 
                      onChange={e => setEditingProjectName(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleUpdateProject(project.id)} className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600"><Check size={16}/></button>
                    <button onClick={() => setEditingProjectId(null)} className="p-1.5 bg-gray-200 dark:bg-slate-600 rounded hover:bg-gray-300 dark:hover:bg-slate-500"><X size={16}/></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }}></div>
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingProjectId(project.id);
                          setEditingProjectName(project.name);
                          setEditingProjectColor(project.color);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500"
                      >
                        <Palette size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {projects.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No projects found. Create one to get started!
              </div>
            )}
          </div>
        </section>
    </div>
  );

  const renderIntegrationsTab = (): React.ReactNode => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Issue Trackers</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-100 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div className="flex items-center gap-3">
                <Github size={20} />
                <div>
                  <h4 className="font-semibold">GitHub Issues</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync GitHub issues to your local tasks.</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-black">Connect</button>
            </div>
            <div className="pt-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-200">
                <p className="font-bold mb-1">OAuth Setup Required:</p>
                <p>1. Go to GitHub Developer Settings.</p>
                <p>2. Set Callback URL to: <code className="bg-white/50 dark:bg-black/50 px-1 rounded">https://ais-dev-bvi5xnc6f2tivdbtqxc2f6-19181455005.asia-northeast1.run.app/auth/callback</code></p>
                <p>3. Add CLIENT_ID and CLIENT_SECRET to environment variables.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Calendar Sync</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon size={20} />
                <div>
                  <h4 className="font-semibold">CalDAV / iCal</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Import external calendar events as time blocks.</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Add Feed</button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Data Sovereignty</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-100 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div className="flex items-center gap-3">
                <HardDrive size={20} />
                <div>
                  <h4 className="font-semibold">Self-Hosted WebDAV</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync data to your own server (Nextcloud, etc).</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-medium">Configure</button>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <Cloud size={20} />
                <div>
                  <h4 className="font-semibold">Dropbox / Google Drive</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Zero-knowledge encrypted cloud sync.</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-medium">Connect</button>
            </div>
          </div>
        </section>
    </div>
  );

  const TABS = [
      { id: 'general', label: t('general'), icon: Database },
      { id: 'appearance', label: t('appearance'), icon: Palette },
      { id: 'projects', label: t('projects'), icon: Layers },
      { id: 'integrations', label: 'Integrations', icon: Share2 },
      { id: 'sync', label: t('account'), icon: Cloud },
      { id: 'ai', label: t('aiConfig'), icon: Key },
  ];

  return (
    <div className={`h-full flex ${isMobile ? 'flex-col' : ''}`}>
      {isMobile ? (
        <div className="p-4 border-b border-white/20 dark:border-black/20 bg-black/5 dark:bg-white/5">
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
          >
            {TABS.map(tab => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <aside className="w-52 bg-black/5 dark:bg-white/5 p-3 border-r border-white/20 dark:border-black/20">
          <nav className="space-y-1">
             {TABS.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-left ${activeTab === tab.id ? 'bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
              </button>
             ))}
          </nav>
        </aside>
      )}
      <main className={`flex-1 ${isMobile ? 'p-4' : 'p-6'} overflow-y-auto bg-slate-50/30 dark:bg-transparent`}>
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'projects' && renderProjectsTab()}
          {activeTab === 'integrations' && renderIntegrationsTab()}
          {activeTab === 'sync' && renderSyncTab()}
          {activeTab === 'ai' && renderAIConfigTab()}
      </main>
      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={() => { setIsRestoreModalOpen(false); handleRestore(); }}
        title={t('restoreModalTitle')}
        message={t('restoreModalMessage')}
        confirmText={t('restoreConfirmButton')}
      />
      
      <ConfirmationModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onConfirm={() => setIsHistoryModalOpen(false)}
        title={t('changeHistory')}
        message={
          <div className="space-y-4 text-left">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">v1.0.0 - Stable Release</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                <li>Initial stable release of StudyPro OS</li>
                <li>Integrated Gemini 3.1 Pro for advanced AI assistance</li>
                <li>Full Markdown support in Notes</li>
                <li>Real-time Cloud Sync via Supabase</li>
                <li>Multi-language support (EN, JP, CN, ES)</li>
                <li>Advanced Task Management with subtasks and projects</li>
                <li>Focus Timer with project tracking</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white">Bug Fixes & Improvements</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                <li>Fixed image loading issues with referrer policies</li>
                <li>Optimized cloud sync frequency to prevent excessive API calls</li>
                <li>Improved accessibility with ARIA labels</li>
                <li>Enhanced UI responsiveness for mobile devices</li>
                <li>Fixed TypeScript type error in ConfirmationModal to support ReactNode messages</li>
                <li>Fixed linting error in ConfirmationModal by removing unused React import</li>
              </ul>
            </div>
          </div>
        }
        confirmText={t('close')}
      />
    </div>
  );
};

export default Settings;
