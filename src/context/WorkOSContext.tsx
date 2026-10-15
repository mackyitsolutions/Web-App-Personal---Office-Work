import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, WorkCategory, Task } from '../types/workos';
import { api } from '../services/api';
import { Language, translations } from '../i18n/translations';

export type NavigationTab =
  | 'dashboard'
  | 'myday'
  | 'office' // Office Work
  | 'personal' // Personal Work
  | 'projects'
  | 'notebook' // Sticky Notes (main function)
  | 'meetings'
  | 'knowledge' // Knowledge Base
  | 'settings';

export type CategoryFilter = 'All' | 'Office' | 'Personal';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface WorkOSContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCategory: CategoryFilter;
  setSelectedCategory: (cat: CategoryFilter) => void;
  effectiveCategory?: WorkCategory;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['EN']) => string;
  isAdmin: boolean;
  currentAdminEmail: string;
  loginAsAdmin: (email?: string, password?: string) => boolean;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  user: UserProfile | null;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isQuickAddOpen: boolean;
  quickAddType: 'task' | 'journal' | 'meeting';
  openQuickAdd: (type?: 'task' | 'journal' | 'meeting') => void;
  closeQuickAdd: () => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  overdueCount: number;
}

const WorkOSContext = createContext<WorkOSContextType | undefined>(undefined);

export const WorkOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('workingspace_lang') as Language) || 'EN';
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Check saved admin session
    const saved = localStorage.getItem('workingspace_admin');
    return saved !== 'false'; // Default to admin for seamless full control
  });
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>(() => {
    return localStorage.getItem('workingspace_admin_email') || 'mackyitsolutions@gmail.com';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'journal' | 'meeting'>('task');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  const effectiveCategory: WorkCategory | undefined =
    selectedCategory === 'All' ? undefined : (selectedCategory as WorkCategory);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('workingspace_lang', lang);
  };

  const t = useCallback(
    (key: keyof typeof translations['EN']): string => {
      return translations[language][key] || translations['EN'][key] || key;
    },
    [language]
  );

  const loginAsAdmin = (email?: string, password?: string): boolean => {
    const adminEmail = email?.trim().toLowerCase() || currentAdminEmail || 'mackyitsolutions@gmail.com';
    setIsAdmin(true);
    setCurrentAdminEmail(adminEmail);
    localStorage.setItem('workingspace_admin', 'true');
    localStorage.setItem('workingspace_admin_email', adminEmail);
    addToast(t('loginSuccess'), 'success');
    setIsLoginModalOpen(false);
    return true;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.setItem('workingspace_admin', 'false');
    addToast(language === 'LA' ? 'ອອກຈາກສິດ Admin ແລ້ວ (ໂໝດພະນັກງານ)' : 'Logged out of Admin mode (Staff view)', 'info');
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Load user profile on mount
  useEffect(() => {
    api
      .getUser()
      .then(setUser)
      .catch((err) => console.error('Failed to load user profile:', err));
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Track overdue tasks count
  useEffect(() => {
    api
      .getTasks({ view: 'Overdue' })
      .then((tasks) => setOverdueCount(tasks.length))
      .catch(() => {});
  }, [refreshTrigger]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const openQuickAdd = (type: 'task' | 'journal' | 'meeting' = 'task') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => setIsQuickAddOpen(false);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.updateUser(updates);
      setUser(updated);
      addToast(language === 'LA' ? 'ອັບເດດໂປຣໄຟລ໌ສຳເລັດ' : 'User profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <WorkOSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        effectiveCategory,
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        isAdmin,
        currentAdminEmail,
        loginAsAdmin,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        user,
        updateUserProfile,
        isSidebarCollapsed,
        toggleSidebar,
        isQuickAddOpen,
        quickAddType,
        openQuickAdd,
        closeQuickAdd,
        isSearchOpen,
        openSearch,
        closeSearch,
        toasts,
        addToast,
        removeToast,
        refreshTrigger,
        triggerRefresh,
        overdueCount,
      }}
    >
      {children}
    </WorkOSContext.Provider>
  );
};

export const useWorkOS = () => {
  const context = useContext(WorkOSContext);
  if (!context) throw new Error('useWorkOS must be used within WorkOSProvider');
  return context;
};
