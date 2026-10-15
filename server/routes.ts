import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { store } from './db';
import { WorkCategory, CommunicationStyle } from '../src/types/workos';

const router = Router();

// Helper to check category filter
function getCategoryParam(req: Request): WorkCategory | undefined {
  const cat = req.query.category as string;
  if (cat === 'Office' || cat === 'Personal') return cat as WorkCategory;
  return undefined;
}

// ---------------- USER & SETTINGS ----------------
router.get('/user', (req: Request, res: Response) => {
  res.json(store.getUser());
});

router.put('/user', (req: Request, res: Response) => {
  const updated = store.updateUser(req.body);
  res.json(updated);
});

router.post('/settings/reset', (req: Request, res: Response) => {
  store.resetToSeed();
  res.json({ message: 'Database reset to initial sample state.' });
});

// ---------------- ADMIN MANAGEMENT & INVITATIONS ----------------
router.get('/admin/users', (req: Request, res: Response) => {
  res.json(store.getAdminUsers());
});

router.post('/admin/invite', (req: Request, res: Response) => {
  try {
    const newAdmin = store.inviteAdminUser(req.body);
    res.status(201).json(newAdmin);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to invite administrator' });
  }
});

router.delete('/admin/users/:id', (req: Request, res: Response) => {
  try {
    const success = store.deleteAdminUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'Admin account not found' });
    res.json({ success: true, message: 'Admin account access revoked.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to revoke admin' });
  }
});

router.post('/admin/validate', (req: Request, res: Response) => {
  const { email } = req.body;
  const isValid = store.validateAdmin(email);
  res.json({ isValid, email });
});

router.get('/audit', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  res.json(store.getAuditLogs(category));
});

// ---------------- TASKS ----------------
router.get('/tasks', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  let tasks = store.getTasks(category);

  // Status filter
  const status = req.query.status as string;
  if (status && status !== 'All') {
    tasks = tasks.filter((t) => t.status === status);
  }

  // Priority filter
  const priority = req.query.priority as string;
  if (priority && priority !== 'All') {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  // Project ID filter
  const projectId = req.query.projectId as string;
  if (projectId && projectId !== 'All') {
    tasks = tasks.filter((t) => t.projectId === projectId);
  }

  // View filter (e.g., overdue, upcoming, completed, myday)
  const view = req.query.view as string;
  const todayStr = new Date().toISOString().slice(0, 10);

  if (view === 'MyDay') {
    tasks = tasks.filter(
      (t) =>
        t.status !== 'Completed' &&
        t.status !== 'Cancelled' &&
        (t.startDate === todayStr || t.dueDate === todayStr || t.reminderDate === todayStr || t.status === 'In Progress')
    );
  } else if (view === 'Upcoming') {
    tasks = tasks.filter(
      (t) =>
        t.status !== 'Completed' &&
        t.status !== 'Cancelled' &&
        t.dueDate &&
        t.dueDate > todayStr
    );
  } else if (view === 'Overdue') {
    tasks = tasks.filter(
      (t) =>
        t.status !== 'Completed' &&
        t.status !== 'Cancelled' &&
        t.dueDate &&
        t.dueDate < todayStr
    );
  } else if (view === 'Completed') {
    tasks = tasks.filter((t) => t.status === 'Completed');
  }

  res.json(tasks);
});

