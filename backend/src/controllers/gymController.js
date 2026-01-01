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

  // Get all gym logs sorted by date descending
  const logs = await GymLog.find({
    userId,
    date: { $lte: today },
  }).sort({ date: -1 }).populate('workoutDayId');

  if (logs.length === 0) {
    return res.json({ streak: 0 });
  }

  // Filter logs that have at least 2 exercises completed
  const qualifyingLogs = logs.filter(log => {
    const totalExercises = log.workoutDayId?.exercises?.length || 0;
    const completedExercises = log.exercises?.length || 0;
    // A day counts if at least 2 exercises were completed
    return completedExercises >= 2;
  });

  if (qualifyingLogs.length === 0) {
    return res.json({ streak: 0 });
  }

  let streak = 0;
  let currentDate = new Date(today);

  // Check if there's a qualifying workout today or yesterday
  const mostRecentLog = qualifyingLogs[0];
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

  // Count consecutive days (first day = 0, then increment for each additional day)
  let foundFirstDay = false;
  for (const log of qualifyingLogs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === currentDate.getTime()) {
      if (foundFirstDay) {
        // Increment for days after the first
        streak++;
      }
      foundFirstDay = true;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (logDate < currentDate) {
      // Gap found, break
      break;
    }
  }

  res.json({ streak });
};

// Get monthly gym activity stats (entire current month)
export const getMonthlyStats = async (req, res) => {
  const { userId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get first and last day of current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999);
  const daysInMonth = lastDayOfMonth.getDate();

  const logs = await GymLog.find({
    userId,
    date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
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

  // Generate stats for each day of the current month
  const stats = [];
  for (let i = 0; i < daysInMonth; i++) {
    const date = new Date(firstDayOfMonth);
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

// Get comprehensive gym statistics
export const getGymStatistics = async (req, res) => {
  const { userId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get first and last day of current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999);

  // Get first day of current week (Sunday)
  const firstDayOfWeek = new Date(today);
  const dayOfWeek = firstDayOfWeek.getDay();
  firstDayOfWeek.setDate(firstDayOfWeek.getDate() - dayOfWeek);
  firstDayOfWeek.setHours(0, 0, 0, 0);

  // Fetch all gym logs for this user
  const allLogs = await GymLog.find({ userId }).populate('workoutDayId').sort({ date: 1 });

  // Fetch logs for current month
  const monthLogs = await GymLog.find({
    userId,
    date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
  }).populate('workoutDayId');

  // Fetch logs for current week
  const weekLogs = await GymLog.find({
    userId,
    date: { $gte: firstDayOfWeek, $lte: today },
  }).populate('workoutDayId');

  // Calculate total sessions overall
  const totalSessions = allLogs.filter(log => log.completed).length;

  // Calculate total sessions this month
  const totalSessionsThisMonth = monthLogs.filter(log => log.completed).length;

  // Calculate total sessions this week
  const totalSessionsThisWeek = weekLogs.filter(log => log.completed).length;

  // Calculate most frequent workout
  const workoutFrequency = {};
  allLogs.filter(log => log.completed && log.workoutDayId).forEach(log => {
    const workoutName = log.workoutDayId.name;
    workoutFrequency[workoutName] = (workoutFrequency[workoutName] || 0) + 1;
  });

  let mostFrequentWorkout = null;
  let maxFrequency = 0;
  Object.entries(workoutFrequency).forEach(([name, count]) => {
    if (count > maxFrequency) {
      maxFrequency = count;
      mostFrequentWorkout = { name, count };
    }
  });

  // Calculate total exercises completed
  let totalExercisesCompleted = 0;
  allLogs.filter(log => log.completed).forEach(log => {
    totalExercisesCompleted += log.exercises?.length || 0;
  });

  // Calculate average exercises per session
  const avgExercisesPerSession = totalSessions > 0 
    ? Math.round(totalExercisesCompleted / totalSessions) 
    : 0;

  // Calculate total weight lifted (sum of all sets * weight)
  let totalWeightLifted = 0;
  allLogs.filter(log => log.completed).forEach(log => {
    log.exercises?.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        exercise.sets.forEach(set => {
          if (set.weight && set.reps) {
            totalWeightLifted += (set.weight * set.reps);
          }
        });
      }
    });
  });

  // Calculate total workout time (cardio time)
  let totalWorkoutTime = 0;
  allLogs.filter(log => log.completed).forEach(log => {
    log.exercises?.forEach(exercise => {
      if (exercise.time) {
        totalWorkoutTime += exercise.time;
      }
    });
  });

  // Calculate weekly consistency (percentage of days with workouts in current week)
  const daysInCurrentWeek = Math.floor((today - firstDayOfWeek) / (1000 * 60 * 60 * 24)) + 1;
  const weeklyConsistency = daysInCurrentWeek > 0 
    ? Math.round((totalSessionsThisWeek / daysInCurrentWeek) * 100)
    : 0;

  // Calculate monthly consistency (percentage of days with workouts in current month)
  const daysPassedInMonth = today.getDate();
  const monthlyConsistency = daysPassedInMonth > 0
    ? Math.round((totalSessionsThisMonth / daysPassedInMonth) * 100)
    : 0;

  // Get current streak
  const qualifyingLogs = allLogs.filter(log => {
    const totalExercises = log.workoutDayId?.exercises?.length || 0;
    const completedExercises = log.exercises?.length || 0;
    return completedExercises >= 2;
  }).sort((a, b) => b.date - a.date);

  let currentStreak = 0;
  if (qualifyingLogs.length > 0) {
    const mostRecentLog = qualifyingLogs[0];
    const mostRecentDate = new Date(mostRecentLog.date);
    mostRecentDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (mostRecentDate.getTime() >= yesterday.getTime()) {
      let currentDate = new Date(mostRecentDate);
      let foundFirstDay = false;

      for (const log of qualifyingLogs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);

        if (logDate.getTime() === currentDate.getTime()) {
          if (foundFirstDay) {
            currentStreak++;
          }
          foundFirstDay = true;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (logDate < currentDate) {
          break;
        }
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let previousDate = null;

  qualifyingLogs.reverse().forEach(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (!previousDate) {
      tempStreak = 1;
    } else {
      const dayDiff = Math.floor((logDate - previousDate) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    previousDate = logDate;
  });
  longestStreak = Math.max(longestStreak, tempStreak);

  res.json({
    totalSessions,
    totalSessionsThisMonth,
    totalSessionsThisWeek,
    mostFrequentWorkout,
    totalExercisesCompleted,
    avgExercisesPerSession,
    totalWeightLifted: Math.round(totalWeightLifted),
    totalWorkoutTime,
    weeklyConsistency,
    monthlyConsistency,
    currentStreak,
    longestStreak,
  });
};
