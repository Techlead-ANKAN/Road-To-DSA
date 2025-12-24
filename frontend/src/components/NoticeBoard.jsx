import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Plus, Edit, Trash2, CheckCircle2, AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { fetchNotices, createNotice, updateNotice, deleteNotice, markNoticeDone } from '../api/notice';
import { NoticeFormModal } from './NoticeFormModal';

export const NoticeBoard = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  // Fetch notices
  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices', user.userId],
    queryFn: () => fetchNotices(user.userId),
    enabled: !!user.userId,
  });

  // Create notice mutation
  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries(['notices', user.userId]);
    },
  });

  // Update notice mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notices', user.userId]);
    },
  });

  // Delete notice mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries(['notices', user.userId]);
    },
  });

  // Mark done mutation
  const markDoneMutation = useMutation({
    mutationFn: ({ id, isDone }) => markNoticeDone(id, isDone),
    onSuccess: () => {
      queryClient.invalidateQueries(['notices', user.userId]);
    },
  });

  const handleCreateNotice = (formData) => {
    createMutation.mutate({
      userId: user.userId,
      ...formData,
    });
  };

  const handleUpdateNotice = (formData) => {
    if (editingNotice) {
      updateMutation.mutate({
        id: editingNotice._id,
        data: formData,
      });
      setEditingNotice(null);
    }
  };

  const handleDeleteNotice = (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      deleteMutation.mutate(noticeId);
    }
  };

  const handleToggleDone = (noticeId, currentStatus) => {
    markDoneMutation.mutate({ id: noticeId, isDone: !currentStatus });
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  const getPriorityIcon = (level) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5" />;
      case 'low':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getPriorityColors = (level) => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-rose-50 dark:bg-rose-900/10',
          border: 'border-rose-200 dark:border-rose-800',
          badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
          icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-amber-200 dark:border-amber-800',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
          icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        };
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/10',
          border: 'border-blue-200 dark:border-blue-800',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
          icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-900/10',
          border: 'border-slate-200 dark:border-slate-800',
          badge: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
          icon: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
        };
    }
  };

  const isOverdue = (deadline, isDone) => {
    if (!deadline || isDone) return false;
    return new Date(deadline) < new Date();
  };

  const isDueSoon = (deadline, isDone) => {
    if (!deadline || isDone) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);
    return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notice Board</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <Plus className="h-4 w-4" />
          Add Notice
        </button>
      </div>

      {/* Notices Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface p-12">
          <p className="text-sm text-slate-500">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface p-12">
          <Bell className="mb-3 h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">No notices yet. Create your first notice!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => {
            const colors = getPriorityColors(notice.noticeLevel);
            const overdue = isOverdue(notice.deadline, notice.isDone);
            const dueSoon = isDueSoon(notice.deadline, notice.isDone);

            return (
              <div
                key={notice._id}
                className={`rounded-2xl border p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg ${
                  notice.isDone ? 'opacity-60' : ''
                } ${colors.bg} ${colors.border}`}
              >
                {/* Header with Icon and Actions */}
                <div className="mb-3 flex items-start justify-between">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${colors.icon}`}>
                    {getPriorityIcon(notice.noticeLevel)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-800/50"
                      title="Edit notice"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleDone(notice._id, notice.isDone)}
                      className={`rounded-lg p-2 transition ${
                        notice.isDone
                          ? 'text-emerald-600 hover:bg-white/50 dark:hover:bg-slate-800/50'
                          : 'text-slate-400 hover:bg-white/50 hover:text-emerald-600 dark:hover:bg-slate-800/50'
                      }`}
                      title={notice.isDone ? 'Mark as not done' : 'Mark as done'}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/50 hover:text-rose-600 dark:hover:bg-slate-800/50"
                      title="Delete notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100 ${notice.isDone ? 'line-through' : ''}`}>
                  {notice.title}
                </h3>

                {/* Description */}
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{notice.description}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {/* Priority Badge */}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colors.badge}`}>
                    {notice.noticeLevel}
                  </span>

                  {/* Deadline Badge */}
                  {notice.deadline && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        overdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                          : dueSoon
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {overdue ? 'Overdue' : dueSoon ? 'Due Soon' : formatDeadline(notice.deadline)}
                    </span>
                  )}

                  {/* Done Badge */}
                  {notice.isDone && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <NoticeFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingNotice ? handleUpdateNotice : handleCreateNotice}
        initialData={editingNotice}
      />
    </div>
  );
};
