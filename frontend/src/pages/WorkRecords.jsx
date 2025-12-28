import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import {
  fetchTimeLogsForMonth,
  fetchWeeklyStats,
  deleteTimeEntry,
  updateTimeEntry,
} from '../api/timeLog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
  work: '#3b82f6',
  study: '#10b981',
  meeting: '#a855f7',
  break: '#f97316',
};

const CATEGORY_LABELS = {
  work: 'Work',
  study: 'Study',
  meeting: 'Meeting',
  break: 'Break',
};

const WorkRecords = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // State for date navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Fetch monthly data
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ['timeLogsMonth', user?.userId, year, month],
    queryFn: () => fetchTimeLogsForMonth(user.userId, year, month),
    enabled: !!user?.userId,
  });

  const timeLogs = monthlyData?.data || {};

  // Mutations
  const deleteEntryMutation = useMutation({
    mutationFn: ({ logId, entryId }) => deleteTimeEntry(logId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeLogsMonth']);
      queryClient.invalidateQueries(['timeLog']);
    },
  });

  // Navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate analytics
  const analytics = useMemo(() => {
    const hourDistribution = Array(24).fill(0);
    const categoryTotals = { work: 0, study: 0, meeting: 0, break: 0 };
    let totalMinutes = 0;
    let totalDays = 0;

    Object.values(timeLogs).forEach((log) => {
      if (log.entries && log.entries.length > 0) {
        totalDays++;
        log.entries.forEach((entry) => {
          totalMinutes += entry.durationMinutes;
          categoryTotals[entry.category] += entry.durationMinutes;

          // Parse start time to get hour
          const [startHour] = entry.startTime.split(':').map(Number);
          const [endHour] = entry.endTime.split(':').map(Number);

          // Distribute hours across the time range
          const hoursWorked = entry.durationMinutes / 60;
          if (startHour === endHour) {
            hourDistribution[startHour] += hoursWorked;
          } else {
            for (let h = startHour; h < endHour; h++) {
              hourDistribution[h] += hoursWorked / (endHour - startHour);
            }
          }
        });
      }
    });

    // Find peak hour
    const peakHourIndex = hourDistribution.indexOf(Math.max(...hourDistribution));
    const peakHour = peakHourIndex === 0 ? '12 AM' : 
                     peakHourIndex < 12 ? `${peakHourIndex} AM` : 
                     peakHourIndex === 12 ? '12 PM' : 
                     `${peakHourIndex - 12} PM`;

    // Find most used category
    const mostUsedCategory = Object.entries(categoryTotals).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    return {
      hourDistribution: hourDistribution.map((hours, index) => ({
        hour: index === 0 ? '12A' : index < 12 ? `${index}A` : index === 12 ? '12P' : `${index - 12}P`,
        hours: parseFloat(hours.toFixed(2)),
      })),
      categoryTotals,
      totalHours: (totalMinutes / 60).toFixed(1),
      totalDays,
      avgHoursPerDay: totalDays > 0 ? (totalMinutes / 60 / totalDays).toFixed(1) : '0.0',
      peakHour,
      mostUsedCategory: CATEGORY_LABELS[mostUsedCategory],
    };
  }, [timeLogs]);

  // Get sorted dates
  const sortedDates = Object.keys(timeLogs).sort((a, b) => b.localeCompare(a));

  const handleDeleteEntry = (logId, entryId) => {
    if (confirm('Delete this time entry?')) {
      deleteEntryMutation.mutate({ logId, entryId });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-hover rounded w-64 mb-4"></div>
          <div className="h-64 bg-surface-hover rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Work Records</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track and analyze your work patterns
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 bg-surface border border-surface-border rounded-lg font-medium min-w-[180px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors ml-2"
          >
            Today
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Hours</p>
              <p className="text-2xl font-bold">{analytics.totalHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active Days</p>
              <p className="text-2xl font-bold">{analytics.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg Per Day</p>
              <p className="text-2xl font-bold">{analytics.avgHoursPerDay}h</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Peak Hour</p>
              <p className="text-2xl font-bold">{analytics.peakHour}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Hourly Distribution */}
        <div className="bg-surface rounded-xl border border-surface-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Work Distribution by Hour
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.hourDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value}h`, 'Hours']}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-text-secondary mt-4 text-center">
            You work most during <span className="font-semibold text-text-primary">{analytics.peakHour}</span>
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="bg-surface rounded-xl border border-surface-border p-6">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(analytics.categoryTotals).map(([category, minutes]) => {
              const hours = (minutes / 60).toFixed(1);
              const percentage = analytics.totalHours > 0 
                ? ((minutes / (parseFloat(analytics.totalHours) * 60)) * 100).toFixed(1) 
                : 0;
              
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: CATEGORY_COLORS[category] }}
                      ></div>
                      <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {hours}h ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-hover rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: CATEGORY_COLORS[category],
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-text-secondary mt-4 text-center">
            Most used: <span className="font-semibold text-text-primary">{analytics.mostUsedCategory}</span>
          </p>
        </div>
      </div>

      {/* Daily Records */}
      <div className="bg-surface rounded-xl border border-surface-border p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Records</h3>

        {sortedDates.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No work sessions recorded this month</p>
            <p className="text-sm mt-1">Start tracking your work hours from the Dashboard</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((dateKey) => {
              const log = timeLogs[dateKey];
              const totalHours = (log.totalMinutes / 60).toFixed(1);

              return (
                <div key={dateKey} className="border border-surface-border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-semibold">{formatDate(dateKey)}</h4>
                      <p className="text-sm text-text-secondary">
                        {totalHours}h total · {log.entries.length} session{log.entries.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Timeline visualization */}
                  <div className="relative h-8 bg-surface-hover rounded mb-3">
                    {log.entries.map((entry) => {
                      const [startHour, startMin] = entry.startTime.split(':').map(Number);
                      const [endHour, endMin] = entry.endTime.split(':').map(Number);
                      const startPercent = ((startHour + startMin / 60) / 24) * 100;
                      const endPercent = ((endHour + endMin / 60) / 24) * 100;
                      const widthPercent = endPercent - startPercent;

                      return (
                        <div
                          key={entry._id}
                          className="absolute h-full rounded opacity-80"
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: CATEGORY_COLORS[entry.category],
                          }}
                          title={`${entry.startTime} - ${entry.endTime}`}
                        ></div>
                      );
                    })}
                  </div>

                  {/* Entry list */}
                  <div className="space-y-2">
                    {log.entries.map((entry) => (
                      <div
                        key={entry._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-hover rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-1 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">
                                {entry.startTime} - {entry.endTime}
                              </span>
                              <span className="px-2 py-0.5 bg-surface rounded text-xs">
                                {(entry.durationMinutes / 60).toFixed(1)}h
                              </span>
                              <span className="px-2 py-0.5 bg-surface rounded text-xs">
                                {CATEGORY_LABELS[entry.category]}
                              </span>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-text-secondary mt-1 truncate">
                                {entry.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(log._id, entry._id)}
                          disabled={deleteEntryMutation.isPending}
                          className="p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 self-end sm:self-center"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkRecords;
