import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Building2,
  User,
  Users,
  CheckCircle2,
  Clock,
  CheckSquare,
  FileText,
  Copy,
  Check,
  Loader2,
  X,
  ArrowRight,
  ListOrdered,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { MeetingRecord, WorkCategory } from '../../types/workos';

export const MeetingsView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast } = useWorkOS();
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // Minutes modal / drawer
  const [minutesModalOpen, setMinutesModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [convertingActionId, setConvertingActionId] = useState<string | null>(null);

  // New Meeting Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<WorkCategory>('Office');
  const [newTitle, setNewTitle] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newParticipants, setNewParticipants] = useState('');
  const [newAgenda, setNewAgenda] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getMeetings(effectiveCategory)
      .then((data) => {
        setMeetings(data);
        if (data.length > 0 && !selectedMeetingId) {
          setSelectedMeetingId(data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load meetings:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const selectedMeeting =
    meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const handleConvertAction = async (meetingId: string, actionId: string) => {
    setConvertingActionId(actionId);
    try {
      const task = await api.convertMeetingActionToTask(meetingId, actionId);
      addToast(`Action item converted to Task ${task.id}!`, 'success');
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to convert action to task', 'error');
    } finally {
      setConvertingActionId(null);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPurpose.trim()) {
      addToast('Title and Purpose are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const participantsList = newParticipants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const agendaList = newAgenda
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean);

      const created = await api.createMeeting({
        category: newCategory,
        title: newTitle.trim(),
        dateTime: newDate || `${new Date().toISOString().slice(0, 10)}T09:00:00Z`,
        purpose: newPurpose.trim(),
        participants: participantsList.length > 0 ? participantsList : ['Alex Morgan'],
        agenda: agendaList.length > 0 ? agendaList : ['1. Progress alignment'],
        discussionNotes: newNotes.trim() || 'Reviewed roadmap priorities and next steps.',
        keyIssues: [],
        decisionsMade: [],
        actionItems: [],
      });

      addToast(`Scheduled meeting ${created.id}`, 'success');
      setIsNewModalOpen(false);
      setSelectedMeetingId(created.id);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to create meeting', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const generateMeetingMinutes = (m: MeetingRecord) => {
    return `=====================================================
EXECUTIVE MEETING MINUTES: ${m.title.toUpperCase()}
=====================================================
Date & Time: ${m.dateTime}
Category: ${m.category} Scope
Participants: ${m.participants.join(', ')}
Meeting ID: ${m.id}

1. PURPOSE & OBJECTIVES
-----------------------------------------------------
${m.purpose}

2. AGENDA ITEMS
-----------------------------------------------------
${m.agenda.map((a, i) => `${i + 1}. ${a}`).join('\n')}

3. DISCUSSION NOTES & HIGHLIGHTS
-----------------------------------------------------
${m.discussionNotes}

4. KEY ISSUES & RISKS IDENTIFIED
-----------------------------------------------------
${m.keyIssues?.length ? m.keyIssues.map((k) => `• ${k}`).join('\n') : '• None logged.'}

5. FORMAL DECISIONS ADOPTED
-----------------------------------------------------
${m.decisionsMade?.length ? m.decisionsMade.map((d) => `✓ ${d}`).join('\n') : '• Pending follow-up review.'}

6. ACTION ITEMS & COMMITMENTS
-----------------------------------------------------
${
  m.actionItems?.length
    ? m.actionItems
        .map(
          (act, i) =>
            `[${i + 1}] ${act.description}
    Owner: ${act.responsiblePerson} | Deadline: ${act.deadline} | Status: ${act.status}${
              act.convertedTaskId ? ` | Linked Task: ${act.convertedTaskId}` : ''
            }`
        )
        .join('\n\n')
    : 'No outstanding action items recorded.'
}

Generated by My WorkOS Enterprise Executive Suite.
=====================================================`;
  };

  const handleCopyMinutes = () => {
    if (!selectedMeeting) return;
    navigator.clipboard.writeText(generateMeetingMinutes(selectedMeeting));
    setCopied(true);
    addToast('Meeting minutes copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Meetings & Action Item Tracking
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize agendas, separate discussion from decisions, and convert action items into tasks.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading meeting records...</div>
      ) : meetings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No meetings found in this view
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Schedule a meeting to record agendas, notes, and commitments.
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
          >
            Schedule Meeting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Meeting List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Recorded Meetings ({meetings.length})
            </h2>

            {meetings.map((m) => {
              const isSelected = m.id === selectedMeetingId;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 dark:border-teal-500 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        m.category === 'Office'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {m.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {m.dateTime.slice(0, 10)}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {m.title}
                  </h3>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{m.participants.length} Participants</span>
                    <span>{m.actionItems?.length || 0} Actions</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (2 Cols): Meeting Minutes & Actions Canvas */}
          {selectedMeeting && (
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                {/* Title & Generate Minutes Button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {selectedMeeting.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{selectedMeeting.id}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {selectedMeeting.dateTime}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {selectedMeeting.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setMinutesModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors shrink-0"
                  >
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Formatted Minutes</span>
                  </button>
                </div>

                {/* Purpose & Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
                      Purpose:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {selectedMeeting.purpose}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
                      Participants:
                    </span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedMeeting.participants.map((p, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-[11px]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Agenda */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Meeting Agenda</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-1">
                    {selectedMeeting.agenda.map((ag, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{ag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Discussion Notes */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Discussion Points & Key Arguments
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedMeeting.discussionNotes}
                  </p>
                </div>

                {/* Decisions Adopted */}
                {selectedMeeting.decisionsMade?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 space-y-1.5 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Decisions Made in Session
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-emerald-900 dark:text-emerald-200">
                      {selectedMeeting.decisionsMade.map((dec, i) => (
                        <li key={i}>{dec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items & 1-Click Task Conversion */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Action Items ({selectedMeeting.actionItems?.length || 0})</span>
                  </h4>

                  <div className="space-y-2">
                    {!selectedMeeting.actionItems || selectedMeeting.actionItems.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No action items recorded.</p>
                    ) : (
                      selectedMeeting.actionItems.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {act.description}
                            </p>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Owner: <strong>{act.responsiblePerson}</strong> · Due:{' '}
                              <strong>{act.deadline}</strong>
                            </span>
                          </div>

                          <div>
                            {act.convertedTaskId ? (
                              <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Converted ({act.convertedTaskId})
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConvertAction(selectedMeeting.id, act.id)}
                                disabled={convertingActionId === act.id}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1 shadow-2xs"
                              >
                                {convertingActionId === act.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ArrowRight className="w-3 h-3" />
                                )}
                                <span>Convert to Task</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORMATTED MINUTES PREVIEW MODAL */}
      {minutesModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Formal Meeting Minutes
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMinutes}
                  className="px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-lg flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Minutes'}</span>
                </button>
                <button
                  onClick={() => setMinutesModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <pre className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed custom-scrollbar">
              {generateMeetingMinutes(selectedMeeting)}
            </pre>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Schedule Meeting Session
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
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
                    <span className="text-xs font-bold">Office Meeting</span>
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
                    <span className="text-xs font-bold">Personal Discussion</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Monthly Cross-Functional Operations Review"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="What is the objective of this session?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Participants (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newParticipants}
                    onChange={(e) => setNewParticipants(e.target.value)}
                    placeholder="Alex Morgan, Sarah Jenkins, David Wu"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Meeting</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
