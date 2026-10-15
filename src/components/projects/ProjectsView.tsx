import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  FileCheck,
  ShieldAlert,
  Loader2,
  X,
  StickyNote as StickyIcon,
  Bell,
  ListTodo,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { Project, WorkCategory, ProjectStatus } from '../../types/workos';
import { ProjectStickyNotes } from './ProjectStickyNotes';
import { ProjectReminders } from './ProjectReminders';
import { ProjectTasksList } from './ProjectTasksList';

type ProjectSubTab = 'overview' | 'tasks' | 'notebook' | 'reminders';

export const ProjectsView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast, setActiveTab, language } = useWorkOS();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>('overview');

  // New Project Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<WorkCategory>('Office');
  const [newName, setNewName] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newOwner, setNewOwner] = useState('Alex Morgan');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newRisks, setNewRisks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getProjects(effectiveCategory)
      .then((data) => {
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const handleToggleMilestone = async (project: Project, milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );

    try {
      await api.updateProject(project.id, { milestones: updatedMilestones });
      addToast('Milestone status updated', 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newObjective.trim()) {
      addToast('Project Name and Objective are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const risksArray = newRisks
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const created = await api.createProject({
        name: newName.trim(),
        category: newCategory,
        objective: newObjective.trim(),
        owner: newOwner.trim() || 'Alex Morgan',
        startDate: newStartDate || new Date().toISOString().slice(0, 10),
        targetCompletionDate: newEndDate || new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
        status: 'Active',
        risks: risksArray,
        milestones: [
          { id: 'MS-1', title: 'Phase 1 Kickoff & Resource Alignment', dueDate: newStartDate || new Date().toISOString().slice(0, 10), isCompleted: false },
        ],
        deliverables: [
          { id: 'DEL-1', title: 'Primary Architecture / Strategy Specification', status: 'Pending' },
        ],
      });

      addToast(`Created project ${created.id}: "${created.name}"`, 'success');
      setIsNewModalOpen(false);
      setSelectedProjectId(created.id);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to create project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Project Management & Governance
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Milestones, deliverables, risk registries, and calculated objective progress.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Project Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setProjectSubTab('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            projectSubTab === 'overview'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>{language === 'LA' ? 'ພາບລວມ & ເປົ້າໝາຍໂຄງການ' : 'Overview & Milestones'}</span>
        </button>

        <button
          onClick={() => setProjectSubTab('tasks')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            projectSubTab === 'tasks'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{language === 'LA' ? 'ລາຍການວຽກ (Tasks List)' : 'Project Tasks List'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
            1.Planned • 2.Progress • 3.Done
          </span>
        </button>

        <button
          onClick={() => setProjectSubTab('notebook')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            projectSubTab === 'notebook'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <StickyIcon className="w-4 h-4 text-amber-500" />
          <span>{language === 'LA' ? 'ສະໝຸດໂນ໊ດ & ໂນ໊ດຕິດ (Sticky Notes)' : 'Notebook & Sticky Notes'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
            Color Palette
          </span>
        </button>

        <button
          onClick={() => setProjectSubTab('reminders')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            projectSubTab === 'reminders'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 text-indigo-500" />
          <span>{language === 'LA' ? 'ການແຈ້ງເຕືອນ (Reminders)' : 'Project Reminders'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading project records...</div>
      ) : projectSubTab === 'tasks' ? (
        <ProjectTasksList currentProject={selectedProject} projects={projects} />
      ) : projectSubTab === 'notebook' ? (
        <ProjectStickyNotes currentProject={selectedProject} projects={projects} />
      ) : projectSubTab === 'reminders' ? (
        <ProjectReminders currentProject={selectedProject} projects={projects} />
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
          <FolderKanban className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No projects in current category
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Create an Office or Personal project to start tracking initiatives.
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List Column */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Active Portfolios ({projects.length})
            </h2>

            {projects.map((proj) => {
              const isSelected = proj.id === selectedProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        proj.category === 'Office'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {proj.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {proj.name}
                  </h3>

                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Calculated Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {proj.calculatedProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${proj.calculatedProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{proj.milestones?.length || 0} Milestones</span>
                    <span>Target: {proj.targetCompletionDate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project Details Panel (2 Cols) */}
          {selectedProject && (
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedProject.category === 'Office'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {selectedProject.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedProject.id}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedProject.name}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Owner</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {selectedProject.owner}
                    </span>
                  </div>
                </div>

                {/* Quick Sub-module Action Pills */}
                <div className="flex flex-wrap items-center gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setProjectSubTab('tasks')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tasks List (1.Planned, 2.Progress, 3.Done)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectSubTab('notebook')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900 transition-all cursor-pointer"
                  >
                    <StickyIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sticky Notes (Notebook)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectSubTab('reminders')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 transition-all cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Reminders</span>
                  </button>
                </div>

                {/* Objective */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Objective & Scope
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedProject.objective}
                  </p>
                </div>

                {/* Timeline & Progress Bar */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Objective Progress (Milestones + Linked Tasks)
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {selectedProject.calculatedProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${selectedProject.calculatedProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Started: {selectedProject.startDate}</span>
                    <span>Target: {selectedProject.targetCompletionDate}</span>
                  </div>
                </div>

                {/* Milestones Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Project Milestones</span>
                  </h4>

                  <div className="space-y-2">
                    {selectedProject.milestones?.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleMilestone(selectedProject, m.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                              m.isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-blue-500'
                            }`}
                          >
                            {m.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <span
                            className={`font-semibold ${
                              m.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">Due: {m.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                {selectedProject.deliverables?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Deliverables Status</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProject.deliverables.map((d: any) => (
                        <div
                          key={d.id}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {d.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                              d.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'In Review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risks & Dependencies */}
                {selectedProject.risks?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Identified Risks</span>
                    </h4>
                    <div className="space-y-1">
                      {selectedProject.risks.map((risk: string, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200"
                        >
                          ⚠️ {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Project Portfolio
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
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
                    <span className="text-xs font-bold">Office Project</span>
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
                    <span className="text-xs font-bold">Personal Initiative</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Enterprise Logistics Automation 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Strategic Objective *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Define targets, expected savings, and measurable deliverables..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
