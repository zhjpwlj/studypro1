
import { useState, useCallback, useRef } from 'react';
import { AppModule, WindowConfig } from '../types';
import { usePersistentState } from './usePersistentState';

const getMenuBarHeight = (): number => {
  if (typeof document === 'undefined') return 32;
  const dummy = document.createElement('div');
  dummy.style.height = 'var(--menubar-height)';
  dummy.style.position = 'absolute';
  dummy.style.visibility = 'hidden';
  document.body.appendChild(dummy);
  const height = dummy.clientHeight;
  document.body.removeChild(dummy);
  return height || 32;
};

const getDefaultWindowSize = (appId: AppModule): { width: number; height: number } => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const MENUBAR_HEIGHT = getMenuBarHeight();
  const DOCK_HEIGHT = 64;
  const availableHeight = screenHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;
  const availableWidth = screenWidth;
  
  const paddingX = 100;
  const paddingY = 120;

  switch (appId) {
    case AppModule.CHAT:
      return {
        width: Math.min(450, availableWidth - 40),
        height: Math.min(700, availableHeight - 40),
      };
    case AppModule.CALCULATOR:
      return {
        width: 380,
        height: 600,
      };
    case AppModule.NOTES:
       return {
        width: Math.min(900, availableWidth - paddingX),
        height: Math.min(650, availableHeight - paddingY),
      };
    case AppModule.WEATHER:
      return {
        width: Math.min(500, availableWidth - 40),
        height: Math.min(700, availableHeight - 40),
      };
    case AppModule.CALENDAR:
       return {
        width: Math.min(1000, availableWidth - paddingX),
        height: Math.min(750, availableHeight - paddingY),
      };
    case AppModule.MUSIC:
      return {
        width: 380,
        height: 420,
      };
    case AppModule.POMODORO:
        return {
            width: 480,
            height: 620,
        };
    case AppModule.FLASHCARDS:
        return {
            width: Math.min(900, availableWidth - 80),
            height: Math.min(650, availableHeight - 80),
        };
    case AppModule.SETTINGS:
      return {
        width: Math.min(900, availableWidth - 80),
        height: Math.min(750, availableHeight - 60),
      };
    case AppModule.TASKS:
      return {
        width: Math.min(1100, availableWidth - 40),
        height: Math.min(700, availableHeight - 60),
      };
    default:
      return {
        width: Math.min(800, availableWidth - paddingX),
        height: Math.min(600, availableHeight - paddingY),
      };
  }
};

export const useWindowManager = (): {
  windows: WindowConfig[];
  setWindows: React.Dispatch<React.SetStateAction<WindowConfig[]>>;
  activeWindowId: AppModule | null;
  setActiveWindowId: React.Dispatch<React.SetStateAction<AppModule | null>>;
  isClosingWindow: AppModule | null;
  openWindow: (appId: AppModule) => void;
  focusWindow: (appId: AppModule) => void;
  closeWindow: (appId: AppModule) => void;
  minimizeWindow: (appId: AppModule) => void;
  toggleMaximize: (appId: AppModule) => void;
  tileWindows: () => void;
  closeAllWindows: () => void;
} => {
  const [windows, setWindows] = usePersistentState<WindowConfig[]>('focusflow-windows', []);
  const [activeWindowId, setActiveWindowId] = useState<AppModule | null>(null);
  const [isClosingWindow, setIsClosingWindow] = useState<AppModule | null>(null);
  const nextZIndex = useRef(100);

  const openWindow = useCallback((appId: AppModule): void => {
    setWindows(prev => {
      const existingIndex = prev.findIndex(w => w.id === appId);
      const newZIndex = nextZIndex.current++;
      if (existingIndex !== -1) {
        return prev.map((w, i) => i === existingIndex ? { ...w, isMinimized: false, zIndex: newZIndex } : w);
      }
      
      const { width, height } = getDefaultWindowSize(appId);
      const MENUBAR_HEIGHT = getMenuBarHeight();
      const DOCK_HEIGHT = 64;
      const availableHeight = window.innerHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;
      const availableWidth = window.innerWidth;
      
      const x = Math.max(20, Math.min(Math.random() * (availableWidth - width - 40), availableWidth - width - 20));
      const y = Math.max(MENUBAR_HEIGHT + 10, Math.min(Math.random() * (availableHeight - height - 20) + MENUBAR_HEIGHT, availableHeight - height + MENUBAR_HEIGHT - 10));

      return [...prev, {
        id: appId,
        x: x,
        y: y,
        width: width,
        height: height,
        zIndex: newZIndex,
        isMinimized: false,
        isMaximized: false,
      }];
    });
    setActiveWindowId(appId);
  }, [setWindows]);

  const focusWindow = useCallback((appId: AppModule): void => {
    const newZIndex = nextZIndex.current++;
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: false, zIndex: newZIndex } : w));
    setActiveWindowId(appId);
  }, [setWindows]);

  const closeWindow = useCallback((appId: AppModule): void => {
    setIsClosingWindow(appId);
    setTimeout(() => {
      setWindows(prev => prev.filter(w => w.id !== appId));
      if (activeWindowId === appId) {
        setActiveWindowId(null);
      }
      setIsClosingWindow(null);
    }, 300);
  }, [activeWindowId, setWindows]);

  const minimizeWindow = useCallback((appId: AppModule): void => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
    if (activeWindowId === appId) setActiveWindowId(null);
  }, [activeWindowId, setWindows]);
  
  const toggleMaximize = useCallback((appId: AppModule): void => {
    setWindows(prev => prev.map(w => {
        if (w.id === appId) {
            if (w.isMaximized) {
                return { ...w, isMaximized: false, ...w.preMaximizeState };
            } else {
                return { ...w, isMaximized: true, preMaximizeState: { x: w.x, y: w.y, width: w.width, height: w.height }};
            }
        }
        return w;
    }));
  }, [setWindows]);

  const tileWindows = useCallback((): void => {
    const visibleWindows = windows.filter(w => !w.isMinimized);
    const count = visibleWindows.length;
    if (count === 0) return;

    const MENUBAR_HEIGHT = getMenuBarHeight();
    const DOCK_HEIGHT = 64;
    const availableHeight = window.innerHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;
    const availableWidth = window.innerWidth;

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const width = availableWidth / cols;
    const height = availableHeight / rows;

    setWindows(prev => prev.map(w => {
      if (w.isMinimized) return w;
      const index = visibleWindows.findIndex(vw => vw.id === w.id);
      if (index === -1) return w;
      
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      return {
        ...w,
        x: col * width,
        y: MENUBAR_HEIGHT + (row * height),
        width: width,
        height: height,
        isMaximized: false
      };
    }));
  }, [windows, setWindows]);

  const closeAllWindows = useCallback((): void => {
    setWindows([]);
    setActiveWindowId(null);
  }, [setWindows]);

  return {
    windows,
    setWindows,
    activeWindowId,
    setActiveWindowId,
    isClosingWindow,
    openWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    tileWindows,
    closeAllWindows
  };
};
