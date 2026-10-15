import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  CheckSquare,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ListTodo,
  CheckCircle2,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { WorkCategory, TaskPriority, TaskStatus, Project, TaskChecklistItem } from '../../types/workos';

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, closeQuickAdd, quickAddType, addToast, triggerRefresh, t, language } = useWorkOS();

  const [activeTab, setActiveTab] = useState<'task' | 'journal' | 'meeting'>('task');
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Task Form State - Defaults: Office, Medium priority, no due date
  const [taskCategory, setTaskCategory] = useState<WorkCategory>('Office');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  // Checklists / Tasks List to do below description
  const [checklistItems, setChecklistItems] = useState<TaskChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('Not Started');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskReminderDate, setTaskReminderDate] = useState('');
  const [taskNextAction, setTaskNextAction] = useState('');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskResponsible, setTaskResponsible] = useState('');

  // Office Work (Journal) Form State
  const [journalCategory, setJournalCategory] = useState<WorkCategory>('Office');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalDesc, setJournalDesc] = useState('');
  const [journalActions, setJournalActions] = useState('');
  const [journalResults, setJournalResults] = useState('');
  const [journalChallenges, setJournalChallenges] = useState('');
  const [journalLessons, setJournalLessons] = useState('');
  const [journalNextAction, setJournalNextAction] = useState('');

  // Validation Error Message
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isQuickAddOpen) {
      setActiveTab(quickAddType as any || 'task');
      setErrorMsg('');
      api.getProjects().then(setProjects).catch(() => {});
    }
  }, [isQuickAddOpen, quickAddType]);

  if (!isQuickAddOpen) return null;

  const resetForms = () => {
    setTaskCategory('Office');
    setTaskTitle('');
    setTaskDesc('');
    setChecklistItems([]);
    setNewChecklistText('');
    setTaskPriority('Medium');
    setTaskStatus('Not Started');
    setTaskStartDate('');
    setTaskDueDate('');
    setTaskReminderDate('');
    setTaskNextAction('');
    setTaskProjectId('');
    setTaskResponsible('');

    setJournalTitle('');
    setJournalDesc('');
    setJournalActions('');
    setJournalResults('');
    setJournalChallenges('');
    setJournalLessons('');
    setJournalNextAction('');
    setErrorMsg('');
  };

  const handleAddChecklistStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: TaskChecklistItem = {
      id: `chk-${Date.now().toString().slice(-6)}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklistItems((prev) => [...prev, newItem]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistStep = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleChecklistStep = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!taskTitle.trim()) {
      setErrorMsg(language === 'LA' ? 'ກະລຸນາໃສ່ຫົວຂໍ້ວຽກ' : 'Task title is required.');
      return;
    }
    if (!taskCategory || (taskCategory !== 'Office' && taskCategory !== 'Personal')) {
      setErrorMsg(language === 'LA' ? 'ກະລຸນາເລືອກໝວດໝູ່ວຽກ' : 'Valid Work Category is required.');
      return;
    }
    if (taskStartDate && taskDueDate && taskDueDate < taskStartDate) {
      setErrorMsg(
        language === 'LA'
          ? 'ວັນທີກຳນົດສົ່ງບໍ່ສາມາດມາກ່ອນວັນທີເລີ່ມໄດ້'
          : 'Due date cannot be earlier than start date.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const selectedProj = projects.find((p) => p.id === taskProjectId);
      await api.createTask({
        title: taskTitle.trim(),
        category: taskCategory,
        description: taskDesc.trim() || undefined,
        checklist: checklistItems.length > 0 ? checklistItems : undefined,
        priority: taskPriority,
        status: taskStatus,
        startDate: taskStartDate || undefined,
        dueDate: taskDueDate || undefined,
        reminderDate: taskReminderDate || undefined,
        nextAction: taskNextAction.trim() || undefined,
        projectId: taskProjectId || undefined,
        projectTitle: selectedProj?.name,
        responsiblePerson: taskResponsible.trim() || undefined,
      });

      addToast(
        language === 'LA'
          ? `ສ້າງວຽກ ${taskCategory}: "${taskTitle.trim()}" ສຳເລັດແລ້ວ`
          : `Created ${taskCategory} task: "${taskTitle.trim()}"`,
        'success'
      );
      triggerRefresh();
      resetForms();
      closeQuickAdd();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!journalTitle.trim()) {
      setErrorMsg(language === 'LA' ? 'ກະລຸນາໃສ່ຫົວຂໍ້ກິດຈະກຳ' : 'Activity title is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createJournalEntry({
        title: journalTitle.trim(),
        category: journalCategory,
        description: journalDesc.trim(),
        actionsPerformed: journalActions.trim() || 'Logged daily office activity.',
        results: journalResults.trim() || undefined,
        challenges: journalChallenges.trim() || undefined,
        lessonsLearned: journalLessons.trim() || undefined,
        nextAction: journalNextAction.trim() || undefined,
      });

      addToast(
        language === 'LA'
          ? `ບັນທຶກວຽກຫ້ອງການ "${journalTitle.trim()}" ສຳເລັດແລ້ວ`
          : `Logged ${journalCategory} entry: "${journalTitle.trim()}"`,
        'success'
      );
      triggerRefresh();
      resetForms();
      closeQuickAdd();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('createRecord')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'LA'
                ? 'ເພີ່ມລາຍການວຽກພ້ອມລາຍການວຽກຍ່ອຍ (Checklist)'
                : 'Add work items with subtask checklists to track execution until complete.'}
            </p>
          </div>
          <button
            onClick={() => {
              resetForms();
              closeQuickAdd();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex px-6 pt-3 gap-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('task');
              setErrorMsg('');
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'task'
                ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{t('personalWork')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('journal');
              setErrorMsg('');
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'journal'
                ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('officeWork')}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TASK FORM WITH SUBTASKS CHECKLIST BELOW DESCRIPTION */}
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Mandatory Office vs Personal Selectable Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {t('workCategory')} <span className="text-rose-500">* (Mandatory)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setTaskCategory('Office')}
                    className={`cursor-pointer p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      taskCategory === 'Office'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/40 dark:bg-slate-800/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        taskCategory === 'Office'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {language === 'LA' ? 'ວຽກຫ້ອງການ' : 'Office Task'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {language === 'LA' ? 'ພັນທະ ແລະ ເອກະສານຫ້ອງການ' : 'Professional deliverables'}
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setTaskCategory('Personal')}
                    className={`cursor-pointer p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      taskCategory === 'Personal'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/40 dark:bg-slate-800/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        taskCategory === 'Personal'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {language === 'LA' ? 'ວຽກສ່ວນຕົວ' : 'Personal Task'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {language === 'LA' ? 'ເປົ້າໝາຍ, ສຸຂະພາບ & ການເງິນ' : 'Private life & commitments'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('taskTitle')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Complete financial audit presentation"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('description')}
                </label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Provide scope, context, and goals..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* CRITICAL NEW FEATURE: TASKS LIST / CHECKLIST BELOW DESCRIPTION */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-teal-600" />
                    <span>{t('taskListBelowDesc')}</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {checklistItems.filter((i) => i.completed).length} / {checklistItems.length} {language === 'LA' ? 'ສຳເລັດແລ້ວ' : 'completed'}
                  </span>
                </div>

                {/* Subtask Input Field */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistStep();
                      }
                    }}
                    placeholder={t('checklistItemPlaceholder')}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddChecklistStep()}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'LA' ? 'ເພີ່ມ' : 'Add'}</span>
                  </button>
                </div>

                {/* Active Checklist Items List */}
                {checklistItems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {checklistItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleChecklistStep(item.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              item.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-teal-500'
                            }`}
                          >
                            {item.completed && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                          <span
                            className={`truncate ${
                              item.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 dark:text-slate-200 font-medium'
                            }`}
                          >
                            <span className="font-mono text-slate-400 mr-1.5">{idx + 1}.</span>
                            {item.text}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistStep(item.id)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('priority')}
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Critical">🔴 Critical</option>
                    <option value="High">🟠 High Priority</option>
                    <option value="Medium">🟡 Medium (Default)</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Planned">1. Planned (Blue #3B82F6)</option>
                    <option value="In Progress">2. In Progress (Amber #F59E0B)</option>
                    <option value="Completed">3. Completed (Green #16A34A)</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Waiting for Approval">Waiting for Approval</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('startDate')}
                  </label>
                  <input
                    type="date"
                    value={taskStartDate}
                    onChange={(e) => setTaskStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('dueDate')}
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    min={taskStartDate || undefined}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('reminderDate')}
                  </label>
                  <input
                    type="date"
                    value={taskReminderDate}
                    onChange={(e) => setTaskReminderDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForms();
                    closeQuickAdd();
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg flex items-center gap-2 shadow-xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('saveTask')}</span>
                </button>
              </div>
            </form>
          )}

          {/* OFFICE WORK (JOURNAL) FORM */}
          {activeTab === 'journal' && (
            <form onSubmit={handleCreateJournal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="e.g. Prepared departmental budget analysis"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Actions Performed
                </label>
                <textarea
                  rows={2}
                  value={journalActions}
                  onChange={(e) => setJournalActions(e.target.value)}
                  placeholder="What specific tasks were completed?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Results & Deliverables
                  </label>
                  <input
                    type="text"
                    value={journalResults}
                    onChange={(e) => setJournalResults(e.target.value)}
                    placeholder="Outcomes achieved"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('nextAction')}
                  </label>
                  <input
                    type="text"
                    value={journalNextAction}
                    onChange={(e) => setJournalNextAction(e.target.value)}
                    placeholder="Next concrete action step"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForms();
                    closeQuickAdd();
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Office Activity</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
