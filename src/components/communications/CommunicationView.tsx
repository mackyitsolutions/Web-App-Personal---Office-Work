import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  FileText,
  Mail,
  Loader2,
  Sliders,
  RotateCcw,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { CommunicationStyle } from '../../types/workos';

const TEMPLATES = [
  'Management Update',
  'Professional Email',
  'Executive Summary',
  'Project Status Report',
  'Problem-Solving Proposal',
  'Request for Executive Approval',
  'Procurement & CAPEX Justification',
  'Risk & Vulnerability Notice',
  'Meeting Minutes & Directives',
  'Incident Response Post-Mortem',
  'Stakeholder Follow-Up Message',
  'Performance Evaluation Summary',
  'Board Presentation Outline',
];

const STYLES: CommunicationStyle[] = [
  'Executive',
  'Concise',
  'Diplomatic',
  'Formal',
  'Persuasive',
  'Technical',
];

export const CommunicationView: React.FC = () => {
  const { addToast } = useWorkOS();

  const [selectedTemplate, setSelectedTemplate] = useState('Management Update');
  const [selectedStyle, setSelectedStyle] = useState<CommunicationStyle>('Executive');
  const [recipient, setRecipient] = useState('Chief Operating Officer & Project Stakeholders');
  const [objective, setObjective] = useState('Reconcile Q4 operational milestones and request emergency software hotfix sign-off.');
  const [context, setContext] = useState('Operational dispatches in European logistics hub experienced latency; technical containment deployed.');
  const [keyPoints, setKeyPoints] = useState('1. ERP scanner firmware v3.8 stabilized queue throughput.\n2. Cloud staging cluster decommissioning saves $3,400 monthly.\n3. Approval required for secondary courier carrier backup agreement.');

  const [generatedDraft, setGeneratedDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generateCommunication({
        templateType: selectedTemplate,
        style: selectedStyle,
        context,
        recipient,
        objective,
        keyPoints,
      });

      setGeneratedDraft(res.draft);
      addToast(`Generated ${selectedStyle} ${selectedTemplate} draft`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    addToast('Draft copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Professional Communication Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            13 enterprise communication templates with tone modulation and structured executive clarity.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Server-Side AI Privacy Enforced</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleGenerate}
            className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Select Template Type
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              >
                {TEMPLATES.map((tmpl) => (
                  <option key={tmpl} value={tmpl}>
                    {tmpl}
                  </option>
                ))}
              </select>
            </div>

            {/* Communication Style Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Tone & Communication Style
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {STYLES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStyle(st)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-semibold transition-all ${
                      selectedStyle === st
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient / Intended Audience
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Executive Board, CFO, Project Team"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Core Purpose & Desired Outcome
              </label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What action or understanding should this produce?"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            {/* Background Context */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Background Context
              </label>
              <textarea
                rows={2}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide factual background and situational constraints..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            {/* Key Points */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verified Key Points & Specific Actions
              </label>
              <textarea
                rows={3}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Bullet points of verified facts, required approvals, dates..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Draft {selectedTemplate}</span>
            </button>
          </form>
        </div>

        {/* Right Output: Draft Viewer & Editor (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Generated Executive Draft ({selectedStyle})</span>
            </h2>

            {generatedDraft && (
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-lg flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Draft'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col min-h-[420px]">
            {!generatedDraft ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ready to craft your communication
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Select a template and tone on the left, then click "Draft" to generate an executive-ready message.
                </p>
              </div>
            ) : (
              <textarea
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="flex-1 w-full bg-transparent text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed outline-hidden resize-none custom-scrollbar p-1"
                placeholder="Edit your draft here..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
