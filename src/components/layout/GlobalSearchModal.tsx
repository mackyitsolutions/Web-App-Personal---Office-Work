import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  CheckSquare,
  BookOpen,
  FolderKanban,
  Brain,
  Scale,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import {
  Task,
  JournalEntry,
  Project,
  ProblemRecord,
  DecisionRecord,
  MeetingRecord,
} from '../../types/workos';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, setActiveTab, effectiveCategory } = useWorkOS();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    tasks: Task[];
    journal: JournalEntry[];
    projects: Project[];
    problems: ProblemRecord[];
    decisions: DecisionRecord[];
    meetings: MeetingRecord[];
  }>({
    tasks: [],
    journal: [],
    projects: [],
    problems: [],
    decisions: [],
    meetings: [],
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], journal: [], projects: [], problems: [], decisions: [], meetings: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api
        .search(query, effectiveCategory)
        .then((res) => {
          setResults(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query, effectiveCategory]);

  if (!isSearchOpen) return null;

  const totalHits =
    results.tasks.length +
    results.journal.length +
    results.projects.length +
    results.problems.length +
    results.decisions.length +
    results.meetings.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records by keyword, ID, title, or details..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
          />
          {loading && <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />}
          <button
            onClick={closeSearch}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="py-12 text-center text-xs text-slate-400">
              Type keywords above to search across all WorkOS records...
            </div>
          )}

          {query.trim() && totalHits === 0 && !loading && (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks ({results.tasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTab('personal');
                      closeSearch();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          t.category === 'Office'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}
                      >
                        {t.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">{t.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Projects ({results.projects.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveTab('projects');
                      closeSearch();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">{p.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Office Work (Journal) */}
          {results.journal.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Office Work ({results.journal.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.journal.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => {
                      setActiveTab('office');
                      closeSearch();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {j.title}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">{j.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meetings */}
          {results.meetings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Meetings ({results.meetings.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.meetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setActiveTab('meetings');
                      closeSearch();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {m.title}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                      {m.dateTime.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Press ESC or click anywhere outside to close</span>
          <span className="flex items-center gap-1 font-medium">
            Jump to module <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
