import React, { useState, useEffect } from 'react';
import {
  Sun,
  CheckCircle2,
  Clock,
  Plus,
  Building2,
  User,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckSquare,
  BookOpen,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { Task, MeetingRecord } from '../../types/workos';

export const MyDayView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast, openQuickAdd } = useWorkOS();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getTasks({ view: 'MyDay', category: effectiveCategory }),
      api.getMeetings(effectiveCategory),
    ])
      .then(([taskList, meetingList]) => {
        setTasks(taskList);
        setMeetings(meetingList.filter((m) => m.dateTime.slice(0, 10) === todayStr));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load My Day:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const handleToggleTask = async (task: Task) => {
    try {
      const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
      await api.updateTask(task.id, { status: nextStatus });
      addToast(`Marked task as ${nextStatus}`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* My Day Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-indigo-500/10 dark:from-slate-850 dark:to-slate-800 border border-amber-200/50 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs mb-1">
            <Sun className="w-4 h-4" />
            <span>DAILY FOCUS & EXECUTION</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Day · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Focus exclusively on today's scheduled tasks, high-impact deliverables, and active commitments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openQuickAdd('task')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task to Today</span>
          </button>
          <button
            onClick={() => openQuickAdd('journal')}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Quick Journal</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
            {progressPct}%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Today's Completion Pace
            </div>
            <div className="text-[11px] text-slate-500">
              {completedCount} of {tasks.length} tasks completed today
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Today's Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <span>Today's Priority Agenda ({tasks.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading daily schedule...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-850 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
              <Sun className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                All clear for today!
              </p>
              <p className="text-[11px] mt-1 text-slate-400">
                No tasks are currently scheduled with start or due date for today.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 transition-all flex items-start gap-3 group"
              >
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`w-5 h-5 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                    task.status === 'Completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                  }`}
                >
                  {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        task.category === 'Office'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {task.category}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase">
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 ml-auto">{task.id}</span>
                  </div>

                  <h3
                    className={`text-xs font-bold text-slate-900 dark:text-white ${
                      task.status === 'Completed' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.nextAction && (
                    <div className="mt-1 text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                      ↳ Next Action: {task.nextAction}
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {task.dueDate}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Today's Meetings & Quick Notes */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Today's Sessions ({meetings.length})</span>
            </h3>

            {meetings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No meetings scheduled for today.</p>
            ) : (
              <div className="space-y-2">
                {meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200">{m.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {m.dateTime.slice(11, 16)} · {m.participants.length} Participants
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-850 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Daily Principle</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Separate the urgent noise from deliberate strategic progress. Guard personal boundaries with the same discipline applied to executive deliverables."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
