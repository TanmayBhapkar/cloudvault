import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  HardDrive,
  FolderOpen,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getAllUsers,
  getAllFiles,
  updateUserRole,
  deleteUserAccount,
  getSystemMetrics
} from '../services/adminService';
import { getAllActivities } from '../services/activityService';
import { formatBytes, formatDate, formatRelativeTime } from '../utils/formatters';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function AdminPage() {
  const { currentUser, isAdmin } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [met, acts] = await Promise.all([
        getSystemMetrics(),
        getAllActivities(20),
      ]);
      setMetrics(met);
      setUsers(met.users || []);
      setActivities(acts || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Admin Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This section is restricted to CloudVault Administrators. Your account does not possess administrative privileges.
        </p>
      </div>
    );
  }

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setActionLoadingId(targetUser.uid);
    try {
      await updateUserRole(targetUser.uid, newRole, currentUser);
      toastSuccess(`Updated ${targetUser.email} to ${newRole}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      toastError('Failed to change user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.uid === currentUser.uid) {
      toastError('You cannot delete your own admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user account "${targetUser.email}"?`)) {
      return;
    }

    setActionLoadingId(targetUser.uid);
    try {
      await deleteUserAccount(targetUser.uid, currentUser);
      toastSuccess(`Deleted user account: ${targetUser.email}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            System Administration & Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global cloud system metrics, user registry management, and security audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating system telemetry..." />
      ) : (
        <>
          {/* Admin KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                <Users className="w-5 h-5 text-brand-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {metrics?.totalUsers || 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Registered Accounts</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Files</span>
                <FolderOpen className="w-5 h-5 text-sky-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {metrics?.totalFiles || 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Stored Objects in Storage</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Storage</span>
                <HardDrive className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatBytes(metrics?.totalStorageBytes || 0)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Across all users</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Status</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Enforced
              </h3>
              <p className="text-xs text-slate-400 mt-1">Firestore & Storage Rules</p>
            </div>
          </div>

          {/* User Management Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Registered User Directory ({users.length})
              </h3>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Storage Used</th>
                    <th className="py-3 px-4 hidden md:table-cell">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isSelf = user.uid === currentUser.uid;
                    const isActing = actionLoadingId === user.uid;

                    return (
                      <tr
                        key={user.uid}
                        className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                user.photoURL ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  user.name || user.email
                                )}&backgroundColor=0284c7`
                              }
                              alt=""
                              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {user.name || 'Scholar'}
                                {isSelf && (
                                  <span className="ml-1.5 text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize border ${
                              user.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {user.role || 'user'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                          {formatBytes(user.storageUsed || 0)}
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell">
                          {formatDate(user.createdAt)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={isActing || isSelf}
                              onClick={() => handleRoleToggle(user)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
                              title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            >
                              {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                            </button>

                            <button
                              disabled={isActing || isSelf}
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Activity Stream */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              Platform Audit Log Stream
            </h3>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {activities.map((act) => (
                <div key={act.activityId || Math.random()} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {act.userEmail}
                    </span>
                    <span className="text-slate-500 ml-2">{act.action}</span>
                    {act.fileName && (
                      <span className="text-brand-600 dark:text-brand-400 ml-1.5 font-medium">
                        "{act.fileName}"
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
