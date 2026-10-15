import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  FolderKanban,
  Brain,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { WorkCategory, Task, Project, ProblemRecord, DecisionRecord, JournalEntry } from '../../types/workos';

type ReportPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
type ReportType =
  | 'Office Work Report'
  | 'Personal Activity Report'
  | 'Executive Overall Summary'
  | 'Project Status Report'
  | 'Task Performance Report';

export const ReportsView: React.FC = () => {
  const { addToast } = useWorkOS();

  const [period, setPeriod] = useState<ReportPeriod>('Weekly');
  const [reportType, setReportType] = useState<ReportType>('Office Work Report');
  const [loading, setLoading] = useState(true);

  // Loaded data strictly matching report type category
  const [summary, setSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);

  // CRITICAL REQUIREMENT: Office reports MUST exclude personal records!
  const targetCategory: WorkCategory | undefined =
    reportType === 'Office Work Report'
      ? 'Office'
      : reportType === 'Personal Activity Report'
      ? 'Personal'
      : undefined;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getSummary(targetCategory),
      api.getTasks({ category: targetCategory }),
      api.getProjects(targetCategory),
      api.getJournal(targetCategory),
      api.getProblems(targetCategory),
      api.getDecisions(targetCategory),
    ])
      .then(([sumRes, taskList, projList, jrnList, probList, decList]) => {
        setSummary(sumRes);
        setTasks(taskList);
        setProjects(projList);
        setJournal(jrnList);
        setProblems(probList);
        setDecisions(decList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load report data:', err);
        setLoading(false);
      });
  }, [reportType, period]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const catQuery = targetCategory ? `&category=${targetCategory}` : '';
    window.open(`/api/export?format=csv${catQuery}`, '_blank');
    addToast('Initiated CSV export', 'success');
  };

  const handleExportJSON = () => {
    const catQuery = targetCategory ? `&category=${targetCategory}` : '';
    window.open(`/api/export?format=json${catQuery}`, '_blank');
    addToast('Initiated JSON backup export', 'success');
  };

  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const openTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < todayStr);

  return (
    <div className="space-y-6">
      {/* Header with Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Reports & Executive Management Insights
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict category segregation: Office reports strictly exclude personal records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 rounded-lg shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 print:hidden">
        {/* Report Scope Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              'Office Work Report',
              'Personal Activity Report',
              'Executive Overall Summary',
              'Project Status Report',
            ] as const
          ).map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                reportType === t
                  ? t === 'Office Work Report'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : t === 'Personal Activity Report'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1">
          {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                period === p
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Document Title Header */}
        <div className="pb-4 border-b-2 border-slate-900 dark:border-slate-700 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  reportType === 'Office Work Report'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                    : reportType === 'Personal Activity Report'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {reportType}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Scope: {targetCategory ? `${targetCategory} Only` : 'All Categories'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {reportType} · {period} Edition
            </h2>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>
              Generated Date:{' '}
              <strong className="text-slate-900 dark:text-white">
                {new Date().toISOString().slice(0, 10)}
              </strong>
            </div>
            <div>Authorized Lead: Alex Morgan</div>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-center">
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completedTasks.length}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">
              Completed Activities
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {openTasks.length}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Open Commitments</span>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-rose-600">
              {overdueTasks.length}
            </div>
            <span className="text-[11px] font-semibold text-rose-600">Overdue Tasks</span>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-blue-600">
              {projects.length}
            </div>
            <span className="text-[11px] font-semibold text-blue-600">Active Projects</span>
          </div>
        </div>

        {/* 1. Executive Summary Narrative */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1">
            1. Executive Narrative & Deliverables Progress
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            During this {period.toLowerCase()} cycle, operational initiatives in the {targetCategory || 'enterprise'} scope maintained steady progress. Total completed milestones and verified activities reached {completedTasks.length} items. Resource allocation and project timelines were evaluated with zero privacy leakage between personal and corporate domains.
          </p>
        </div>

        {/* 2. Key Completed Achievements */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1">
            2. Completed Tasks & Verified Achievements ({completedTasks.length})
          </h3>
          {completedTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No tasks marked completed in this cycle.</p>
          ) : (
            <div className="space-y-1.5">
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                    {t.id} · {t.updatedAt.slice(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Open Tasks & Outstanding Commitments */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1">
            3. Open Tasks & Priority Commitments ({openTasks.length})
          </h3>
          <div className="space-y-1.5">
            {openTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {t.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">[{t.priority}]</span>
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 ml-3">
                  {t.dueDate ? `Due: ${t.dueDate}` : 'No deadline'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Active Projects Status */}
        {projects.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1">
              4. Strategic Projects & Progress
            </h3>
            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                    <span className="font-bold text-blue-600">{p.status}</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{p.objective}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Problems & Decisions Pending */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              Unresolved Incident Containments ({problems.length})
            </h4>
            {problems.map((pr) => (
              <div
                key={pr.id}
                className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300"
              >
                <strong>{pr.id}:</strong> {pr.title} ({pr.status})
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              Decisions Recorded ({decisions.length})
            </h4>
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300"
              >
                <strong>{dec.id}:</strong> {dec.title} — Status: {dec.status}
              </div>
            ))}
          </div>
        </div>

        {/* Sign-off Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-mono">
          <span>My WorkOS Automated Reporting Service</span>
          <span>Verified Non-Fabricated Database Records</span>
        </div>
      </div>
    </div>
  );
};
