import TimeLog from '../models/TimeLog.js'

// Helper function to parse date string to local Date object
const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

// Helper function to format Date to YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get time logs with optional filters
// @route   GET /api/time-logs/:userId
// @access  Private
export const getTimeLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    const query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = parseLocalDate(startDate);
      }
      if (endDate) {
        const endDateObj = parseLocalDate(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.date.$lte = endDateObj;
      }
    }

    const timeLogs = await TimeLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: timeLogs.length,
      data: timeLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get time log for a specific date
// @route   GET /api/time-logs/:userId/date/:date
// @access  Private
export const getTimeLogByDate = async (req, res, next) => {
  try {
    const { userId, date } = req.params;
    const targetDate = parseLocalDate(date);

    let timeLog = await TimeLog.findOne({ userId, date: targetDate });

    if (!timeLog) {
      // Return empty log structure
      return res.json({
        success: true,
        data: {
          userId,
          date: targetDate,
          entries: [],
          totalMinutes: 0,
        },
      });
    }

    res.json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get time logs for a specific month
// @route   GET /api/time-logs/:userId/month/:year/:month
// @access  Private
export const getTimeLogsForMonth = async (req, res, next) => {
  try {
    const { userId, year, month } = req.params;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const timeLogs = await TimeLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Format as object keyed by date string
    const logsByDate = {};
    timeLogs.forEach((log) => {
      const dateKey = formatDate(log.date);
      logsByDate[dateKey] = log;
    });

    res.json({
      success: true,
      data: logsByDate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update time log
// @route   POST /api/time-logs
// @access  Private
export const createOrUpdateTimeLog = async (req, res, next) => {
  try {
    const { userId, date, entries } = req.body;

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: 'userId and date are required',
      });
    }

    const targetDate = parseLocalDate(date);

    // Find existing log or create new one
    let timeLog = await TimeLog.findOne({ userId, date: targetDate });

    if (timeLog) {
      timeLog.entries = entries || timeLog.entries;
      await timeLog.save();
    } else {
      timeLog = await TimeLog.create({
        userId,
        date: targetDate,
        entries: entries || [],
      });
    }

    res.status(201).json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add time entry to existing log
// @route   POST /api/time-logs/:logId/entries
// @access  Private
export const addTimeEntry = async (req, res, next) => {
  try {
    const { logId } = req.params;
    const { startTime, endTime, durationMinutes, description, category } = req.body;

    if (!startTime || !endTime || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'startTime, endTime, and durationMinutes are required',
      });
    }

    const timeLog = await TimeLog.findById(logId);

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found',
      });
    }

    // Add entry with order
    const newEntry = {
      startTime,
      endTime,
      durationMinutes,
      description: description || '',
      category: category || 'work',
      order: timeLog.entries.length,
    };

    timeLog.entries.push(newEntry);
    await timeLog.save();

    res.status(201).json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update time entry
// @route   PUT /api/time-logs/:logId/entries/:entryId
// @access  Private
export const updateTimeEntry = async (req, res, next) => {
  try {
    const { logId, entryId } = req.params;
    const updates = req.body;

    const timeLog = await TimeLog.findById(logId);

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found',
      });
    }

    const entry = timeLog.entries.id(entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found',
      });
    }

    // Update entry fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        entry[key] = updates[key];
      }
    });

    await timeLog.save();

    res.json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete time entry
// @route   DELETE /api/time-logs/:logId/entries/:entryId
// @access  Private
export const deleteTimeEntry = async (req, res, next) => {
  try {
    const { logId, entryId } = req.params;

    const timeLog = await TimeLog.findById(logId);

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found',
      });
    }

    // Remove entry by _id
    timeLog.entries = timeLog.entries.filter(
      (entry) => entry._id.toString() !== entryId
    );

    await timeLog.save();

    res.json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete entire time log
// @route   DELETE /api/time-logs/:logId
// @access  Private
export const deleteTimeLog = async (req, res, next) => {
  try {
    const { logId } = req.params;

    const timeLog = await TimeLog.findByIdAndDelete(logId);

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found',
      });
    }

    res.json({
      success: true,
      message: 'Time log deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's total hours
// @route   GET /api/time-logs/:userId/stats/today
// @access  Private
export const getTodayTotal = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeLog = await TimeLog.findOne({ userId, date: today });

    res.json({
      success: true,
      data: {
        totalMinutes: timeLog ? timeLog.totalMinutes : 0,
        totalHours: timeLog ? (timeLog.totalMinutes / 60).toFixed(1) : '0.0',
        entriesCount: timeLog ? timeLog.entries.length : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly stats (last 7 days)
// @route   GET /api/time-logs/:userId/stats/weekly
// @access  Private
export const getWeeklyStats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const timeLogs = await TimeLog.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: 1 });

    // Create array for all 7 days
    const stats = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dateKey = formatDate(date);

      const log = timeLogs.find((l) => formatDate(l.date) === dateKey);

      stats.push({
        date: dateKey,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: log ? (log.totalMinutes / 60).toFixed(1) : 0,
        minutes: log ? log.totalMinutes : 0,
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly stats
// @route   GET /api/time-logs/:userId/stats/monthly/:year/:month
// @access  Private
export const getMonthlyStats = async (req, res, next) => {
  try {
    const { userId, year, month } = req.params;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const timeLogs = await TimeLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalMinutes = timeLogs.reduce((sum, log) => sum + log.totalMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const daysWorked = timeLogs.length;

    res.json({
      success: true,
      data: {
        totalMinutes,
        totalHours,
        daysWorked,
        averageHoursPerDay: daysWorked > 0 ? (totalMinutes / 60 / daysWorked).toFixed(1) : '0.0',
      },
    });
  } catch (error) {
    next(error);
  }
};
