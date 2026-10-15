import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  ShieldCheck,
  User,
  UserPlus,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  FileCode,
  Key,
  Lock,
  Loader2,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Mail,
  X,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { AuditLog, UserProfile, AdminUser } from '../../types/workos';

export const SettingsView: React.FC = () => {
  const { user, updateUserProfile, addToast, triggerRefresh, t, language, currentAdminEmail, isAdmin } = useWorkOS();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'User' | 'Manager' | 'Executive'>('Manager');
  const [savingUser, setSavingUser] = useState(false);

  // Admin accounts state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Administrator' | 'Backup Admin'>('Backup Admin');
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviting, setInviting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setJobTitle(user.jobTitle);
      setDepartment(user.department);
      setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    setLoadingAudit(true);
    api
      .getAuditLogs()
      .then((logs) => {
        setAuditLogs(logs);
        setLoadingAudit(false);
      })
      .catch(() => setLoadingAudit(false));
  }, []);

  const loadAdmins = () => {
    setLoadingAdmins(true);
    api
      .getAdminUsers()
      .then((admins) => {
        setAdminUsers(admins);
        setLoadingAdmins(false);
      })
      .catch((err) => {
        console.error('Failed to load admin users:', err);
        setLoadingAdmins(false);
      });
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      addToast(language === 'LA' ? 'ກະລຸນາໃສ່ອີເມວ Admin' : 'Admin email is required', 'error');
      return;
    }

    setInviting(true);
    try {
      const newAdmin = await api.inviteAdminUser({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: inviteRole,
        notes: inviteNotes.trim() || undefined,
      });

      addToast(
        language === 'LA'
          ? `ເພີ່ມ ແລະ ໃຫ້ສິດ Admin ໃຫ້ "${newAdmin.email}" ສຳເລັດແລ້ວ!`
          : `Admin invited & authorized: "${newAdmin.email}"!`,
        'success'
      );
      setInviteEmail('');
      setInviteName('');
      setInviteNotes('');
      setShowInviteModal(false);
      loadAdmins();
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to invite administrator', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.role === 'Primary Owner' || admin.email.toLowerCase() === 'mackyitsolutions@gmail.com') {
      addToast(t('cannotDeleteOwner'), 'error');
      return;
    }

    const confirmMsg =
      language === 'LA'
        ? `ຕ້ອງການຍົກເລີກສິດ Admin ຂອງ "${admin.email}" ແທ້ບໍ່?`
        : `Are you sure you want to revoke admin privileges for "${admin.email}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deleteAdminUser(admin.id);
      addToast(t('adminRevokedSuccess'), 'info');
      loadAdmins();
      triggerRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to revoke admin', 'error');
    }
  };

  const handleCopyInviteLink = (admin: AdminUser) => {
    const inviteUrl = `${window.location.origin}?invite_admin=${admin.inviteCode || admin.id}&email=${encodeURIComponent(
      admin.email
    )}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(admin.id);
    addToast(t('linkCopied'), 'success');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim(),
        role,
      });
    } finally {
      setSavingUser(false);
    }
  };

  const handleResetData = async () => {
    if (
      !window.confirm(
        'Reset the database to the initial executive sample dataset? All custom test records will be restored to initial state.'
      )
    )
      return;

    setResetting(true);
    try {
      await api.resetDatabase();
      addToast('Database restored to initial state', 'success');
      triggerRefresh();
      // Reload audit logs
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            System Settings & Security Governance
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Profile configuration, data persistence architecture, and immutable audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Profile & Database Operations */}
        <div className="lg:col-span-5 space-y-6">
          {/* User Profile Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-teal-600" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                User Identity Profile
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Manager">Manager</option>
                    <option value="User">User</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Organization
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={savingUser}
                className="w-full py-2 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs flex items-center justify-center gap-2"
              >
                {savingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Profile Updates</span>
              </button>
            </form>
          </div>

          {/* Database & Data Controls */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Database className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Database Administration
              </h2>
            </div>

            <p className="text-xs text-slate-500">
              Database operations run against persistent atomic disk storage on the backend server.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="/api/export?format=json"
                download
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-600" />
                  Full JSON Backup Download
                </span>
                <span className="text-[10px] text-slate-400">All Collections</span>
              </a>

              <a
                href="/api/export?format=csv&category=Office"
                download
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  Export Office Tasks (CSV)
                </span>
                <span className="text-[10px] text-slate-400">Office Only</span>
              </a>

              <button
                onClick={handleResetData}
                disabled={resetting}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  Reset Database to Initial Sample Dataset
                </span>
                {resetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Architecture & Audit Logs */}
        <div className="lg:col-span-7 space-y-6">
          {/* AUTHORIZED ADMIN ACCOUNTS & EMAIL INVITATIONS */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('adminAccounts')} ({adminUsers.length})
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('adminAccountsDesc')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('inviteNewAdmin')}</span>
              </button>
            </div>

            {/* List of Authorized Admins */}
            <div className="space-y-2">
              {loadingAdmins ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Loading authorized admin accounts...</span>
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No admin accounts found.
                </div>
              ) : (
                adminUsers.map((adm) => (
                  <div
                    key={adm.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {adm.email}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              adm.role === 'Primary Owner'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                : adm.role === 'Backup Admin'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                                : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                            }`}
                          >
                            {adm.role}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('activeStatus')}</span>
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                          {adm.name && <span>{adm.name}</span>}
                          <span>{t('invitedDate')}: {adm.invitedAt?.slice(0, 10)}</span>
                          {adm.notes && <span className="italic text-slate-400">"{adm.notes}"</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyInviteLink(adm)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-lg shadow-2xs transition-colors"
                        title={t('copyLink')}
                      >
                        {copiedId === adm.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>{t('copyLink')}</span>
                          </>
                        )}
                      </button>

                      {adm.role !== 'Primary Owner' && adm.email.toLowerCase() !== 'mackyitsolutions@gmail.com' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(adm)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('revokeAccess')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Architecture & Backend Explainer */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Server className="w-4 h-4" />
              <span>Full-Stack Architecture & Cloud Deployment</span>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                <strong>Architecture:</strong> Full-stack Express backend (<code className="text-teal-300">server.ts</code>) mounted with Vite middleware, providing REST API endpoints (<code className="text-teal-300">/api/*</code>), schema-level validation, and transactional ACID-style atomic disk persistence (<code className="text-teal-300">data/workos_data.json</code>).
              </p>
              <p>
                <strong>Data Isolation:</strong> Strict segregation guarantees that Office queries and exports reject personal records automatically at the API layer, preventing accidental disclosure in enterprise reports.
              </p>
              <p>
                <strong>Firestore Cloud Deployment:</strong> The database models are 100% compatible with Firebase Firestore and Cloud Run. Pre-configured security rules and schema definitions are ready in the repository for production multi-tenant deployment.
              </p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Security & Audit Trail Log ({auditLogs.length})
                </h2>
              </div>
              <span className="text-[10px] text-slate-400">Immutable Ledger</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
              {loadingAudit ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading audit log...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No audit events logged yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            log.action === 'CREATE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action === 'DELETE'
                              ? 'bg-rose-100 text-rose-800'
                              : log.action === 'STATUS_CHANGE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {log.entityType} ({log.entityId})
                        </span>
                        <span className="text-[9px] text-slate-400">[{log.category}]</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        {log.summary}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {log.timestamp.slice(11, 19)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('inviteNewAdmin')}
                  </h3>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase">
                    {t('adminAccounts')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteAdmin} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('adminAccountsDesc')}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('email')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. backup.admin@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('adminRole')}
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                >
                  <option value="Backup Admin">{t('backupAdmin')} (Prevent Access Lockout)</option>
                  <option value="Administrator">{t('administrator')} (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('inviteNotes')}
                </label>
                <input
                  type="text"
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  placeholder="e.g. Co-founder backup access"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{t('sendInviteBtn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
