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

  // Group tasks by date
  const tasksByDate = {};
  tasks.forEach((task) => {
    const year = task.date.getFullYear();
    const month = String(task.date.getMonth() + 1).padStart(2, '0');
    const day = String(task.date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  // Calculate streak from today backwards
  let streak = 0;
  let currentDate = new Date(today);
  let foundFirstQualifyingDay = false;

  while (true) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dayTasks = tasksByDate[dateKey] || [];

    if (dayTasks.length === 0) {
      // No tasks assigned, skip this day
      currentDate.setDate(currentDate.getDate() - 1);
      // But break if we've gone back more than 30 days
      if (today.getTime() - currentDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
        break;
      }
      continue;
    }

    const completedCount = dayTasks.filter(task => task.completed).length;
    const completionRate = completedCount / dayTasks.length;

    if (completionRate >= 0.75) {
      if (foundFirstQualifyingDay) {
        // Increment only for days after the first (first day = 0)
        streak++;
      }
      foundFirstQualifyingDay = true;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }

    // Safety check to avoid infinite loop
    if (today.getTime() - currentDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
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
