import React, { useState, useEffect } from 'react';
import {
  StickyNote as StickyIcon,
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
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { StickyNote, Project } from '../../types/workos';

export interface StickyColorOption {
  id: string;
  name: string;
  hex: string;
  borderHex: string;
  textHex: string;
  headerHex: string;
  pinHex: string;
}

export const STICKY_PALETTE: StickyColorOption[] = [
  {
    id: 'yellow',
    name: 'Post-it Yellow',
    hex: '#FEF08A',
    borderHex: '#FACC15',
    textHex: '#713F12',
    headerHex: '#FDE047',
    pinHex: '#CA8A04',
  },
  {
    id: 'peach',
    name: 'Warm Peach',
    hex: '#FED7AA',
    borderHex: '#FB923C',
    textHex: '#7C2D12',
    headerHex: '#FDBA74',
    pinHex: '#EA580C',
  },
  {
    id: 'rose',
    name: 'Pastel Rose',
    hex: '#FECDD3',
    borderHex: '#FB7185',
    textHex: '#881337',
    headerHex: '#FDA4AF',
    pinHex: '#E11D48',
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    hex: '#BAE6FD',
    borderHex: '#38BDF8',
    textHex: '#0C4A6E',
    headerHex: '#7DD3FC',
    pinHex: '#0284C7',
  },
  {
    id: 'mint',
    name: 'Mint Green',
    hex: '#A7F3D0',
    borderHex: '#34D399',
    textHex: '#064E3B',
    headerHex: '#6EE7B7',
    pinHex: '#059669',
  },
  {
    id: 'lavender',
    name: 'Lavender Purple',
    hex: '#E9D5FF',
    borderHex: '#C084FC',
    textHex: '#581C87',
    headerHex: '#D8B4FE',
    pinHex: '#9333EA',
  },
  {
    id: 'slate',
    name: 'Minimal Pearl',
    hex: '#F1F5F9',
    borderHex: '#CBD5E1',
    textHex: '#1E293B',
    headerHex: '#E2E8F0',
    pinHex: '#64748B',
  },
];

interface ProjectStickyNotesProps {
  currentProject?: Project | null;
  projects: Project[];
}

export const ProjectStickyNotes: React.FC<ProjectStickyNotesProps> = ({
  currentProject,
  projects,
}) => {
  const { t, language, addToast, refreshTrigger, triggerRefresh } = useWorkOS();

  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProjectId, setFilterProjectId] = useState<string>(
    currentProject ? currentProject.id : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('#FEF08A');
  const [selectedProjId, setSelectedProjId] = useState<string>(
    currentProject ? currentProject.id : ''
  );
  const [isPinned, setIsPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync currentProject change
  useEffect(() => {
    if (currentProject) {
      setFilterProjectId(currentProject.id);
      setSelectedProjId(currentProject.id);
    }
  }, [currentProject]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await api.getStickyNotes();
      setNotes(data);
    } catch (err: any) {
      console.error('Failed to load sticky notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  const handleOpenAdd = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setSelectedColor('#FEF08A'); // Default yellow
    setSelectedProjId(currentProject ? currentProject.id : (projects[0]?.id || ''));
    setIsPinned(false);
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: StickyNote) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSelectedColor(note.color || '#FEF08A');
    setSelectedProjId(note.projectId || '');
    setIsPinned(!!note.isPinned);
    setTagsInput(note.tags ? note.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      addToast(
        language === 'LA' ? 'ກະລຸນາໃສ່ຫົວຂໍ້ ຫຼື ເນື້ອໃນໂນ໊ດ' : 'Please provide a title or note content',
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const foundProj = projects.find((p) => p.id === selectedProjId);

      if (editingNoteId) {
        await api.updateStickyNote(editingNoteId, {
          title: title.trim() || 'Quick Note',
          content: content.trim(),
          color: selectedColor,
          projectId: selectedProjId || undefined,
          projectTitle: foundProj ? foundProj.name : undefined,
          isPinned,
          tags,
        });
        addToast(language === 'LA' ? 'ອັບເດດໂນ໊ດຕິດແລ້ວ' : 'Sticky note updated', 'success');
      } else {
        await api.createStickyNote({
          title: title.trim() || 'Quick Note',
          content: content.trim(),
          color: selectedColor,
          projectId: selectedProjId || undefined,
          projectTitle: foundProj ? foundProj.name : undefined,
          isPinned,
          tags,
        });
        addToast(language === 'LA' ? 'ເພີ່ມໂນ໊ດຕິດໃໝ່ແລ້ວ!' : 'Created new sticky note!', 'success');
      }

      setIsModalOpen(false);
      triggerRefresh();
      loadNotes();
    } catch (err: any) {
      addToast(err.message || 'Failed to save note', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.deleteStickyNote(id);
      addToast(language === 'LA' ? 'ລຶບໂນ໊ດແລ້ວ' : 'Sticky note deleted', 'info');
      setNotes((prev) => prev.filter((n) => n.id !== id));
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete note', 'error');
    }
  };

  const handleTogglePin = async (note: StickyNote) => {
    try {
      const updated = await api.updateStickyNote(note.id, { isPinned: !note.isPinned });
      setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
      addToast(note.isPinned ? 'Unpinned' : 'Pinned to top', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const filteredNotes = notes
    .filter((n) => {
      if (filterProjectId !== 'ALL') {
        return n.projectId === filterProjectId;
      }
      return true;
    })
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.projectTitle && n.projectTitle.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    })
    .sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  // Find color metadata
  const getColorMeta = (hex: string) => {
    const matched = STICKY_PALETTE.find(
      (c) => c.hex.toLowerCase() === hex.toLowerCase() || c.id === hex
    );
    if (matched) return matched;
    return {
      id: 'custom',
      name: 'Custom',
      hex,
      borderHex: hex,
      textHex: '#1e293b',
      headerHex: hex,
      pinHex: '#f59e0b',
    };
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <StickyIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'LA' ? 'ສະໝຸດໂນ໊ດ & ໂນ໊ດຕິດ' : 'Notebook & Sticky Notes'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {filteredNotes.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'LA'
                  ? 'ບັນທຶກແນວຄວາມຄິດດ່ວນ ແລະ ເລືອກສີໂນ໊ດຕິດໄດ້ຕາມໃຈ'
                  : 'Sticky notes with customizable paper colors and project links.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-hidden"
          >
            <option value="ALL">
              {language === 'LA' ? 'ທຸກໂຄງການ (All Projects)' : 'All Projects'}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'LA' ? 'ຄົ້ນຫາໂນ໊ດ...' : 'Search notes...'}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-hidden w-36 sm:w-44"
            />
          </div>

          {/* Add Sticky Note Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'LA' ? 'ເພີ່ມໂນ໊ດຕິດ' : 'Add Sticky Note'}</span>
          </button>
        </div>
      </div>

      {/* Sticky Notes Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading sticky notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <StickyIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {language === 'LA' ? 'ຍັງບໍ່ມີໂນ໊ດຕິດເທື່ອ' : 'No sticky notes yet'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'LA'
              ? 'ກົດປຸ່ມດ້ານເທິງເພື່ອສ້າງໂນ໊ດຕິດໃໝ່ ແລະ ເລືອກສີທີ່ທ່ານມັກໄດ້ທັນທີ!'
              : 'Click "+ Add Sticky Note" to jot down thoughts, action reminders, and choose your favorite color!'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'LA' ? 'ເພີ່ມໂນ໊ດຕິດໃໝ່' : 'Add First Note'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => {
            const colorMeta = getColorMeta(note.color);

            return (
              <div
                key={note.id}
                style={{
                  backgroundColor: colorMeta.hex,
                  borderColor: colorMeta.borderHex,
                }}
                className={`relative rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group text-slate-900 min-h-[190px] ${
                  note.isPinned ? 'ring-2 ring-amber-500/50 shadow-md' : ''
                }`}
              >
                {/* Top Tape / Pin Decoration */}
                <div className="flex items-center justify-between pb-2 border-b border-black/10 mb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePin(note)}
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      className={`p-1 rounded hover:bg-black/10 transition-colors ${
                        note.isPinned ? 'text-amber-700 font-bold' : 'text-black/40'
                      }`}
                    >
                      <Pin
                        className={`w-3.5 h-3.5 ${
                          note.isPinned ? 'fill-amber-600 text-amber-700 rotate-45' : ''
                        }`}
                      />
                    </button>
                    {note.projectTitle ? (
                      <span className="text-[10px] font-bold text-black/70 truncate max-w-[120px] flex items-center gap-1">
                        <FolderKanban className="w-3 h-3 text-black/60 shrink-0" />
                        <span className="truncate">{note.projectTitle}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-black/50">Notebook Note</span>
                    )}
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      title="Edit note & color"
                      className="p-1 text-black/60 hover:text-black hover:bg-black/10 rounded transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      title="Delete note"
                      className="p-1 text-black/60 hover:text-rose-700 hover:bg-rose-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Body */}
                <div className="space-y-1.5 flex-1">
                  <h4
                    style={{ color: colorMeta.textHex }}
                    className="text-xs font-bold leading-snug line-clamp-2"
                  >
                    {note.title}
                  </h4>
                  <p
                    style={{ color: colorMeta.textHex }}
                    className="text-[12px] whitespace-pre-wrap leading-relaxed opacity-90 line-clamp-6"
                  >
                    {note.content}
                  </p>
                </div>

                {/* Footer / Tags & Date */}
                <div className="pt-2 mt-2 border-t border-black/10 flex items-center justify-between text-[10px] text-black/60">
                  <div className="flex flex-wrap items-center gap-1 max-w-[140px] truncate">
                    {note.tags && note.tags.length > 0 ? (
                      note.tags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 rounded bg-black/10 text-black/80 font-medium text-[9px]"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="font-mono text-[9px] opacity-75">{note.id}</span>
                    )}
                  </div>
                  <span className="font-mono text-[9px] opacity-75">
                    {note.updatedAt?.slice(0, 10)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT STICKY NOTE MODAL WITH COLOR PICKER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                  <StickyIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingNoteId
                      ? language === 'LA'
                        ? 'ແກ້ໄຂໂນ໊ດຕິດ'
                        : 'Edit Sticky Note'
                      : language === 'LA'
                      ? 'ເພີ່ມໂນ໊ດຕິດໃໝ່'
                      : 'Create New Sticky Note'}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    {language === 'LA'
                      ? 'ເລືອກສີທີ່ຕ້ອງການ ແລະ ຂຽນບັນທຶກ'
                      : 'Choose note paper color and write thoughts.'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveNote} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {/* COLOR SELECTOR */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'LA' ? 'ເລືອກສີໂນ໊ດຕິດ (Select Color) *' : 'Select Note Color *'}</span>
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {STICKY_PALETTE.map((col) => {
                    const isSelected = selectedColor.toLowerCase() === col.hex.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setSelectedColor(col.hex)}
                        title={col.name}
                        style={{ backgroundColor: col.hex, borderColor: col.borderHex }}
                        className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center relative transition-transform cursor-pointer ${
                          isSelected
                            ? 'scale-105 ring-2 ring-blue-600 shadow-md'
                            : 'hover:scale-102 hover:shadow-xs'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-slate-900 drop-shadow-xs stroke-[3]" />
                        )}
                        <span className="text-[8px] font-bold text-slate-800/80 mt-0.5 truncate max-w-[36px]">
                          {col.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE PREVIEW BOX */}
              <div
                style={{
                  backgroundColor: selectedColor,
                  borderColor: getColorMeta(selectedColor).borderHex,
                }}
                className="p-3 rounded-xl border shadow-inner text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-black/60 pb-1 mb-1 border-b border-black/10">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Live Note Preview ({getColorMeta(selectedColor).name})</span>
                  </span>
                  {isPinned && <span className="font-bold text-amber-800">📌 Pinned</span>}
                </div>
                <div className="font-bold text-xs truncate">
                  {title.trim() || 'Your Note Title Will Appear Here'}
                </div>
                <div className="text-[11px] text-black/75 line-clamp-2 mt-0.5 whitespace-pre-wrap">
                  {content.trim() || 'Your note message and thoughts preview...'}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ຫົວຂໍ້ໂນ໊ດ *' : 'Note Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Budget Sync Takeaways, Staging Credentials, Slogan Ideas..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'LA' ? 'ເນື້ອໃນບັນທຶກ *' : 'Content & Thoughts *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your notes, checklist items, links, reminders..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-amber-500 font-sans"
                />
              </div>

              {/* Project association & Pin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ຜູກມັດກັບໂຄງການ' : 'Link to Project'}
                  </label>
                  <select
                    value={selectedProjId}
                    onChange={(e) => setSelectedProjId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="">
                      {language === 'LA' ? '-- ບໍ່ຜູກມັດ (General Notebook) --' : '-- General Notebook Note --'}
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'LA' ? 'ແທັກ (Tags)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Budget, Architecture, Urgent"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Pin Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-400"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'LA' ? 'ປັກໝຸດໄວ້ເທິງສຸດ (Pin to top)' : 'Pin Note to Top'}</span>
                </span>
              </label>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {editingNoteId
                      ? language === 'LA'
                        ? 'ບັນທຶກການແກ້ໄຂ'
                        : 'Update Note'
                      : language === 'LA'
                      ? 'ສ້າງໂນ໊ດຕິດ'
                      : 'Create Note'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
