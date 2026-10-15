import React, { useState, useEffect } from 'react';
import {
  StickyNote as StickyIcon,
  Bell,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Search,
  Check,
  Calendar,
  Sparkles,
  X,
  Palette,
  Tag,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Filter,
  Copy,
  BookOpen,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { StickyNote, ProjectReminder, Project } from '../../types/workos';
import { STICKY_PALETTE, StickyColorOption } from '../projects/ProjectStickyNotes';
import { ProjectStickyNotes } from '../projects/ProjectStickyNotes';
import { ProjectReminders } from '../projects/ProjectReminders';

export const NotebookView: React.FC = () => {
  const { t, language, addToast, refreshTrigger, triggerRefresh } = useWorkOS();

  const [activeTab, setActiveTab] = useState<'sticky' | 'reminders' | 'all'>('sticky');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Quick stats
  const [stickyCount, setStickyCount] = useState(0);
  const [remindersCount, setRemindersCount] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);

  // Modal triggers
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Note Modal Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('#FEF08A'); // Post-it Yellow default
  const [selectedProjId, setSelectedProjId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [noteTags, setNoteTags] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Reminder Modal Form State
  const [remTitle, setRemTitle] = useState('');
  const [remDueDate, setRemDueDate] = useState('');
  const [remDueTime, setRemDueTime] = useState('09:00');
  const [remPriority, setRemPriority] = useState<'Urgent' | 'High' | 'Normal' | 'Low'>('Normal');
  const [remProjId, setRemProjId] = useState<string>('');
  const [remNotes, setRemNotes] = useState('');
  const [submittingReminder, setSubmittingReminder] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [refreshTrigger]);

  const loadInitialData = async () => {
    setLoadingProjects(true);
    try {
      const [projList, notesList, remList] = await Promise.all([
        api.getProjects(),
        api.getStickyNotes(),
        api.getReminders(),
      ]);
      setProjects(projList);
      setStickyCount(notesList.length);
      setPinnedCount(notesList.filter((n) => n.isPinned).length);
      setRemindersCount(remList.filter((r) => !r.isCompleted).length);
    } catch (err) {
      console.error('Failed to load initial notebook data', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCreateStickyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      addToast('Please enter a note title', 'error');
      return;
    }

    setSubmittingNote(true);
    try {
      const proj = projects.find((p) => p.id === selectedProjId);
      const tags = noteTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createStickyNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        color: selectedColor,
        projectId: selectedProjId || undefined,
        projectTitle: proj ? proj.name : undefined,
        isPinned,
        tags,
      });

      addToast(
        language === 'LA' ? 'ສ້າງໂນ໊ດຕິດສຳເລັດແລ້ວ!' : 'Sticky note added successfully!',
        'success'
      );
      setIsNoteModalOpen(false);
      resetNoteForm();
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to create sticky note', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) {
      addToast('Please enter a reminder title', 'error');
      return;
    }

    setSubmittingReminder(true);
    try {
      const proj = projects.find((p) => p.id === remProjId);
      await api.createReminder({
        title: remTitle.trim(),
        dueDate: remDueDate || new Date().toISOString().slice(0, 10),
        dueTime: remDueTime || '09:00',
        priority: remPriority,
        projectId: remProjId || undefined,
        projectTitle: proj ? proj.name : undefined,
        notes: remNotes.trim(),
      });

      addToast(
        language === 'LA' ? 'ສ້າງການແຈ້ງເຕືອນສຳເລັດແລ້ວ!' : 'Reminder created successfully!',
        'success'
      );
      setIsReminderModalOpen(false);
      resetReminderForm();
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to create reminder', 'error');
    } finally {
      setSubmittingReminder(false);
    }
  };

  const resetNoteForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setSelectedColor('#FEF08A');
    setSelectedProjId('');
    setIsPinned(false);
    setNoteTags('');
  };

  const resetReminderForm = () => {
    setRemTitle('');
    setRemDueDate('');
    setRemDueTime('09:00');
    setRemPriority('Normal');
    setRemProjId('');
    setRemNotes('');
  };

  const currentColorObj =
    STICKY_PALETTE.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase()) ||
    STICKY_PALETTE[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Workspace Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/40">
                <StickyIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'LA' ? 'ໂນ໊ດຕິດ (Sticky Notes)' : 'Sticky Notes'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                    {stickyCount} Notes
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'LA'
                    ? 'ພື້ນທີ່ຈັດການໂນ໊ດຕິດແຍກຕາມສີ, ບັນທຶກຄວາມຄິດດ່ວນ ແລະ ການແຈ້ງເຕືອນສຳຄັນ'
                    : 'Color-coded sticky notes board, quick brainstorming thoughts, and timely action reminders.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:self-auto flex-wrap">
            <button
              onClick={() => {
                resetNoteForm();
                setIsNoteModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-xs transition-all cursor-pointer border border-amber-500/40 hover:scale-[1.02]"
            >
              <Palette className="w-4 h-4 text-amber-900" />
              <span>{language === 'LA' ? '+ ເພີ່ມໂນ໊ດຕິດ (ເລືອກສີ)' : '+ Add Sticky Note'}</span>
            </button>

            <button
              onClick={() => {
                resetReminderForm();
                setIsReminderModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Bell className="w-4 h-4 text-indigo-500" />
              <span>{language === 'LA' ? '+ ເພີ່ມການແຈ້ງເຕືອນ' : '+ Add Reminder'}</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {language === 'LA' ? 'ໂນ໊ດຕິດທັງໝົດ' : 'Total Sticky Notes'}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{stickyCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {language === 'LA' ? 'ປັກໝຸດໄວ້ເທິງສຸດ' : 'Pinned to Top'}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{pinnedCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {language === 'LA' ? 'ການແຈ້ງເຕືອນທີ່ລໍຖ້າ' : 'Pending Reminders'}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{remindersCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {language === 'LA' ? 'ໂຄງການທີ່ເຊື່ອມຕໍ່' : 'Linked Projects'}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{projects.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('sticky')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'sticky'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <StickyIcon className="w-4 h-4 text-amber-500" />
          <span>{language === 'LA' ? 'ກະດານໂນ໊ດຕິດ (Sticky Notes Board)' : 'Sticky Notes Board'}</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono">
            {stickyCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 text-indigo-500" />
          <span>{language === 'LA' ? 'ການແຈ້ງເຕືອນ & ເວລາ (Reminders & Alerts)' : 'Reminders & Alerts'}</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-mono">
            {remindersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-teal-500" />
          <span>{language === 'LA' ? 'ພາບລວມທັງໝົດ (All Workspace Notes)' : 'All Notebook Workspace'}</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      {activeTab === 'sticky' && (
        <div className="space-y-6">
          <ProjectStickyNotes projects={projects} />
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <ProjectReminders projects={projects} />
        </div>
      )}

      {activeTab === 'all' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <StickyIcon className="w-4 h-4 text-amber-500" />
                <span>{language === 'LA' ? 'ໂນ໊ດຕິດລ່າສຸດ' : 'Recent Sticky Notes'}</span>
              </h2>
            </div>
            <ProjectStickyNotes projects={projects} />
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span>{language === 'LA' ? 'ການແຈ້ງເຕືອນລ່າສຸດ' : 'Upcoming Reminders'}</span>
              </h2>
            </div>
            <ProjectReminders projects={projects} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD STICKY NOTE WITH COLOR SELECTOR                   */}
      {/* ============================================================ */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md border flex items-center justify-center"
                  style={{ backgroundColor: currentColorObj.hex, borderColor: currentColorObj.borderHex }}
                >
                  <StickyIcon className="w-3 h-3" style={{ color: currentColorObj.textHex }} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'LA' ? 'ເພີ່ມໂນ໊ດຕິດໃໝ່ (Sticky Note)' : 'Add Sticky Note'}
                </h3>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateStickyNote} className="p-6 space-y-4">
              {/* Color Selection Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'LA' ? 'ເລືອກສີໂນ໊ດຕິດ (Color)' : 'Select Note Color'}</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                    {currentColorObj.name}
                  </span>
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {STICKY_PALETTE.map((color) => {
                    const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.hex)}
                        title={color.name}
                        className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105 shadow-md'
                            : 'hover:scale-105 hover:shadow-xs'
                        }`}
                        style={{
                          backgroundColor: color.hex,
                          border: `2px solid ${color.borderHex}`,
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4" style={{ color: color.textHex }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ຫົວຂໍ້ໂນ໊ດຕິດ' : 'Note Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'LA' ? 'ເຊັ່ນ: ໄອເດຍອອກແບບ, ລາຍການກວດກາ...' : 'e.g. Sprint Ideas, Quick Checklist, Phone memo...'}
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Content Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ເນື້ອຫາ / ຂໍ້ຄວາມ' : 'Content / Message'}
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    language === 'LA'
                      ? 'ພິມຂໍ້ຄວາມໂນ໊ດຕິດ, ບັນທຶກຄວາມຄິດ ຫຼື ລາຍການດ່ວນ...'
                      : 'Write your thoughts, action points, or quick notes...'
                  }
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>

              {/* Project Link & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ເຊື່ອມກັບໂຄງການ (ທາງເລືອກ)' : 'Linked Project (Optional)'}
                  </label>
                  <select
                    value={selectedProjId}
                    onChange={(e) => setSelectedProjId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">{language === 'LA' ? '-- ບໍ່ເຊື່ອມຕໍ່ໂຄງການ (ທົ່ວໄປ) --' : '-- Standalone / General --'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ແທັກ (ຂັ້ນດ້ວຍຈຸດ)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Urgent, Design, Idea..."
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheckNotebook"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 border-slate-300"
                />
                <label htmlFor="pinCheckNotebook" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <Pin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{language === 'LA' ? 'ປັກໝຸດໄວ້ເທິງສຸດຂອງກະດານ' : 'Pin to top of board'}</span>
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 rounded-xl border" style={{ backgroundColor: currentColorObj.hex, borderColor: currentColorObj.borderHex }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: currentColorObj.pinHex }}>
                  Preview:
                </div>
                <div className="font-bold text-sm" style={{ color: currentColorObj.textHex }}>
                  {noteTitle || 'Sample Title'}
                </div>
                <div className="text-xs mt-1 opacity-90 line-clamp-2" style={{ color: currentColorObj.textHex }}>
                  {noteContent || 'Sample sticky note content will appear here...'}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submittingNote ? 'Saving...' : language === 'LA' ? 'ບັນທຶກໂນ໊ດ' : 'Save Sticky Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD REMINDER                                          */}
      {/* ============================================================ */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'LA' ? 'ເພີ່ມການແຈ້ງເຕືອນໃໝ່ (Reminder)' : 'Add New Reminder'}
                </h3>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ຫົວຂໍ້ການແຈ້ງເຕືອນ' : 'Reminder Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Review security logs, Team sync, Submit report..."
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ວັນທີກຳນົດ' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={remDueDate}
                    onChange={(e) => setRemDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ເວລາ' : 'Time'}
                  </label>
                  <input
                    type="time"
                    value={remDueTime}
                    onChange={(e) => setRemDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ລະດັບຄວາມສຳຄັນ' : 'Priority'}
                  </label>
                  <select
                    value={remPriority}
                    onChange={(e) => setRemPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ເຊື່ອມກັບໂຄງການ' : 'Linked Project'}
                  </label>
                  <select
                    value={remProjId}
                    onChange={(e) => setRemProjId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{language === 'LA' ? '-- ບໍ່ເຊື່ອມຕໍ່ໂຄງການ --' : '-- Standalone / General --'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ໝາຍເຫດເພີ່ມເຕີມ' : 'Notes / Additional context'}
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes, instructions or checklist..."
                  value={remNotes}
                  onChange={(e) => setRemNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingReminder}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submittingReminder ? 'Saving...' : language === 'LA' ? 'ບັນທຶກການແຈ້ງເຕືອນ' : 'Save Reminder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
