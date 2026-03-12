
import { useEffect } from 'react';
import { Project, Task, TimeEntry, ActiveTimer, Note, Event, Goal, Class, Deck } from '../types';
import { usePersistentState } from './usePersistentState';

const getTomorrow = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0] || '';
};

export const useAppData = (): {
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
} => {
  const [projects, setProjects] = usePersistentState<Project[]>('focusflow-projects', [
    { id: 'General', name: 'General', color: '#6366f1' },
    { id: 'University', name: 'University', color: '#10b981' },
    { id: 'Work', name: 'Work', color: '#f59e0b' }
  ]);

  const [tasks, setTasks] = usePersistentState<Task[]>('focusflow-tasks', [
    { 
        id: 'task-1', 
        title: 'Welcome to StudyPro OS!', 
        completed: false, 
        projectId: 'General', 
        priority: 1, 
        status: 'todo',
        deadline: getTomorrow(),
        tags: ['studypro'], 
        inMyDay: true,
        subtasks: [
            { id: 'sub-1', title: 'Explore the Unified Productivity Tools', completed: false },
            { id: 'sub-2', title: 'Check the new advanced Sidebar in Tasks', completed: false },
            { id: 'sub-3', title: 'Customize your theme in Settings', completed: false },
        ],
        links: [],
        counters: []
    }
  ]);
  
  useEffect(() => {
      setTasks((prev: Task[]) => prev.map((t: Task) => ({
          ...t,
          status: (t.status || (t.completed ? 'done' : 'todo')) as TaskStatus,
          inMyDay: t.inMyDay !== undefined ? t.inMyDay : false,
      })));
  }, [setTasks]);

  const [timeEntries, setTimeEntries] = usePersistentState<TimeEntry[]>('focusflow-timeEntries', []);
  const [activeTimer, setActiveTimer] = usePersistentState<ActiveTimer | null>('focusflow-activeTimer', null);
  const [notes, setNotes] = usePersistentState<Note[]>('focusflow-notes', [{ id: 'note-1', title: 'StudyPro OS', category: 'General', content: '# Welcome\n\nStudyPro is your unified workspace for academic and professional success.\n\n- Tasks: Powerful multi-category organization.\n- Notes: Full Markdown support.\n- AI Assistant: Integrated Gemini power.', createdAt: Date.now() }]);
  const [events, setEvents] = usePersistentState<Event[]>('focusflow-events', []);
  const [goals, setGoals] = usePersistentState<Goal[]>('focusflow-goals', []);
  const [classes, setClasses] = usePersistentState<Class[]>('focusflow-classes', []);
  const [decks, setDecks] = usePersistentState<Deck[]>('focusflow-decks', []);

  return {
    projects, setProjects,
    tasks, setTasks,
    timeEntries, setTimeEntries,
    activeTimer, setActiveTimer,
    notes, setNotes,
    events, setEvents,
    goals, setGoals,
    classes, setClasses,
    decks, setDecks
  };
};
