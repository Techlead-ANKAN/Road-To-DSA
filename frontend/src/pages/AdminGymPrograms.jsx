import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Edit2,
  Dumbbell,
  Clock,
  Hash,
  Weight,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  Flame,
  Zap,
  Heart,
} from 'lucide-react';
import {
  fetchAllWorkoutDays,
  createWorkoutDay,
  updateWorkoutDay,
  deleteWorkoutDay,
  addExercise,
  updateExercise as updateExerciseAPI,
  deleteExercise as deleteExerciseAPI,
} from '../api/gym';

const AdminGymPrograms = () => {
  const queryClient = useQueryClient();
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(null);
  const [isWorkoutDayModalOpen, setIsWorkoutDayModalOpen] = useState(false);
  const [isDeleteWorkoutModalOpen, setIsDeleteWorkoutModalOpen] = useState(false);
  const [workoutDayToDelete, setWorkoutDayToDelete] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);

  // Fetch all workout days
  const { data: workoutDays = [], isLoading } = useQuery({
    queryKey: ['workoutDays'],
    queryFn: fetchAllWorkoutDays,
  });

  // Mutations
  const createWorkoutDayMutation = useMutation({
    mutationFn: createWorkoutDay,
    onSuccess: (newDay) => {
      queryClient.invalidateQueries(['workoutDays']);
      toast.success('Workout day created!');
      setIsWorkoutDayModalOpen(false);
      setSelectedWorkoutDay(newDay);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create workout day');
    },
  });

  const deleteWorkoutDayMutation = useMutation({
    mutationFn: deleteWorkoutDay,
    onSuccess: () => {
      queryClient.invalidateQueries(['workoutDays']);
      toast.success('Workout day deleted!');
      setIsDeleteWorkoutModalOpen(false);
      setWorkoutDayToDelete(null);
      if (selectedWorkoutDay?._id === workoutDayToDelete?._id) {
        setSelectedWorkoutDay(null);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete workout day');
    },
  });

  const addExerciseMutation = useMutation({
    mutationFn: ({ workoutDayId, exerciseData }) =>
      addExercise(workoutDayId, exerciseData),
    onSuccess: (updatedDay) => {
      queryClient.invalidateQueries(['workoutDays']);
      setSelectedWorkoutDay(updatedDay);
      toast.success('Exercise added!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add exercise');
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: ({ workoutDayId, exerciseId, updates }) =>
      updateExerciseAPI(workoutDayId, exerciseId, updates),
    onSuccess: (updatedDay) => {
      queryClient.invalidateQueries(['workoutDays']);
      setSelectedWorkoutDay(updatedDay);
      setEditingExercise(null);
      toast.success('Exercise updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update exercise');
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: ({ workoutDayId, exerciseId }) =>
      deleteExerciseAPI(workoutDayId, exerciseId),
    onSuccess: (updatedDay) => {
      queryClient.invalidateQueries(['workoutDays']);
      setSelectedWorkoutDay(updatedDay);
      toast.success('Exercise deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete exercise');
    },
  });

  // Reorder exercises within the same category
  const handleMoveExercise = (category, currentIndex, direction) => {
    const categoryExercises = selectedWorkoutDay.exercises.filter(
      (ex) => (ex.category || 'main') === category
    );
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categoryExercises.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const exercise1 = categoryExercises[currentIndex];
    const exercise2 = categoryExercises[targetIndex];

    // Swap order values
    const updates = [
      updateExerciseAPI(selectedWorkoutDay._id, exercise1._id, {
        order: exercise2.order || 0,
      }),
      updateExerciseAPI(selectedWorkoutDay._id, exercise2._id, {
        order: exercise1.order || 0,
      }),
    ];

    Promise.all(updates)
      .then(() => {
        queryClient.invalidateQueries(['workoutDays']);
        // Find and update selected workout day
        const updatedDay = workoutDays.find((d) => d._id === selectedWorkoutDay._id);
        if (updatedDay) setSelectedWorkoutDay(updatedDay);
      })
      .catch((error) => {
        toast.error('Failed to reorder exercise');
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 xl:p-6 2xl:p-8">
      <div className="max-w-[2400px] mx-auto">
        {/* Header */}
        <div className="mb-4 xl:mb-6 2xl:mb-8">
          <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-text-primary mb-1 xl:mb-2">
            Gym Program Manager
          </h1>
          <p className="text-sm xl:text-base 2xl:text-lg text-text-secondary">
            Create and manage your workout days and exercises
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 xl:gap-6 2xl:gap-8">
          {/* Workout Days Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 bg-surface rounded-2xl border border-surface-border p-4 xl:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg xl:text-xl font-semibold">Workout Days</h2>
              <button
                onClick={() => setIsWorkoutDayModalOpen(true)}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {workoutDays.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No workout days yet</p>
                  <button
                    onClick={() => setIsWorkoutDayModalOpen(true)}
                    className="mt-3 text-primary hover:underline text-sm"
                  >
                    Create your first day
                  </button>
                </div>
              ) : (
                workoutDays.map((day) => (
                  <div
                    key={day._id}
                    onClick={() => setSelectedWorkoutDay(day)}
                    className={`p-3 xl:p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedWorkoutDay?._id === day._id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-hover border-transparent hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm xl:text-base font-semibold truncate">
                          {day.name}
                        </h3>
                        <p className="text-xs xl:text-sm text-text-secondary">
                          {day.exercises?.length || 0} exercise
                          {day.exercises?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkoutDayToDelete(day);
                          setIsDeleteWorkoutModalOpen(true);
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Exercise Manager */}
          <div className="flex-1 bg-surface rounded-2xl border border-surface-border p-4 xl:p-6 2xl:p-8">
            {selectedWorkoutDay ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold mb-2">
                    {selectedWorkoutDay.name}
                  </h2>
                  <p className="text-sm xl:text-base text-text-secondary">
                    Manage exercises for this workout day
                  </p>
                </div>

                {/* Exercise List - Grouped by Category */}
                <div className="mb-6">
                  <h3 className="text-lg xl:text-xl font-semibold mb-4">
                    Exercises ({selectedWorkoutDay.exercises?.length || 0})
                  </h3>

                  {selectedWorkoutDay.exercises && selectedWorkoutDay.exercises.length > 0 ? (
                    <div className="space-y-6">
                      {/* Warmup Section */}
                      {(() => {
                        const warmupExercises = selectedWorkoutDay.exercises
                          .filter((ex) => (ex.category || 'main') === 'warmup')
                          .sort((a, b) => (a.order || 0) - (b.order || 0));
                        if (warmupExercises.length === 0) return null;
                        return (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Flame className="w-5 h-5 text-orange-500" />
                              <h4 className="text-base xl:text-lg font-semibold text-orange-500">
                                WARM-UP
                              </h4>
                              <div className="flex-1 h-px bg-orange-500/20"></div>
                            </div>
                            <div className="space-y-3 bg-orange-50/30 dark:bg-orange-950/10 rounded-lg p-3">
                              {warmupExercises.map((exercise, index) => (
                                <ExerciseCard
                                  key={exercise._id}
                                  exercise={exercise}
                                  index={index}
                                  category="warmup"
                                  categoryExercises={warmupExercises}
                                  onEdit={() => setEditingExercise(exercise)}
                                  onDelete={() =>
                                    deleteExerciseMutation.mutate({
                                      workoutDayId: selectedWorkoutDay._id,
                                      exerciseId: exercise._id,
                                    })
                                  }
                                  onMoveUp={() => handleMoveExercise('warmup', index, 'up')}
                                  onMoveDown={() => handleMoveExercise('warmup', index, 'down')}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Main Exercises Section */}
                      {(() => {
                        const mainExercises = selectedWorkoutDay.exercises
                          .filter((ex) => (ex.category || 'main') === 'main')
                          .sort((a, b) => (a.order || 0) - (b.order || 0));
                        if (mainExercises.length === 0) return null;
                        return (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Zap className="w-5 h-5 text-blue-500" />
                              <h4 className="text-base xl:text-lg font-semibold text-blue-500">
                                MAIN WORKOUT
                              </h4>
                              <div className="flex-1 h-px bg-blue-500/20"></div>
                            </div>
                            <div className="space-y-3 bg-blue-50/30 dark:bg-blue-950/10 rounded-lg p-3">
                              {mainExercises.map((exercise, index) => (
                                <ExerciseCard
                                  key={exercise._id}
                                  exercise={exercise}
                                  index={index}
                                  category="main"
                                  categoryExercises={mainExercises}
                                  onEdit={() => setEditingExercise(exercise)}
                                  onDelete={() =>
                                    deleteExerciseMutation.mutate({
                                      workoutDayId: selectedWorkoutDay._id,
                                      exerciseId: exercise._id,
                                    })
                                  }
                                  onMoveUp={() => handleMoveExercise('main', index, 'up')}
                                  onMoveDown={() => handleMoveExercise('main', index, 'down')}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Cardio Section */}
                      {(() => {
                        const cardioExercises = selectedWorkoutDay.exercises
                          .filter((ex) => (ex.category || 'main') === 'cardio')
                          .sort((a, b) => (a.order || 0) - (b.order || 0));
                        if (cardioExercises.length === 0) return null;
                        return (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Heart className="w-5 h-5 text-red-500" />
                              <h4 className="text-base xl:text-lg font-semibold text-red-500">
                                CARDIO
                              </h4>
                              <div className="flex-1 h-px bg-red-500/20"></div>
                            </div>
                            <div className="space-y-3 bg-red-50/30 dark:bg-red-950/10 rounded-lg p-3">
                              {cardioExercises.map((exercise, index) => (
                                <ExerciseCard
                                  key={exercise._id}
                                  exercise={exercise}
                                  index={index}
                                  category="cardio"
                                  categoryExercises={cardioExercises}
                                  onEdit={() => setEditingExercise(exercise)}
                                  onDelete={() =>
                                    deleteExerciseMutation.mutate({
                                      workoutDayId: selectedWorkoutDay._id,
                                      exerciseId: exercise._id,
                                    })
                                  }
                                  onMoveUp={() => handleMoveExercise('cardio', index, 'up')}
                                  onMoveDown={() => handleMoveExercise('cardio', index, 'down')}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      <p>No exercises added yet</p>
                    </div>
                  )}
                </div>

                {/* Add/Edit Exercise Form */}
                <ExerciseForm
                  workoutDayId={selectedWorkoutDay._id}
                  exercise={editingExercise}
                  onSubmit={(exerciseData) => {
                    if (editingExercise) {
                      updateExerciseMutation.mutate({
                        workoutDayId: selectedWorkoutDay._id,
                        exerciseId: editingExercise._id,
                        updates: exerciseData,
                      });
                    } else {
                      addExerciseMutation.mutate({
                        workoutDayId: selectedWorkoutDay._id,
                        exerciseData,
                      });
                    }
                  }}
                  onCancel={() => setEditingExercise(null)}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" />
                  <p className="text-text-secondary mb-4">
                    Select a workout day from the left panel to manage its exercises
                  </p>
                  <button
                    onClick={() => setIsWorkoutDayModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Workout Day
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workout Day Modal */}
      <WorkoutDayModal
        isOpen={isWorkoutDayModalOpen}
        onClose={() => setIsWorkoutDayModalOpen(false)}
        onSubmit={(name) => createWorkoutDayMutation.mutate({ name, exercises: [] })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteWorkoutModalOpen}
        onClose={() => {
          setIsDeleteWorkoutModalOpen(false);
          setWorkoutDayToDelete(null);
        }}
        onConfirm={() => {
          if (workoutDayToDelete) {
            deleteWorkoutDayMutation.mutate(workoutDayToDelete._id);
          }
        }}
        title={workoutDayToDelete?.name}
      />
    </div>
  );
};

// Exercise Card Component
const ExerciseCard = ({ exercise, index, category, categoryExercises, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  return (
    <div className="bg-surface-hover rounded-lg p-3 xl:p-4 border border-surface-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-secondary">
              #{index + 1}
            </span>
            <h4 className="text-sm xl:text-base font-semibold truncate">
              {exercise.name}
            </h4>
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {exercise.type === 'count' ? 'Sets/Reps' : 'Time'}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs xl:text-sm text-text-secondary">
            {exercise.type === 'count' ? (
              <>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {exercise.defaultSets} sets
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {exercise.defaultReps} reps
                </span>
                {exercise.defaultWeight > 0 && (
                  <span className="flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    {exercise.defaultWeight} kg
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {exercise.defaultTime} min
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 hover:bg-surface rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === categoryExercises.length - 1}
              className="p-1 hover:bg-surface rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Exercise Form Component
const ExerciseForm = ({ workoutDayId, exercise, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    type: exercise?.type || 'count',
    category: exercise?.category || 'main',
    defaultSets: exercise?.defaultSets || 3,
    defaultReps: exercise?.defaultReps || 10,
    defaultWeight: exercise?.defaultWeight || 0,
    defaultTime: exercise?.defaultTime || 30,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter exercise name');
      return;
    }
    onSubmit(formData);
    if (!exercise) {
      setFormData({
        name: '',
        type: 'count',
        category: 'main',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
        defaultTime: 30,
      });
    }
  };

  return (
    <div className="bg-surface-hover rounded-xl p-4 xl:p-6 border border-surface-border">
      <h3 className="text-lg xl:text-xl font-semibold mb-4">
        {exercise ? 'Edit Exercise' : 'Add New Exercise'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Exercise Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Bench Press, Squats, Pull-ups"
            className="w-full px-4 py-2 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, category: 'warmup' })}
              className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all ${
                formData.category === 'warmup'
                  ? 'bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-950/30'
                  : 'bg-surface border-surface-border hover:border-orange-500/30'
              }`}
            >
              <Flame className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs font-medium">Warmup</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, category: 'main' })}
              className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all ${
                formData.category === 'main'
                  ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-950/30'
                  : 'bg-surface border-surface-border hover:border-blue-500/30'
              }`}
            >
              <Zap className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs font-medium">Main</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, category: 'cardio' })}
              className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all ${
                formData.category === 'cardio'
                  ? 'bg-red-50 border-red-500 text-red-600 dark:bg-red-950/30'
                  : 'bg-surface border-surface-border hover:border-red-500/30'
              }`}
            >
              <Heart className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs font-medium">Cardio</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Exercise Type</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'count' })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                formData.type === 'count'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface border-surface-border hover:border-primary/30'
              }`}
            >
              <Hash className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Sets & Reps</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'time' })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                formData.type === 'time'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface border-surface-border hover:border-primary/30'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Time-based</span>
            </button>
          </div>
        </div>

        {formData.type === 'count' ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Sets</label>
              <input
                type="number"
                min="1"
                value={formData.defaultSets}
                onChange={(e) =>
                  setFormData({ ...formData, defaultSets: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reps</label>
              <input
                type="number"
                min="1"
                value={formData.defaultReps}
                onChange={(e) =>
                  setFormData({ ...formData, defaultReps: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.defaultWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultWeight: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={formData.defaultTime}
              onChange={(e) =>
                setFormData({ ...formData, defaultTime: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {exercise && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-surface rounded-lg hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {exercise ? 'Update Exercise' : 'Add Exercise'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Workout Day Modal
const WorkoutDayModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a workout day name');
      return;
    }
    onSubmit(name);
    setName('');
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
          <h2 className="text-xl font-semibold">Create Workout Day</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Workout Day Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chest Day, Leg Day, Upper Body"
              className="w-full px-4 py-2 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={100}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface-hover rounded-lg hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-2xl border border-surface-border p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-semibold mb-4">Delete Workout Day</h2>
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete "<strong>{title}</strong>"? This will remove all
          associated gym logs from the calendar. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-surface-hover rounded-lg hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminGymPrograms;