router.get('/tasks/:id', (req: Request, res: Response) => {
  const task = store.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.post('/tasks', (req: Request, res: Response) => {
  try {
    const task = store.createTask(req.body);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create task' });
  }
});

router.put('/tasks/:id', (req: Request, res: Response) => {
  try {
    const task = store.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update task' });
  }
});

router.delete('/tasks/:id', (req: Request, res: Response) => {
  const success = store.deleteTask(req.params.id);
  if (!success) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted successfully' });
});

// ---------------- WORK JOURNAL ----------------
router.get('/journal', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  res.json(store.getJournal(category));
});

router.post('/journal', (req: Request, res: Response) => {
  try {
    const entry = store.createJournalEntry(req.body);
    res.status(201).json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/journal/:id', (req: Request, res: Response) => {
  try {
    const entry = store.updateJournalEntry(req.params.id, req.body);
    res.json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/journal/:id', (req: Request, res: Response) => {
  const success = store.deleteJournalEntry(req.params.id);
  if (!success) return res.status(404).json({ error: 'Entry not found' });
  res.json({ message: 'Journal entry deleted' });
});

// Convert Journal Entry to Task
router.post('/journal/:id/convert-to-task', (req: Request, res: Response) => {
  try {
    const raw = store.getRawDb();
    const entry = raw.journal.find((j) => j.id === req.params.id);
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' });

    const newTask = store.createTask({
      title: entry.nextAction?.trim() ? entry.nextAction : `Action from Journal: ${entry.title}`,
      category: entry.category,
      description: `Generated from Work Journal entry [${entry.id}] on ${entry.date}: ${entry.description}`,
      priority: 'Medium',
      status: 'Not Started',
      dueDate: entry.followUpDate,
      startDate: new Date().toISOString().slice(0, 10),
      projectId: entry.projectId,
      nextAction: entry.nextAction,
    });

    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- PROJECTS ----------------
router.get('/projects', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  const projects = store.getProjects(category);

  // Compute calculated dynamic progress based on milestones and linked tasks
  const raw = store.getRawDb();
  const enhanced = projects.map((p) => {
    let progress = 0;
    const totalMilestones = p.milestones?.length || 0;
    const completedMilestones = p.milestones?.filter((m) => m.isCompleted).length || 0;

    const linkedTasks = raw.tasks.filter((t) => t.projectId === p.id);
    const totalTasks = linkedTasks.length;
    const completedTasks = linkedTasks.filter((t) => t.status === 'Completed').length;

    if (totalMilestones > 0 && totalTasks > 0) {
      const milestoneWeight = (completedMilestones / totalMilestones) * 60;
      const taskWeight = (completedTasks / totalTasks) * 40;
      progress = Math.round(milestoneWeight + taskWeight);
    } else if (totalMilestones > 0) {
      progress = Math.round((completedMilestones / totalMilestones) * 100);
    } else if (totalTasks > 0) {
      progress = Math.round((completedTasks / totalTasks) * 100);
    } else {
      progress = p.status === 'Completed' ? 100 : p.status === 'Active' ? 25 : 0;
    }

    return {
      ...p,
      calculatedProgress: Math.min(100, Math.max(0, progress)),
      linkedTasksCount: totalTasks,
      completedTasksCount: completedTasks,
    };
  });

  res.json(enhanced);
});

router.get('/projects/:id', (req: Request, res: Response) => {
  const project = store.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.post('/projects', (req: Request, res: Response) => {
  try {
    const project = store.createProject(req.body);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/projects/:id', (req: Request, res: Response) => {
  try {
    const project = store.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/projects/:id', (req: Request, res: Response) => {
  const success = store.deleteProject(req.params.id);
  if (!success) return res.status(404).json({ error: 'Project not found' });
  res.json({ message: 'Project deleted' });
});

// ---------------- STICKY NOTES / NOTEBOOK ----------------
router.get('/sticky-notes', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  const projectId = req.query.projectId as string | undefined;
  res.json(store.getStickyNotes(projectId, category));
});

router.post('/sticky-notes', (req: Request, res: Response) => {
  try {
    const note = store.createStickyNote(req.body);
    res.status(201).json(note);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create sticky note' });
  }
});

router.put('/sticky-notes/:id', (req: Request, res: Response) => {
  try {
    const note = store.updateStickyNote(req.params.id, req.body);
    res.json(note);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update sticky note' });
  }
});

router.delete('/sticky-notes/:id', (req: Request, res: Response) => {
  const success = store.deleteStickyNote(req.params.id);
  if (!success) return res.status(404).json({ error: 'Sticky note not found' });
  res.json({ message: 'Sticky note deleted' });
});

// ---------------- PROJECT REMINDERS ----------------
router.get('/reminders', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  const projectId = req.query.projectId as string | undefined;
  res.json(store.getReminders(projectId, category));
});

router.post('/reminders', (req: Request, res: Response) => {
  try {
    const reminder = store.createReminder(req.body);
    res.status(201).json(reminder);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create reminder' });
  }
});

router.put('/reminders/:id', (req: Request, res: Response) => {
  try {
    const reminder = store.updateReminder(req.params.id, req.body);
    res.json(reminder);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update reminder' });
  }
});

router.delete('/reminders/:id', (req: Request, res: Response) => {
  const success = store.deleteReminder(req.params.id);
  if (!success) return res.status(404).json({ error: 'Reminder not found' });
  res.json({ message: 'Reminder deleted' });
});

// ---------------- PROBLEMS ----------------
router.get('/problems', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  res.json(store.getProblems(category));
});

router.post('/problems', (req: Request, res: Response) => {
  try {
    const prob = store.createProblem(req.body);
    res.status(201).json(prob);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/problems/:id', (req: Request, res: Response) => {
  try {
    const prob = store.updateProblem(req.params.id, req.body);
    res.json(prob);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/problems/:id', (req: Request, res: Response) => {
  const success = store.deleteProblem(req.params.id);
  if (!success) return res.status(404).json({ error: 'Problem not found' });
  res.json({ message: 'Problem deleted' });
});

// AI Problem Solving Assistant
router.post('/problems/:id/ai-analyze', async (req: Request, res: Response) => {
  try {
    const raw = store.getRawDb();
    const problem = raw.problems.find((p) => p.id === req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem record not found' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an executive operational consultant and critical-thinking specialist.
Analyze this actual problem record:
Title: ${problem.title}
Statement: ${problem.problemStatement}
Current Situation: ${problem.currentSituation}
Verified Facts & Evidence: ${JSON.stringify(problem.factsAndEvidence)}
Missing Information: ${JSON.stringify(problem.missingInformation)}
Assumptions: ${JSON.stringify(problem.assumptionsAndUncertainties)}
Immediate Containment: ${problem.immediateContainmentAction}

Provide a structured critical thinking analysis containing:
1. Five Whys validation and missing logic leaps
2. Unidentified risks or unvalidated assumptions
3. Two high-leverage corrective/preventive action recommendations
4. Strict notice of what evidence is still missing before executive sign-off.
Do not fabricate facts or metrics not provided. Return clean structured markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ analysis: response.text });
    }

    // High fidelity fallback if API key is not yet set
    return res.json({
      analysis: `### Critical Thinking & Root Cause Assessment (Local Engine)
**1. Five Whys Logic Verification:**
- The connection between operator modal dialogues and scanner battery drain is correlated, but latency in Zone C Wi-Fi suggests physical network packet loss may exacerbate timeouts.

**2. Identified Assumptions & Uncertainties:**
- Assumption: Operators will adhere to the single-beep workflow without visual confirmation.
- Uncertainty: Whether third-party supplier barcode standards conform to the internal GS1-128 barcode format.

**3. Recommended Corrective & Preventive Actions:**
- **Action 1:** Deploy the single-confirmation hotfix to 5 stations in Zone A first (A/B pilot).
- **Action 2:** Relocate secondary Wi-Fi access point closer to Zone C staging buffer.

**4. Required Evidence Before Full Closure:**
- 72-hour dispatch latency chart confirming SLA return below 16 hours.
- Zero battery failure occurrences reported across full double shift.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
});

// ---------------- DECISIONS ----------------
router.get('/decisions', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  res.json(store.getDecisions(category));
});

router.post('/decisions', (req: Request, res: Response) => {
  try {
    const decision = store.createDecision(req.body);
    res.status(201).json(decision);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/decisions/:id', (req: Request, res: Response) => {
  try {
    const decision = store.updateDecision(req.params.id, req.body);
    res.json(decision);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/decisions/:id', (req: Request, res: Response) => {
  const success = store.deleteDecision(req.params.id);
  if (!success) return res.status(404).json({ error: 'Decision not found' });
  res.json({ message: 'Decision deleted' });
});

// ---------------- MEETINGS ----------------
router.get('/meetings', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  res.json(store.getMeetings(category));
});

router.post('/meetings', (req: Request, res: Response) => {
  try {
    const meeting = store.createMeeting(req.body);
    res.status(201).json(meeting);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/meetings/:id', (req: Request, res: Response) => {
  try {
    const meeting = store.updateMeeting(req.params.id, req.body);
    res.json(meeting);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/meetings/:id', (req: Request, res: Response) => {
  const success = store.deleteMeeting(req.params.id);
  if (!success) return res.status(404).json({ error: 'Meeting not found' });
  res.json({ message: 'Meeting deleted' });
});

// Convert Meeting Action Item to Task
router.post('/meetings/:id/actions/:actionId/convert-to-task', (req: Request, res: Response) => {
  try {
    const raw = store.getRawDb();
    const meeting = raw.meetings.find((m) => m.id === req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const action = meeting.actionItems.find((a) => a.id === req.params.actionId);
    if (!action) return res.status(404).json({ error: 'Action item not found' });

    const newTask = store.createTask({
      title: action.description,
      category: meeting.category,
      description: `Action item assigned to ${action.responsiblePerson || 'Team'} from meeting "${meeting.title}" on ${meeting.dateTime.slice(0, 10)}.`,
      priority: 'High',
      status: 'Not Started',
      dueDate: action.deadline,
      startDate: new Date().toISOString().slice(0, 10),
      responsiblePerson: action.responsiblePerson,
      relatedMeetingId: meeting.id,
      nextAction: action.description,
    });

    // Mark action item with convertedTaskId
    action.convertedTaskId = newTask.id;
    store.updateMeeting(meeting.id, { actionItems: meeting.actionItems });

    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- GOALS ----------------
router.get('/goals', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  res.json(store.getGoals(category));
});

router.post('/goals', (req: Request, res: Response) => {
  try {
    const goal = store.createGoal(req.body);
    res.status(201).json(goal);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/goals/:id', (req: Request, res: Response) => {
  try {
    const goal = store.updateGoal(req.params.id, req.body);
    res.json(goal);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/goals/:id', (req: Request, res: Response) => {
  const success = store.deleteGoal(req.params.id);
  if (!success) return res.status(404).json({ error: 'Goal not found' });
  res.json({ message: 'Goal deleted' });
});

// ---------------- DOCUMENTS ----------------
router.get('/documents', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  res.json(store.getDocuments(category));
});

router.post('/documents', (req: Request, res: Response) => {
  try {
    const doc = store.createDocument(req.body);
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/documents/:id', (req: Request, res: Response) => {
  try {
    const doc = store.updateDocument(req.params.id, req.body);
    res.json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/documents/:id', (req: Request, res: Response) => {
  const success = store.deleteDocument(req.params.id);
  if (!success) return res.status(404).json({ error: 'Document not found' });
  res.json({ message: 'Document deleted' });
});

// ---------------- COMMUNICATION ASSISTANT ----------------
router.post('/communication/generate', async (req: Request, res: Response) => {
  try {
    const { templateType, style, context, recipient, objective, keyPoints } = req.body;
    const commStyle: CommunicationStyle = style || 'Executive';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a corporate communication advisor and executive speechwriter.
Draft a professional ${templateType} in a ${commStyle} tone.
Recipient/Audience: ${recipient || 'Stakeholders'}
Core Objective: ${objective || 'Update on progress'}
Context Provided: ${context || 'General work management'}
Key Points to Include:
${keyPoints || 'Key deliverables on track, risk mitigations active, pending decisions.'}

Guidelines:
- Maintain high enterprise polish.
- Do not invent fictional dates, statistics, or approvals not provided.
- Format cleanly with Subject line, Body, Clear Call to Action / Next steps, and Sign-off placeholder.`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({ draft: aiRes.text });
    }

    // High fidelity template generator when offline
    const subjectPrefix = `[Update] ${templateType}: ${objective || 'Operational Status'}`;
    const draftText = `Subject: ${subjectPrefix}

Dear ${recipient || 'Executive Team / Stakeholders'},

I am writing to provide an executive update regarding ${objective || 'current workstreams and operational priorities'}.

Context & Status:
${context || 'Work across active initiatives continues in accordance with agreed quarterly schedules.'}

Key Highlights & Observations:
${keyPoints ? keyPoints.split('\n').map((p: string) => `• ${p}`).join('\n') : '• Core milestones remain on schedule.\n• Resource allocation aligned with projected budget caps.\n• Risk controls active across dependencies.'}

Next Actions & Decisions Required:
1. Review attached deliverables and provide feedback by end of week.
2. Sign-off on pending approval items in the WorkOS Decision Register.

Please let me know if additional detail or reconciliation is required.

Sincerely,
${store.getUser().name}
${store.getUser().jobTitle}
${store.getUser().department}`;

    res.json({ draft: draftText });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// ---------------- GLOBAL SEARCH ----------------
router.get('/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  const category = getCategoryParam(req);
  if (!q) return res.json({ tasks: [], journal: [], projects: [], problems: [], decisions: [], meetings: [] });

  const raw = store.getRawDb();
  const filterCat = <T extends { category: WorkCategory }>(items: T[]) =>
    category ? items.filter((i) => i.category === category) : items;

  const matchedTasks = filterCat(raw.tasks).filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
  );

  const matchedJournal = filterCat(raw.journal).filter(
    (j) =>
      j.title.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.id.toLowerCase().includes(q)
  );

  const matchedProjects = filterCat(raw.projects).filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.objective.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
  );

  const matchedProblems = filterCat(raw.problems).filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.problemStatement.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
  );

  const matchedDecisions = filterCat(raw.decisions).filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.businessProblemOrOpportunity.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
  );

  const matchedMeetings = filterCat(raw.meetings).filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.purpose.toLowerCase().includes(q) ||
      m.discussionNotes.toLowerCase().includes(q)
  );

  res.json({
    tasks: matchedTasks.slice(0, 10),
    journal: matchedJournal.slice(0, 10),
    projects: matchedProjects.slice(0, 10),
    problems: matchedProblems.slice(0, 10),
    decisions: matchedDecisions.slice(0, 10),
    meetings: matchedMeetings.slice(0, 10),
  });
});

// ---------------- DASHBOARD & REPORTS ----------------
router.get('/reports/summary', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  // CRITICAL REQUIREMENT: If report is Office, Personal records MUST NOT appear!
  const raw = store.getRawDb();

  const filterCat = <T extends { category: WorkCategory }>(items: T[]) => {
    if (category) return items.filter((i) => i.category === category);
    return items;
  };

  const tasks = filterCat(raw.tasks);
  const journal = filterCat(raw.journal);
  const projects = filterCat(raw.projects);
  const problems = filterCat(raw.problems);
  const decisions = filterCat(raw.decisions);
  const meetings = filterCat(raw.meetings);
  const goals = filterCat(raw.goals);

  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const openTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
  const officeTasks = tasks.filter((t) => t.category === 'Office' && t.status !== 'Completed');
  const personalTasks = tasks.filter((t) => t.category === 'Personal' && t.status !== 'Completed');
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < todayStr);
  const completedThisWeek = tasks.filter(
    (t) => t.status === 'Completed' && t.updatedAt >= sevenDaysAgo
  );
  const activeProjects = projects.filter((p) => p.status === 'Active');
  const pendingDecisions = decisions.filter(
    (d) => d.status === 'Draft' || d.status === 'Pending Approval'
  );
  const unresolvedProblems = problems.filter(
    (p) => p.status !== 'Resolved' && p.status !== 'Closed'
  );

  // Top priorities
  const topPriorities = openTasks
    .filter((t) => t.priority === 'Critical' || t.priority === 'High')
    .slice(0, 5);

  // Recommended next actions
  const recommendedActions = openTasks
    .filter((t) => t.nextAction && t.nextAction.trim().length > 0)
    .slice(0, 5)
    .map((t) => ({
      taskId: t.id,
      taskTitle: t.title,
      category: t.category,
      priority: t.priority,
      nextAction: t.nextAction!,
      dueDate: t.dueDate,
    }));

  res.json({
    categoryFilter: category || 'All',
    totalOpenTasks: openTasks.length,
    officeTasksCount: officeTasks.length,
    personalTasksCount: personalTasks.length,
    overdueTasksCount: overdueTasks.length,
    completedThisWeekCount: completedThisWeek.length,
    activeProjectsCount: activeProjects.length,
    pendingDecisionsCount: pendingDecisions.length,
    unresolvedProblemsCount: unresolvedProblems.length,
    topPriorities,
    recommendedActions,
    recentJournalEntries: journal.slice(0, 5),
    overdueTasksList: overdueTasks.slice(0, 5),
    allTasksCount: tasks.length,
    completedTasksCount: tasks.filter((t) => t.status === 'Completed').length,
    goalsCount: goals.length,
    meetingsCount: meetings.length,
  });
});

// ---------------- EXPORT ----------------
router.get('/export', (req: Request, res: Response) => {
  const category = getCategoryParam(req);
  const format = (req.query.format as string) || 'json';
  const raw = store.getRawDb();

  const filterCat = <T extends { category: WorkCategory }>(items: T[]) =>
    category ? items.filter((i) => i.category === category) : items;

  const exportData = {
    exportDate: new Date().toISOString(),
    categoryScope: category || 'All (Personal & Office)',
    user: raw.user,
    tasks: filterCat(raw.tasks),
    journal: filterCat(raw.journal),
    projects: filterCat(raw.projects),
    problems: filterCat(raw.problems),
    decisions: filterCat(raw.decisions),
    meetings: filterCat(raw.meetings),
    goals: filterCat(raw.goals),
    documents: filterCat(raw.documents),
  };

  if (format === 'csv') {
    // Generate clean CSV of tasks
    const headers = [
      'Task ID',
      'Category',
      'Title',
      'Priority',
      'Status',
      'Start Date',
      'Due Date',
      'Responsible Person',
      'Created At',
    ];
    const rows = exportData.tasks.map((t) => [
      t.id,
      t.category,
      `"${t.title.replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.startDate || '',
      t.dueDate || '',
      `"${(t.responsiblePerson || '').replace(/"/g, '""')}"`,
      t.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="workos-tasks-${category || 'all'}-${Date.now()}.csv"`
    );
    return res.send(csvContent);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="workos-backup-${category || 'all'}-${Date.now()}.json"`
  );
  res.json(exportData);
});

export default router;
