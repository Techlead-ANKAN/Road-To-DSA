import Task from '../models/Task.js';

// Get tasks for a user with optional date range filtering
export const getTasks = async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, date } = req.query;

  let query = { userId };

  if (date) {
    // Get tasks for a specific date
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
    query.date = { $gte: targetDate, $lt: nextDay };
  } else if (startDate && endDate) {
    // Get tasks within date range
    const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
    const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
    query.date = {
      $gte: new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0),
      $lte: new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999),
    };
  }

  const tasks = await Task.find(query).sort({ date: 1, order: 1 });
  res.json(tasks);
};

// Get tasks for a specific date
export const getTasksByDate = async (req, res) => {
  const { userId, date } = req.params;

  // Parse date string as local date to avoid timezone shift
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

  const tasks = await Task.find({
    userId,
    date: { $gte: targetDate, $lt: nextDay },
  }).sort({ order: 1 });

  res.json(tasks);
};

// Create a new task
export const createTask = async (req, res) => {
  const { userId, title, description, date, priority } = req.body;

  // Validate date is within 3 months range
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  // Parse date string as local date to avoid timezone shift
  const [year, month, day] = date.split('-').map(Number);
  const taskDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (taskDate < threeMonthsAgo || taskDate > threeMonthsLater) {
    return res.status(400).json({
      error: 'Task date must be within 3 months in the past or future',
    });
  }

  // Get the highest order for tasks on this date
  const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  const maxOrderTask = await Task.findOne({
    userId,
    date: {
      $gte: taskDate,
      $lt: nextDay,
    },
  }).sort({ order: -1 });

  const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

  const task = new Task({
    userId,
    title,
    description,
    date: taskDate,
    priority: priority || 'medium',
    order,
  });

  await task.save();
  res.status(201).json(task);
};

// Update a task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // If date is being updated, validate it
  if (updates.date) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    // Parse date string as local date to avoid timezone shift
    const [year, month, day] = updates.date.split('-').map(Number);
    const taskDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    if (taskDate < threeMonthsAgo || taskDate > threeMonthsLater) {
      return res.status(400).json({
        error: 'Task date must be within 3 months in the past or future',
      });
    }
    updates.date = taskDate;
  }

  const task = await Task.findByIdAndUpdate(id, updates, { new: true });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
};

// Delete a task
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  const task = await Task.findByIdAndDelete(id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ message: 'Task deleted successfully' });
};

// Reorder tasks (swap order of two tasks)
export const reorderTasks = async (req, res) => {
  const { taskId1, taskId2 } = req.body;

  const task1 = await Task.findById(taskId1);
  const task2 = await Task.findById(taskId2);

  if (!task1 || !task2) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Swap order values
  const tempOrder = task1.order;
  task1.order = task2.order;
  task2.order = tempOrder;

  await task1.save();
  await task2.save();

  res.json({ task1, task2 });
};

// Get today's task counts (assigned and completed)
export const getTodayCount = async (req, res) => {
  const { userId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const allTasks = await Task.find({
    userId,
    date: { $gte: today, $lt: tomorrow },
  });

  const assigned = allTasks.length;
  const completed = allTasks.filter(task => task.completed).length;

  res.json({ assigned, completed });
};

// Get total completed task count
export const getCompletedCount = async (req, res) => {
  const { userId } = req.params;

  const count = await Task.countDocuments({
    userId,
    completed: true,
  });

  res.json({ count });
};

// Get weekly task completion stats (last 7 days)
export const getWeeklyStats = async (req, res) => {
  const { userId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sixDaysAgo = new Date(today);
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

  const allTasks = await Task.find({
    userId,
    date: { $gte: sixDaysAgo, $lte: today },
  });

  // Group by date
  const stats = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sixDaysAgo);
    date.setDate(date.getDate() + i);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayTasks = allTasks.filter(
      (task) => task.date >= date && task.date < nextDay
    );

    const assigned = dayTasks.length;
    const completed = dayTasks.filter(task => task.completed).length;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];

    stats.push({
      date: date.toISOString().split('T')[0],
      day: dayName,
      assigned,
      completed,
    });
  }

  res.json(stats);
};

// Get work streak (consecutive days with >75% task completion)
export const getWorkStreak = async (req, res) => {
  const { userId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all tasks up to today, sorted by date descending
  const tasks = await Task.find({
    userId,
    date: { $lte: today },
  }).sort({ date: -1 });

  if (tasks.length === 0) {
    return res.json({ streak: 0 });
  }

  // Group tasks by date and filter qualifying days (>75% completion)
  const qualifyingDates = [];
  const tasksByDate = {};
  
  tasks.forEach((task) => {
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    const dateKey = taskDate.getTime();
    
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = {
        date: taskDate,
        tasks: [],
      };
    }
    tasksByDate[dateKey].tasks.push(task);
  });

  // Calculate completion rate for each day and filter qualifying days
  Object.values(tasksByDate).forEach((dayData) => {
    const completedCount = dayData.tasks.filter(task => task.completed).length;
    const completionRate = completedCount / dayData.tasks.length;
    
    if (completionRate >= 0.75) {
      qualifyingDates.push(dayData.date);
    }
  });

  if (qualifyingDates.length === 0) {
    return res.json({ streak: 0 });
  }

  // Sort dates descending
  qualifyingDates.sort((a, b) => b.getTime() - a.getTime());

  // Check if the most recent qualifying day is today or yesterday
  const mostRecentDate = qualifyingDates[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (mostRecentDate < yesterday) {
    return res.json({ streak: 0 });
  }

  // Count consecutive days (first day = 0, then increment for each additional day)
  let streak = 0;
  let currentDate = new Date(mostRecentDate);
  let foundFirstDay = false;

  for (const qualifyingDate of qualifyingDates) {
    if (qualifyingDate.getTime() === currentDate.getTime()) {
      if (foundFirstDay) {
        // Increment for days after the first
        streak++;
      }
      foundFirstDay = true;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (qualifyingDate < currentDate) {
      // Gap found, break
      break;
    }
  }

  res.json({ streak });
};

// Get tasks grouped by date for calendar view
export const getTasksForMonth = async (req, res) => {
  const { userId, year, month } = req.params;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const tasks = await Task.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1, order: 1 });

  // Group tasks by date
  const tasksByDate = {};
  tasks.forEach((task) => {
    // Format date as YYYY-MM-DD in local timezone
    const year = task.date.getFullYear();
    const month = String(task.date.getMonth() + 1).padStart(2, '0');
    const day = String(task.date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  res.json(tasksByDate);
};
