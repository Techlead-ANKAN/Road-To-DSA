import Notice from '../models/Notice.js';

// Get all notices for a user (sorted by deadline, then priority)
export const getNotices = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const notices = await Notice.find({ userId }).sort({
    isDone: 1, // Not done first
    deadline: 1, // Earliest deadline first
    noticeLevel: 1, // high < medium < low (alphabetically)
  });

  res.json(notices);
};

// Create a new notice
export const createNotice = async (req, res) => {
  const { userId, title, description, deadline, noticeLevel } = req.body;

  if (!userId || !title || !description) {
    return res.status(400).json({
      message: 'User ID, title, and description are required',
    });
  }

  const notice = new Notice({
    userId,
    title,
    description,
    deadline: deadline || null,
    noticeLevel: noticeLevel || 'medium',
    isDone: false,
  });

  await notice.save();
  res.status(201).json(notice);
};

// Update a notice
export const updateNotice = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Notice ID is required' });
  }

  const notice = await Notice.findByIdAndUpdate(
    id,
    { ...updates },
    { new: true, runValidators: true }
  );

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json(notice);
};

// Delete a notice
export const deleteNotice = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Notice ID is required' });
  }

  const notice = await Notice.findByIdAndDelete(id);

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json({ message: 'Notice deleted successfully', notice });
};

// Mark a notice as done
export const markNoticeDone = async (req, res) => {
  const { id } = req.params;
  const { isDone } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Notice ID is required' });
  }

  const notice = await Notice.findByIdAndUpdate(
    id,
    { isDone: isDone !== undefined ? isDone : true },
    { new: true }
  );

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json(notice);
};
