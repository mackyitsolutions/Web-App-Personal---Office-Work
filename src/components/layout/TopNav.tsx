import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Building2,
  User,
  SlidersHorizontal,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Lock,
  UserPlus,
} from 'lucide-react';
import { LaoFlag, UKFlag } from '../common/FlagIcons';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { Task } from '../../types/workos';

export const TopNav: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    isAdmin,
    openLoginModal,
    user,
    openQuickAdd,
    openSearch,
    toggleSidebar,
    setActiveTab,
    refreshTrigger,
  } = useWorkOS();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getTasks({ view: 'Overdue' })
      .then(setUrgentTasks)
      .catch(() => {});
  }, [refreshTrigger]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-colors">
      {/* Left Area: Mobile Toggle & Category Filter */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 text-slate-500 rounded-lg md:hidden hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Work Category Segments */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200/70 dark:border-slate-700/60 shadow-inner">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedCategory === 'All'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('allRecords')}</span>
          </button>

          <button
            onClick={() => setSelectedCategory('Office')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedCategory === 'Office'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('officeOnly')}</span>
          </button>

          <button
            onClick={() => setSelectedCategory('Personal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedCategory === 'Personal'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('personalOnly')}</span>
          </button>
        </div>
      </div>

      {/* Middle Area: Global Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-4">
        <button
          onClick={openSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors group cursor-text"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('searchPlaceholder')}
            </span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Area: Language Switcher with Flags, Admin Status, Quick Add, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* LA / EN DUAL TOGGLE SWITCH WITH AUTHENTIC FLAG ICONS (Dark container, bright active badge) */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xs select-none">
          <button
            type="button"
            onClick={() => setLanguage('LA')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all duration-150 ${
              language === 'LA'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="ພາສາລາວ (Lao)"
          >
            <LaoFlag className="w-4.5 h-3.5" />
            <span className="tracking-wide font-sans">ລາວ</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('EN')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all duration-150 ${
              language === 'EN'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="English (EN)"
          >
            <UKFlag className="w-4.5 h-3.5" />
            <span className="tracking-wide font-sans">EN</span>
          </button>
        </div>

        {/* ADMIN STATUS / LOGIN PILL */}
        <div className="flex items-center gap-1">
          <button
            onClick={openLoginModal}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isAdmin
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 hover:bg-teal-100'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
            }`}
            title={isAdmin ? 'Admin Full Control Active (Click to manage admins & invites)' : 'Staff Mode (Click to Login as Admin)'}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t('admin')}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t('staff')}</span>
              </>
            )}
          </button>

          {/* Direct "Invite Admin" button in TopNav to avoid loss of accessibility */}
          <button
            onClick={openLoginModal}
            className="hidden md:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
            title={language === 'LA' ? 'ເຊີນ ຫຼື ສ້າງບັນຊີ Admin ໃໝ່ (Invite Admin)' : 'Invite new Admin by email to prevent losing access'}
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-[11px]">{t('inviteNewAdmin')}</span>
          </button>
        </div>

        {/* Quick Add CTA */}
        <button
          onClick={() => openQuickAdd('task')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition-all focus:outline-hidden"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('createRecord')}</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className="relative p-2 text-slate-600 rounded-lg hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {urgentTasks.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-850 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('overdue')} ({urgentTasks.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('personal');
                    setNotificationsOpen(false);
                  }}
                  className="text-xs text-teal-600 hover:underline dark:text-teal-400 font-medium"
                >
                  View Tasks
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {urgentTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/80" />
                    <span>No overdue commitments! All work on schedule.</span>
                  </div>
                ) : (
                  urgentTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveTab('personal');
                        setNotificationsOpen(false);
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            t.category === 'Office'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {t.category}
                        </span>
                        <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due {t.dueDate}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                        {t.title}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* User / Admin Profile Button */}
        <button
          onClick={openLoginModal}
          className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700"
        >
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
            {isAdmin ? 'AD' : 'ST'}
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200">
            {isAdmin ? 'Admin' : 'Staff'}
          </span>
        </button>
      </div>
    </header>
  );
};
