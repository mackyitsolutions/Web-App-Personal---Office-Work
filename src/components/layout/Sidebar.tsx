import React from 'react';
import {
  LayoutDashboard,
  Sun,
  Building2,
  CheckSquare,
  FolderKanban,
  StickyNote,
  Calendar,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Shield,
  Lock,
} from 'lucide-react';
import { useWorkOS, NavigationTab } from '../../context/WorkOSContext';

interface NavItem {
  id: NavigationTab;
  labelKey:
    | 'dashboard'
    | 'myDay'
    | 'officeWork'
    | 'personalWork'
    | 'projects'
    | 'notebook'
    | 'meetings'
    | 'knowledgeBase'
    | 'settings';
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    selectedCategory,
    overdueCount,
    t,
    isAdmin,
    openLoginModal,
  } = useWorkOS();

  // Primary Workspace Modules:
  // Dashboard, My Day, Office Work, Personal Work, Projects, Sticky Notes, Meetings, Knowledge Base, Settings
  const navItems: NavItem[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { id: 'myday', labelKey: 'myDay', icon: Sun },
    { id: 'office', labelKey: 'officeWork', icon: Building2 },
    {
      id: 'personal',
      labelKey: 'personalWork',
      icon: CheckSquare,
      badge: overdueCount > 0 ? `${overdueCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'projects', labelKey: 'projects', icon: FolderKanban },
    { id: 'notebook', labelKey: 'notebook', icon: StickyNote },
    { id: 'meetings', labelKey: 'meetings', icon: Calendar },
    { id: 'knowledge', labelKey: 'knowledgeBase', icon: Library },
    { id: 'settings', labelKey: 'settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-300 ease-in-out select-none z-20
        ${isSidebarCollapsed ? 'w-18' : 'w-64'}
        bg-slate-900 text-slate-300 border-slate-800 dark:bg-slate-950 dark:border-slate-800/80`}
    >
      {/* Brand Header: Renamed to My Working Space */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {!isSidebarCollapsed && (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-600 text-white font-bold shadow-md shadow-teal-900/40">
              <ShieldCheck className="w-5 h-5 text-teal-100" />
            </div>
            <div className="truncate">
              <h1 className="font-bold text-white tracking-tight text-sm sm:text-base leading-tight truncate">
                {t('appName')}
              </h1>
              <span className="text-[10px] font-medium tracking-wide uppercase text-teal-400">
                {t('appSubtitle')}
              </span>
            </div>
          </div>
        )}

        {isSidebarCollapsed && (
          <div className="mx-auto flex items-center justify-center w-9 h-9 rounded-lg bg-teal-600 text-white font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors
            ${isSidebarCollapsed ? 'hidden md:block absolute -right-3 top-5 bg-slate-800 border border-slate-700 shadow-md' : ''}`}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Admin Privilege Status Badge */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div
            onClick={openLoginModal}
            className={`flex items-center justify-between px-3 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
              isAdmin
                ? 'bg-teal-950/40 border-teal-800/80 text-teal-300'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
            }`}
          >
            <span className="flex items-center gap-1.5 font-bold">
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('adminFullControl')}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('staffMode')}</span>
                </>
              )}
            </span>
            <span className="text-[10px] uppercase font-mono underline">
              {isAdmin ? 'Active' : 'Login'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const labelText = t(item.labelKey);

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isSidebarCollapsed ? labelText : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                ${
                  isActive
                    ? 'bg-teal-600/20 text-white border-l-3 border-teal-500 pl-[9px]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isSidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{labelText}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isSidebarCollapsed && (
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>My Working Space</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">v3.0.0</span>
        </div>
      )}
    </aside>
  );
};
