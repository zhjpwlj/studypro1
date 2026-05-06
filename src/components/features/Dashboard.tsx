
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Task, Project, TimeEntry, Event, Class, Goal } from '../../types';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieLabelRenderProps } from 'recharts';
import { CalendarDays, CheckCircle2, Circle, Palette, GraduationCap, CheckSquare, Target, Quote, Sparkles, RefreshCw } from 'lucide-react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  timeEntries: TimeEntry[];
  events: Event[];
  classes: Class[];
  goals: Goal[];
  isMobile?: boolean;
}

const AgendaItem: React.FC<{ time: string; title: string; color: string; icon: React.ReactNode; isMobile?: boolean }> = ({ time, title, color, icon, isMobile }): React.ReactElement => (
    <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
        <div className={`${isMobile ? 'w-10 text-xs' : 'w-12 text-sm'} text-right font-semibold text-slate-400`}>{time}</div>
        <div className="flex-shrink-0 w-1 h-8 rounded-full" style={{backgroundColor: color}}></div>
        <div className={`flex-1 flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <div className="text-slate-400">{icon}</div>
            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{title}</span>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ tasks, projects, setProjects, timeEntries, events, classes, goals, isMobile }): React.ReactElement => {
    const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
    const [motivation, setMotivation] = useState<{ quote: string; author: string } | null>(null);
    const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
    const { t } = useContext(LanguageContext);

    const fetchMotivation = async (): Promise<void> => {
        setIsLoadingMotivation(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: "Give me a short, powerful motivational quote for a student. Return it in JSON format: { \"quote\": \"...\", \"author\": \"...\" }",
                config: { responseMimeType: "application/json" }
            });
            if (response.text) {
                const data = JSON.parse(response.text);
                setMotivation(data);
            }
        } catch (err) {
            console.error("Failed to fetch motivation:", err);
            setMotivation({ quote: "The secret of getting ahead is getting started.", author: "Mark Twain" });
        } finally {
            setIsLoadingMotivation(false);
        }
    };

    useEffect(() => {
        fetchMotivation();
    }, []);

    const pieData = useMemo(() => {
        return projects.map(project => ({
            name: project.name,
            value: tasks.filter(task => task.projectId === project.id).length,
            color: project.color || '#ccc'
        })).filter(p => p.value > 0);
    }, [projects, tasks]);
    
    const todayStr = useMemo(() => {
        const parts = new Date().toISOString().split('T');
        return parts[0] || '';
    }, []);
    const goalsCompleted = useMemo(() => goals.filter(g => g.completedDates.includes(todayStr)).length, [goals, todayStr]);
    const goalsProgress = goals.length > 0 ? (goalsCompleted / goals.length) * 100 : 0;
    const nextIncompleteGoal = useMemo(() => goals.find(g => !g.completedDates.includes(todayStr)), [goals, todayStr]);

    const barData = useMemo(() => {
        const data: Record<string, number> = {};
        timeEntries.forEach(entry => {
            const proj = projects.find(p => p.name === entry.project || p.id === entry.project);
            const key = proj ? proj.name : entry.project;
            data[key] = (data[key] || 0) + entry.duration;
        });

        return Object.entries(data).map(([name, duration]) => {
             const proj = projects.find(p => p.name === name);
             return {
                name,
                minutes: Math.round(duration / 60),
                color: proj?.color || '#8884d8'
             };
        });
    }, [timeEntries, projects]);

    const {
        completedTasksInProject,
        totalTasksInProject,
        progress,
        nextIncompleteTask,
        selectedProjectColor
    } = useMemo(() => {
        if (!selectedProjectId) return { completedTasksInProject: 0, totalTasksInProject: 0, progress: 0, nextIncompleteTask: null, selectedProjectColor: '#fff' };
        
        const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
        const completed = projectTasks.filter(t => t.completed).length;
        const total = projectTasks.length;
        const prog = total > 0 ? (completed / total) * 100 : 0;
        const nextTask = projectTasks.find(t => !t.completed);
        const color = projects.find(p => p.id === selectedProjectId)?.color || '#fff';

        return {
            completedTasksInProject: completed,
            totalTasksInProject: total,
            progress: prog,
            nextIncompleteTask: nextTask,
            selectedProjectColor: color
        };
    }, [selectedProjectId, tasks, projects]);

    const agendaItems = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();

        const todayEvents = events
            .filter(e => e.date === todayStr)
            .map(e => ({ type: 'event', time: e.startTime || 'All Day', title: e.title, color: e.color, icon: <CalendarDays size={16}/> }));
        
        const todayTasks = tasks
            .filter(t => t.deadline === todayStr && !t.completed)
            .map(t => ({ type: 'task', time: t.deadlineTime || 'Deadline', title: t.title, color: '#94a3b8', icon: <CheckSquare size={16}/> }));

        const todayClasses = classes.flatMap(c => 
            c.sessions
              .filter(s => s.dayOfWeek === dayOfWeek)
              .map(s => ({ type: 'class', time: s.startTime, title: c.name, color: c.color, icon: <GraduationCap size={16}/>}))
        );

        return [...todayEvents, ...todayTasks, ...todayClasses].sort((a,b) => a.time.localeCompare(b.time));

    }, [events, tasks, classes, todayStr]);

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedProjectId(e.target.value);
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, color: e.target.value } : p));
    };

    const renderCustomizedLabel = (props: PieLabelRenderProps): React.ReactNode => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
        if (cx === undefined || cy === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined || percent === undefined) return null;
        
        const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
        const x = (cx as number) + radius * Math.cos(-(midAngle as number) * (Math.PI / 180));
        const y = (cy as number) + radius * Math.sin(-(midAngle as number) * (Math.PI / 180));
        return (percent > 0.05 ? 
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text> : null
        );
    };

    return (
        <div className={`h-full overflow-y-auto ${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'} text-white bg-transparent`}>
            {/* 0. Motivation Row */}
            <div className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Quote size={120} />
                </div>
                <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-300">
                        <Sparkles size={18} />
                        <span className="text-sm font-bold uppercase tracking-wider">{t('motivation')}</span>
                    </div>
                    {isLoadingMotivation ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-6 bg-white/10 rounded w-3/4"></div>
                            <div className="h-4 bg-white/10 rounded w-1/4"></div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                            <p className="text-xl md:text-2xl font-medium italic leading-relaxed">
                                &quot;{motivation?.quote}&quot;
                            </p>
                            <p className="text-indigo-300 mt-2 font-bold">— {motivation?.author}</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={fetchMotivation}
                    disabled={isLoadingMotivation}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    title="Refresh quote"
                >
                    <RefreshCw size={20} className={isLoadingMotivation ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* 1. Charts Row */}
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2 xl:grid-cols-4'} gap-6`}>
                {/* Breakdown Pie Chart */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl flex flex-col xl:col-span-1">
                    <h2 className="text-lg font-semibold mb-4">{t('projectBreakdown')}</h2>
                    <div className={`flex-1 ${isMobile ? 'min-h-[200px]' : 'min-h-[250px]'} relative`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={isMobile ? 60 : 80} innerRadius={isMobile ? 30 : 40} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                        {pieData.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500">{t('noData')}</div>
                        )}
                    </div>
                </div>

                {/* Goals Widget */}
                 <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl flex flex-col xl:col-span-1">
                    <h2 className="text-lg font-semibold mb-4">{t('goalProgress')}</h2>
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm text-slate-400">
                               <span>{t('progress')}</span>
                               <span>{Math.round(goalsProgress)}%</span>
                           </div>
                           <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                               <div className="h-2 transition-all duration-500 rounded-full bg-emerald-500" style={{ width: `${goalsProgress}%` }}></div>
                           </div>
                           <p className="text-xs text-right text-slate-500">{goalsCompleted} / {goals.length} {t('goals')}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 mt-4">
                           <h3 className="text-sm font-medium text-slate-300 mb-2">{t('nextGoal')}</h3>
                           {nextIncompleteGoal ? (
                                <div className="flex items-start gap-3">
                                    <Target size={16} className="mt-1 text-slate-500" />
                                    <p className="text-sm font-medium">{nextIncompleteGoal.title}</p>
                                </div>
                           ) : goals.length > 0 ? (
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                    <CheckCircle2 size={16} />
                                    <span>{t('allGoalsCompleted')}</span>
                                </div>
                           ) : (
                                <p className="text-sm text-slate-500">{t('noGoalsYet')}</p>
                           )}
                        </div>
                    </div>
                 </div>

                {/* Agenda */}
                <div className={`bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl flex flex-col ${isMobile ? '' : 'xl:col-span-2'}`}>
                    <h2 className="text-lg font-semibold mb-4">{t('agendaToday')}</h2>
                    <div className={`flex-1 space-y-4 overflow-y-auto pr-2 ${isMobile ? 'max-h-[300px]' : ''}`}>
                        {agendaItems.length > 0 ? agendaItems.map((item, index) => (
                            <AgendaItem key={index} {...item} isMobile={isMobile} />
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8">
                                <CheckCircle2 size={32} className="mb-2"/>
                                <p className="font-medium">{t('allClear')}</p>
                                <p className="text-sm">{t('noEvents')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Project Summary & Focus Duration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Summary */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-semibold">{t('projectSummary')}</h2>
                        <div className="flex items-center gap-2">
                             <Palette size={16} className="text-slate-400"/>
                             <input type="color" value={selectedProjectColor} onChange={handleColorChange} className="w-6 h-6 rounded border-none p-0 bg-transparent cursor-pointer" title="Change project color" />
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <select value={selectedProjectId} onChange={handleProjectChange} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-accent">
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    
                    {projects.length > 0 && selectedProjectId && (
                        <div className="space-y-6 flex-1">
                             <div className="space-y-2">
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>{t('progress')}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div className="h-2 transition-all duration-500 rounded-full" style={{ width: `${progress}%`, backgroundColor: selectedProjectColor }}></div>
                                </div>
                                <p className="text-xs text-right text-slate-500">{completedTasksInProject} / {totalTasksInProject} {t('tasks')}</p>
                            </div>
                            
                            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                               <h3 className="text-sm font-medium text-slate-300 mb-2">{t('nextUp')}</h3>
                               {nextIncompleteTask ? (
                                    <div className="flex items-start gap-3">
                                        <Circle size={16} className="mt-1 text-slate-500" />
                                        <div>
                                            <p className="text-sm font-medium">{nextIncompleteTask.title}</p>
                                            {nextIncompleteTask.deadline && (
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <CalendarDays size={12} />
                                                    <span>{new Date(nextIncompleteTask.deadline).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                               ) : totalTasksInProject > 0 ? (
                                    <div className="flex items-center gap-2 text-green-400 text-sm">
                                        <CheckCircle2 size={16} />
                                        <span>{t('allTasksCompleted')}</span>
                                    </div>
                               ) : (
                                    <p className="text-sm text-slate-500">{t('noTasksYet')}</p>
                               )}
                            </div>
                        </div>
                    )}
                </div>

                 {/* Focus Duration */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">{t('focusDuration')}</h2>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip cursor={{ fill: '#334155', opacity: 0.2 }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}/>
                                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                                    {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        {barData.length === 0 && (
                             <div className="absolute inset-0 flex items-center justify-center text-slate-500 pt-10">{t('noFocusData')}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
