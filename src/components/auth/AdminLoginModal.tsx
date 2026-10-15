import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  UserPlus,
  Copy,
  Check,
} from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';
import { api } from '../../services/api';
import { AdminUser } from '../../types/workos';

export const AdminLoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginAsAdmin,
    isAdmin,
    currentAdminEmail,
    logout,
    t,
    language,
    addToast,
    triggerRefresh,
  } = useWorkOS();

  const [email, setEmail] = useState('mackyitsolutions@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Administrator' | 'Backup Admin'>('Backup Admin');
  const [inviting, setInviting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isLoginModalOpen) {
      setError('');
      setShowInviteForm(false);
      api
        .getAdminUsers()
        .then((admins) => {
          setAdminUsers(admins);
          if (admins.length > 0 && !email) {
            setEmail(admins[0].email);
          }
        })
        .catch(() => {});
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError(language === 'LA' ? 'ກະລຸນາໃສ່ອີເມວ' : 'Please provide an email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.validateAdmin(cleanEmail);
      if (!res.isValid) {
        setError(
          language === 'LA'
            ? `ອີເມວ "${cleanEmail}" ບໍ່ໄດ້ຮັບອະນຸຍາດເປັນ Admin. ກະລຸນາເຊີນບັນຊີນີ້ກ່ອນ ຫຼື ໃຊ້ບັນຊີເຈົ້າຂອງຫຼັກ.`
            : `Email "${cleanEmail}" is not authorized as an Admin. Please invite this email first or use an authorized admin account.`
        );
        setLoading(false);
        return;
      }

      loginAsAdmin(cleanEmail, password);
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginEmail = (targetEmail: string) => {
    setEmail(targetEmail);
    setLoading(true);
    setTimeout(() => {
      loginAsAdmin(targetEmail);
      setLoading(false);
    }, 250);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setError('');
    try {
      const newAdmin = await api.inviteAdminUser({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: inviteRole,
        notes: 'Invited via Admin Security Modal to prevent access loss',
      });
      addToast(
        language === 'LA'
          ? `ເພີ່ມ ແລະ ໃຫ້ສິດ Admin ໃຫ້ "${newAdmin.email}" ສຳເລັດແລ້ວ!`
          : `Successfully authorized new admin: "${newAdmin.email}"!`,
        'success'
      );
      setInviteEmail('');
      setInviteName('');
      setShowInviteForm(false);
      triggerRefresh();
      // Reload admins
      const updated = await api.getAdminUsers();
      setAdminUsers(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to invite admin');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('adminLogin')}
              </h2>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase">
                {t('adminFullControl')}
              </span>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('loginDesc')}
          </p>

          {isAdmin ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      {t('adminFullControl')} Active
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
                      {currentAdminEmail || 'mackyitsolutions@gmail.com'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white dark:bg-slate-800 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  {t('logout')}
                </button>
              </div>

              {/* Authorized Admins List & Invite Shortcut */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>{t('adminAccounts')} ({adminUsers.length})</span>
                  </span>

                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('inviteNewAdmin')}</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {adminUsers.map((admin) => (
                    <div
                      key={admin.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{admin.email}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              admin.role === 'Primary Owner'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                            }`}
                          >
                            {admin.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {t('activeStatus')} · {admin.invitedAt?.slice(0, 10)}
                        </div>
                      </div>

                      {admin.email.toLowerCase() !== currentAdminEmail.toLowerCase() && (
                        <button
                          onClick={() => handleQuickLoginEmail(admin.email)}
                          className="px-2 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950/40 rounded hover:bg-teal-100 border border-teal-200 dark:border-teal-800"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter authorized admin email"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{t('loginButton')}</span>
              </button>

              {/* 1-Click Authorized Admins Quick Selection */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'LA' ? 'ບັນຊີ Admin ທີ່ໄດ້ຮັບອະນຸຍາດ:' : 'Authorized Admin Accounts:'}
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {adminUsers.map((adm) => (
                    <button
                      key={adm.id}
                      type="button"
                      onClick={() => handleQuickLoginEmail(adm.email)}
                      disabled={loading}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>{adm.email}</span>
                      <span className="text-[10px] text-teal-500 font-mono">({adm.role.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>
                      {t('inviteNewAdmin')} ({language === 'LA' ? 'ປ້ອງກັນການສູນເສຍສິດເຂົ້າເຖິງ' : 'Prevent access loss'})
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Quick Invite Admin Form Drawer */}
          {showInviteForm && (
            <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  <span>{t('inviteNewAdmin')}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80">
                {t('adminAccountsDesc')}
              </p>

              <form onSubmit={handleSendInvite} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    {t('email')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. backup.admin@company.com"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      {t('adminRole')}
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                    >
                      <option value="Backup Admin">{t('backupAdmin')}</option>
                      <option value="Administrator">{t('administrator')}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={inviting || !inviteEmail.trim()}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{t('sendInviteBtn')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
