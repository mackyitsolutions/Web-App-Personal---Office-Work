import fs from 'fs';
import path from 'path';
import {
  WorkOSDatabase,
  Task,
  JournalEntry,
  Project,
  ProblemRecord,
  DecisionRecord,
  MeetingRecord,
  Goal,
  KnowledgeDocument,
  AuditLog,
  WorkCategory,
  UserProfile,
  AdminUser,
  StickyNote,
  ProjectReminder,
} from '../src/types/workos';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'workos_data.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_main',
  name: 'Alex Morgan',
  email: 'alex.morgan@workos.internal',
  jobTitle: 'Senior Operations & Projects Lead',
  department: 'Operations & Strategy',
  role: 'Manager',
  privacyPinEnabled: false,
};

function getSeedData(): WorkOSDatabase {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const tasks: Task[] = [
    {
      id: 'TSK-1001',
      title: 'Finalize Q4 Operational Budget Allocation',
      category: 'Office',
      description: 'Review departmental requests against revised enterprise CAPEX limits and reconcile with CFO guidance.',
      priority: 'Critical',
      status: 'In Progress',
      startDate: lastWeek,
      dueDate: tomorrow,
      reminderDate: today,
      nextAction: 'Schedule 30-min reconciliation session with Finance Lead.',
      projectId: 'PRJ-3001',
      projectTitle: 'Enterprise Resource Optimization 2026',
      responsiblePerson: 'Alex Morgan',
      relatedDecisionId: 'DEC-5001',
      checklist: [
        { id: 'chk-1', text: 'Aggregate department budget spreadsheets', completed: true },
        { id: 'chk-2', text: 'Reconcile variances with CFO revised limits', completed: true },
        { id: 'chk-3', text: 'Prepare final 3-page executive summary slide deck', completed: false },
        { id: 'chk-4', text: 'Obtain formal sign-off in steering committee', completed: false }
      ],
      createdAt: lastWeek,
      updatedAt: today,
      createdBy: 'Alex Morgan',
    },
    {
      id: 'TSK-1002',
      title: 'Audit Cloud Architecture Security & Firewall Rules',
      category: 'Office',
      description: 'Perform penetration review and credential rotation across production API gateways and database clusters.',
      priority: 'High',
      status: 'In Progress',
      startDate: lastWeek,
      dueDate: nextWeek,
      nextAction: 'Review automated SOC2 scan outputs with DevOps team.',
      projectId: 'PRJ-3002',
      projectTitle: 'Infrastructure Reliability & Security Hardening',
      responsiblePerson: 'DevOps / Alex Morgan',
      createdAt: lastWeek,
      updatedAt: today,
      createdBy: 'Alex Morgan',
    },
    {
      id: 'TSK-1003',
      title: 'Conduct Monthly Executive Operations Review',
      category: 'Office',
      description: 'Prepare management slide deck covering deliverables, delayed workstreams, and resource allocation requests.',
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      dueDate: nextWeek,
      nextAction: 'Aggregate monthly progress reports across all project owners.',
      relatedMeetingId: 'MTG-6001',
      responsiblePerson: 'Alex Morgan',
      createdAt: today,
      updatedAt: today,
      createdBy: 'Alex Morgan',
    },
    {
      id: 'TSK-1004',
      title: 'Annual Comprehensive Medical Checkup & Lab Work',
      category: 'Personal',
      description: 'Schedule fasting blood test, cardiology follow-up, and dental cleaning at Central Clinic.',
      priority: 'High',
      status: 'In Progress',
      startDate: yesterday,
      dueDate: nextWeek,
      reminderDate: today,
      nextAction: 'Confirm morning appointment slot with Clinic reception.',
      responsiblePerson: 'Alex Morgan',
      createdAt: yesterday,
      updatedAt: today,
      createdBy: 'Alex Morgan',
    },
    {
      id: 'TSK-1005',
      title: 'Review Personal Investment Portfolio & Estate Documents',
      category: 'Personal',
      description: 'Rebalance index funds, review mortgage amortization, and update beneficiary documentation.',
      priority: 'Medium',
      status: 'Not Started',
      startDate: today,
      dueDate: nextWeek,
      nextAction: 'Download Q3 statements from brokerage portal.',
      responsiblePerson: 'Alex Morgan',
      createdAt: today,
      updatedAt: today,
      createdBy: 'Alex Morgan',
    },
    {
      id: 'TSK-1006',
      title: 'Vehicle 50,000km Major Service & Brake Inspection',
      category: 'Personal',
      description: 'Book official service center for timing check, brake fluid renewal, and tire rotation.',
      priority: 'Low',
      status: 'Completed',
      startDate: lastWeek,
      dueDate: yesterday,
      completionNotes: 'Completed at authorized center. All filters replaced. Next service due at 65,000km.',
      responsiblePerson: 'Alex Morgan',
      createdAt: lastWeek,
      updatedAt: yesterday,
      createdBy: 'Alex Morgan',
    },
    {
      id: 'TSK-1007',
      title: 'Resolve Warehouse Order Fulfillment Latency Issue',
      category: 'Office',
      description: 'Address unexpected 48-hour dispatch delays reported by European logistics hub.',
      priority: 'Critical',
      status: 'Waiting for Approval',
      startDate: lastWeek,
      dueDate: today,
      nextAction: 'Awaiting signature on backup courier service agreement.',
      projectId: 'PRJ-3001',
      projectTitle: 'Enterprise Resource Optimization 2026',
      responsiblePerson: 'Logistics Supervisor',
      createdAt: lastWeek,
      updatedAt: today,
      createdBy: 'Alex Morgan',
    },
  ];

  const journal: JournalEntry[] = [
    {
      id: 'JRN-2001',
      date: today,
      time: '09:15',
      category: 'Office',
      title: 'Q4 Budget Alignment Meeting & Cost Driver Analysis',
      description: 'Met with departmental heads to review projected cloud infrastructure expenditures and license renewals.',
      objective: 'Prevent budget overruns without impacting production uptime.',
      actionsPerformed: 'Analyzed AWS & GCP cost spikes. Identified 18 idle non-production environments.',
      results: 'Secured commitment to decommission staging clusters, saving estimated $3,400 monthly.',
      challenges: 'Engineering teams hesitant to release reserved compute instances.',
      lessonsLearned: 'Automated auto-shutdown policies achieve compliance faster than manual requests.',
      timeSpentMinutes: 75,
      projectId: 'PRJ-3001',
      nextAction: 'Draft decommission script proposal with Tech Lead.',
      followUpDate: tomorrow,
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'JRN-2002',
      date: today,
      time: '07:00',
      category: 'Personal',
      title: 'Morning 5km Zone 2 Run & Mindfulness Session',
      description: 'Maintained steady aerobic heart rate below 142 bpm. Focused on consistent pacing.',
      objective: 'Cardiovascular conditioning and mental clarity for the upcoming sprint week.',
      actionsPerformed: '5.2 km run in 28 mins followed by 10 mins mobility stretching.',
      results: 'Resting heart rate recovered to normal within 4 minutes.',
      timeSpentMinutes: 45,
      lessonsLearned: 'Proper hydration the night before noticeably improves early morning stamina.',
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'JRN-2003',
      date: yesterday,
      time: '14:30',
      category: 'Office',
      title: 'Post-Mortem on Production Payment Webhook Interruption',
      description: 'Analyzed transient 12-minute webhook timeout during payment provider gateway maintenance.',
      objective: 'Ensure zero transaction loss and implement automatic exponential retry mechanism.',
      actionsPerformed: 'Traced logs with security lead. Re-enqueued 14 stalled event payloads.',
      results: 'All 14 payments successfully acknowledged. No customer financial impact occurred.',
      challenges: 'Third-party status page took 20 minutes to reflect outage.',
      lessonsLearned: 'Local circuit breaker must immediately switch to dead-letter queue when latency spikes past 2500ms.',
      timeSpentMinutes: 90,
      projectId: 'PRJ-3002',
      nextAction: 'Update Payment gateway retry logic in sprint backlog.',
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  ];

  const projects: Project[] = [
    {
      id: 'PRJ-3001',
      name: 'Enterprise Resource Optimization 2026',
      category: 'Office',
      objective: 'Streamline operational expenditures and optimize inter-departmental logistics workflows to reduce lead times by 25%.',
      scope: 'Covers regional supply chain, vendor contracts, software seat audits, and process re-engineering.',
      expectedResults: 'Estimated $120,000 annual operational savings and under-24-hour order fulfillment.',
      owner: 'Alex Morgan',
      stakeholders: ['COO Sarah Jenkins', 'CFO David Wu', 'Logistics Director Elena Rostova'],
      startDate: '2026-08-01',
      targetCompletionDate: '2026-12-15',
      milestones: [
        { id: 'MS-1', title: 'Comprehensive Vendor Contract Audit', dueDate: '2026-09-01', isCompleted: true, completedAt: '2026-08-28' },
        { id: 'MS-2', title: 'Cloud Infrastructure Right-Sizing', dueDate: '2026-10-20', isCompleted: false },
        { id: 'MS-3', title: 'Warehouse Automation Dispatch System Rollout', dueDate: '2026-11-30', isCompleted: false },
        { id: 'MS-4', title: 'Executive Post-Implementation Review', dueDate: '2026-12-15', isCompleted: false },
      ],
      deliverables: [
        { id: 'DEL-1', title: 'Vendor Rationalization Summary Report', status: 'Accepted' },
        { id: 'DEL-2', title: 'Staging Cluster Auto-Decommission Runbook', status: 'In Review' },
        { id: 'DEL-3', title: 'Dispatch API Gateway v2 Integration', status: 'Pending' },
      ],
      status: 'Active',
      risks: [
        'Vendor price renegotiation resistance',
        'Warehouse staff training curve during peak sales season',
      ],
      dependencies: ['Finance sign-off on adjusted tier caps', 'Vendor API v3 release date'],
      linkedTaskIds: ['TSK-1001', 'TSK-1007'],
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: today,
    },
    {
      id: 'PRJ-3002',
      name: 'Infrastructure Reliability & Security Hardening',
      category: 'Office',
      objective: 'Achieve SOC2 Type II compliance readiness and establish sub-second database failover capabilities across two regional zones.',
      scope: 'PostgreSQL clusters, secret rotation mechanisms, API authentication tokens, and backup automation.',
      expectedResults: '99.99% availability SLA and zero unencrypted credential storage.',
      owner: 'Alex Morgan',
      stakeholders: ['Chief Information Security Officer', 'Head of Platform Engineering'],
      startDate: '2026-09-01',
      targetCompletionDate: '2026-11-30',
      milestones: [
        { id: 'MS-201', title: 'Database Cold Backup & Point-in-Time Recovery Drill', dueDate: '2026-09-25', isCompleted: true, completedAt: '2026-09-24' },
        { id: 'MS-202', title: 'Zero-Trust Bastion Host & IAM Role Restructuring', dueDate: '2026-10-25', isCompleted: false },
        { id: 'MS-203', title: 'Third-party Penetration Testing Certification', dueDate: '2026-11-20', isCompleted: false },
      ],
      deliverables: [
        { id: 'DEL-201', title: 'Disaster Recovery Runbook & Drill Sign-off', status: 'Accepted' },
        { id: 'DEL-202', title: 'SOC2 Evidence Repository & Policy Matrix', status: 'In Review' },
      ],
      status: 'Active',
      risks: ['Third-party audit team availability backlog'],
      linkedTaskIds: ['TSK-1002'],
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: today,
    },
    {
      id: 'PRJ-3003',
      name: 'Personal Health & Marathon Endurance Conditioning',
      category: 'Personal',
      objective: 'Prepare physical stamina, nutrition, and cardiovascular threshold to comfortably complete the Spring Half Marathon in under 1h 45m.',
      owner: 'Alex Morgan',
      startDate: '2026-08-15',
      targetCompletionDate: '2026-12-01',
      milestones: [
        { id: 'MS-301', title: 'Establish Weekly 30km Base Mileage', dueDate: '2026-09-15', isCompleted: true, completedAt: '2026-09-12' },
        { id: 'MS-302', title: 'Biometrics & VO2 Max Assessment with Sports Physician', dueDate: '2026-10-25', isCompleted: false },
        { id: 'MS-303', title: 'Official 15km Race Simulation', dueDate: '2026-11-15', isCompleted: false },
      ],
      deliverables: [
        { id: 'DEL-301', title: 'Personalized Nutrition & Electrolyte Timing Plan', status: 'Accepted' },
      ],
      status: 'Active',
      linkedTaskIds: ['TSK-1004'],
      createdAt: '2026-08-15T08:00:00Z',
      updatedAt: today,
    },
  ];

  const problems: ProblemRecord[] = [
    {
      id: 'PRB-4001',
      category: 'Office',
      title: 'Regional Warehouse Order Fulfillment Latency Spike',
      problemStatement: 'Average dispatch turnaround time increased from 14 hours to 48 hours over the past two weeks, resulting in customer service escalations.',
      dateIdentified: lastWeek,
      currentSituation: 'Orders are queuing in the staging buffer faster than the picking floor can pack and scan them.',
      factsAndEvidence: [
        'Verified ERP database dispatch logs show 640 orders delayed beyond SLA.',
        'Barcode scanner battery degradations caused 25% station downtime during shift handovers.',
        'Recent software update to Inventory v4 added 3 mandatory verification modals per item.',
      ],
      missingInformation: [
        'Exact network latency metrics between handheld scanners and local Wi-Fi access points during peak hours.',
      ],
      assumptionsAndUncertainties: [
        'Assumption: Warehouse floor staff headcount is sufficient if software latency is resolved.',
        'Uncertainty: Whether supplier packaging changes contributed to barcode scan retries.',
      ],
      impactAndUrgency: 'High',
      stakeholdersAffected: ['Customer Support Team', 'Logistics Supervisors', 'E-commerce Customers'],
      immediateContainmentAction: 'Reverted scanner software to v3.8 on 30 primary handheld units; brought in 4 temporary scanning stations.',
      rootCauseAnalysis: {
        method: 'Five Whys',
        fiveWhys: [
          'Why are dispatches delayed? -> Orders spend 2.5x longer at packing verification stations.',
          'Why do packing stations take longer? -> Operators must scan each item barcode 3 times due to redundant modal popups.',
          'Why are redundant popups occurring? -> New software release v4 enabled compliance verification checks by default.',
          'Why was this enabled without staging validation? -> Release pipeline skipped the floor user acceptance test.',
          'Root Cause: Deployment checklist lacked sign-off requirement from warehouse floor lead prior to production push.',
        ],
        contributingFactors: ['Aged scanner hardware battery degradation', 'Inadequate floor Wi-Fi signal in Zone C'],
        summaryRootCause: 'Untested ERP client UX changes pushed directly to production without physical workstation testing.',
      },
      possibleSolutions: [
        {
          id: 'SOL-1',
          name: 'Hotfix ERP software to streamline scanning flow into a single confirmation beep',
          description: 'Deploy software patch removing the redundant confirmation dialogues and optimizing caching.',
          advantages: 'Directly addresses the 2.5x delay; zero physical hardware cost.',
          disadvantages: 'Requires emergency engineering release cycle.',
          estimatedCost: '$2,000 engineering time',
          estimatedEffort: 'Low',
          risks: 'Low risk if regression tested on staging handhelds first.',
        },
        {
          id: 'SOL-2',
          name: 'Permanently increase warehouse packing staff by 4 full-time contractors',
          description: 'Hire additional manual operators to absorb the extra verification burden.',
          advantages: 'Provides immediate physical labor redundancy.',
          disadvantages: 'High ongoing payroll expenditure ($14,000/mo); masks root software inefficiency.',
          estimatedCost: '$168,000 annually',
          estimatedEffort: 'High',
          risks: 'Onboarding lag; high turnover.',
        },
      ],
      recommendedSolution: 'Deploy ERP Hotfix (SOL-1) combined with Wi-Fi repeater relocation in Zone C.',
      recommendationRationale: 'Solves the verified root cause at minimal cost and restores the 14-hour SLA sustainably.',
      requiredApproval: 'Logistics Director & VP Engineering',
      actionPlan: '1. Validate hotfix on test handheld (Oct 14). 2. Roll out to production during 22:00 maintenance window. 3. Monitor dispatch queue for 48 hours.',
      responsiblePerson: 'Lead ERP Engineer / Alex Morgan',
      deadline: tomorrow,
      successCriteria: 'Average dispatch turnaround time returns to under 16 hours within 48 hours of hotfix release.',
      status: 'Solution Selected',
      createdAt: lastWeek,
      updatedAt: today,
    },
  ];

  const decisions: DecisionRecord[] = [
    {
      id: 'DEC-5001',
      category: 'Office',
      title: 'Migration from Dedicated Staging Servers to On-Demand Ephemeral Environments',
      background: 'Current staging environment costs $5,800/month while standing idle 68% of the time during non-working hours and weekends.',
      businessProblemOrOpportunity: 'Opportunity to trim recurring cloud spend by 60% while speeding up testing pipelines using containerized preview builds.',
      optionsConsidered: [
        {
          id: 'OPT-1',
          name: 'On-Demand Ephemeral Container Environments (Recommended)',
          benefits: 'Reduces monthly cost to ~$1,900; provides fresh isolated test environments for every pull request.',
          tradeOffs: 'Initial 2-3 minute cold-start spin-up time for first QA tester.',
          riskRating: 'Low',
        },
        {
          id: 'OPT-2',
          name: 'Keep Existing Fixed VMs with Scheduled Cron Power-Down',
          benefits: 'Zero changes to existing developer test workflows.',
          tradeOffs: 'Saves only 35%; shared staging environments still suffer database collision issues between engineers.',
          riskRating: 'Medium',
        },
      ],
      supportingEvidence: 'Analysis of past 90 days AWS CloudWatch utilization metrics indicated average CPU utilization below 4.2% outside 09:00-18:00.',
      assumptions: 'Engineers tolerate 2-minute container boot time in exchange for isolated PR staging domains.',
      recommendedOption: 'Option 1: Ephemeral Container Environments via Kubernetes autoscaling.',
      decisionOwner: 'Alex Morgan',
      approvalAuthority: 'Chief Technology Officer',
      status: 'Approved',
      decisionDate: yesterday,
      implementationActions: [
        'Implement GitHub Actions runner workflow for ephemeral deployments.',
        'Migrate staging secrets to vault manager.',
        'Decommission legacy EC2 staging instances by Oct 31.',
      ],
      reviewDate: '2026-11-15',
      actualOutcome: 'Approved in executive technical review; phase 1 implementation scheduled for current sprint.',
      createdAt: lastWeek,
      updatedAt: today,
    },
  ];

  const meetings: MeetingRecord[] = [
    {
      id: 'MTG-6001',
      category: 'Office',
      title: 'Weekly Cross-Functional Operations & Priorities Sync',
      dateTime: `${today}T10:00:00Z`,
      purpose: 'Align project roadmaps, address cross-team bottlenecks, and finalize weekly priorities.',
      participants: ['Alex Morgan (Chair)', 'Sarah Jenkins (COO)', 'Elena Rostova (Logistics)', 'Marcus Vance (Engineering)'],
      agenda: [
        '1. Review of Q4 Operations Milestones & KPIs',
        '2. Warehouse Dispatch Latency Hotfix Status',
        '3. Cloud Infrastructure Cost Decommissioning',
        '4. Action Items & Next Week Commitments',
      ],
      discussionNotes: 'Elena confirmed the temporary manual scanning stations stabilized the dispatch backlog. Marcus reported the ERP hotfix passed QA testing on test scanners. Sarah requested updated monthly cost savings figures by Friday afternoon.',
      keyIssues: [
        'Zone C warehouse Wi-Fi dead-zone identified during walk-through.',
        'Approval needed from Finance for the secondary courier contract.',
      ],
      decisionsMade: [
        'Approved deployment of ERP scanner hotfix tonight at 22:00.',
        'Agreed to decommission 18 idle staging servers by end of month.',
      ],
      actionItems: [
        {
          id: 'ACT-601',
          description: 'Deploy ERP scanner hotfix and conduct live validation on morning shift.',
          responsiblePerson: 'Marcus Vance',
          deadline: tomorrow,
          status: 'Open',
        },
        {
          id: 'ACT-602',
          description: 'Submit revised Staging Decommissioning cost savings report to Sarah.',
          responsiblePerson: 'Alex Morgan',
          deadline: nextWeek,
          status: 'Open',
        },
      ],
      createdAt: today,
      updatedAt: today,
    },
  ];

  const goals: Goal[] = [
    {
      id: 'GOL-7001',
      category: 'Office',
      title: 'Attain PMP & Advanced Systems Architecture Certification',
      description: 'Strengthen enterprise governance and agile systems design credentials through accredited coursework and formal examination.',
      targetDate: '2026-12-20',
      milestones: [
        { id: 'GM-1', title: 'Complete 35 Contact Hours Training Modules', completed: true },
        { id: 'GM-2', title: 'Complete 4 Simulated Mock Exams with >85% score', completed: true },
        { id: 'GM-3', title: 'Sit Formal Examination and Obtain Credential', completed: false },
      ],
      progressPercentage: 66,
      successCriteria: 'Official certification awarded and logged in corporate talent matrix.',
      weeklyObstacles: ['Balancing evening study time with intense Q4 project deadlines.'],
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: today,
    },
    {
      id: 'GOL-7002',
      category: 'Personal',
      title: 'Master Classical Spanish Guitar Repertoire & Music Theory',
      description: 'Practice 45 minutes 4 days per week focusing on fingerstyle precision and reading notation.',
      targetDate: '2026-12-31',
      milestones: [
        { id: 'GM-201', title: 'Learn Tarrega - Recuerdos de la Alhambra (Intro & A Section)', completed: true },
        { id: 'GM-202', title: 'Master Tremolo technique at 120 bpm', completed: false },
      ],
      progressPercentage: 50,
      successCriteria: 'Record full clean performance piece without score prompts.',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: today,
    },
  ];

  const documents: KnowledgeDocument[] = [
    {
      id: 'DOC-8001',
      category: 'Office',
      title: 'Staff Health, Wellness & Comprehensive Medical Benefits Plan 2026',
      type: 'Benefits',
      targetAudience: 'All Staff',
      fileName: 'Staff_Health_Benefits_2026.pdf',
      fileSize: '2.4 MB',
      downloadCount: 38,
      content: `### 1. Overview of Medical & Health Coverage
All full-time office staff are covered under the Comprehensive Executive Group Medical Insurance policy effective on day one of employment.

### 2. Core Coverage Highlights
- **Inpatient Hospitalization:** 100% covered up to $50,000 annually per employee.
- **Outpatient Clinical Consultations:** $50 copay allowance per visit up to 20 visits per calendar year.
- **Dental & Optical Benefit:** $750 annual combined reimbursement for routine dental checkups, cleanings, and prescription eyewear.
- **Mental Wellness Support:** 6 confidential consultation sessions per year with licensed corporate counselors.

### 3. Claims Submission Process
1. Retain official itemized clinic invoices and receipts.
2. Submit claim in the Employee Benefits portal within 30 days of treatment.
3. Reimbursements are credited to your registered payroll bank account within 5 business days.`,
      tags: ['Staff Benefits', 'Health Insurance', 'Medical', 'Wellness'],
      owner: 'Admin Office',
      confidentiality: 'Internal',
      createdAt: '2026-08-10T00:00:00Z',
      updatedAt: today,
    },
    {
      id: 'DOC-8002',
      category: 'Office',
      title: 'Annual Paid Leave, Parental Leave & Flexible Work Guidelines',
      type: 'Policy',
      targetAudience: 'Office Staff',
      fileName: 'Office_Leave_Policy_Guidelines.pdf',
      fileSize: '1.8 MB',
      downloadCount: 52,
      content: `### 1. Annual Leave Entitlement
- All permanent office team members receive **18 days of paid annual leave** per calendar year, accruing on a monthly basis.
- Up to 5 unused annual leave days may be carried forward into the next calendar year.

### 2. Sick & Medical Leave
- **14 Paid Outpatient Sick Days:** Medical certificate (MC) required for absences exceeding 1 business day.
- **60 Days Hospitalization Leave:** Covered at full pay upon hospital admission.

### 3. Core Working Hours & Hybrid Schedule
- Core collaborative office hours are **10:00 to 16:00**.
- Flexible arrival between 08:30 and 10:00. Up to 2 remote workdays per week with manager coordination.`,
      tags: ['Leave Policy', 'HR', 'Office Staff', 'Handbook'],
      owner: 'Admin Office',
      confidentiality: 'Internal',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: today,
    },
    {
      id: 'DOC-8003',
      category: 'Office',
      title: 'Employee Continuous Learning & Professional Development Subsidy',
      type: 'Benefits',
      targetAudience: 'All Staff',
      fileName: 'Professional_Learning_Subsidy_Program.pdf',
      fileSize: '950 KB',
      downloadCount: 24,
      content: `### 1. Annual Learning Allowance
Each employee is allocated up to **$1,500 annually** to pursue approved professional certifications, technical training, conferences, or relevant books.

### 2. Eligible Programs
- Professional certifications (PMP, AWS, Google Cloud, CPA, Scrum Master).
- Language and communication courses (English, Lao, Business Writing).
- Industry conference passes and workshops.

### 3. How to Apply
Submit course syllabus and invoice to Admin Office. Tuition is paid directly or reimbursed upon successful completion certificate.`,
      tags: ['Staff Benefits', 'Training', 'Certifications', 'Education'],
      owner: 'Admin Office',
      confidentiality: 'Internal',
      createdAt: '2026-09-15T00:00:00Z',
      updatedAt: today,
    },
    {
      id: 'DOC-8004',
      category: 'Office',
      title: 'Standard Operating Procedure: Production Incident Severity & Escalation',
      type: 'Procedure',
      targetAudience: 'Office Staff',
      fileName: 'SOP_Incident_Response_Escalation.pdf',
      fileSize: '1.2 MB',
      downloadCount: 19,
      content: `### 1. Severity Levels
- **Sev-1 (Critical Outage):** Customer-facing disruption. Max response time: 15 minutes.
- **Sev-2 (Degraded Operations):** Major feature impairment. Max response time: 60 minutes.
- **Sev-3 (Minor Defect):** Administrative glitch. Max response time: 1 business day.

### 2. Escalation Chain
1. Primary On-Call -> 2. Incident Commander -> 3. VP Engineering -> 4. Executive Stakeholders.`,
      tags: ['SOP', 'Operations', 'Incident Response'],
      owner: 'Admin Office',
      confidentiality: 'Internal',
      createdAt: '2026-08-10T00:00:00Z',
      updatedAt: today,
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-001',
      timestamp: yesterday,
      userId: 'usr_main',
      action: 'CREATE',
      entityType: 'Task',
      entityId: 'TSK-1001',
      category: 'Office',
      summary: 'Created task "Finalize Q4 Operational Budget Allocation"',
    },
    {
      id: 'AUD-002',
      timestamp: today,
      userId: 'usr_main',
      action: 'UPDATE',
      entityType: 'Problem',
      entityId: 'PRB-4001',
      category: 'Office',
      summary: 'Updated root cause analysis and selected containment solution',
    },
  ];

  const adminUsers: AdminUser[] = [
    {
      id: 'ADM-001',
      email: 'mackyitsolutions@gmail.com',
      name: 'Primary Owner',
      role: 'Primary Owner',
      status: 'Active',
      invitedBy: 'System Bootstrap',
      invitedAt: '2026-08-01T00:00:00Z',
      lastLoginAt: today,
      notes: 'Initial administrator with full master privileges',
    },
  ];

  const stickyNotes: StickyNote[] = [
    {
      id: 'STK-1001',
      projectId: 'PRJ-3001',
      projectTitle: 'Enterprise Resource Optimization 2026',
      title: 'Architecture Sync Key Takeaways',
      content: '1. Switch Redis session TTL to 24h\n2. Add rate limiting to export webhook endpoint\n3. Coordinate next staging rehearsal with DevOps team.',
      color: '#FEF08A', // Classic Sticky Yellow
      isPinned: true,
      category: 'Office',
      tags: ['Architecture', 'Sprint'],
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'STK-1002',
      projectId: 'PRJ-3001',
      projectTitle: 'Enterprise Resource Optimization 2026',
      title: 'Vendor Contract SLA Clause',
      content: 'Negotiate minimum 99.95% uptime SLA and 15% discount before Q4 fiscal closing. Involve legal for terms review.',
      color: '#BAE6FD', // Sky Blue
      isPinned: false,
      category: 'Office',
      tags: ['Vendor', 'Legal'],
      createdAt: yesterday,
      updatedAt: today,
    },
    {
      id: 'STK-1003',
      projectId: 'PRJ-3002',
      projectTitle: 'Infrastructure Reliability & Security Hardening',
      title: 'DevOps Staging Cluster Secrets',
      content: 'Dev cluster gateway: 10.240.12.8\nHealth probe: /api/health\nAuto-shutdown cron executes at 20:00 every weekday to prevent idle spend.',
      color: '#A7F3D0', // Mint Green
      isPinned: true,
      category: 'Office',
      tags: ['DevOps', 'Security'],
      createdAt: lastWeek,
      updatedAt: today,
    },
    {
      id: 'STK-1004',
      title: 'Daily High-Focus Window',
      content: 'Reserve 09:00 - 11:30 AM strictly for deep analytical work without Slack or email interruptions.',
      color: '#FED7AA', // Peach / Orange
      isPinned: false,
      category: 'Personal',
      tags: ['Productivity'],
      createdAt: today,
      updatedAt: today,
    },
  ];

  const reminders: ProjectReminder[] = [
    {
      id: 'REM-1001',
      projectId: 'PRJ-3001',
      projectTitle: 'Enterprise Resource Optimization 2026',
      title: 'Submit Monthly Project Budget Reconciliation to Finance',
      dueDate: tomorrow,
      dueTime: '16:00',
      priority: 'High',
      isCompleted: false,
      category: 'Office',
      notes: 'Prepare final 3-page summary deck with revised CAPEX limits.',
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'REM-1002',
      projectId: 'PRJ-3002',
      projectTitle: 'Infrastructure Reliability & Security Hardening',
      title: 'Confirm Penetration Testing Schedule with External Auditor',
      dueDate: nextWeek,
      dueTime: '10:30',
      priority: 'Urgent',
      isCompleted: false,
      category: 'Office',
      notes: 'Ensure staging whitelist IP range is submitted 48h prior.',
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'REM-1003',
      projectId: 'PRJ-3001',
      projectTitle: 'Enterprise Resource Optimization 2026',
      title: 'Decommission 18 Idle Staging Instances',
      dueDate: yesterday,
      dueTime: '15:00',
      priority: 'Normal',
      isCompleted: true,
      category: 'Office',
      notes: 'Decommissioning approved in executive review.',
      createdAt: lastWeek,
      updatedAt: yesterday,
    },
  ];

  return {
    user: DEFAULT_USER,
    adminUsers,
    tasks,
    journal,
    projects,
    problems,
    decisions,
    meetings,
    goals,
    documents,
    auditLogs,
    stickyNotes,
    reminders,
  };
}

class WorkOSStore {
  private db: WorkOSDatabase;

  constructor() {
    this.db = this.load();
  }

  private load(): WorkOSDatabase {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.tasks && parsed.user) {
          if (!parsed.adminUsers || !Array.isArray(parsed.adminUsers) || parsed.adminUsers.length === 0) {
            parsed.adminUsers = [
              {
                id: 'ADM-001',
                email: 'mackyitsolutions@gmail.com',
                name: 'Primary Owner',
                role: 'Primary Owner',
                status: 'Active',
                invitedBy: 'System Bootstrap',
                invitedAt: '2026-08-01T00:00:00Z',
                lastLoginAt: new Date().toISOString(),
                notes: 'Initial administrator with full master privileges',
              },
            ];
          }
          if (!parsed.stickyNotes || !Array.isArray(parsed.stickyNotes)) {
            parsed.stickyNotes = [
              {
                id: 'STK-1001',
                projectId: 'PRJ-3001',
                projectTitle: 'Enterprise Resource Optimization 2026',
                title: 'Architecture Sync Key Takeaways',
                content: '1. Switch Redis session TTL to 24h\n2. Add rate limiting to export webhook endpoint\n3. Coordinate next staging rehearsal with DevOps team.',
                color: '#FEF08A',
                isPinned: true,
                category: 'Office',
                createdAt: new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString().slice(0, 10),
              },
              {
                id: 'STK-1002',
                projectId: 'PRJ-3001',
                projectTitle: 'Enterprise Resource Optimization 2026',
                title: 'Vendor Contract SLA Clause',
                content: 'Negotiate minimum 99.95% uptime SLA and 15% discount before Q4 fiscal closing.',
                color: '#BAE6FD',
                isPinned: false,
                category: 'Office',
                createdAt: new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString().slice(0, 10),
              },
            ];
          }
          if (!parsed.reminders || !Array.isArray(parsed.reminders)) {
            parsed.reminders = [
              {
                id: 'REM-1001',
                projectId: 'PRJ-3001',
                projectTitle: 'Enterprise Resource Optimization 2026',
                title: 'Submit Monthly Project Budget Reconciliation to Finance',
                dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                dueTime: '16:00',
                priority: 'High',
                isCompleted: false,
                category: 'Office',
                createdAt: new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString().slice(0, 10),
              },
            ];
          }
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading WorkOS data file, resetting to seed data:', err);
    }
    const seed = getSeedData();
    this.save(seed);
    return seed;
  }

  private save(data?: WorkOSDatabase): void {
    if (data) {
      this.db = data;
    }
    try {
      const json = JSON.stringify(this.db, null, 2);
      const tempPath = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tempPath, json, 'utf-8');
      fs.renameSync(tempPath, DATA_FILE);
    } catch (err) {
      console.error('Failed to write atomic WorkOS data file:', err);
    }
  }

  public getRawDb(): WorkOSDatabase {
    return this.db;
  }

  public logAudit(
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    category: WorkCategory,
    summary: string
  ): void {
    const log: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userId: this.db.user.id,
      action,
      entityType,
      entityId,
      category,
      summary,
    };
    this.db.auditLogs.unshift(log);
    if (this.db.auditLogs.length > 500) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 500);
    }
    this.save();
  }

  // USER PROFILE
  public getUser(): UserProfile {
    return this.db.user;
  }

  public updateUser(profile: Partial<UserProfile>): UserProfile {
    this.db.user = { ...this.db.user, ...profile };
    this.save();
    return this.db.user;
  }

  // TASKS
  public getTasks(categoryFilter?: WorkCategory): Task[] {
    if (!categoryFilter) return this.db.tasks.filter((t) => !t.isArchived);
    return this.db.tasks.filter((t) => t.category === categoryFilter && !t.isArchived);
  }

  public getTaskById(id: string): Task | undefined {
    return this.db.tasks.find((t) => t.id === id);
  }

  public createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Task {
    if (!data.title?.trim()) {
      throw new Error('Task title is required.');
    }
    if (data.category !== 'Office' && data.category !== 'Personal') {
      throw new Error('Valid Work Category (Office or Personal) is strictly required.');
    }
    if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
      throw new Error('Task Due Date cannot be earlier than Start Date.');
    }

    const nextNum = 1000 + this.db.tasks.length + 1;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: `TSK-${nextNum}`,
      title: data.title.trim(),
      priority: data.priority || 'Medium',
      status: data.status || 'Not Started',
      createdAt: now,
      updatedAt: now,
      createdBy: this.db.user.name,
    };

    this.db.tasks.unshift(newTask);
    this.save();
    this.logAudit('CREATE', 'Task', newTask.id, newTask.category, `Created task "${newTask.title}"`);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task {
    const idx = this.db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Task with id ${id} not found.`);

    const existing = this.db.tasks[idx];

    // Validate due date if updated
    const finalStart = updates.startDate !== undefined ? updates.startDate : existing.startDate;
    const finalDue = updates.dueDate !== undefined ? updates.dueDate : existing.dueDate;
    if (finalStart && finalDue && finalDue < finalStart) {
      throw new Error('Task Due Date cannot be earlier than Start Date.');
    }

    // Preserve category unless explicitly changing
    const finalCategory = updates.category || existing.category;
    if (finalCategory !== 'Office' && finalCategory !== 'Personal') {
      throw new Error('Work Category must be Office or Personal.');
    }

    const updatedTask: Task = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      category: finalCategory,
      updatedAt: new Date().toISOString(),
    };

    this.db.tasks[idx] = updatedTask;
    this.save();
    this.logAudit(
      updates.status && updates.status !== existing.status ? 'STATUS_CHANGE' : 'UPDATE',
      'Task',
      updatedTask.id,
      updatedTask.category,
      `Updated task "${updatedTask.title}" (Status: ${updatedTask.status})`
    );
    return updatedTask;
  }

  public deleteTask(id: string): boolean {
    const idx = this.db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const deleted = this.db.tasks[idx];
    this.db.tasks.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Task', deleted.id, deleted.category, `Deleted task "${deleted.title}"`);
    return true;
  }

  // WORK JOURNAL
  public getJournal(categoryFilter?: WorkCategory): JournalEntry[] {
    if (!categoryFilter) return this.db.journal;
    return this.db.journal.filter((j) => j.category === categoryFilter);
  }

  public createJournalEntry(data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): JournalEntry {
    if (!data.title?.trim()) throw new Error('Journal entry title is required.');
    if (data.category !== 'Office' && data.category !== 'Personal') {
      throw new Error('Valid category (Office or Personal) is required.');
    }

    const now = new Date().toISOString();
    const nextNum = 2000 + this.db.journal.length + 1;
    const entry: JournalEntry = {
      ...data,
      id: `JRN-${nextNum}`,
      title: data.title.trim(),
      date: data.date || now.slice(0, 10),
      time: data.time || now.slice(11, 16),
      createdAt: now,
      updatedAt: now,
    };

    this.db.journal.unshift(entry);
    this.save();
    this.logAudit('CREATE', 'Journal', entry.id, entry.category, `Logged journal entry: "${entry.title}"`);
    return entry;
  }

  public updateJournalEntry(id: string, updates: Partial<JournalEntry>): JournalEntry {
    const idx = this.db.journal.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error(`Journal entry ${id} not found.`);
    const existing = this.db.journal[idx];
    const updated: JournalEntry = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.journal[idx] = updated;
    this.save();
    this.logAudit('UPDATE', 'Journal', updated.id, updated.category, `Updated journal entry: "${updated.title}"`);
    return updated;
  }

  public deleteJournalEntry(id: string): boolean {
    const idx = this.db.journal.findIndex((j) => j.id === id);
    if (idx === -1) return false;
    const deleted = this.db.journal[idx];
    this.db.journal.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Journal', deleted.id, deleted.category, `Deleted journal entry "${deleted.title}"`);
    return true;
  }

  // PROJECTS
  public getProjects(categoryFilter?: WorkCategory): Project[] {
    if (!categoryFilter) return this.db.projects;
    return this.db.projects.filter((p) => p.category === categoryFilter);
  }

  public getProjectById(id: string): Project | undefined {
    return this.db.projects.find((p) => p.id === id);
  }

  public createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    if (!data.name?.trim()) throw new Error('Project name is required.');
    if (data.category !== 'Office' && data.category !== 'Personal') {
      throw new Error('Valid category (Office or Personal) is required.');
    }
    const now = new Date().toISOString();
    const nextNum = 3000 + this.db.projects.length + 1;
    const project: Project = {
      ...data,
      id: `PRJ-${nextNum}`,
      milestones: data.milestones || [],
      deliverables: data.deliverables || [],
      createdAt: now,
      updatedAt: now,
    };
    this.db.projects.unshift(project);
    this.save();
    this.logAudit('CREATE', 'Project', project.id, project.category, `Created project "${project.name}"`);
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project {
    const idx = this.db.projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Project ${id} not found.`);
    const existing = this.db.projects[idx];
    const updated: Project = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.projects[idx] = updated;
    this.save();
    this.logAudit('UPDATE', 'Project', updated.id, updated.category, `Updated project "${updated.name}"`);
    return updated;
  }

  public deleteProject(id: string): boolean {
    const idx = this.db.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const deleted = this.db.projects[idx];
    this.db.projects.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Project', deleted.id, deleted.category, `Deleted project "${deleted.name}"`);
    return true;
  }

  // PROBLEMS
  public getProblems(categoryFilter?: WorkCategory): ProblemRecord[] {
    if (!categoryFilter) return this.db.problems;
    return this.db.problems.filter((p) => p.category === categoryFilter);
  }

  public createProblem(data: Omit<ProblemRecord, 'id' | 'createdAt' | 'updatedAt'>): ProblemRecord {
    if (!data.title?.trim()) throw new Error('Problem title is required.');
    const now = new Date().toISOString();
    const nextNum = 4000 + this.db.problems.length + 1;
    const problem: ProblemRecord = {
      ...data,
      id: `PRB-${nextNum}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.problems.unshift(problem);
    this.save();
    this.logAudit('CREATE', 'Problem', problem.id, problem.category, `Registered problem analysis: "${problem.title}"`);
    return problem;
  }

  public updateProblem(id: string, updates: Partial<ProblemRecord>): ProblemRecord {
    const idx = this.db.problems.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Problem ${id} not found.`);
    const existing = this.db.problems[idx];
    const updated: ProblemRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.problems[idx] = updated;
    this.save();
    this.logAudit('UPDATE', 'Problem', updated.id, updated.category, `Updated problem "${updated.title}"`);
    return updated;
  }

  public deleteProblem(id: string): boolean {
    const idx = this.db.problems.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const deleted = this.db.problems[idx];
    this.db.problems.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Problem', deleted.id, deleted.category, `Deleted problem record "${deleted.title}"`);
    return true;
  }

  // DECISIONS
  public getDecisions(categoryFilter?: WorkCategory): DecisionRecord[] {
    if (!categoryFilter) return this.db.decisions;
    return this.db.decisions.filter((d) => d.category === categoryFilter);
  }

  public createDecision(data: Omit<DecisionRecord, 'id' | 'createdAt' | 'updatedAt'>): DecisionRecord {
    if (!data.title?.trim()) throw new Error('Decision title is required.');
    const now = new Date().toISOString();
    const nextNum = 5000 + this.db.decisions.length + 1;
    const decision: DecisionRecord = {
      ...data,
      id: `DEC-${nextNum}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.decisions.unshift(decision);
    this.save();
    this.logAudit('CREATE', 'Decision', decision.id, decision.category, `Created decision: "${decision.title}"`);
    return decision;
  }

  public updateDecision(id: string, updates: Partial<DecisionRecord>): DecisionRecord {
    const idx = this.db.decisions.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Decision ${id} not found.`);
    const existing = this.db.decisions[idx];
    const updated: DecisionRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.decisions[idx] = updated;
    this.save();
    this.logAudit('UPDATE', 'Decision', updated.id, updated.category, `Updated decision "${updated.title}"`);
    return updated;
  }

  public deleteDecision(id: string): boolean {
    const idx = this.db.decisions.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    const deleted = this.db.decisions[idx];
    this.db.decisions.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Decision', deleted.id, deleted.category, `Deleted decision "${deleted.title}"`);
    return true;
  }

  // MEETINGS
  public getMeetings(categoryFilter?: WorkCategory): MeetingRecord[] {
    if (!categoryFilter) return this.db.meetings;
    return this.db.meetings.filter((m) => m.category === categoryFilter);
  }

  public createMeeting(data: Omit<MeetingRecord, 'id' | 'createdAt' | 'updatedAt'>): MeetingRecord {
    if (!data.title?.trim()) throw new Error('Meeting title is required.');
    const now = new Date().toISOString();
    const nextNum = 6000 + this.db.meetings.length + 1;
    const meeting: MeetingRecord = {
      ...data,
      id: `MTG-${nextNum}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.meetings.unshift(meeting);
    this.save();
    this.logAudit('CREATE', 'Meeting', meeting.id, meeting.category, `Scheduled meeting: "${meeting.title}"`);
    return meeting;
  }

  public updateMeeting(id: string, updates: Partial<MeetingRecord>): MeetingRecord {
    const idx = this.db.meetings.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Meeting ${id} not found.`);
    const existing = this.db.meetings[idx];
    const updated: MeetingRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.meetings[idx] = updated;
    this.save();
    this.logAudit('UPDATE', 'Meeting', updated.id, updated.category, `Updated meeting "${updated.title}"`);
    return updated;
  }

  public deleteMeeting(id: string): boolean {
    const idx = this.db.meetings.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    const deleted = this.db.meetings[idx];
    this.db.meetings.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Meeting', deleted.id, deleted.category, `Deleted meeting "${deleted.title}"`);
    return true;
  }

  // GOALS
  public getGoals(categoryFilter?: WorkCategory): Goal[] {
    if (!categoryFilter) return this.db.goals;
    return this.db.goals.filter((g) => g.category === categoryFilter);
  }

  public createGoal(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
    if (!data.title?.trim()) throw new Error('Goal title is required.');
    const now = new Date().toISOString();
    const nextNum = 7000 + this.db.goals.length + 1;
    const goal: Goal = {
      ...data,
      id: `GOL-${nextNum}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.goals.unshift(goal);
    this.save();
    this.logAudit('CREATE', 'Goal', goal.id, goal.category, `Created goal: "${goal.title}"`);
    return goal;
  }

  public updateGoal(id: string, updates: Partial<Goal>): Goal {
    const idx = this.db.goals.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error(`Goal ${id} not found.`);
    const existing = this.db.goals[idx];
    const updated: Goal = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.goals[idx] = updated;
    this.save();
    this.logAudit('UPDATE', 'Goal', updated.id, updated.category, `Updated goal "${updated.title}"`);
    return updated;
  }

  public deleteGoal(id: string): boolean {
    const idx = this.db.goals.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    const deleted = this.db.goals[idx];
    this.db.goals.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Goal', deleted.id, deleted.category, `Deleted goal "${deleted.title}"`);
    return true;
  }

  // DOCUMENTS
  public getDocuments(categoryFilter?: WorkCategory): KnowledgeDocument[] {
    if (!categoryFilter) return this.db.documents;
    return this.db.documents.filter((d) => d.category === categoryFilter);
  }

  public createDocument(data: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeDocument {
    if (!data.title?.trim()) throw new Error('Document title is required.');
    const now = new Date().toISOString();
    const nextNum = 8000 + this.db.documents.length + 1;
    const doc: KnowledgeDocument = {
      ...data,
      id: `DOC-${nextNum}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.documents.unshift(doc);
    this.save();
    this.logAudit('CREATE', 'Document', doc.id, doc.category, `Created document: "${doc.title}"`);
    return doc;
  }

  public updateDocument(id: string, updates: Partial<KnowledgeDocument>): KnowledgeDocument {
    const idx = this.db.documents.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Document ${id} not found.`);
    const existing = this.db.documents[idx];
    const updated: KnowledgeDocument = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.documents[idx] = updated;
    this.save();
    this.logAudit('UPDATE', 'Document', updated.id, updated.category, `Updated document "${updated.title}"`);
    return updated;
  }

  public deleteDocument(id: string): boolean {
    const idx = this.db.documents.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    const deleted = this.db.documents[idx];
    this.db.documents.splice(idx, 1);
    this.save();
    this.logAudit('DELETE', 'Document', deleted.id, deleted.category, `Deleted document "${deleted.title}"`);
    return true;
  }

  // AUDIT LOGS
  public getAuditLogs(categoryFilter?: WorkCategory): AuditLog[] {
    if (!categoryFilter) return this.db.auditLogs;
    return this.db.auditLogs.filter((a) => a.category === categoryFilter);
  }

  // ADMIN USERS
  public getAdminUsers(): AdminUser[] {
    if (!this.db.adminUsers || !Array.isArray(this.db.adminUsers) || this.db.adminUsers.length === 0) {
      this.db.adminUsers = [
        {
          id: 'ADM-001',
          email: 'mackyitsolutions@gmail.com',
          name: 'Primary Owner',
          role: 'Primary Owner',
          status: 'Active',
          invitedBy: 'System Bootstrap',
          invitedAt: '2026-08-01T00:00:00Z',
          lastLoginAt: new Date().toISOString(),
          notes: 'Initial administrator with full master privileges',
        },
      ];
      this.save();
    }
    return this.db.adminUsers;
  }

  public inviteAdminUser(data: {
    email: string;
    name?: string;
    role?: 'Administrator' | 'Backup Admin';
    notes?: string;
  }): AdminUser {
    const email = data.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required for admin invitation.');
    }

    const admins = this.getAdminUsers();
    const existing = admins.find((a) => a.email.toLowerCase() === email);
    if (existing) {
      throw new Error(`Admin account with email "${email}" already exists.`);
    }

    const now = new Date().toISOString();
    const nextNum = admins.length + 1;
    const inviteCode = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newAdmin: AdminUser = {
      id: `ADM-00${nextNum}`,
      email,
      name: data.name?.trim() || email.split('@')[0],
      role: data.role || 'Administrator',
      status: 'Active', // Immediately activated so user never loses accessibility
      invitedBy: 'mackyitsolutions@gmail.com',
      invitedAt: now,
      inviteCode,
      notes: data.notes?.trim() || undefined,
    };

    admins.push(newAdmin);
    this.db.adminUsers = admins;
    this.save();
    this.logAudit('CREATE', 'Admin', newAdmin.id, 'Office', `Invited & authorized new admin: ${newAdmin.email} (${newAdmin.role})`);
    return newAdmin;
  }

  public deleteAdminUser(id: string): boolean {
    const admins = this.getAdminUsers();
    const target = admins.find((a) => a.id === id);
    if (!target) return false;
    if (target.role === 'Primary Owner' || target.email.toLowerCase() === 'mackyitsolutions@gmail.com') {
      throw new Error('Cannot revoke the Primary Owner administrator account.');
    }
    this.db.adminUsers = admins.filter((a) => a.id !== id);
    this.save();
    this.logAudit('DELETE', 'Admin', target.id, 'Office', `Revoked admin access for: ${target.email}`);
    return true;
  }

  public validateAdmin(email: string): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    if (clean === 'mackyitsolutions@gmail.com') return true;
    const admins = this.getAdminUsers();
    return admins.some((a) => a.email.toLowerCase() === clean);
  }

  // STICKY NOTES / NOTEBOOK
  public getStickyNotes(projectId?: string, category?: WorkCategory): StickyNote[] {
    let list = this.db.stickyNotes || [];
    if (projectId) {
      list = list.filter((n) => n.projectId === projectId);
    }
    if (category) {
      list = list.filter((n) => !n.category || n.category === category);
    }
    return list;
  }

  public createStickyNote(data: Partial<StickyNote>): StickyNote {
    const notes = this.db.stickyNotes || [];
    const now = new Date().toISOString();
    const id = `STK-${Date.now().toString().slice(-5)}`;

    // Resolve project title if projectId is provided
    let projectTitle = data.projectTitle;
    if (data.projectId && !projectTitle) {
      const proj = this.db.projects.find((p) => p.id === data.projectId);
      if (proj) projectTitle = proj.name;
    }

    const newNote: StickyNote = {
      id,
      projectId: data.projectId,
      projectTitle,
      title: data.title?.trim() || 'Untitled Sticky Note',
      content: data.content?.trim() || '',
      color: data.color || '#FEF08A',
      isPinned: !!data.isPinned,
      category: data.category || 'Office',
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    notes.unshift(newNote);
    this.db.stickyNotes = notes;
    this.save();
    this.logAudit('CREATE', 'Project', newNote.id, newNote.category || 'Office', `Created sticky note "${newNote.title}"`);
    return newNote;
  }

  public updateStickyNote(id: string, data: Partial<StickyNote>): StickyNote {
    const notes = this.db.stickyNotes || [];
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) throw new Error(`Sticky note "${id}" not found.`);

    const existing = notes[index];
    const updated: StickyNote = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    if (data.projectId && data.projectId !== existing.projectId) {
      const proj = this.db.projects.find((p) => p.id === data.projectId);
      if (proj) updated.projectTitle = proj.name;
    }

    notes[index] = updated;
    this.db.stickyNotes = notes;
    this.save();
    return updated;
  }

  public deleteStickyNote(id: string): boolean {
    const notes = this.db.stickyNotes || [];
    const initialLen = notes.length;
    this.db.stickyNotes = notes.filter((n) => n.id !== id);
    if (this.db.stickyNotes.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // PROJECT REMINDERS
  public getReminders(projectId?: string, category?: WorkCategory): ProjectReminder[] {
    let list = this.db.reminders || [];
    if (projectId) {
      list = list.filter((r) => r.projectId === projectId);
    }
    if (category) {
      list = list.filter((r) => !r.category || r.category === category);
    }
    return list;
  }

  public createReminder(data: Partial<ProjectReminder>): ProjectReminder {
    const reminders = this.db.reminders || [];
    const now = new Date().toISOString();
    const id = `REM-${Date.now().toString().slice(-5)}`;

    let projectTitle = data.projectTitle;
    if (data.projectId && !projectTitle) {
      const proj = this.db.projects.find((p) => p.id === data.projectId);
      if (proj) projectTitle = proj.name;
    }

    const newReminder: ProjectReminder = {
      id,
      projectId: data.projectId,
      projectTitle,
      title: data.title?.trim() || 'Untitled Reminder',
      dueDate: data.dueDate || new Date().toISOString().slice(0, 10),
      dueTime: data.dueTime || '09:00',
      priority: data.priority || 'Normal',
      isCompleted: false,
      category: data.category || 'Office',
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    reminders.unshift(newReminder);
    this.db.reminders = reminders;
    this.save();
    this.logAudit('CREATE', 'Project', newReminder.id, newReminder.category || 'Office', `Created reminder "${newReminder.title}"`);
    return newReminder;
  }

  public updateReminder(id: string, data: Partial<ProjectReminder>): ProjectReminder {
    const reminders = this.db.reminders || [];
    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Reminder "${id}" not found.`);

    const existing = reminders[index];
    const updated: ProjectReminder = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    if (data.projectId && data.projectId !== existing.projectId) {
      const proj = this.db.projects.find((p) => p.id === data.projectId);
      if (proj) updated.projectTitle = proj.name;
    }

    reminders[index] = updated;
    this.db.reminders = reminders;
    this.save();
    return updated;
  }

  public deleteReminder(id: string): boolean {
    const reminders = this.db.reminders || [];
    const initialLen = reminders.length;
    this.db.reminders = reminders.filter((r) => r.id !== id);
    if (this.db.reminders.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // RESET / SEED
  public resetToSeed(): void {
    const seed = getSeedData();
    this.save(seed);
  }
}

export const store = new WorkOSStore();
