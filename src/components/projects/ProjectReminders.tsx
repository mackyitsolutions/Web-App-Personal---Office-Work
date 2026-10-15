import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Search,
  FolderKanban,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { ProjectReminder, Project } from '../../types/workos';

interface ProjectRemindersProps {
  currentProject?: Project | null;
  projects: Project[];
}

export const ProjectReminders: React.FC<ProjectRemindersProps> = ({
  currentProject,
  projects,
}) => {
  const { t, language, addToast, refreshTrigger, triggerRefresh } = useWorkOS();

  const [reminders, setReminders] = useState<ProjectReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
  const [filterProjectId, setFilterProjectId] = useState<string>(
    currentProject ? currentProject.id : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal' | 'Low'>('Normal');
  const [selectedProjId, setSelectedProjId] = useState<string>(
    currentProject ? currentProject.id : ''
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setFilterProjectId(currentProject.id);
      setSelectedProjId(currentProject.id);
    }
  }, [currentProject]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (err: any) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [refreshTrigger]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setDueDate(todayStr);
    setDueTime('10:00');
    setPriority('Normal');
    setSelectedProjId(currentProject ? currentProject.id : (projects[0]?.id || ''));
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rem: ProjectReminder) => {
    setEditingId(rem.id);
    setTitle(rem.title);
    setDueDate(rem.dueDate);
    setDueTime(rem.dueTime || '09:00');
    setPriority(rem.priority);
    setSelectedProjId(rem.projectId || '');
    setNotes(rem.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast(language === 'LA' ? 'ກະລຸນາໃສ່ຫົວຂໍ້ເຕືອນ' : 'Please provide a reminder title', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const foundProj = projects.find((p) => p.id === selectedProjId);

      if (editingId) {
        await api.updateReminder(editingId, {
          title: title.trim(),
          dueDate: dueDate || todayStr,
          dueTime,
          priority,
          projectId: selectedProjId || undefined,
          projectTitle: foundProj ? foundProj.name : undefined,
          notes: notes.trim(),
        });
        addToast(language === 'LA' ? 'ອັບເດດການແຈ້ງເຕືອນແລ້ວ' : 'Reminder updated', 'success');
      } else {
        await api.createReminder({
          title: title.trim(),
          dueDate: dueDate || todayStr,
          dueTime,
          priority,
          projectId: selectedProjId || undefined,
          projectTitle: foundProj ? foundProj.name : undefined,
          notes: notes.trim(),
        });
        addToast(language === 'LA' ? 'ເພີ່ມການແຈ້ງເຕືອນສຳເລັດ!' : 'Created new reminder!', 'success');
      }

      setIsModalOpen(false);
      triggerRefresh();
      loadReminders();
    } catch (err: any) {
      addToast(err.message || 'Failed to save reminder', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (rem: ProjectReminder) => {
    try {
      const updated = await api.updateReminder(rem.id, { isCompleted: !rem.isCompleted });
      setReminders((prev) => prev.map((r) => (r.id === rem.id ? updated : r)));
      addToast(
        rem.isCompleted
          ? language === 'LA'
            ? 'ເປີດການເຕືອນຄືນໃໝ່'
            : 'Reminder marked pending'
          : language === 'LA'
          ? 'ໝາຍສຳເລັດແລ້ວ!'
          : 'Reminder marked complete!',
        'success'
      );
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await api.deleteReminder(id);
      addToast(language === 'LA' ? 'ລຶບການເຕືອນແລ້ວ' : 'Reminder deleted', 'info');
      setReminders((prev) => prev.filter((r) => r.id !== id));
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const filteredReminders = reminders
    .filter((r) => {
      if (filterProjectId !== 'ALL') {
        return r.projectId === filterProjectId;
      }
      return true;
    })
    .filter((r) => {
      if (statusFilter === 'Pending') return !r.isCompleted;
      if (statusFilter === 'Completed') return r.isCompleted;
      if (statusFilter === 'Overdue') return !r.isCompleted && r.dueDate < todayStr;
      return true;
    })
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        (r.projectTitle && r.projectTitle.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // Pending first, then due date
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'LA' ? 'ການແຈ້ງເຕືອນໂຄງການ' : 'Project Reminders'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {filteredReminders.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'LA'
                  ? 'ກຳນົດເວລາເຕືອນ, ຕິດຕາມວຽກດ່ວນ ແລະ ວັນເວລາສຳຄັນ'
                  : 'Time-sensitive project milestones and scheduled follow-up alerts.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['All', 'Pending', 'Overdue', 'Completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'All'
                  ? language === 'LA'
                    ? 'ທັງໝົດ'
                    : 'All'
                  : tab === 'Pending'
                  ? language === 'LA'
                    ? 'ລໍຖ້າ'
                    : 'Pending'
                  : tab === 'Overdue'
                  ? language === 'LA'
                    ? 'ກາຍກຳນົດ'
                    : 'Overdue'
                  : language === 'LA'
                  ? 'ສຳເລັດ'
                  : 'Completed'}
              </button>
            ))}
          </div>

          {/* Project Filter */}
          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-hidden"
          >
            <option value="ALL">
              {language === 'LA' ? 'ທຸກໂຄງການ' : 'All Projects'}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'LA' ? 'ຄົ້ນຫາການເຕືອນ...' : 'Search alerts...'}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-hidden w-36"
            />
          </div>

          {/* Add Reminder Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'LA' ? 'ເພີ່ມການແຈ້ງເຕືອນ' : 'Add Reminder'}</span>
          </button>
        </div>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading reminders...</div>
      ) : filteredReminders.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <Bell className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {language === 'LA' ? 'ບໍ່ມີລາຍການແຈ້ງເຕືອນ' : 'No reminders found'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'LA'
              ? 'ກົດປຸ່ມດ້ານເທິງເພື່ອສ້າງການເຕືອນກຳນົດສົ່ງ ແລະ ວຽກສຳຄັນ'
              : 'Add scheduled alerts to keep your project deliverables right on track.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'LA' ? 'ເພີ່ມການເຕືອນໃໝ່' : 'Add First Reminder'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredReminders.map((rem) => {
            const isOverdue = !rem.isCompleted && rem.dueDate < todayStr;
            const isDueToday = !rem.isCompleted && rem.dueDate === todayStr;

            return (
              <div
                key={rem.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  rem.isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : isOverdue
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 shadow-xs'
                    : isDueToday
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-xs'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Left: Checkbox + Title + Meta */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(rem)}
                    title={rem.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      rem.isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                    }`}
                  >
                    {rem.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          rem.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {rem.title}
                      </span>

                      {/* Status / Countdown Badges */}
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{language === 'LA' ? 'ກາຍກຳນົດແລ້ວ' : 'OVERDUE'}</span>
                        </span>
                      )}
                      {isDueToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{language === 'LA' ? 'ຮອດກຳນົດມື້ນີ້' : 'Due Today'}</span>
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          rem.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : rem.priority === 'High'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {rem.priority}
                      </span>
                    </div>

                    {rem.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {rem.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                      {rem.projectTitle && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                          <FolderKanban className="w-3 h-3 text-blue-500" />
                          <span>{rem.projectTitle}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{rem.dueDate}</span>
                      </span>
                      {rem.dueTime && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{rem.dueTime}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenEdit(rem)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    title="Edit Reminder"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT REMINDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingId
                      ? language === 'LA'
                        ? 'ແກ້ໄຂການແຈ້ງເຕືອນ'
                        : 'Edit Reminder'
                      : language === 'LA'
                      ? 'ເພີ່ມການແຈ້ງເຕືອນໃໝ່'
                      : 'Create New Reminder'}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    {language === 'LA'
                      ? 'ກຳນົດວັນເວລາ ແລະ ລາຍລະອຽດການແຈ້ງເຕືອນ'
                      : 'Set due date, time, and priority alert.'}
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

            <form onSubmit={handleSaveReminder} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ຫົວຂໍ້ການເຕືອນ *' : 'Reminder Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Submit budget report, Meeting follow-up, Contract renewal..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ວັນທີກຳນົດສົ່ງ *' : 'Due Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ເວລາເຕືອນ' : 'Alert Time'}
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ລະດັບຄວາມສຳຄັນ' : 'Priority'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent 🔥</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ຜູກມັດກັບໂຄງການ' : 'Project'}
                  </label>
                  <select
                    value={selectedProjId}
                    onChange={(e) => setSelectedProjId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="">
                      {language === 'LA' ? '-- ບໍ່ຜູກມັດໂຄງການ --' : '-- General Reminder --'}
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ໝາຍເຫດເພີ່ມເຕີມ' : 'Notes / Instructions'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context or instruction for this reminder..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
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
                  <span>
                    {editingId
                      ? language === 'LA'
                        ? 'ບັນທຶກການແກ້ໄຂ'
                        : 'Update Reminder'
                      : language === 'LA'
                      ? 'ສ້າງການເຕືອນ'
                      : 'Save Reminder'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
