import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import {
  fetchTimeLogByDate,
  createOrUpdateTimeLog,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '../api/timeLog';

const CATEGORY_COLORS = {
  work: 'bg-blue-500',
  study: 'bg-green-500',
  meeting: 'bg-purple-500',
  break: 'bg-orange-500',
};

const CATEGORY_LABELS = {
  work: 'Work',
  study: 'Study',
  meeting: 'Meeting',
  break: 'Break',
};

const TimelineTracker = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // State for quick-add form
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('work');
  const [description, setDescription] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);

  // Fetch today's time log
  const { data: timeLogData, isLoading } = useQuery({
    queryKey: ['timeLog', user?.userId, today],
    queryFn: () => fetchTimeLogByDate(user.userId, today),
    enabled: !!user?.userId,
  });

  const timeLog = timeLogData?.data || { entries: [], totalMinutes: 0, _id: null };

  // Mutation to create/update time log or add entry
  const addEntryMutation = useMutation({
    mutationFn: async (entryData) => {
      if (timeLog._id) {
        // Add entry to existing log
        return await addTimeEntry(timeLog._id, entryData);
      } else {
        // Create new log with entry
        return await createOrUpdateTimeLog({
          userId: user.userId,
          date: today,
          entries: [entryData],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['timeLog', user.userId]);
      queryClient.invalidateQueries(['todayTotal', user.userId]);
      queryClient.invalidateQueries(['weeklyStats', user.userId]);
      resetForm();
    },
  });

  // Mutation to update entry
  const updateEntryMutation = useMutation({
    mutationFn: ({ entryId, updates }) =>
      updateTimeEntry(timeLog._id, entryId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeLog', user.userId]);
      queryClient.invalidateQueries(['todayTotal', user.userId]);
      queryClient.invalidateQueries(['weeklyStats', user.userId]);
      setEditingEntry(null);
    },
  });

  // Mutation to delete entry
  const deleteEntryMutation = useMutation({
    mutationFn: (entryId) => deleteTimeEntry(timeLog._id, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeLog', user.userId]);
      queryClient.invalidateQueries(['todayTotal', user.userId]);
      queryClient.invalidateQueries(['weeklyStats', user.userId]);
    },
  });

  const resetForm = () => {
    setDuration('');
    setDescription('');
    setCategory('work');
    setEditingEntry(null);
  };

  const handleQuickAdd = (durationHours) => {
    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const durationMinutes = durationHours * 60;
    const startDate = new Date(now.getTime() - durationMinutes * 60 * 1000);
    const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(
      startDate.getMinutes()
    ).padStart(2, '0')}`;

    const entryData = {
      startTime,
      endTime,
      durationMinutes,
      description: description || `${durationHours}h work session`,
      category,
    };

    addEntryMutation.mutate(entryData);
  };

  const handleCustomAdd = () => {
    if (!duration || parseFloat(duration) <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    const durationHours = parseFloat(duration);
    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const durationMinutes = Math.round(durationHours * 60);
    const startDate = new Date(now.getTime() - durationMinutes * 60 * 1000);
    const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(
      startDate.getMinutes()
    ).padStart(2, '0')}`;

    const entryData = {
      startTime,
      endTime,
      durationMinutes,
      description: description || `${durationHours}h ${category} session`,
      category,
    };

    addEntryMutation.mutate(entryData);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setDuration((entry.durationMinutes / 60).toString());
    setDescription(entry.description);
    setCategory(entry.category);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || !duration || parseFloat(duration) <= 0) {
      return;
    }

    const durationMinutes = Math.round(parseFloat(duration) * 60);

    updateEntryMutation.mutate({
      entryId: editingEntry._id,
      updates: {
        durationMinutes,
        description,
        category,
      },
    });
  };

  const handleDeleteEntry = (entryId) => {
    if (confirm('Delete this time entry?')) {
      deleteEntryMutation.mutate(entryId);
    }
  };

  const totalHours = (timeLog.totalMinutes / 60).toFixed(1);

  // Calculate timeline blocks
  const timelineBlocks = timeLog.entries.map((entry) => {
    const [startHour, startMin] = entry.startTime.split(':').map(Number);
    const [endHour, endMin] = entry.endTime.split(':').map(Number);

    const startPercent = ((startHour + startMin / 60) / 24) * 100;
    const endPercent = ((endHour + endMin / 60) / 24) * 100;
    const widthPercent = endPercent - startPercent;

    return {
      ...entry,
      startPercent,
      widthPercent,
    };
  });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-2xl border border-surface-border p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-hover rounded w-48 mb-4"></div>
          <div className="h-24 bg-surface-hover rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Today's Work Timeline</h3>
            <p className="text-sm text-text-secondary">
              Total: <span className="font-semibold text-text-primary">{totalHours}h</span>{' '}
              <span className="text-text-tertiary">
                ({timeLog.entries.length} session{timeLog.entries.length !== 1 ? 's' : ''})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="mb-8">
        <div className="relative h-12 sm:h-16 bg-surface-hover rounded-lg overflow-hidden">
          {/* Hour markers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
              <div
                key={hour}
                className="absolute h-full border-l border-surface-border"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
              </div>
            ))}
          </div>

          {/* Time blocks */}
          {timelineBlocks.map((block) => (
            <div
              key={block._id}
              className={`absolute h-full ${CATEGORY_COLORS[block.category]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer group`}
              style={{
                left: `${block.startPercent}%`,
                width: `${block.widthPercent}%`,
              }}
              title={`${block.startTime} - ${block.endTime} (${(block.durationMinutes / 60).toFixed(1)}h)`}
            >
              <div className="h-full flex items-center justify-center">
                <span className="text-xs font-medium text-white hidden sm:inline">
                  {(block.durationMinutes / 60).toFixed(1)}h
                </span>
              </div>
            </div>
          ))}

          {/* Current time indicator */}
          {(() => {
            const now = new Date();
            const currentPercent = ((now.getHours() + now.getMinutes() / 60) / 24) * 100;
            return (
              <div
                className="absolute h-full w-0.5 bg-red-500"
                style={{ left: `${currentPercent}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            );
          })()}
        </div>

        {/* Hour labels below timeline */}
        <div className="hidden sm:flex justify-between mt-2 px-1">
          {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
            <span key={hour} className="text-[9px] text-text-tertiary whitespace-nowrap -translate-x-1/2">
              {hour === 0 || hour === 24 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`}
            </span>
          ))}
        </div>

        {/* Mobile hour markers */}
        <div className="flex sm:hidden gap-0.5 mt-2 overflow-x-auto pb-1">
          {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
            <span key={hour} className="text-[8px] text-text-tertiary flex-shrink-0 min-w-[24px] text-center">
              {hour === 0 || hour === 24 ? '12A' : hour < 12 ? `${hour}A` : hour === 12 ? '12P' : `${hour - 12}P`}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-surface-hover rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Preset buttons - responsive grid */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => handleQuickAdd(1)}
              disabled={addEntryMutation.isPending}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              +1h
            </button>
            <button
              onClick={() => handleQuickAdd(2)}
              disabled={addEntryMutation.isPending}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              +2h
            </button>
            <button
              onClick={() => handleQuickAdd(3)}
              disabled={addEntryMutation.isPending}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              +3h
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-surface-border"></div>
          <div className="lg:hidden h-px bg-surface-border"></div>

          {/* Custom entry form */}
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <input
              type="number"
              step="0.5"
              min="0.5"
              placeholder="Hours (e.g., 1.5)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="flex-1 sm:w-24 px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 sm:w-28 px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 sm:flex-auto px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {editingEntry ? (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateEntry}
                  disabled={updateEntryMutation.isPending}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Update
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 sm:flex-none px-4 py-2 bg-surface-hover hover:bg-surface border border-surface-border text-text-secondary rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleCustomAdd}
                disabled={addEntryMutation.isPending}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Entry List */}
      {timeLog.entries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-secondary mb-3">Today's Sessions</h4>
          {timeLog.entries
            .slice()
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((entry) => (
              <div
                key={entry._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-hover rounded-lg hover:bg-surface-border transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-1 h-8 sm:h-10 ${CATEGORY_COLORS[entry.category]} rounded-full flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {entry.startTime} - {entry.endTime}
                      </span>
                      <span className="px-2 py-0.5 bg-surface rounded text-xs text-text-secondary">
                        {(entry.durationMinutes / 60).toFixed(1)}h
                      </span>
                      <span className="px-2 py-0.5 bg-surface rounded text-xs text-text-secondary">
                        {CATEGORY_LABELS[entry.category]}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-text-secondary truncate">{entry.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="p-2 hover:bg-surface rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    disabled={deleteEntryMutation.isPending}
                    className="p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {timeLog.entries.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No work sessions logged today</p>
          <p className="text-sm mt-1">Use the quick add buttons or custom form above to start tracking</p>
        </div>
      )}
    </div>
  );
};

export default TimelineTracker;
