import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Building2,
  User,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Search,
  Scale,
  ArrowRight,
  Loader2,
  FileText,
  ListOrdered,
  X,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { ProblemRecord, WorkCategory } from '../../types/workos';

export const ProblemSolvingView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast } = useWorkOS();
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // AI analysis state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // New Problem Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<WorkCategory>('Office');
  const [newTitle, setNewTitle] = useState('');
  const [newStatement, setNewStatement] = useState('');
  const [newCurrentSituation, setNewCurrentSituation] = useState('');
  const [newContainment, setNewContainment] = useState('');
  const [newFacts, setNewFacts] = useState('');
  const [newMissingInfo, setNewMissingInfo] = useState('');
  const [newAssumptions, setNewAssumptions] = useState('');
  const [newImpact, setNewImpact] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getProblems(effectiveCategory)
      .then((data) => {
        setProblems(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load problems:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const selectedProblem = problems.find((p) => p.id === selectedId) || problems[0];

  const handleRunAiAnalysis = async (problemId: string) => {
    setAiAnalyzing(true);
    setAiReport(null);
    try {
      const res = await api.aiAnalyzeProblem(problemId);
      setAiReport(res.analysis);
      addToast('Critical thinking AI assessment generated', 'success');
    } catch (err: any) {
      addToast(err.message || 'AI analysis failed', 'error');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStatement.trim()) {
      addToast('Title and problem statement are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const factsList = newFacts
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);
      const missingList = newMissingInfo
        .split('\n')
        .map((m) => m.trim())
        .filter(Boolean);
      const assumptionsList = newAssumptions
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean);

      const created = await api.createProblem({
        category: newCategory,
        title: newTitle.trim(),
        problemStatement: newStatement.trim(),
        dateIdentified: new Date().toISOString().slice(0, 10),
        currentSituation: newCurrentSituation.trim() || 'Observed operational bottleneck.',
        factsAndEvidence: factsList.length > 0 ? factsList : ['Initial incident reports logged.'],
        missingInformation: missingList,
        assumptionsAndUncertainties: assumptionsList,
        impactAndUrgency: newImpact,
        stakeholdersAffected: ['Operations Team'],
        immediateContainmentAction: newContainment.trim() || 'Monitoring active queue thresholds.',
        rootCauseAnalysis: {
          method: 'Five Whys',
          fiveWhys: ['1. Initial deviation noticed.'],
          contributingFactors: [],
        },
        possibleSolutions: [],
        status: 'Investigating',
      });

      addToast(`Created problem record ${created.id}`, 'success');
      setIsModalOpen(false);
      setSelectedId(created.id);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to create problem', 'error');
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
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Critical Thinking & Root Cause Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured 5-Whys, verified facts vs. assumptions, containment, and solution evaluation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Problem Record</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading problem records...</div>
      ) : problems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
          <Brain className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No active problem records in current view
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Register an operational bottleneck or personal obstacle to conduct structured root cause analysis.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Create Problem Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Problems List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Active Investigations ({problems.length})
            </h2>

            {problems.map((prob) => {
              const isSelected = prob.id === selectedId;
              return (
                <div
                  key={prob.id}
                  onClick={() => {
                    setSelectedId(prob.id);
                    setAiReport(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 dark:border-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        prob.category === 'Office'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {prob.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        prob.impactAndUrgency === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {prob.impactAndUrgency}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {prob.title}
                  </h3>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Status: {prob.status}</span>
                    <span>{prob.dateIdentified}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (2 Cols): Problem Investigation & Root Cause Canvas */}
          {selectedProblem && (
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                {/* Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {selectedProblem.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{selectedProblem.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {selectedProblem.status}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {selectedProblem.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleRunAiAnalysis(selectedProblem.id)}
                    disabled={aiAnalyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors shrink-0"
                  >
                    {aiAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                    )}
                    <span>AI Critical Analysis</span>
                  </button>
                </div>

                {/* Problem Statement & Current Situation */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Problem Statement
                    </h4>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {selectedProblem.problemStatement}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                      Immediate Containment Action
                    </h4>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      {selectedProblem.immediateContainmentAction}
                    </p>
                  </div>
                </div>

                {/* CRITICAL DISTINCTION: Verified Facts vs Assumptions vs Missing Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Verified Facts */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 space-y-1.5">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Facts & Evidence
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {selectedProblem.factsAndEvidence?.map((fact, idx) => (
                        <li key={idx} className="leading-tight">
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Assumptions */}
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 space-y-1.5">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Assumptions & Hypotheses
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {selectedProblem.assumptionsAndUncertainties?.map((item, idx) => (
                        <li key={idx} className="leading-tight">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Info */}
                  <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 space-y-1.5">
                    <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing Information Needed
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {selectedProblem.missingInformation?.map((item, idx) => (
                        <li key={idx} className="leading-tight">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 5 Whys Root Cause Analysis */}
                {selectedProblem.rootCauseAnalysis && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-indigo-500" />
                      <span>Five Whys Investigation Path</span>
                    </h4>

                    <div className="space-y-1.5 pt-1">
                      {selectedProblem.rootCauseAnalysis.fiveWhys?.map((why, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                        >
                          {why}
                        </div>
                      ))}
                    </div>

                    {selectedProblem.rootCauseAnalysis.summaryRootCause && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          Identified Primary Root Cause:
                        </strong>{' '}
                        {selectedProblem.rootCauseAnalysis.summaryRootCause}
                      </div>
                    )}
                  </div>
                )}

                {/* Evaluated Solution Options */}
                {selectedProblem.possibleSolutions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" />
                      <span>Evaluated Countermeasure Options</span>
                    </h4>

                    <div className="space-y-2">
                      {selectedProblem.possibleSolutions.map((sol) => (
                        <div
                          key={sol.id}
                          className="p-3.5 rounded-xl border bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 space-y-1.5 text-xs"
                        >
                          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{sol.name}</span>
                            <span className="font-normal text-slate-500 font-mono">
                              Cost: {sol.estimatedCost} · Effort: {sol.estimatedEffort}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div className="text-emerald-700 dark:text-emerald-400">
                              ✓ {sol.advantages}
                            </div>
                            <div className="text-rose-700 dark:text-rose-400">
                              ✗ {sol.disadvantages}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Critical Thinking Report Panel */}
                {aiReport && (
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Executive AI Critical Thinking Assessment</span>
                    </div>
                    <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {aiReport}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE PROBLEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Initiate Problem Investigation
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-3">
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
                    <span className="text-xs font-bold">Office Incident</span>
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
                    <span className="text-xs font-bold">Personal Obstacle</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Order fulfillment latency spike in European hub"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Statement *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="What is the measurable deviation from the baseline expectation?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Immediate Containment Action
                </label>
                <input
                  type="text"
                  value={newContainment}
                  onChange={(e) => setNewContainment(e.target.value)}
                  placeholder="Emergency action deployed to stop the bleeding..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Verified Facts (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newFacts}
                    onChange={(e) => setNewFacts(e.target.value)}
                    placeholder="Physical metrics confirmed..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Missing Information (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newMissingInfo}
                    onChange={(e) => setNewMissingInfo(e.target.value)}
                    placeholder="Evidence needed before conclusion..."
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
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Problem Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
