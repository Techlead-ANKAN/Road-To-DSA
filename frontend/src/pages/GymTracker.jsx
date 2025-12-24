import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Dumbbell,
  Plus,
  Minus,
  X,
  Trash2,
} from 'lucide-react';
import {
  fetchAllWorkoutDays,
  fetchGymLogsForMonth,
  createGymLog,
  updateGymLog,
  deleteGymLog,
} from '../api/gym';

const GymTracker = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch workout days and gym logs
  const { data: workoutDays = [] } = useQuery({
    queryKey: ['workoutDays'],
    queryFn: fetchAllWorkoutDays,
  });

  const { data: gymLogsByDate = {} } = useQuery({
    queryKey: ['gymLogs', user?.userId, currentDate.year(), currentDate.month() + 1],
    queryFn: () =>
      fetchGymLogsForMonth(user.userId, currentDate.year(), currentDate.month() + 1),
    enabled: !!user?.userId,
  });

  // Get log for selected date
  const selectedDateKey = selectedDate.format('YYYY-MM-DD');
  const selectedDayLog = gymLogsByDate[selectedDateKey];

  // Mutations
  const assignWorkoutMutation = useMutation({
    mutationFn: createGymLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['gymLogs', user.userId]);
      toast.success('Workout assigned!');
      setIsAssignModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to assign workout');
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: ({ logId, updates }) => updateGymLog(logId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['gymLogs', user.userId]);
      toast.success('Workout updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update workout');
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: deleteGymLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['gymLogs', user.userId]);
      toast.success('Workout unassigned!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to unassign workout');
    },
  });

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const goToToday = () => {
    const today = dayjs();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Calendar calculations
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const calendarDays = [];
  let day = startDate;
  while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
    calendarDays.push(day);
    day = day.add(1, 'day');
  }

  const handleAssignWorkout = (workoutDayId) => {
    assignWorkoutMutation.mutate({
      userId: user.userId,
      date: selectedDate.format('YYYY-MM-DD'),
      workoutDayId,
      exercises: [],
      completed: false,
    });
  };

  if (!user || !user.userId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg text-text-secondary">Please set up your profile first</p>
        <a
          href="/profile"
          className="px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
        >
          Go to Profile
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 xl:p-6 2xl:p-8">
      <div className="max-w-[2400px] mx-auto">
        {/* Header */}
        <div className="mb-4 xl:mb-6 2xl:mb-8">
          <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-text-primary mb-1 xl:mb-2">
            Gym Tracker
          </h1>
          <p className="text-sm xl:text-base 2xl:text-lg text-text-secondary">
            Plan workouts and track your fitness journey
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 xl:gap-6 2xl:gap-8">
          {/* Calendar Section */}
          <div className="flex-1 bg-surface rounded-2xl border border-surface-border p-4 xl:p-6 2xl:p-8">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 xl:mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 xl:w-6 xl:h-6" />
              </button>
              <div className="flex items-center gap-3 xl:gap-4">
                <h2 className="text-lg xl:text-xl 2xl:text-2xl font-semibold">
                  {currentDate.format('MMMM YYYY')}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-xs xl:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Today
                </button>
              </div>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 xl:w-6 xl:h-6" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 xl:gap-2 2xl:gap-3">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs xl:text-sm 2xl:text-base font-semibold text-text-secondary py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const isToday = day.isSame(dayjs(), 'day');
                const isCurrentMonth = day.month() === currentDate.month();
                const isSelected = day.isSame(selectedDate, 'day');
                const dateKey = day.format('YYYY-MM-DD');
                const log = gymLogsByDate[dateKey];
                const hasWorkout = !!log;
                const isCompleted = log?.completed;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative h-16 md:h-20 xl:h-24 2xl:h-28 rounded-lg border-2 transition-all
                      ${isToday ? 'bg-green-50 dark:bg-green-900/20 border-green-400' : 'border-transparent'}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                      ${isCurrentMonth ? 'bg-surface-hover' : 'bg-surface opacity-40'}
                      ${hasWorkout && !isCompleted ? 'bg-orange-50 dark:bg-orange-900/10' : ''}
                      hover:ring-2 hover:ring-primary/50
                    `}
                  >
                    <div className="absolute top-1 left-2 text-xs xl:text-sm 2xl:text-base font-semibold">
                      {day.date()}
                    </div>

                    {/* Workout indicator */}
                    {hasWorkout && !isCompleted && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                        <Dumbbell className="w-4 h-4 text-orange-500" />
                      </div>
                    )}

                    {/* Completed checkmark overlay */}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-lg"
                      >
                        <Check className="w-6 h-6 xl:w-8 xl:h-8 text-green-500" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workout Panel */}
          <div className="w-full lg:w-96 xl:w-[26rem] 2xl:w-[30rem] bg-surface rounded-2xl border border-surface-border p-4 xl:p-6 2xl:p-8">
            <div className="flex items-center justify-between mb-4 xl:mb-6">
              <div>
                <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold">
                  {selectedDate.format('MMM D, YYYY')}
                </h3>
                <p className="text-xs xl:text-sm text-text-secondary">
                  {selectedDayLog ? selectedDayLog.workoutDayId?.name : 'No workout assigned'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedDayLog ? (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to unassign this workout?')) {
                        deleteLogMutation.mutate(selectedDayLog._id);
                      }
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Unassign workout"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {selectedDayLog ? (
              <WorkoutLogger
                log={selectedDayLog}
                onUpdate={(updates) =>
                  updateLogMutation.mutate({ logId: selectedDayLog._id, updates })
                }
              />
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="w-12 h-12 mx-auto text-text-secondary/30 mb-3" />
                <p className="text-text-secondary mb-4">No workout assigned for this day</p>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Assign Workout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Workout Modal */}
      <AssignWorkoutModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        workoutDays={workoutDays}
        onAssign={handleAssignWorkout}
      />
    </div>
  );
};

// Workout Logger Component
const WorkoutLogger = ({ log, onUpdate }) => {
  const [exercises, setExercises] = useState(
    log.exercises.length > 0
      ? log.exercises
      : log.workoutDayId?.exercises.map((ex) => ({
          name: ex.name,
          type: ex.type,
          sets: ex.type === 'count' ? Array(ex.defaultSets).fill({ reps: ex.defaultReps, weight: ex.defaultWeight }) : [],
          time: ex.type === 'time' ? ex.defaultTime : 0,
          notes: '',
        })) || []
  );

  const handleAddSet = (exerciseIndex) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const template = log.workoutDayId.exercises[exerciseIndex];
    exercise.sets.push({ reps: template.defaultReps, weight: template.defaultWeight });
    setExercises(newExercises);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = parseFloat(value) || 0;
    setExercises(newExercises);
  };

  const handleTimeChange = (exerciseIndex, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].time = parseFloat(value) || 0;
    setExercises(newExercises);
  };

  const handleNotesChange = (exerciseIndex, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].notes = value;
    setExercises(newExercises);
  };

  const handleMarkAsDone = () => {
    onUpdate({ exercises, completed: true });
  };

  const handleSave = () => {
    onUpdate({ exercises });
  };

  return (
    <div className="space-y-4">
      <div className="max-h-[600px] overflow-y-auto space-y-4">
        {exercises.map((exercise, exerciseIndex) => (
          <div
            key={exerciseIndex}
            className="bg-surface-hover rounded-lg p-3 xl:p-4 border border-surface-border"
          >
            <h4 className="text-sm xl:text-base font-semibold mb-3">{exercise.name}</h4>

            {exercise.type === 'count' ? (
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-12">
                      Set {setIndex + 1}
                    </span>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ''}
                      onChange={(e) =>
                        handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)
                      }
                      className="flex-1 px-2 py-1 text-sm bg-background border border-surface-border rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-xs">×</span>
                    <input
                      type="number"
                      placeholder="Weight"
                      value={set.weight || ''}
                      onChange={(e) =>
                        handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)
                      }
                      className="flex-1 px-2 py-1 text-sm bg-background border border-surface-border rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-xs">kg</span>
                    <button
                      onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddSet(exerciseIndex)}
                  className="w-full py-1 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  + Add Set
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Duration"
                  value={exercise.time || ''}
                  onChange={(e) => handleTimeChange(exerciseIndex, e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">minutes</span>
              </div>
            )}

            <textarea
              placeholder="Notes (optional)"
              value={exercise.notes || ''}
              onChange={(e) => handleNotesChange(exerciseIndex, e.target.value)}
              rows={2}
              className="w-full mt-2 px-3 py-2 text-sm bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-surface-hover rounded-lg hover:bg-surface transition-colors"
        >
          Save Progress
        </button>
        <button
          onClick={handleMarkAsDone}
          disabled={log.completed}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {log.completed ? 'Completed' : 'Mark as Done'}
        </button>
      </div>
    </div>
  );
};

// Assign Workout Modal
const AssignWorkoutModal = ({ isOpen, onClose, workoutDays, onAssign }) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');

  const handleAssign = () => {
    if (!selectedWorkoutId) {
      toast.error('Please select a workout day');
      return;
    }
    onAssign(selectedWorkoutId);
    setSelectedWorkoutId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-2xl border border-surface-border p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Assign Workout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {workoutDays.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">
              No workout days available. Create one in Gym Admin first.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Select Workout Day</label>
              <div className="space-y-2">
                {workoutDays.map((day) => (
                  <button
                    key={day._id}
                    onClick={() => setSelectedWorkoutId(day._id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedWorkoutId === day._id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-hover border-transparent hover:border-primary/30'
                    }`}
                  >
                    <div className="font-semibold">{day.name}</div>
                    <div className="text-xs text-text-secondary mt-1">
                      {day.exercises?.length || 0} exercises
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-surface-hover rounded-lg hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Assign
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GymTracker;
