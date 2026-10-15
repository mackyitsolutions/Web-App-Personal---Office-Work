import {
  Task,
  JournalEntry,
  Project,
  ProblemRecord,
  DecisionRecord,
  MeetingRecord,
  Goal,
  KnowledgeDocument,
  AuditLog,
  UserProfile,
  WorkCategory,
  AdminUser,
  StickyNote,
  ProjectReminder,
} from '../types/workos';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // USER & PROFILE
  getUser: () => request<UserProfile>('/user'),
  updateUser: (profile: Partial<UserProfile>) =>
    request<UserProfile>('/user', { method: 'PUT', body: JSON.stringify(profile) }),
  resetDatabase: () => request<{ message: string }>('/settings/reset', { method: 'POST' }),
  getAuditLogs: (category?: WorkCategory) =>
    request<AuditLog[]>(`/audit${category ? `?category=${category}` : ''}`),

  // ADMIN ACCOUNTS MANAGEMENT
  getAdminUsers: () => request<AdminUser[]>('/admin/users'),
  inviteAdminUser: (data: {
    email: string;
    name?: string;
    role?: 'Administrator' | 'Backup Admin';
    notes?: string;
  }) => request<AdminUser>('/admin/invite', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminUser: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
  validateAdmin: (email: string) =>
    request<{ isValid: boolean; email: string }>('/admin/validate', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // DASHBOARD & REPORTS
  getSummary: (category?: WorkCategory) =>
    request<any>(`/reports/summary${category ? `?category=${category}` : ''}`),

  // TASKS
  getTasks: (params?: {
    category?: WorkCategory;
    view?: string;
    status?: string;
    priority?: string;
    projectId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.view) query.set('view', params.view);
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.projectId) query.set('projectId', params.projectId);
    const qs = query.toString();
    return request<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },
  getTaskById: (id: string) => request<Task>(`/tasks/${id}`),
  createTask: (data: Partial<Task>) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),

  // WORK JOURNAL
  getJournal: (category?: WorkCategory) =>
    request<JournalEntry[]>(`/journal${category ? `?category=${category}` : ''}`),
  createJournalEntry: (data: Partial<JournalEntry>) =>
    request<JournalEntry>('/journal', { method: 'POST', body: JSON.stringify(data) }),
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) =>
    request<JournalEntry>(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJournalEntry: (id: string) =>
    request<{ message: string }>(`/journal/${id}`, { method: 'DELETE' }),
  convertJournalToTask: (id: string) =>
    request<Task>(`/journal/${id}/convert-to-task`, { method: 'POST' }),

  // PROJECTS
  getProjects: (category?: WorkCategory) =>
    request<(Project & { calculatedProgress: number; linkedTasksCount: number; completedTasksCount: number })[]>(
      `/projects${category ? `?category=${category}` : ''}`
    ),
  getProjectById: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project>) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),

  // STICKY NOTES / NOTEBOOK
  getStickyNotes: (params?: { projectId?: string; category?: WorkCategory }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.category) query.set('category', params.category);
    const qs = query.toString();
    return request<StickyNote[]>(`/sticky-notes${qs ? `?${qs}` : ''}`);
  },
  createStickyNote: (data: Partial<StickyNote>) =>
    request<StickyNote>('/sticky-notes', { method: 'POST', body: JSON.stringify(data) }),
  updateStickyNote: (id: string, data: Partial<StickyNote>) =>
    request<StickyNote>(`/sticky-notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStickyNote: (id: string) =>
    request<{ message: string }>(`/sticky-notes/${id}`, { method: 'DELETE' }),

  // REMINDERS
  getReminders: (params?: { projectId?: string; category?: WorkCategory }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.category) query.set('category', params.category);
    const qs = query.toString();
    return request<ProjectReminder[]>(`/reminders${qs ? `?${qs}` : ''}`);
  },
  createReminder: (data: Partial<ProjectReminder>) =>
    request<ProjectReminder>('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  updateReminder: (id: string, data: Partial<ProjectReminder>) =>
    request<ProjectReminder>(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReminder: (id: string) =>
    request<{ message: string }>(`/reminders/${id}`, { method: 'DELETE' }),

  // PROBLEMS
  getProblems: (category?: WorkCategory) =>
    request<ProblemRecord[]>(`/problems${category ? `?category=${category}` : ''}`),
  createProblem: (data: Partial<ProblemRecord>) =>
    request<ProblemRecord>('/problems', { method: 'POST', body: JSON.stringify(data) }),
  updateProblem: (id: string, data: Partial<ProblemRecord>) =>
    request<ProblemRecord>(`/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProblem: (id: string) =>
    request<{ message: string }>(`/problems/${id}`, { method: 'DELETE' }),
  aiAnalyzeProblem: (id: string) =>
    request<{ analysis: string }>(`/problems/${id}/ai-analyze`, { method: 'POST' }),

  // DECISIONS
  getDecisions: (category?: WorkCategory) =>
    request<DecisionRecord[]>(`/decisions${category ? `?category=${category}` : ''}`),
  createDecision: (data: Partial<DecisionRecord>) =>
    request<DecisionRecord>('/decisions', { method: 'POST', body: JSON.stringify(data) }),
  updateDecision: (id: string, data: Partial<DecisionRecord>) =>
    request<DecisionRecord>(`/decisions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDecision: (id: string) =>
    request<{ message: string }>(`/decisions/${id}`, { method: 'DELETE' }),

  // MEETINGS
  getMeetings: (category?: WorkCategory) =>
    request<MeetingRecord[]>(`/meetings${category ? `?category=${category}` : ''}`),
  createMeeting: (data: Partial<MeetingRecord>) =>
    request<MeetingRecord>('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  updateMeeting: (id: string, data: Partial<MeetingRecord>) =>
    request<MeetingRecord>(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMeeting: (id: string) =>
    request<{ message: string }>(`/meetings/${id}`, { method: 'DELETE' }),
  convertMeetingActionToTask: (meetingId: string, actionId: string) =>
    request<Task>(`/meetings/${meetingId}/actions/${actionId}/convert-to-task`, { method: 'POST' }),

  // GOALS
  getGoals: (category?: WorkCategory) =>
    request<Goal[]>(`/goals${category ? `?category=${category}` : ''}`),
  createGoal: (data: Partial<Goal>) =>
    request<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, data: Partial<Goal>) =>
    request<Goal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id: string) =>
    request<{ message: string }>(`/goals/${id}`, { method: 'DELETE' }),

  // DOCUMENTS
  getDocuments: (category?: WorkCategory) =>
    request<KnowledgeDocument[]>(`/documents${category ? `?category=${category}` : ''}`),
  createDocument: (data: Partial<KnowledgeDocument>) =>
    request<KnowledgeDocument>('/documents', { method: 'POST', body: JSON.stringify(data) }),
  updateDocument: (id: string, data: Partial<KnowledgeDocument>) =>
    request<KnowledgeDocument>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDocument: (id: string) =>
    request<{ message: string }>(`/documents/${id}`, { method: 'DELETE' }),

  // COMMUNICATIONS
  generateCommunication: (payload: {
    templateType: string;
    style: string;
    context: string;
    recipient?: string;
    objective?: string;
    keyPoints?: string;
  }) =>
    request<{ draft: string }>('/communication/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // GLOBAL SEARCH
  search: (query: string, category?: WorkCategory) => {
    const q = encodeURIComponent(query);
    const cat = category ? `&category=${category}` : '';
    return request<{
      tasks: Task[];
      journal: JournalEntry[];
      projects: Project[];
      problems: ProblemRecord[];
      decisions: DecisionRecord[];
      meetings: MeetingRecord[];
    }>(`/search?q=${q}${cat}`);
  },
};
