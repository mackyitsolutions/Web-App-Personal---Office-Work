import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Building2,
  User,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { Goal, WorkCategory } from '../../types/workos';

export const GoalsView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast } = useWorkOS();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<WorkCategory>('Office');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getGoals(effectiveCategory)
      .then((data) => {
        setGoals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load goals:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const handleToggleMilestone = async (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    try {
      await api.updateGoal(goal.id, {
        milestones: updatedMilestones,
        progressPercentage: progress,
      });
      addToast('Goal progress updated', 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('Goal title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createGoal({
        category: newCategory,
        title: newTitle.trim(),
        description: newDescription.trim() || 'Strategic growth milestone.',
        targetDate: newTargetDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        milestones: [
          { id: 'GM-1', title: 'Phase 1 Foundations & Setup', completed: false },
          { id: 'GM-2', title: 'Formal Milestone Execution', completed: false },
        ],
        progressPercentage: 0,
        successCriteria: newCriteria.trim() || 'Objective verifiable assessment.',
      });

      addToast(`Created goal ${created.id}`, 'success');
      setIsModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to create goal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Goals & Professional Development
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal ambitions, professional accreditations, weekly obstacle review, and reflections.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
          <Target className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No goals registered in this view
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Set ambitious targets with measurable success criteria.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      goal.category === 'Office'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}
                  >
                    {goal.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Target: {goal.targetDate}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {goal.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {goal.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Milestone Progress
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {goal.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Milestones check list */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Success Milestones
                  </span>
                  {goal.milestones?.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(goal, m.id)}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer text-xs"
                    >
                      <button
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          m.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {m.completed && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <span
                        className={`${
                          m.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-200 font-medium'
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Success Criteria */}
                {goal.successCriteria && (
                  <div className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/40 text-[11px]">
                    <strong className="text-teal-800 dark:text-teal-300 block mb-0.5">
                      Success Criteria:
                    </strong>
                    <span className="text-teal-900 dark:text-teal-200">{goal.successCriteria}</span>
                  </div>
                )}
              </div>

              {/* Obstacle callout */}
              {goal.weeklyObstacles && goal.weeklyObstacles.length > 0 && (
                <div className="pt-2 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Active Obstacle: {goal.weeklyObstacles[0]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Set Development Goal
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewCategory('Office')}
                    className={`cursor-pointer p-2.5 rounded-lg border-2 flex items-center gap-2 ${
                      newCategory === 'Office'
                        ? 'border-blue-600 bg-blue-50/60'
                        : 'border-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">Office Career Goal</span>
                  </div>
                  <div
                    onClick={() => setNewCategory('Personal')}
                    className={`cursor-pointer p-2.5 rounded-lg border-2 flex items-center gap-2 ${
                      newCategory === 'Personal'
                        ? 'border-emerald-600 bg-emerald-50/60'
                        : 'border-slate-200'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">Personal Growth Goal</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Attain PMP & Advanced Systems Architecture Certification"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="How will this elevate your capabilities or wellbeing?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Success Criteria
                  </label>
                  <input
                    type="text"
                    value={newCriteria}
                    onChange={(e) => setNewCriteria(e.target.value)}
                    placeholder="Measurable proof of completion"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
