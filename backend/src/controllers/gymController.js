import WorkoutDay from '../models/WorkoutDay.js';
import GymLog from '../models/GymLog.js';

// ============ WORKOUT DAY MANAGEMENT ============

// Get all workout days
export const getAllWorkoutDays = async (req, res) => {
  const workoutDays = await WorkoutDay.find().sort({ createdAt: -1 });
  res.json(workoutDays);
};

// Get a single workout day
export const getWorkoutDay = async (req, res) => {
  const { id } = req.params;

  const workoutDay = await WorkoutDay.findById(id);

  if (!workoutDay) {
    return res.status(404).json({ error: 'Workout day not found' });
  }

  res.json(workoutDay);
};

// Create a new workout day
export const createWorkoutDay = async (req, res) => {
  const { name, exercises } = req.body;

  const workoutDay = new WorkoutDay({
    name,
    exercises: exercises || [],
  });

  await workoutDay.save();
  res.status(201).json(workoutDay);
};

// Update a workout day
export const updateWorkoutDay = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const workoutDay = await WorkoutDay.findByIdAndUpdate(id, updates, {
    new: true,
  });

  if (!workoutDay) {
    return res.status(404).json({ error: 'Workout day not found' });
  }

  res.json(workoutDay);
};

// Delete a workout day
export const deleteWorkoutDay = async (req, res) => {
  const { id } = req.params;

  const workoutDay = await WorkoutDay.findByIdAndDelete(id);

  if (!workoutDay) {
    return res.status(404).json({ error: 'Workout day not found' });
  }

  // Note: Associated gym logs will remain for historical tracking
  res.json({ message: 'Workout day deleted successfully' });
};

// Add exercise to workout day
export const addExercise = async (req, res) => {
  const { id } = req.params;
  const exercise = req.body;

  const workoutDay = await WorkoutDay.findById(id);

  if (!workoutDay) {
    return res.status(404).json({ error: 'Workout day not found' });
  }

  // Calculate the next order value within the same category
  const category = exercise.category || 'main';
  const sameCategoryExercises = workoutDay.exercises.filter(
    (ex) => (ex.category || 'main') === category
  );
  const maxOrder = sameCategoryExercises.length > 0
    ? Math.max(...sameCategoryExercises.map((ex) => ex.order || 0))
    : -1;
  
  exercise.order = maxOrder + 1;

  workoutDay.exercises.push(exercise);
  await workoutDay.save();

  res.json(workoutDay);
};

// Update exercise in workout day
export const updateExercise = async (req, res) => {
  const { id, exerciseId } = req.params;
  const updates = req.body;

  const workoutDay = await WorkoutDay.findById(id);

  if (!workoutDay) {
    return res.status(404).json({ error: 'Workout day not found' });
  }

  const exercise = workoutDay.exercises.id(exerciseId);

  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }

  Object.assign(exercise, updates);
  await workoutDay.save();

  res.json(workoutDay);
};

// Delete exercise from workout day
export const deleteExercise = async (req, res) => {
  const { id, exerciseId } = req.params;

  const workoutDay = await WorkoutDay.findById(id);

  if (!workoutDay) {
    return res.status(404).json({ error: 'Workout day not found' });
  }

  workoutDay.exercises.pull(exerciseId);
  await workoutDay.save();

  res.json(workoutDay);
};

// ============ GYM LOG MANAGEMENT ============

// Get gym logs for a user with optional date range
export const getGymLogs = async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  let query = { userId };

  if (startDate && endDate) {
    const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
    const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
    query.date = {
      $gte: new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0),
      $lte: new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999),
    };
  }

  const logs = await GymLog.find(query)
    .populate('workoutDayId')
    .sort({ date: -1 });

  res.json(logs);
};

// Get gym log for a specific date
export const getGymLogByDate = async (req, res) => {
  const { userId, date } = req.params;

  // Parse date string as local date to avoid timezone shift
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);

  const log = await GymLog.findOne({
    userId,
    date: targetDate,
  }).populate('workoutDayId');

  // Return null if no log exists (this is a valid state, not an error)
  res.json(log);
};

