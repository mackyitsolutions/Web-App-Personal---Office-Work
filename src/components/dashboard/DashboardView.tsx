import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  FolderKanban,
  Brain,
  Scale,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  User,
  CheckCircle2,
  Flame,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Library,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { Task } from '../../types/workos';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    effectiveCategory,
    setSelectedCategory,
    setActiveTab,
    refreshTrigger,
    triggerRefresh,
    openQuickAdd,
    addToast,
    t,
    language,
  } = useWorkOS();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getSummary(effectiveCategory)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard summary:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
      await api.updateTask(task.id, { status: newStatus });
      addToast(`Task marked as ${newStatus}`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Calculating WorkOS metrics...</span>
        </div>
      </div>
    );
  }

  // Chart data
  const priorityChartData = [
    {
      name: 'Critical',
      count: data?.topPriorities?.filter((t: any) => t.priority === 'Critical').length || 1,
      color: '#ef4444',
    },
    {
      name: 'High',
      count: data?.topPriorities?.filter((t: any) => t.priority === 'High').length || 2,
      color: '#f97316',
    },
    { name: 'Medium', count: 3, color: '#eab308' },
    { name: 'Low', count: 1, color: '#10b981' },
  ];

  const categoryDistribution = [
    { name: 'Office', value: data?.officeTasksCount || 4, color: '#2563eb' },
    { name: 'Personal', value: data?.personalTasksCount || 2, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Filter Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Executive Cockpit
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Executive Overview & Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-0.5">
            Real-time status of personal commitments, enterprise deliverables, and strategic decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd('task')}
            className="px-3.5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-lg shadow-sm transition-all"
          >
            + New Task
          </button>
          <button
            onClick={() => triggerRefresh()}
            title="Refresh database metrics"
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Statistic Cards Grid - Calculated from real records */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Open Tasks */}
        <div
          onClick={() => setActiveTab('personal')}
          className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 cursor-pointer shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('personalWork')}</span>
            <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.totalOpenTasks ?? 0}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>
              {data?.officeTasksCount} Office · {data?.personalTasksCount} Personal
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => setActiveTab('personal')}
          className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 cursor-pointer shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {t('overdue')}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {data?.overdueTasksCount ?? 0}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Requires prompt action</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500" />
          </div>
        </div>

        {/* Active Projects */}
        <div
          onClick={() => setActiveTab('projects')}
          className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('activeProjects')}</span>
            <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.activeProjectsCount ?? 0}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Milestones in flight</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
          </div>
        </div>

        {/* Staff Documentation & Knowledge Base */}
        <div
          onClick={() => setActiveTab('knowledge')}
          className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 cursor-pointer shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('knowledgeBase')}</span>
            <Library className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            {t('staff')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Official staff documents</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Section: Top Priorities & Recommended Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Priorities & Urgent Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Priorities Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Top Priority Commitments
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('personal')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>{t('allTasks')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {!data?.topPriorities || data.topPriorities.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No critical or high-priority tasks pending!
                </div>
              ) : (
                data.topPriorities.map((task: Task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                        }`}
                      >
                        {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="truncate">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              task.category === 'Office'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }`}
                          >
                            {task.category}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              task.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p
                          className={`text-xs font-semibold text-slate-900 dark:text-white truncate ${
                            task.status === 'Completed' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {task.dueDate && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.dueDate}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">{task.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended Next Actions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recommended Next Actions
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Action items extracted directly from current active tasks and problem containment plans.
            </p>

            <div className="space-y-2">
              {data?.recommendedActions?.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No next actions explicitly logged on active tasks.
                </div>
              ) : (
                data?.recommendedActions?.map((act: any) => (
                  <div
                    key={act.taskId}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      →
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {act.nextAction}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Linked Task: {act.taskTitle} ({act.taskId})
                      </div>
                    </div>
                    {act.dueDate && (
                      <span className="text-[10px] text-slate-500 font-medium shrink-0">
                        Target: {act.dueDate}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Visual Health & Analytics */}
        <div className="space-y-6">
          {/* Category Distribution Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Workload Separation
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Separation between Office tasks vs. Personal commitments.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span>Office ({data?.officeTasksCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Personal ({data?.personalTasksCount})</span>
              </div>
            </div>
          </div>

          {/* Quick Module Navigation Links */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Strategic Navigation
            </h3>

            <button
              onClick={() => setActiveTab('myday')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                {t('myDay')} & Today's Schedule
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('office')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                {t('officeWork')} (Office Deliverables)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('personal')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                {t('personalWork')} (Action Checklist)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Library className="w-4 h-4 text-teal-500" />
                {t('knowledgeBase')} ({t('staff')})
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
