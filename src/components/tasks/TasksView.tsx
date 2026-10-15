import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  ArrowUpDown,
  LayoutList,
  Columns,
  Search,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  Building2,
  User,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  X,
  AlertCircle,
  Loader2,
  ListTodo,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { Task, WorkCategory, TaskPriority, TaskStatus, Project, TaskChecklistItem } from '../../types/workos';

type TaskViewTab =
  | 'All Tasks'
  | 'Office Tasks'
  | 'Personal Tasks'
  | 'My Day'
  | 'Upcoming'
  | 'Overdue'
  | 'Completed';

export const TasksView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast, openQuickAdd, t, language } = useWorkOS();

  const [activeTab, setActiveTab] = useState<TaskViewTab>('All Tasks');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'updated'>('deadline');

  // Edit / Details Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);

  // Edit Form Fields
  const [editCategory, setEditCategory] = useState<WorkCategory>('Office');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editChecklist, setEditChecklist] = useState<TaskChecklistItem[]>([]);
  const [editNewChecklistText, setEditNewChecklistText] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');
  const [editStatus, setEditStatus] = useState<TaskStatus>('Not Started');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editReminderDate, setEditReminderDate] = useState('');
  const [editNextAction, setEditNextAction] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editResponsible, setEditResponsible] = useState('');
  const [editCompletionNotes, setEditCompletionNotes] = useState('');
  const [editError, setEditError] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Fetch tasks based on activeTab
  useEffect(() => {
    setLoading(true);
    let catFilter: WorkCategory | undefined = effectiveCategory;
    let viewFilter: string | undefined = undefined;

    if (activeTab === 'Office Tasks') catFilter = 'Office';
    else if (activeTab === 'Personal Tasks') catFilter = 'Personal';
    else if (activeTab === 'My Day') viewFilter = 'MyDay';
    else if (activeTab === 'Upcoming') viewFilter = 'Upcoming';
    else if (activeTab === 'Overdue') viewFilter = 'Overdue';
    else if (activeTab === 'Completed') viewFilter = 'Completed';

    Promise.all([
      api.getTasks({
        category: catFilter,
        view: viewFilter,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
      }),
      api.getProjects(),
    ])
      .then(([taskList, projectList]) => {
        setTasks(taskList);
        setProjects(projectList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load tasks:', err);
        setLoading(false);
      });
  }, [activeTab, effectiveCategory, statusFilter, priorityFilter, refreshTrigger]);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter & Sort
  const filteredTasks = tasks
    .filter((task) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.id.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.nextAction?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'priority') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setEditCategory(task.category); // Preserve category
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditChecklist(task.checklist ? [...task.checklist] : []);
    setEditNewChecklistText('');
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditStartDate(task.startDate || '');
    setEditDueDate(task.dueDate || '');
    setEditReminderDate(task.reminderDate || '');
    setEditNextAction(task.nextAction || '');
    setEditProjectId(task.projectId || '');
    setEditResponsible(task.responsiblePerson || '');
    setEditCompletionNotes(task.completionNotes || '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleToggleChecklistItem = async (task: Task, chkId: string) => {
    if (!task.checklist) return;
    const updated = task.checklist.map((item) =>
      item.id === chkId ? { ...item, completed: !item.completed } : item
    );
    try {
      await api.updateTask(task.id, { checklist: updated });
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setEditError('');

    if (!editTitle.trim()) {
      setEditError('Task title is required.');
      return;
    }
    if (editStartDate && editDueDate && editDueDate < editStartDate) {
      setEditError('Due date cannot be earlier than start date.');
      return;
    }

    setSubmittingEdit(true);
    try {
      const selectedProj = projects.find((p) => p.id === editProjectId);
      await api.updateTask(editingTask.id, {
        title: editTitle.trim(),
        category: editCategory, // Explicit or preserved category
        description: editDesc.trim() || undefined,
        checklist: editChecklist.length > 0 ? editChecklist : undefined,
        priority: editPriority,
        status: editStatus,
        startDate: editStartDate || undefined,
        dueDate: editDueDate || undefined,
        reminderDate: editReminderDate || undefined,
        nextAction: editNextAction.trim() || undefined,
        projectId: editProjectId || undefined,
        projectTitle: selectedProj?.name,
        responsiblePerson: editResponsible.trim() || undefined,
        completionNotes: editCompletionNotes.trim() || undefined,
      });

      addToast(`Updated task ${editingTask.id}`, 'success');
      setIsEditModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update task');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirmTask) return;
    try {
      await api.deleteTask(deleteConfirmTask.id);
      addToast(`Deleted task ${deleteConfirmTask.id}`, 'info');
      setDeleteConfirmTask(null);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await api.updateTask(task.id, { status: newStatus });
      addToast(`Task marked as ${newStatus}`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const tabs: TaskViewTab[] = [
    'All Tasks',
    'Office Tasks',
    'Personal Tasks',
    'My Day',
    'Upcoming',
    'Overdue',
    'Completed',
  ];

  const kanbanColumns: { status: TaskStatus; label: string; hex: string }[] = [
    { status: 'Planned', label: '1. Planned (#3B82F6)', hex: '#3B82F6' },
    { status: 'In Progress', label: '2. In Progress (#F59E0B)', hex: '#F59E0B' },
    { status: 'Completed', label: '3. Completed (#16A34A)', hex: '#16A34A' },
  ];

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('personalWork')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'LA'
              ? 'ການຈັດການວຽກພ້ອມລາຍການວຽກຍ່ອຍ (Checklist) ຈົນກວ່າຈະສຳເລັດ'
              : 'Execution workflow with subtask checklists to track actions until complete.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* List vs Kanban Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden md:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden md:inline">Kanban</span>
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => openQuickAdd('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Task Navigation Tabs - As mandated by Prompt */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? tab === 'Office Tasks'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : tab === 'Personal Tasks'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : tab === 'Overdue'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'Office Tasks' && <Building2 className="w-3.5 h-3.5" />}
              {tab === 'Personal Tasks' && <User className="w-3.5 h-3.5" />}
              {tab === 'Overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
              {tab === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* 3 Status Filter Buttons (1. Planned #3B82F6, 2. In Progress #F59E0B, 3. Completed #16A34A) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            statusFilter === 'All'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All ({tasks.length})
        </button>

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
        </button>

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
        </button>

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
        </button>
      </div>

      {/* Controls Bar: Search, Filters, Sorters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, ID, next action..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-hidden font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Planned">1. Planned (#3B82F6)</option>
            <option value="In Progress">2. In Progress (#F59E0B)</option>
            <option value="Completed">3. Completed (#16A34A)</option>
            <option value="Not Started">Not Started</option>
            <option value="Blocked">Blocked</option>
            <option value="Waiting for Approval">Waiting for Approval</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="updated">Sort: Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Main List / Kanban Display */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-400">Loading categorized records...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
          <CheckSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No tasks found in this view
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Create an Office or Personal task to populate this category.
          </p>
          <button
            onClick={() => openQuickAdd('task')}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
          >
            + Create New Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const isOverdue =
              task.status !== 'Completed' &&
              task.status !== 'Cancelled' &&
              task.dueDate &&
              task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl bg-white dark:bg-slate-850 border transition-all hover:shadow-xs group ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Status Checkbox */}
                    <button
                      onClick={() =>
                        handleQuickStatusChange(
                          task,
                          task.status === 'Completed' ? 'In Progress' : 'Completed'
                        )
                      }
                      className={`w-5 h-5 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                        task.status === 'Completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                      }`}
                    >
                      {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Badge Row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {/* MANDATORY CATEGORY BADGE */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            task.category === 'Office'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-bold'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold'
                          }`}
                        >
                          {task.category === 'Office' ? (
                            <Building2 className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span>{task.category}</span>
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            task.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                              : task.priority === 'High'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : task.priority === 'Medium'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Status Badge with requested Hex colors */}
                        {task.status === 'Completed' ? (
                          <span
                            style={{ backgroundColor: '#16A34A', color: '#ffffff' }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs"
                          >
                            3. Completed (#16A34A)
                          </span>
                        ) : task.status === 'In Progress' || task.status === 'Waiting for Approval' ? (
                          <span
                            style={{ backgroundColor: '#F59E0B', color: '#ffffff' }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs"
                          >
                            2. In Progress (#F59E0B)
                          </span>
                        ) : (
                          <span
                            style={{ backgroundColor: '#3B82F6', color: '#ffffff' }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded shadow-xs"
                          >
                            1. Planned (#3B82F6)
                          </span>
                        )}

                        {/* Overdue Warning */}
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> OVERDUE
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-slate-400 ml-auto">
                          {task.id}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-sm font-bold text-slate-900 dark:text-white ${
                          task.status === 'Completed' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Checklist Below Description */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                              <ListTodo className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t('taskListBelowDesc')}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {task.checklist.filter((c) => c.completed).length} / {task.checklist.length}{' '}
                              {language === 'LA' ? 'ສຳເລັດ' : 'done'}
                            </span>
                          </div>

                          <div className="space-y-1 pt-0.5">
                            {task.checklist.map((chk) => (
                              <div
                                key={chk.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleChecklistItem(task, chk.id);
                                }}
                                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-750 p-1 rounded transition-colors"
                              >
                                <button
                                  type="button"
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    chk.completed
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                                  }`}
                                >
                                  {chk.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                                </button>
                                <span
                                  className={`text-[11px] select-none ${
                                    chk.completed
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-800 dark:text-slate-200 font-medium'
                                  }`}
                                >
                                  {chk.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Action Callout */}
                      {task.nextAction && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                          <span className="font-bold">Next Action:</span> {task.nextAction}
                        </div>
                      )}

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {task.dueDate && (
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              isOverdue ? 'text-rose-600 dark:text-rose-400' : ''
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> Due: {task.dueDate}
                          </span>
                        )}

                        {task.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Started: {task.startDate}
                          </span>
                        )}

                        {task.projectTitle && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                            {task.projectTitle}
                          </span>
                        )}

                        {task.responsiblePerson && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <User className="w-3.5 h-3.5" />
                            {task.responsiblePerson}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTask(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => {
              if (col.status === 'Planned') return t.status === 'Planned' || t.status === 'Not Started';
              if (col.status === 'In Progress') return t.status === 'In Progress' || t.status === 'Waiting for Approval';
              if (col.status === 'Completed') return t.status === 'Completed';
              return t.status === col.status;
            });

            return (
              <div
                key={col.status}
                className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 flex flex-col min-w-[280px]"
              >
                <div
                  style={{ borderLeftColor: col.hex }}
                  className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-750 pl-2 border-l-4"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{ backgroundColor: col.hex }}
                      className="w-2.5 h-2.5 rounded-full inline-block"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {col.label}
                    </span>
                  </div>
                  <span
                    style={{ backgroundColor: col.hex, color: '#ffffff' }}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs"
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] custom-scrollbar">
                  {colTasks.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 italic">
                      Empty column
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-2 group cursor-pointer hover:border-teal-500/50"
                        onClick={() => handleOpenEdit(t)}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              t.category === 'Office'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                            }`}
                          >
                            {t.category}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">{t.id}</span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {t.title}
                        </h4>

                        {t.dueDate && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {t.dueDate}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Task ({editingTask.id})
                </h2>
                <p className="text-xs text-slate-500">
                  Preserve category integrity and adjust deadlines or assignees.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {editError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Work Category Selector (Preserved by default) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Work Category (Preserved unless explicitly changed)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setEditCategory('Office')}
                    className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all ${
                      editCategory === 'Office'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Office Task
                    </span>
                  </div>

                  <div
                    onClick={() => setEditCategory('Personal')}
                    className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all ${
                      editCategory === 'Personal'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Personal Task
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Tasks List Below Description in Edit Modal */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-teal-600" />
                    <span>{t('taskListBelowDesc')}</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {editChecklist.filter((c) => c.completed).length} / {editChecklist.length} {language === 'LA' ? 'ສຳເລັດ' : 'done'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editNewChecklistText}
                    onChange={(e) => setEditNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editNewChecklistText.trim()) {
                          setEditChecklist((prev) => [
                            ...prev,
                            {
                              id: `chk-${Date.now().toString().slice(-6)}`,
                              text: editNewChecklistText.trim(),
                              completed: false,
                            },
                          ]);
                          setEditNewChecklistText('');
                        }
                      }
                    }}
                    placeholder={t('checklistItemPlaceholder')}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editNewChecklistText.trim()) {
                        setEditChecklist((prev) => [
                          ...prev,
                          {
                            id: `chk-${Date.now().toString().slice(-6)}`,
                            text: editNewChecklistText.trim(),
                            completed: false,
                          },
                        ]);
                        setEditNewChecklistText('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {editChecklist.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {editChecklist.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditChecklist((prev) =>
                                prev.map((c) => (c.id === item.id ? { ...c, completed: !c.completed } : c))
                              )
                            }
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              item.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {item.completed && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                          <span
                            className={`truncate ${
                              item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <span className="font-mono text-slate-400 mr-1.5">{idx + 1}.</span>
                            {item.text}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditChecklist((prev) => prev.filter((c) => c.id !== item.id))}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Planned">1. Planned (#3B82F6)</option>
                    <option value="In Progress">2. In Progress (#F59E0B)</option>
                    <option value="Completed">3. Completed (#16A34A)</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Waiting for Approval">Waiting for Approval</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    min={editStartDate || undefined}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Next Action */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Next Action
                </label>
                <input
                  type="text"
                  value={editNextAction}
                  onChange={(e) => setEditNextAction(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Completion Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Completion Notes / Results
                </label>
                <textarea
                  rows={2}
                  value={editCompletionNotes}
                  onChange={(e) => setEditCompletionNotes(e.target.value)}
                  placeholder="Record outcome upon completion..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2"
                >
                  {submittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Task Deletion
                </h3>
                <span className="text-xs text-slate-500">
                  {deleteConfirmTask.id} · {deleteConfirmTask.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete "{deleteConfirmTask.title}"? This action is
              irreversible and will be recorded in the audit log.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
