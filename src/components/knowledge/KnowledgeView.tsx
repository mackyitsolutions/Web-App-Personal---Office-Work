import React, { useState, useEffect } from 'react';
import {
  Library,
  Upload,
  Search,
  Building2,
  FileText,
  Download,
  Lock,
  Trash2,
  Loader2,
  X,
  FileCheck,
  ShieldCheck,
  HeartHandshake,
  Users,
  Eye,
  CheckCircle2,
  Tag,
  Paperclip,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { KnowledgeDocument, WorkCategory, ConfidentialityLevel } from '../../types/workos';

export const KnowledgeView: React.FC = () => {
  const { effectiveCategory, refreshTrigger, triggerRefresh, addToast, isAdmin, openLoginModal, t, language } =
    useWorkOS();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDoc, setActiveDoc] = useState<KnowledgeDocument | null>(null);

  // Upload Documentation Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<KnowledgeDocument['type']>('Benefits');
  const [newAudience, setNewAudience] = useState<'All Staff' | 'Office Staff' | 'New Hires'>('All Staff');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Staff Benefits, Healthcare');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getDocuments(effectiveCategory)
      .then((data) => {
        setDocuments(data);
        if (data.length > 0 && !activeDoc) {
          setActiveDoc(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load documents:', err);
        setLoading(false);
      });
  }, [effectiveCategory, refreshTrigger]);

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'All' && doc.type !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.tags?.some((t) => t.toLowerCase().includes(q)) ||
        doc.fileName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFileSize(`${sizeMB} MB`);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      openLoginModal();
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      addToast(language === 'LA' ? 'ກະລຸນາໃສ່ຫົວຂໍ້ ແລະ ເນື້ອໃນເອກະສານ' : 'Title and documentation content are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const tagsList = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await api.createDocument({
        category: 'Office',
        title: newTitle.trim(),
        type: newType,
        targetAudience: newAudience,
        content: newContent.trim(),
        tags: tagsList,
        owner: 'Admin Office',
        confidentiality: 'Internal',
        fileName: uploadedFileName || `${newTitle.replace(/\s+/g, '_')}.pdf`,
        fileSize: uploadedFileSize || '1.5 MB',
        downloadCount: 0,
      });

      addToast(
        language === 'LA'
          ? `ອັບໂຫລດເອກະສານ "${created.title}" ສຳເລັດແລ້ວ`
          : `Uploaded staff documentation: "${created.title}"`,
        'success'
      );
      setIsUploadModalOpen(false);
      setActiveDoc(created);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!isAdmin) {
      openLoginModal();
      return;
    }
    if (!window.confirm(language === 'LA' ? 'ຕ້ອງການລຶບເອກະສານນີ້ແທ້ບໍ່?' : 'Delete this office documentation?'))
      return;

    try {
      await api.deleteDocument(id);
      addToast(language === 'LA' ? 'ລຶບເອກະສານສຳເລັດແລ້ວ' : 'Document deleted', 'info');
      setActiveDoc(null);
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDownload = (doc: KnowledgeDocument) => {
    // Generate text/markdown downloadable blob for full functionality
    const blob = new Blob(
      [
        `====================================================\n${doc.title.toUpperCase()}\nType: ${doc.type} | Audience: ${doc.targetAudience || 'All Staff'}\nOwner: ${doc.owner} | Date: ${doc.createdAt}\n====================================================\n\n${doc.content}`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(language === 'LA' ? 'ກຳລັງດາວໂຫລດເອກະສານ...' : 'Downloading document file...', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {t('staffBenefitsTitle')}
            </span>
            <span className="text-xs text-slate-400">Official Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t('knowledgeBase')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-0.5">
            {t('staffBenefitsSubtitle')}
          </p>
        </div>

        {/* Upload Documentation Button (Admin Only or prompt login) */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-xs transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{t('uploadDocumentation')}</span>
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 rounded-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{t('adminLogin')} to Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'LA'
                ? 'ຄົ້ນຫາສະຫວັດດີການ, ປະກັນໄພ, ນະໂຍບາຍ, ຄູ່ມື...'
                : 'Search benefits, healthcare, leave policies, handbooks...'
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-hidden"
        >
          <option value="All">{language === 'LA' ? 'ທຸກໝວດໝູ່' : 'All Categories'}</option>
          <option value="Benefits">{language === 'LA' ? 'ສະຫວັດດີການພະນັກງານ' : 'Staff Benefits & Healthcare'}</option>
          <option value="Policy">{language === 'LA' ? 'ນະໂຍບາຍຫ້ອງການ' : 'Office Policies & Leave'}</option>
          <option value="Procedure">{language === 'LA' ? 'ຂັ້ນຕອນ SOP' : 'Standard Operating Procedures'}</option>
          <option value="Template">{language === 'LA' ? 'ແບບຟອມ & ເອກະສານ' : 'Templates & Forms'}</option>
        </select>
      </div>

      {/* Main Grid: Document List & Document Reader */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading documentation...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700">
          <Library className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {language === 'LA' ? 'ບໍ່ພົບເອກະສານ' : 'No documentation matches search'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {language === 'LA' ? 'Admin ສາມາດອັບໂຫລດເອກະສານສະຫວັດດີການໃຫ້ພະນັກງານໄດ້.' : 'Admin can upload benefits guidelines for office staff.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
            >
              {t('uploadDocumentation')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span>{language === 'LA' ? 'ລາຍການເອກະສານ' : 'Office Documents'} ({filteredDocs.length})</span>
              <span className="text-teal-600 dark:text-teal-400">{t('allStaff')}</span>
            </div>

            {filteredDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 dark:border-teal-500 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        doc.type === 'Benefits'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {doc.type === 'Benefits' ? (
                        <HeartHandshake className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      <span>{doc.type}</span>
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500">
                      {doc.targetAudience || 'All Staff'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {doc.title}
                  </h3>

                  {doc.fileName && (
                    <div className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-mono mt-2">
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate">{doc.fileName}</span>
                      {doc.fileSize && <span className="text-slate-400">({doc.fileSize})</span>}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags?.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Document Reader & Download Area */}
          {activeDoc && (
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                        {activeDoc.type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{activeDoc.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Audience: {activeDoc.targetAudience || 'All Staff'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeDoc.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDownload(activeDoc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('downloadDoc')}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteDocument(activeDoc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete document (Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* File Attachment Pill */}
                {activeDoc.fileName && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                        PDF
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {activeDoc.fileName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {activeDoc.fileSize || '1.8 MB'} · Verified Office Document
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(activeDoc)}
                      className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                )}

                {/* Document Body */}
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {activeDoc.content}
                </div>

                {/* Footer Metadata */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Authorized by: {activeDoc.owner}</span>
                  <span>Effective Date: {activeDoc.updatedAt.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN UPLOAD DOCUMENTATION MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('uploadDocumentation')}
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              {/* File Attachment Input */}
              <div className="p-4 rounded-xl border-2 border-dashed border-teal-500/40 bg-teal-50/30 dark:bg-teal-950/20 text-center space-y-2">
                <Upload className="w-8 h-8 text-teal-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {uploadedFileName ? uploadedFileName : 'Select or drop office document file'}
                </div>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 2026 Office Medical Insurance & Wellness Benefit Policy"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('docCategory')}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Benefits">Staff Benefits & Healthcare</option>
                    <option value="Policy">Office Policy & Handbook</option>
                    <option value="Procedure">Standard Operating Procedure</option>
                    <option value="Template">Forms & Templates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Staff Audience
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="All Staff">All Staff</option>
                    <option value="Office Staff">Office Staff</option>
                    <option value="New Hires">New Hires</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Summary & Key Guidelines Content *
                </label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Summarize benefits, claims process, contact numbers, and guidelines..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Staff Benefits, Health Insurance, Office Policy"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('uploadDocumentation')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
