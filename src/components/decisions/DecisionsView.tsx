import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Building2,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  XCircle,
  ThumbsUp,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { DecisionRecord, DecisionStatus, WorkCategory } from '../../types/workos';

export const DecisionsView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast } = useWorkOS();
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | DecisionStatus>('All');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  // New Decision Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<WorkCategory>('Office');
  const [newTitle, setNewTitle] = useState('');
  const [newBackground, setNewBackground] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newOwner, setNewOwner] = useState('Alex Morgan');
  const [newAuthority, setNewAuthority] = useState('Chief Technology Officer');
  const [newRecommended, setNewRecommended] = useState('');
  const [newStatus, setNewStatus] = useState<DecisionStatus>('Draft');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getDecisions(effectiveCategory)
      .then((data) => {
        setDecisions(data);
        if (data.length > 0 && !selectedDecisionId) {
          setSelectedDecisionId(data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load decisions:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const filteredDecisions = decisions.filter((d) => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    return true;
  });

  const selectedDecision =
    decisions.find((d) => d.id === selectedDecisionId) || decisions[0];

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProblem.trim()) {
      addToast('Title and problem/opportunity context are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createDecision({
        category: newCategory,
        title: newTitle.trim(),
        background: newBackground.trim() || 'Evaluated in executive operations review.',
        businessProblemOrOpportunity: newProblem.trim(),
        optionsConsidered: [
          {
            id: 'OPT-1',
            name: newRecommended.trim() || 'Primary Proposed Path',
            benefits: 'High efficiency alignment with strategic objectives.',
            tradeOffs: 'Resource commitment required in current cycle.',
            riskRating: 'Low',
          },
        ],
        supportingEvidence: 'Documented historical metrics and vendor bids.',
        assumptions: 'Stakeholders will adhere to agreed rollout schedule.',
        recommendedOption: newRecommended.trim() || 'Option 1',
        decisionOwner: newOwner.trim(),
        approvalAuthority: newAuthority.trim(),
        status: newStatus,
        decisionDate: new Date().toISOString().slice(0, 10),
        implementationActions: ['Draft rollout communication and brief operational leads.'],
      });

      addToast(`Created decision record ${created.id}`, 'success');
      setIsModalOpen(false);
      setSelectedDecisionId(created.id);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to create decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: DecisionStatus) => {
    try {
      await api.updateDecision(id, { status });
      addToast(`Updated decision status to ${status}`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Executive Decision Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Document options, business justification, approval authority, and audit implementation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Decision</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
        {(['All', 'Draft', 'Pending Approval', 'Approved', 'Rejected', 'Implemented'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading decisions...</div>
      ) : filteredDecisions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
          <Scale className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No decisions match this view
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Record a strategic choice or operational trade-off in the register.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
          >
            Create Decision Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Decision List Column */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Registered Decisions ({filteredDecisions.length})
            </h2>

            {filteredDecisions.map((dec) => {
              const isSelected = dec.id === selectedDecisionId;
              return (
                <div
                  key={dec.id}
                  onClick={() => setSelectedDecisionId(dec.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        dec.category === 'Office'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {dec.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        dec.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : dec.status === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : dec.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {dec.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {dec.title}
                  </h3>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Authority: {dec.approvalAuthority}</span>
                    <span>{dec.decisionDate || 'Draft'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decision Details Panel (2 Cols) */}
          {selectedDecision && (
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {selectedDecision.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedDecision.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          selectedDecision.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedDecision.status === 'Pending Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {selectedDecision.status}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {selectedDecision.title}
                    </h2>
                  </div>

                  {/* Status update actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedDecision.status !== 'Approved' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedDecision.id, 'Approved')}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {selectedDecision.status !== 'Rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedDecision.id, 'Rejected')}
                        className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Problem or Opportunity Context */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Business Problem or Opportunity
                  </h4>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedDecision.businessProblemOrOpportunity}
                  </p>
                </div>

                {/* Background & Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Background:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedDecision.background}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Supporting Evidence:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedDecision.supportingEvidence}
                    </p>
                  </div>
                </div>

                {/* Recommended Option Callout */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                    Recommended Option
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">
                    {selectedDecision.recommendedOption}
                  </p>
                </div>

                {/* Options Considered */}
                {selectedDecision.optionsConsidered?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Options Considered & Trade-offs
                    </h4>
                    <div className="space-y-2">
                      {selectedDecision.optionsConsidered.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5"
                        >
                          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{opt.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Risk Rating: {opt.riskRating}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="text-emerald-700 dark:text-emerald-400">
                              <strong>Benefits:</strong> {opt.benefits}
                            </div>
                            <div className="text-amber-700 dark:text-amber-400">
                              <strong>Trade-offs:</strong> {opt.tradeOffs}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Implementation Actions */}
                {selectedDecision.implementationActions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Implementation Commitments
                    </h4>
                    <ul className="space-y-1 text-xs list-disc list-inside text-slate-700 dark:text-slate-300">
                      {selectedDecision.implementationActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE DECISION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log New Decision in Register
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDecision} className="space-y-3">
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
                    <span className="text-xs font-bold">Office Decision</span>
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
                    <span className="text-xs font-bold">Personal Decision</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Decision Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Migration to Ephemeral Preview Environments"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Problem or Opportunity *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  placeholder="Why is this decision required now?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Approval Authority
                  </label>
                  <input
                    type="text"
                    value={newAuthority}
                    onChange={(e) => setNewAuthority(e.target.value)}
                    placeholder="e.g. VP Engineering / CTO"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DecisionStatus)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Draft">Draft (Recommendation Only)</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                  </select>
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
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
