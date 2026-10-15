/**
 * Data Models & Types for My WorkOS — Personal & Office Management System
 */

export type WorkCategory = 'Office' | 'Personal';

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskStatus =
  | 'Planned'
  | 'Not Started'
  | 'In Progress'
  | 'Blocked'
  | 'Waiting for Approval'
  | 'Completed'
  | 'Cancelled';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string; // e.g. TSK-1001
  title: string;
  category: WorkCategory; // Mandatory: Office or Personal
  description?: string;
  checklist?: TaskChecklistItem[]; // Subtask checklist items to ensure tasks are completed step-by-step
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  dueDate?: string;
  reminderDate?: string;
  nextAction?: string;
  projectId?: string;
  projectTitle?: string;
  responsiblePerson?: string;
  relatedMeetingId?: string;
  relatedDecisionId?: string;
  documentLinks?: string[];
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isArchived?: boolean;
}

export interface JournalEntry {
  id: string; // e.g. JRN-2001
  date: string;
  time: string;
  category: WorkCategory;
  title: string;
  description: string;
  objective?: string;
  actionsPerformed: string;
  results?: string;
  challenges?: string;
  lessonsLearned?: string;
  timeSpentMinutes?: number;
  projectId?: string;
  taskId?: string;
  supportingEvidence?: string;
  nextAction?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  status: 'Pending' | 'In Review' | 'Accepted';
}

export interface Project {
  id: string; // e.g. PRJ-3001
  name: string;
  category: WorkCategory;
  objective: string;
  scope?: string;
  expectedResults?: string;
  owner: string;
  stakeholders?: string[];
  startDate: string;
  targetCompletionDate: string;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  status: ProjectStatus;
  risks?: string[];
  dependencies?: string[];
  linkedTaskIds?: string[];
  documentLinks?: string[];
  closureSummary?: string;
  lessonsLearned?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemOption {
  id: string;
  name: string;
  description: string;
  advantages: string;
  disadvantages: string;
  estimatedCost: string;
  estimatedEffort: 'Low' | 'Medium' | 'High';
  risks: string;
}

export interface ProblemRecord {
  id: string; // e.g. PRB-4001
  category: WorkCategory;
  title: string;
  problemStatement: string;
  dateIdentified: string;
  currentSituation: string;
  factsAndEvidence: string[];
  missingInformation: string[];
  assumptionsAndUncertainties: string[];
  impactAndUrgency: 'Low' | 'Medium' | 'High' | 'Critical';
  stakeholdersAffected: string[];
  immediateContainmentAction: string;
  rootCauseAnalysis: {
    method: 'Five Whys' | 'Cause and Effect' | 'Fault Tree';
    fiveWhys?: string[];
    contributingFactors?: string[];
    summaryRootCause?: string;
  };
  possibleSolutions: ProblemOption[];
  recommendedSolution?: string;
  recommendationRationale?: string;
  requiredApproval?: string;
  actionPlan?: string;
  responsiblePerson?: string;
  deadline?: string;
  successCriteria?: string;
  verificationResults?: string;
  lessonsLearned?: string;
  status: 'Investigating' | 'Containment Implemented' | 'Solution Selected' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export type DecisionStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Implemented'
  | 'Reviewed';

export interface DecisionOption {
  id: string;
  name: string;
  benefits: string;
  tradeOffs: string;
  riskRating: 'Low' | 'Medium' | 'High';
}

export interface DecisionRecord {
  id: string; // e.g. DEC-5001
  category: WorkCategory;
  title: string;
  background: string;
  businessProblemOrOpportunity: string;
  optionsConsidered: DecisionOption[];
  supportingEvidence: string;
  assumptions: string;
  recommendedOption: string;
  decisionOwner: string;
  approvalAuthority: string;
  status: DecisionStatus;
  decisionDate?: string;
  implementationActions: string[];
  reviewDate?: string;
  actualOutcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingActionItem {
  id: string;
  description: string;
  responsiblePerson: string;
  deadline: string;
  convertedTaskId?: string;
  status: 'Open' | 'Completed';
}

export interface MeetingRecord {
  id: string; // e.g. MTG-6001
  category: WorkCategory;
  title: string;
  dateTime: string;
  purpose: string;
  participants: string[];
  agenda: string[];
  discussionNotes: string;
  keyIssues: string[];
  decisionsMade: string[];
  actionItems: MeetingActionItem[];
  supportingDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export type CommunicationStyle =
  | 'Concise'
  | 'Diplomatic'
  | 'Formal'
  | 'Persuasive'
  | 'Technical'
  | 'Executive';

export interface Goal {
  id: string; // e.g. GOL-7001
  category: WorkCategory;
  title: string;
  description: string;
  targetDate: string;
  milestones: { id: string; title: string; completed: boolean }[];
  progressPercentage: number;
  successCriteria: string;
  relatedTaskIds?: string[];
  reviewNotes?: string;
  weeklyObstacles?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ConfidentialityLevel = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export interface KnowledgeDocument {
  id: string; // e.g. DOC-8001
  category: WorkCategory;
  title: string;
  type: 'Benefits' | 'Policy' | 'Procedure' | 'Work Instruction' | 'Template' | 'Reference' | 'Guidance';
  content: string;
  tags: string[];
  owner: string;
  confidentiality: ConfidentialityLevel;
  targetAudience?: 'All Staff' | 'Office Staff' | 'New Hires';
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64 or attachment data
  downloadCount?: number;
  relatedProjectId?: string;
  externalLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'EXPORT';
  entityType: 'Task' | 'Journal' | 'Project' | 'Problem' | 'Decision' | 'Meeting' | 'Goal' | 'Document' | 'User' | 'Admin';
  entityId: string;
  category: WorkCategory;
  summary: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  avatarUrl?: string;
  role: 'User' | 'Manager' | 'Executive';
  privacyPinEnabled: boolean;
}

export interface AdminUser {
  id: string; // e.g. ADM-001
  email: string;
  name?: string;
  role: 'Primary Owner' | 'Administrator' | 'Backup Admin';
  status: 'Active' | 'Pending Invitation';
  invitedBy: string;
  invitedAt: string;
  lastLoginAt?: string;
  inviteCode?: string;
  notes?: string;
}

export interface StickyNote {
  id: string; // e.g. STK-1001
  projectId?: string;
  projectTitle?: string;
  title: string;
  content: string;
  color: string; // e.g. 'yellow' | 'peach' | 'rose' | 'sky' | 'mint' | 'lavender' or hex
  isPinned?: boolean;
  category?: WorkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectReminder {
  id: string; // e.g. REM-1001
  projectId?: string;
  projectTitle?: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  isCompleted: boolean;
  category?: WorkCategory;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOSDatabase {
  user: UserProfile;
  adminUsers?: AdminUser[];
  tasks: Task[];
  journal: JournalEntry[];
  projects: Project[];
  problems: ProblemRecord[];
  decisions: DecisionRecord[];
  meetings: MeetingRecord[];
  goals: Goal[];
  documents: KnowledgeDocument[];
  auditLogs: AuditLog[];
  stickyNotes?: StickyNote[];
  reminders?: ProjectReminder[];
}
