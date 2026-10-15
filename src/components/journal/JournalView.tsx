import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Building2,
  User,
  ArrowRight,
  Clock,
  Calendar,
  CheckSquare,
  Trash2,
  Edit3,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  Circle,
  PlayCircle,
  ListTodo,
  Check,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { JournalEntry, WorkCategory, Task, TaskStatus } from '../../types/workos';

export const JournalView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast, openQuickAdd, t, language } = useWorkOS();

  const [activeTab, setActiveTab] = useState<'tasks' | 'journal'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Planned' | 'In Progress' | 'Completed'>('All');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getJournal(effectiveCategory || 'Office'),
      api.getTasks({ category: 'Office' }),
    ])
      .then(([journalData, taskData]) => {
        setEntries(journalData);
        setTasks(taskData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load office data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [effectiveCategory, refreshTrigger]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const handleToggleTaskCompleted = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
      addToast(`Task status updated`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleConvertToTask = async (entry: JournalEntry) => {
    setConvertingId(entry.id);
    try {
      const createdTask = await api.convertJournalToTask(entry.id);
      addToast(`Generated Task ${createdTask.id} from office activity!`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to convert to task', 'error');
    } finally {
      setConvertingId(null);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm(language === 'LA' ? 'ຕ້ອງການລຶບລາຍການນີ້ແທ້ບໍ່?' : 'Delete this entry?')) return;
    try {
      await api.deleteJournalEntry(id);
      addToast(language === 'LA' ? 'ລຶບສຳເລັດແລ້ວ' : 'Entry deleted', 'info');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const filteredTasks = tasks
    .filter((t) => {
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Planned') return t.status === 'Planned' || t.status === 'Not Started';
      if (statusFilter === 'In Progress') return t.status === 'In Progress' || t.status === 'Waiting for Approval';
      if (statusFilter === 'Completed') return t.status === 'Completed';
      return true;
    })
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.nextAction?.toLowerCase().includes(q)
      );
    });

  const filteredEntries = entries.filter((entry) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.actionsPerformed.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (dateFilter === 'today') return entry.date === todayStr;
    if (dateFilter === 'week') return entry.date >= sevenDaysAgo;
    if (dateFilter === 'month') return entry.date >= thirtyDaysAgo;
    return true;
  });

  const countPlanned = tasks.filter((t) => t.status === 'Planned' || t.status === 'Not Started').length;
  const countInProgress = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Waiting for Approval').length;
  const countCompleted = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('officeWork')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'LA'
              ? 'ຈັດການວຽກຫ້ອງການ 1. Planned, 2. In Progress, 3. Completed ແລະ ບັນທຶກຜົນການເຮັດວຽກ'
              : 'Track corporate office work streams, planned deliverables, in-progress tasks, and accomplishment logs.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'tasks' ? (
            <button
              onClick={() => openQuickAdd('task')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'LA' ? '+ ສ້າງວຽກຫ້ອງການ' : '+ New Office Task'}</span>
            </button>
          ) : (
            <button
              onClick={() => openQuickAdd('journal')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'LA' ? '+ ບັນທຶກວຽກຫ້ອງການ' : '+ New Office Entry'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Toggle: Office Tasks Tracker vs Activity Log */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{language === 'LA' ? 'ວຽກຫ້ອງການ (Office Tasks)' : 'Office Tasks Tracker'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'LA' ? 'ບັນທຶກຜົນງານຫ້ອງການ (Activity Logs)' : 'Office Activity Logs & Accomplishments'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold">
            {entries.length}
          </span>
        </button>
      </div>

      {activeTab === 'tasks' ? (
        /* ================= OFFICE TASKS TRACKER ================= */
        <div className="space-y-4">
          {/* 3 Status Filter Buttons with Explicit Hex Codes */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All Office Tasks ({tasks.length})
            </button>

            {/* 1. Planned (Blue HEX: #3B82F6) */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'Planned' ? 'All' : 'Planned')}
              style={
                statusFilter === 'Planned'
                  ? { backgroundColor: '#3B82F6', color: '#ffffff' }
                  : {}
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'Planned'
                  ? 'shadow-xs'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-900'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusFilter === 'Planned' ? '#ffffff' : '#3B82F6' }}
              />
              <span>1. Planned (Blue #3B82F6)</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                {countPlanned}
              </span>
            </button>

            {/* 2. In Progress (Amber HEX: #F59E0B) */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'All' : 'In Progress')}
              style={
                statusFilter === 'In Progress'
                  ? { backgroundColor: '#F59E0B', color: '#ffffff' }
                  : {}
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'In Progress'
                  ? 'shadow-xs'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusFilter === 'In Progress' ? '#ffffff' : '#F59E0B' }}
              />
              <span>2. In Progress (Amber #F59E0B)</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                {countInProgress}
              </span>
            </button>

            {/* 3. Completed (Green HEX: #16A34A) */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}
              style={
                statusFilter === 'Completed'
                  ? { backgroundColor: '#16A34A', color: '#ffffff' }
                  : {}
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'Completed'
                  ? 'shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusFilter === 'Completed' ? '#ffffff' : '#16A34A' }}
              />
              <span>3. Completed (Green #16A34A)</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                {countCompleted}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search office tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
            />
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading office tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No tasks match current filter
              </h4>
              <p className="text-xs text-slate-500">
                Add an office task to track Planned, In Progress, and Completed work.
              </p>
              <button
                onClick={() => openQuickAdd('task')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                + Add Office Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const isPlanned = task.status === 'Planned' || task.status === 'Not Started';
                const isInProgress = task.status === 'In Progress' || task.status === 'Waiting for Approval';

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTaskCompleted(task)}
                        title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>

                          {/* 3 Explicit Status Badges */}
                          {isPlanned && (
                            <span
                              style={{ backgroundColor: '#3B82F6', color: '#ffffff' }}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                            >
                              1. Planned (#3B82F6)
                            </span>
                          )}
                          {isInProgress && (
                            <span
                              style={{ backgroundColor: '#F59E0B', color: '#ffffff' }}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                            >
                              2. In Progress (#F59E0B)
                            </span>
                          )}
                          {isCompleted && (
                            <span
                              style={{ backgroundColor: '#16A34A', color: '#ffffff' }}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                            >
                              3. Completed (#16A34A)
                            </span>
                          )}

                          <span className="text-[9px] font-mono text-slate-400">
                            {task.id}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                          {task.projectTitle && (
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              📁 {task.projectTitle}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Due: {task.dueDate}
                            </span>
                          )}
                          {task.nextAction && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[200px]">
                              👉 Next: {task.nextAction}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= ACTIVITY LOG ================= */
        <div className="space-y-4">
          {/* Filter and Range Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries by title, description, or lessons learned..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setDateFilter(period)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    dateFilter === period
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {period === 'all'
                    ? 'All Dates'
                    : period === 'today'
                    ? 'Today'
                    : period === 'week'
                    ? 'This Week'
                    : 'This Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Entries Feed */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading journal records...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No journal entries match your filters
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Record today's work accomplishments or reflections.
              </p>
              <button
                onClick={() => openQuickAdd('journal')}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                + Create First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {entry.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{entry.id}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {entry.date} {entry.time && `• ${entry.time}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.timeSpentMinutes && (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.timeSpentMinutes} mins
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {entry.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>

                  {entry.actionsPerformed && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Actions Executed:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">{entry.actionsPerformed}</p>
                    </div>
                  )}

                  {entry.results && (
                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                        Deliverable Outcome & Results:
                      </span>
                      <p className="text-emerald-700 dark:text-emerald-400">{entry.results}</p>
                    </div>
                  )}

                  {entry.lessonsLearned && (
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Key Insight & Lessons Learned:
                      </span>
                      <p className="text-amber-700 dark:text-amber-400">{entry.lessonsLearned}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500">
                      {entry.nextAction && (
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">Next Action:</strong>{' '}
                          {entry.nextAction}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleConvertToTask(entry)}
                      disabled={convertingId === entry.id}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-lg flex items-center gap-1.5 transition-all self-end sm:self-auto cursor-pointer"
                    >
                      {convertingId === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckSquare className="w-3.5 h-3.5" />
                      )}
                      <span>Convert to Task</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
