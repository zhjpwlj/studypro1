
import { useCallback } from 'react';
import { Task, Project, TimeEntry, ActiveTimer, Note, Event, Goal, Class, Deck, Flashcard, WindowConfig } from '../types';

interface AppActionsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  timeEntries: TimeEntry[];
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
  activeTimer: ActiveTimer | null;
  setActiveTimer: React.Dispatch<React.SetStateAction<ActiveTimer | null>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  classes: Class[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
  setWindows: React.Dispatch<React.SetStateAction<WindowConfig[]>>;
  onRestoreData: (data: Record<string, unknown>) => void;
  accentColors: { name: string; hex: string; hoverHex: string }[];
}

export const useAppActions = ({
  projects, setTasks, setTimeEntries,
  activeTimer, setActiveTimer, setNotes, setEvents,
  setGoals, setClasses, setDecks,
  accentColors, decks
}: AppActionsProps): {
  handleStartTimer: (description: string, project: string) => void;
  handleStopTimer: () => void;
  handleAddNote: (category: string) => void;
  handleUpdateNote: (id: string, updates: Partial<Note>) => void;
  handleDeleteNote: (id: string) => void;
  handleAddEvent: (event: Omit<Event, 'id'>) => void;
  handleDeleteEvent: (id: string) => void;
  handleAddGoal: (goal: Omit<Goal, 'id'>) => void;
  handleToggleGoal: (id: string) => void;
  handleDeleteGoal: (id: string) => void;
  handleAddClass: (cls: Class) => void;
  handleDeleteClass: (id: string) => void;
  handleAddDeck: (title: string) => void;
  handleDeleteDeck: (id: string) => void;
  handleAddCard: (deckId: string, front: string, back: string) => void;
  handleUpdateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
  handleDeleteCard: (deckId: string, cardId: string) => void;
  handleUpdateTask: (id: string, updates: Partial<Task>) => void;
  handleDeleteTask: (id: string) => void;
  handleAiAction: (functionName: string, args: Record<string, unknown>) => void;
} => {

  const handleStartTimer = useCallback((description: string, project: string): void => {
    // If there's an active timer, stop it first to prevent double-accounting
    if (activeTimer) {
      const endTime = Date.now();
      const newEntry: TimeEntry = {
        id: `time-${endTime}`,
        description: activeTimer.description,
        startTime: activeTimer.startTime,
        endTime,
        duration: Math.floor((endTime - activeTimer.startTime) / 1000),
        project: activeTimer.project,
      };
      setTimeEntries(prev => [newEntry, ...prev]);
    }
    setActiveTimer({ startTime: Date.now(), description, project });
  }, [activeTimer, setActiveTimer, setTimeEntries]);

  const handleStopTimer = useCallback((): void => {
    if (!activeTimer) return;
    const endTime = Date.now();
    const newEntry: TimeEntry = {
      id: `time-${endTime}`,
      description: activeTimer.description,
      startTime: activeTimer.startTime,
      endTime,
      duration: Math.floor((endTime - activeTimer.startTime) / 1000),
      project: activeTimer.project,
    };
    setTimeEntries(prev => [newEntry, ...prev]);
    setActiveTimer(null);
  }, [activeTimer, setTimeEntries, setActiveTimer]);

  const handleAddNote = useCallback((category: string): void => {
    const newNote: Note = { id: `note-${Date.now()}`, title: 'New Note', content: '', category, createdAt: Date.now() };
    setNotes(prev => [newNote, ...prev]);
  }, [setNotes]);

  const handleUpdateNote = useCallback((id: string, updates: Partial<Note>): void => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, [setNotes]);

  const handleDeleteNote = useCallback((id: string): void => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [setNotes]);

  const handleAddEvent = useCallback((event: Omit<Event, 'id'>): void => {
    setEvents(prev => [...prev, { ...event, id: `event-${Date.now()}` }]);
  }, [setEvents]);

  const handleDeleteEvent = useCallback((id: string): void => {
    setEvents(prev => prev.filter((e: Event) => e.id !== id));
  }, [setEvents]);

  const handleAddGoal = useCallback((goal: Omit<Goal, 'id'>): void => {
    setGoals(prev => [...prev, { ...goal, id: `goal-${Date.now()}` }]);
  }, [setGoals]);
  
  const handleToggleGoal = useCallback((id: string): void => {
    const today = new Date().toISOString().split('T')[0] || '';
    setGoals((prev: Goal[]) => prev.map((g: Goal) => {
        if (g.id === id) {
            const completedToday = g.completedDates.includes(today);
            const newCompletedDates = completedToday 
                ? g.completedDates.filter((d: string) => d !== today)
                : [...g.completedDates, today];
            
            return {
                ...g,
                completedDates: newCompletedDates,
                streak: completedToday ? Math.max(0, g.streak - 1) : g.streak + 1
            }
        }
        return g;
    }));
  }, [setGoals]);

  const handleDeleteGoal = useCallback((id: string): void => {
    setGoals(prev => prev.filter((g: Goal) => g.id !== id));
  }, [setGoals]);

  const handleAddClass = useCallback((cls: Class): void => {
    setClasses(prev => [...prev, cls]);
  }, [setClasses]);

  const handleDeleteClass = useCallback((id: string): void => {
    setClasses(prev => prev.filter((c: Class) => c.id !== id));
  }, [setClasses]);
  
  const handleAddDeck = useCallback((title: string): void => {
    setDecks(prev => [...prev, { id: `deck-${Date.now()}`, title, cards: [] }]);
  }, [setDecks]);

  const handleDeleteDeck = useCallback((id: string): void => {
    setDecks(prev => prev.filter((d: Deck) => d.id !== id));
  }, [setDecks]);

  const handleAddCard = useCallback((deckId: string, front: string, back: string): void => {
      setDecks(prev => prev.map(d => d.id === deckId ? {
          ...d,
          cards: [...d.cards, { id: `card-${Date.now()}`, front, back, box: 0, nextReview: Date.now() }]
      } : d));
  }, [setDecks]);

  const handleUpdateCard = useCallback((deckId: string, cardId: string, updates: Partial<Flashcard>): void => {
      setDecks(prev => prev.map(d => d.id === deckId ? {
          ...d,
          cards: d.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
      } : d));
  }, [setDecks]);

  const handleDeleteCard = useCallback((deckId: string, cardId: string): void => {
      setDecks(prev => prev.map(d => d.id === deckId ? {
          ...d,
          cards: d.cards.filter(c => c.id !== cardId)
      } : d));
  }, [setDecks]);

  const handleUpdateTask = useCallback((id: string, updates: Partial<Task>): void => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updatedTask = { ...t, ...updates };
        // Status Machine Transitions
        if (updates.status === 'done' && t.status !== 'done') {
          updatedTask.completed = true;
          // Secondary actions: stop timers if this task was active
          if (activeTimer?.description === t.title) {
            handleStopTimer();
          }
        }
        return updatedTask;
      }
      return t;
    }));
  }, [setTasks, activeTimer, handleStopTimer]);

  const handleDeleteTask = useCallback((id: string): void => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [setTasks]);

  const handleAiAction = useCallback((functionName: string, args: Record<string, unknown>): void => {
    switch (functionName) {
      case 'addTask': {
        const title = typeof args.title === 'string' ? args.title : 'New Task';
        const projectName = typeof args.projectName === 'string' ? args.projectName : undefined;
        const deadline = typeof args.deadline === 'string' ? args.deadline : undefined;
        
        let projectId = projects[0]?.id || 'proj-0';
        if (projectName) {
          const foundProject = projects.find(p => p.name.toLowerCase().includes(projectName.toLowerCase()));
          if (foundProject) {
            projectId = foundProject.id;
          }
        }
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: title,
          completed: false,
          status: 'todo',
          projectId: projectId,
          priority: 4,
          tags: ['AI'],
          deadline: deadline,
        };
        setTasks(prev => [newTask, ...prev]);
        break;
      }
      case 'updateTask': {
        const oldTitle = typeof args.oldTitle === 'string' ? args.oldTitle : '';
        const newTitle = typeof args.newTitle === 'string' ? args.newTitle : undefined;
        const completed = typeof args.completed === 'boolean' ? args.completed : undefined;

        setTasks(prev => prev.map(t => {
            if (oldTitle && t.title.toLowerCase().includes(oldTitle.toLowerCase())) {
                return {
                    ...t,
                    title: newTitle || t.title,
                    completed: completed !== undefined ? completed : t.completed,
                    status: completed ? 'done' : (completed === false ? 'in_progress' : t.status)
                };
            }
            return t;
        }));
        break;
      }
      case 'deleteTask': {
        const title = typeof args.title === 'string' ? args.title : '';
        if (title) {
          setTasks(prev => prev.filter(t => !t.title.toLowerCase().includes(title.toLowerCase())));
        }
        break;
      }
      case 'addEvent': {
        const title = typeof args.title === 'string' ? args.title : 'New Event';
        const date = typeof args.date === 'string' ? args.date : (new Date().toISOString().split('T')[0] || '');
        const startTime = typeof args.startTime === 'string' ? args.startTime : undefined;
        const endTime = typeof args.endTime === 'string' ? args.endTime : undefined;

        const newEvent: Omit<Event, 'id'> = {
          title,
          date,
          startTime,
          endTime,
          color: accentColors[Math.floor(Math.random() * accentColors.length)]?.hex || '#3b82f6',
        };
        handleAddEvent(newEvent);
        break;
      }
      case 'addNote': {
        const title = typeof args.title === 'string' ? args.title : 'New Note';
        const content = typeof args.content === 'string' ? args.content : '';
        const category = typeof args.category === 'string' ? args.category : 'General';
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title,
          content,
          category,
          createdAt: Date.now(),
        };
        setNotes(prev => [newNote, ...prev]);
        break;
      }
      case 'addGoal': {
        const title = typeof args.title === 'string' ? args.title : 'New Goal';
        const icon = typeof args.icon === 'string' ? args.icon : '🎯';
        const color = typeof args.color === 'string' ? args.color : (accentColors[Math.floor(Math.random() * accentColors.length)]?.hex || '#3b82f6');
        const newGoal: Omit<Goal, 'id'> = {
          title,
          icon,
          color,
          streak: 0,
          completedDates: [],
          targetDaysPerWeek: 7,
        };
        handleAddGoal(newGoal);
        break;
      }
      case 'addFlashcard': {
        const deckTitle = typeof args.deckTitle === 'string' ? args.deckTitle : 'General';
        const front = typeof args.front === 'string' ? args.front : '';
        const back = typeof args.back === 'string' ? args.back : '';

        let deck = decks.find((d: Deck) => d.title.toLowerCase().includes(deckTitle.toLowerCase()));
        if (!deck) {
          const newDeckId = `deck-${Date.now()}`;
          const newDeck: Deck = { id: newDeckId, title: deckTitle, cards: [] };
          setDecks((prev: Deck[]) => [...prev, newDeck]);
          deck = newDeck;
        }
        if (deck) {
          handleAddCard(deck.id, front, back);
        }
        break;
      }
      default:
        console.warn(`Unknown AI action: ${functionName}`);
    }
  }, [projects, setTasks, setNotes, setDecks, handleAddEvent, handleAddGoal, handleAddCard, accentColors, decks]);

  return {
    handleStartTimer,
    handleStopTimer,
    handleUpdateTask,
    handleDeleteTask,
    handleAddNote,
    handleUpdateNote,
    handleDeleteNote,
    handleAddEvent,
    handleDeleteEvent,
    handleAddGoal,
    handleToggleGoal,
    handleDeleteGoal,
    handleAddClass,
    handleDeleteClass,
    handleAddDeck,
    handleDeleteDeck,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleAiAction
  };
};
