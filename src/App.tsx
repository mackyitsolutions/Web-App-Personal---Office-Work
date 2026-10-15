import React from 'react';
import { WorkOSProvider, useWorkOS, NavigationTab } from './context/WorkOSContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { QuickAddModal } from './components/layout/QuickAddModal';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ToastContainer } from './components/layout/ToastContainer';
import { AdminLoginModal } from './components/auth/AdminLoginModal';

// Active Module Views (Pruned to requested 8 modules)
import { DashboardView } from './components/dashboard/DashboardView';
import { MyDayView } from './components/myday/MyDayView';
import { JournalView } from './components/journal/JournalView'; // Office Work
import { TasksView } from './components/tasks/TasksView'; // Personal Work
import { ProjectsView } from './components/projects/ProjectsView';
import { NotebookView } from './components/notebook/NotebookView'; // Notebook & Sticky Notes (main function)
import { MeetingsView } from './components/meetings/MeetingsView';
import { KnowledgeView } from './components/knowledge/KnowledgeView'; // Staff Documentation & Benefits
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useWorkOS();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'myday':
        return <MyDayView />;
      case 'office':
        return <JournalView />;
      case 'personal':
        return <TasksView />;
      case 'projects':
        return <ProjectsView />;
      case 'notebook':
        return <NotebookView />;
      case 'meetings':
        return <MeetingsView />;
      case 'knowledge':
        return <KnowledgeView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans antialiased">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Container */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Top Executive Navigation Bar with LA/EN Flags & Admin Status */}
        <TopNav />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl w-full mx-auto custom-scrollbar">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <QuickAddModal />
      <GlobalSearchModal />
      <AdminLoginModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WorkOSProvider>
      <MainContent />
    </WorkOSProvider>
  );
}
