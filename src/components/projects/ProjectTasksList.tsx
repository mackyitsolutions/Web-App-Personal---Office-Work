import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Search,
  Filter,
  Check,
  Circle,
  PlayCircle,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { Task, Project, TaskStatus, TaskPriority, TaskChecklistItem } from '../../types/workos';

interface ProjectTasksListProps {
  currentProject?: Project | null;
  projects: Project[];
}

export const ProjectTasksList: React.FC<ProjectTasksListProps> = ({
  currentProject,
  projects,
}) => {
  const { t, language, addToast, refreshTrigger, triggerRefresh } = useWorkOS();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Planned' | 'In Progress' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Planned');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const data = await api.getTasks({ projectId: currentProject.id });
      setTasks(data);
    } catch (err: any) {
      console.error('Failed to load project tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentProject?.id, refreshTrigger]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleOpenAdd = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setStatus('Planned');
    setPriority('Medium');
    setStartDate(todayStr);
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setNextAction('');
    setChecklist([]);
    setNewChecklistText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setStartDate(task.startDate || todayStr);
    setDueDate(task.dueDate || '');
    setNextAction(task.nextAction || '');
    setChecklist(task.checklist ? [...task.checklist] : []);
    setNewChecklistText('');
    setIsModalOpen(true);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: `chk-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast(language === 'LA' ? 'ກະລຸນາໃສ່ຫົວຂໍ້ວຽກ' : 'Please provide a task title', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTaskId) {
        await api.updateTask(editingTaskId, {
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          startDate,
          dueDate,
          nextAction: nextAction.trim(),
          checklist,
        });
        addToast(language === 'LA' ? 'ອັບເດດວຽກສຳເລັດ' : 'Project task updated', 'success');
      } else {
        await api.createTask({
          title: title.trim(),
          category: currentProject?.category || 'Office',
          projectId: currentProject?.id,
          projectTitle: currentProject?.name,
          description: description.trim(),
          status,
          priority,
          startDate: startDate || todayStr,
          dueDate: dueDate || undefined,
          nextAction: nextAction.trim(),
          checklist,
        });
        addToast(language === 'LA' ? 'ເພີ່ມວຽກໃສ່ໂຄງການສຳເລັດ!' : 'Added task to project!', 'success');
      }

      setIsModalOpen(false);
      triggerRefresh();
      loadTasks();
    } catch (err: any) {
      addToast(err.message || 'Failed to save task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (task: Task, nextStatus: TaskStatus) => {
    try {
      await api.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
      addToast(`Status changed to ${nextStatus}`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleCompleted = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    await handleQuickStatusChange(task, newStatus);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      addToast(language === 'LA' ? 'ລຶບວຽກແລ້ວ' : 'Task deleted', 'info');
      setTasks((prev) => prev.filter((t) => t.id !== id));
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Filter tasks
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

  // Count by status
  const countPlanned = tasks.filter((t) => t.status === 'Planned' || t.status === 'Not Started').length;
  const countInProgress = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Waiting for Approval').length;
  const countCompleted = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-4">
      {/* Status Bar / Filter Tabs with Explicit Hex Colors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* All */}
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'All'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Tasks ({tasks.length})
          </button>

          {/* 1. Planned (Blue HEX: #3B82F6) */}
          <button
            onClick={() => setStatusFilter('Planned')}
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
            <span>1. Planned</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10">
              {countPlanned}
            </span>
          </button>

          {/* 2. In Progress (Amber HEX: #F59E0B) */}
          <button
            onClick={() => setStatusFilter('In Progress')}
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
            <span>2. In Progress</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10">
              {countInProgress}
            </span>
          </button>

          {/* 3. Completed (Green HEX: #16A34A) */}
          <button
            onClick={() => setStatusFilter('Completed')}
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
            <span>3. Completed</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10">
              {countCompleted}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-hidden w-36"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List Items */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading project tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {language === 'LA' ? 'ບໍ່ມີວຽກໃນສະຖານະນີ້' : 'No tasks in this category'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'LA'
              ? 'ເພີ່ມວຽກໃສ່ໂຄງການນີ້ເພື່ອຕິດຕາມ 1. Planned, 2. In Progress, 3. Completed'
              : 'Add tasks to this project and track them across Planned, In Progress, and Completed states.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Project Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isPlanned = task.status === 'Planned' || task.status === 'Not Started';
            const isInProgress = task.status === 'In Progress' || task.status === 'Waiting for Approval';

            const completedChecklistCount = task.checklist?.filter((c) => c.completed).length || 0;
            const totalChecklistCount = task.checklist?.length || 0;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Left: Checkbox + Title + Status Badge */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleCompleted(task)}
                    title={isCompleted ? 'Mark In Progress' : 'Mark Completed'}
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

                      {/* Explicit 3 Status Badges with user-requested Hex Colors */}
                      {isPlanned && (
                        <span
                          style={{ backgroundColor: '#3B82F6', color: '#ffffff' }}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                        >
                          <Circle className="w-2 h-2 fill-current" />
                          <span>1. Planned (#3B82F6)</span>
                        </span>
                      )}
                      {isInProgress && (
                        <span
                          style={{ backgroundColor: '#F59E0B', color: '#ffffff' }}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                        >
                          <PlayCircle className="w-2.5 h-2.5" />
                          <span>2. In Progress (#F59E0B)</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span
                          style={{ backgroundColor: '#16A34A', color: '#ffffff' }}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>3. Completed (#16A34A)</span>
                        </span>
                      )}

                      {/* Priority */}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          task.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'High'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {task.dueDate}</span>
                        </span>
                      )}

                      {totalChecklistCount > 0 && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                          <ListTodo className="w-3 h-3 text-blue-500" />
                          <span>
                            {completedChecklistCount}/{totalChecklistCount} Subtasks
                          </span>
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

                {/* Right: Quick Status Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  {/* Quick status cycle button */}
                  {!isCompleted && (
                    <button
                      onClick={() =>
                        handleQuickStatusChange(
                          task,
                          isPlanned ? 'In Progress' : 'Completed'
                        )
                      }
                      title={`Move to ${isPlanned ? 'In Progress' : 'Completed'}`}
                      className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <span>{isPlanned ? 'Start Work' : 'Finish'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    title="Edit Task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingTaskId ? 'Edit Project Task' : 'Add Task to Project'}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentProject?.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Conduct Vendor Performance Audit..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, requirements, and scope of this task..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status (1. Planned, 2. In Progress, 3. Completed) *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden font-bold"
                  >
                    <option value="Planned">1. Planned (#3B82F6)</option>
                    <option value="In Progress">2. In Progress (#F59E0B)</option>
                    <option value="Completed">3. Completed (#16A34A)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
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
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Next Action */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Immediate Next Action
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Call vendor representative to request updated pricing sheet"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Subtask Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Subtask Checklist (To-Do List)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {checklist.filter((c) => c.completed).length}/{checklist.length} done
                  </span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    placeholder="Add step (e.g. Schedule call, prepare draft...)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 rounded-lg"
                  >
                    + Add
                  </button>
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-white dark:hover:bg-slate-800"
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklist(item.id)}
                            className="w-3.5 h-3.5 rounded text-blue-600"
                          />
                          <span
                            className={`truncate ${
                              item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {item.text}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTaskId ? 'Update Task' : 'Add Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