// Create or update gym log
export const createGymLog = async (req, res) => {
  const { userId, date, workoutDayId, exercises, completed } = req.body;

  // Validate date is within 3 months range
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  // Parse date string as local date to avoid timezone shift
  const [year, month, day] = date.split('-').map(Number);
  const logDate = new Date(year, month - 1, day, 0, 0, 0, 0);

  if (logDate < threeMonthsAgo || logDate > threeMonthsLater) {
    return res.status(400).json({
      error: 'Gym log date must be within 3 months in the past or future',
    });
  }

  // Check if log already exists for this date
  let gymLog = await GymLog.findOne({ userId, date: logDate });

  if (gymLog) {
    // Update existing log
    gymLog.workoutDayId = workoutDayId;
    gymLog.exercises = exercises || [];
    gymLog.completed = completed !== undefined ? completed : gymLog.completed;
    await gymLog.save();
  } else {
    // Create new log
    gymLog = new GymLog({
      userId,
      date: logDate,
      workoutDayId,
      exercises: exercises || [],
      completed: completed || false,
    });
    await gymLog.save();
  }

  await gymLog.populate('workoutDayId');
  res.status(201).json(gymLog);
};

// Update gym log
export const updateGymLog = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const gymLog = await GymLog.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate('workoutDayId');

  if (!gymLog) {
    return res.status(404).json({ error: 'Gym log not found' });
  }

  res.json(gymLog);
};

// Delete gym log
export const deleteGymLog = async (req, res) => {
  const { id } = req.params;

  const gymLog = await GymLog.findByIdAndDelete(id);

  if (!gymLog) {
    return res.status(404).json({ error: 'Gym log not found' });
  }

  res.json({ message: 'Gym log deleted successfully' });
};

// Get gym logs for a month (for calendar view)
export const getGymLogsForMonth = async (req, res) => {
  const { userId, year, month } = req.params;

  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const logs = await GymLog.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  })
    .populate('workoutDayId')
    .sort({ date: 1 });

  // Group logs by date
  const logsByDate = {};
  logs.forEach((log) => {
    // Format date as YYYY-MM-DD in local timezone
    const year = log.date.getFullYear();
    const month = String(log.date.getMonth() + 1).padStart(2, '0');
    const day = String(log.date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    logsByDate[dateKey] = log;
  });

  res.json(logsByDate);
};

// ============ STATISTICS ============

// Get gym sessions count for current month
export const getMonthCount = async (req, res) => {
  const { userId } = req.params;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const count = await GymLog.countDocuments({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
    completed: true,
  });

  res.json({ count });
};

// Get gym streak (consecutive days with workouts)
export const getStreak = async (req, res) => {
  const { userId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all completed gym logs sorted by date descending
  const logs = await GymLog.find({
    userId,
    completed: true,
    date: { $lte: today },
  }).sort({ date: -1 });

  if (logs.length === 0) {
    return res.json({ streak: 0 });
  }

  let streak = 0;
  let currentDate = new Date(today);

  // Check if there's a workout today or yesterday
  const mostRecentLog = logs[0];
  const mostRecentDate = new Date(mostRecentLog.date);
  mostRecentDate.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // If most recent workout is not today or yesterday, streak is 0
  if (mostRecentDate < yesterday) {
    return res.json({ streak: 0 });
  }

  // Start from most recent workout
  currentDate = new Date(mostRecentDate);

  for (const log of logs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (logDate < currentDate) {
      // Gap found, break
      break;
    }
  }

  res.json({ streak });
};

// Get monthly gym activity stats (last 30 days)
export const getMonthlyStats = async (req, res) => {
  const { userId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // 30 days total

  const logs = await GymLog.find({
    userId,
    date: { $gte: thirtyDaysAgo, $lte: today },
  }).populate('workoutDayId');

  // Create a map of logs by date
  const logsByDate = {};
  logs.forEach((log) => {
    const year = log.date.getFullYear();
    const month = String(log.date.getMonth() + 1).padStart(2, '0');
    const day = String(log.date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    logsByDate[dateKey] = log;
  });

  // Generate stats for each day
  const stats = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const log = logsByDate[dateKey];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    stats.push({
      date: dateKey,
      day: `${dayNames[date.getDay()]} ${date.getDate()}`,
      completed: log?.completed || false,
      workoutName: log?.workoutDayId?.name || null,
      assigned: !!log,
    });
  }

  res.json(stats);
};
