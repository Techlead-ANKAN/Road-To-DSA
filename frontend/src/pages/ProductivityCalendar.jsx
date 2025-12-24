import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import {
  fetchTasksForMonth,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../api/task';

const ProductivityCalendar = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks for the current month
  const { data: tasksByDate = {}, isLoading } = useQuery({
    queryKey: ['tasks', user?.userId, currentDate.year(), currentDate.month() + 1],
    queryFn: () =>
      fetchTasksForMonth(user.userId, currentDate.year(), currentDate.month() + 1),
    enabled: !!user?.userId,
  });

  // Get tasks for selected date
  const selectedDateKey = selectedDate.format('YYYY-MM-DD');
  const selectedDayTasks = tasksByDate[selectedDateKey] || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', user.userId]);
      toast.success('Task created successfully!');
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create task');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, updates }) => updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', user.userId]);
      toast.success('Task updated successfully!');
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update task');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', user.userId]);
      toast.success('Task deleted successfully!');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ taskId1, taskId2 }) => reorderTasks(taskId1, taskId2),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', user.userId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to reorder tasks');
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ taskId, completed }) => updateTask(taskId, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', user.userId]);
    },
  });

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

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

  // Check if a date's tasks are all completed
  const isDateCompleted = (date) => {
    const dateKey = date.format('YYYY-MM-DD');
    const tasks = tasksByDate[dateKey];
    return tasks && tasks.length > 0 && tasks.every((task) => task.completed);
  };

  // Handle task reordering
  const moveTaskUp = (index) => {
    if (index === 0) return;
    const task1 = selectedDayTasks[index];
    const task2 = selectedDayTasks[index - 1];
    reorderMutation.mutate({ taskId1: task1._id, taskId2: task2._id });
  };

  const moveTaskDown = (index) => {
    if (index === selectedDayTasks.length - 1) return;
    const task1 = selectedDayTasks[index];
    const task2 = selectedDayTasks[index + 1];
    reorderMutation.mutate({ taskId1: task1._id, taskId2: task2._id });
  };

  // Handle task form submission
  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      updateMutation.mutate({ taskId: editingTask._id, updates: taskData });
    } else {
      createMutation.mutate({ ...taskData, userId: user.userId });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
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
            Productivity Calendar
          </h1>
          <p className="text-sm xl:text-base 2xl:text-lg text-text-secondary">
            Manage your tasks and track habits with precision
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
                const dayTasks = tasksByDate[dateKey] || [];
                const isCompleted = isDateCompleted(day);

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative h-16 md:h-20 xl:h-24 2xl:h-28 rounded-lg border-2 transition-all
                      ${isToday ? 'bg-green-50 dark:bg-green-900/20 border-green-400' : 'border-transparent'}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                      ${isCurrentMonth ? 'bg-surface-hover' : 'bg-surface opacity-40'}
                      hover:ring-2 hover:ring-primary/50
                    `}
                  >
                    <div className="absolute top-1 left-2 text-xs xl:text-sm 2xl:text-base font-semibold">
                      {day.date()}
                    </div>

                    {/* Task indicators */}
                    {dayTasks.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5 justify-center">
                        {dayTasks.slice(0, 3).map((task, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 xl:w-2 xl:h-2 rounded-full ${
                              task.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[8px] xl:text-[10px] text-text-secondary">
                            +{dayTasks.length - 3}
                          </span>
                        )}
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

          {/* Task List Panel */}
          <div className="w-full lg:w-96 xl:w-[26rem] 2xl:w-[30rem] bg-surface rounded-2xl border border-surface-border p-4 xl:p-6 2xl:p-8">
            <div className="flex items-center justify-between mb-4 xl:mb-6">
              <div>
                <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold">
                  {selectedDate.format('MMM D, YYYY')}
                </h3>
                <p className="text-xs xl:text-sm text-text-secondary">
                  {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-2 xl:space-y-3 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {selectedDayTasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-surface-hover rounded-lg p-3 xl:p-4 border border-surface-border"
                  >
                    <div className="flex items-start gap-2 xl:gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) =>
                          toggleCompleteMutation.mutate({
                            taskId: task._id,
                            completed: e.target.checked,
                          })
                        }
                        className="mt-1 w-4 h-4 xl:w-5 xl:h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`text-sm xl:text-base 2xl:text-lg font-medium ${
                              task.completed
                                ? 'line-through text-text-secondary'
                                : 'text-text-primary'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] xl:text-xs rounded-full font-medium whitespace-nowrap ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs xl:text-sm text-text-secondary mb-2">
                            {task.description}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveTaskUp(index)}
                            disabled={index === 0}
                            className="p-1 hover:bg-surface rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="w-3 h-3 xl:w-4 xl:h-4" />
                          </button>
                          <button
                            onClick={() => moveTaskDown(index)}
                            disabled={index === selectedDayTasks.length - 1}
                            className="p-1 hover:bg-surface rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-3 h-3 xl:w-4 xl:h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1 hover:bg-surface rounded"
                          >
                            <Edit2 className="w-3 h-3 xl:w-4 xl:h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded"
                          >
                            <Trash2 className="w-3 h-3 xl:w-4 xl:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {selectedDayTasks.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 mx-auto text-text-secondary/30 mb-3" />
                  <p className="text-text-secondary">No tasks for this day</p>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-3 text-primary hover:underline text-sm"
                  >
                    Add your first task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        defaultDate={selectedDate.format('YYYY-MM-DD')}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={() => {
          if (taskToDelete) {
            deleteMutation.mutate(taskToDelete._id);
          }
        }}
        taskTitle={taskToDelete?.title}
      />
    </div>
  );
};

// Task Modal Component
const TaskModal = ({ isOpen, onClose, onSubmit, task, defaultDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: defaultDate,
    priority: 'medium',
  });

  // Update form when task changes
  useState(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        date: dayjs(task.date).format('YYYY-MM-DD'),
        priority: task.priority,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: defaultDate,
        priority: 'medium',
      });
    }
  }, [task, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-2xl border border-surface-border p-6 xl:p-8 max-w-md xl:max-w-lg 2xl:max-w-xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl xl:text-2xl font-semibold">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 xl:space-y-5">
          <div>
            <label className="block text-sm xl:text-base font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title"
              className="w-full px-4 py-2 xl:py-3 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm xl:text-base font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add details about this task"
              rows={4}
              className="w-full px-4 py-2 xl:py-3 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-sm xl:text-base font-medium mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 xl:py-3 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm xl:text-base font-medium mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-4 py-2 xl:py-3 bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 xl:py-3 bg-surface-hover rounded-lg hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 xl:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-2xl border border-surface-border p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-semibold mb-4">Delete Task</h2>
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete "<strong>{taskTitle}</strong>"? This action
          cannot be undone.
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

export default ProductivityCalendar;
