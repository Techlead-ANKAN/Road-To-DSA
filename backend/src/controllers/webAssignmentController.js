import WebAssignment from '../models/WebAssignment.js';

// Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await WebAssignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Get single assignment
export const getAssignment = async (req, res) => {
  try {
    const assignment = await WebAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment', error: error.message });
  }
};

// Get assignment with user's solution
export const getAssignmentWithSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const assignment = await WebAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find user's solution
    const userSolution = assignment.solutions.find(
      (sol) => sol.userId.toString() === userId
    );

    res.json({
      ...assignment.toObject(),
      userSolution: userSolution || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment', error: error.message });
  }
};

// Create new assignment (admin)
export const createAssignment = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const assignment = new WebAssignment({
      title,
      description,
      tags: tags || [],
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

// Update assignment (admin)
export const updateAssignment = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const assignment = await WebAssignment.findByIdAndUpdate(
      req.params.id,
      { title, description, tags },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
};

// Delete assignment (admin)
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await WebAssignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting assignment', error: error.message });
  }
};

// Save or update user's solution
export const saveSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, htmlCode, cssCode, jsCode } = req.body;

    const assignment = await WebAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find existing solution
    const existingSolutionIndex = assignment.solutions.findIndex(
      (sol) => sol.userId.toString() === userId
    );

    // Check if solution has code (user has worked on it)
    const hasCode = (htmlCode && htmlCode.trim()) || (cssCode && cssCode.trim()) || (jsCode && jsCode.trim());

    if (existingSolutionIndex !== -1) {
      // Update existing solution
      const existingSolution = assignment.solutions[existingSolutionIndex];
      assignment.solutions[existingSolutionIndex] = {
        userId,
        htmlCode: htmlCode || '',
        cssCode: cssCode || '',
        jsCode: jsCode || '',
        completed: existingSolution.completed || false,
        completedAt: existingSolution.completedAt || null,
        lastUpdated: Date.now(),
      };
    } else {
      // Add new solution
      assignment.solutions.push({
        userId,
        htmlCode: htmlCode || '',
        cssCode: cssCode || '',
        jsCode: jsCode || '',
        completed: false,
        completedAt: null,
      });
    }

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error saving solution', error: error.message });
  }
};

// Mark assignment as complete/incomplete
export const markComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, completed } = req.body;

    const assignment = await WebAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find existing solution
    const existingSolutionIndex = assignment.solutions.findIndex(
      (sol) => sol.userId.toString() === userId
    );

    if (existingSolutionIndex !== -1) {
      // Update existing solution
      assignment.solutions[existingSolutionIndex].completed = completed;
      assignment.solutions[existingSolutionIndex].completedAt = completed ? Date.now() : null;
      assignment.solutions[existingSolutionIndex].lastUpdated = Date.now();
    } else {
      // Create new solution entry
      assignment.solutions.push({
        userId,
        htmlCode: '',
        cssCode: '',
        jsCode: '',
        completed,
        completedAt: completed ? Date.now() : null,
      });
    }

    await assignment.save();
    
    // Return the updated solution
    const updatedSolution = assignment.solutions.find(
      (sol) => sol.userId.toString() === userId
    );
    
    res.json({ solution: updatedSolution });
  } catch (error) {
    res.status(500).json({ message: 'Error marking assignment', error: error.message });
  }
};

// Get user's solutions for all assignments
export const getUserSolutions = async (req, res) => {
  try {
    const { userId } = req.params;

    const assignments = await WebAssignment.find({
      'solutions.userId': userId,
    });

    const userSolutions = assignments.map((assignment) => {
      const solution = assignment.solutions.find(
        (sol) => sol.userId.toString() === userId
      );
      return {
        assignmentId: assignment._id,
        title: assignment.title,
        tags: assignment.tags,
        solution,
      };
    });

    res.json(userSolutions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user solutions', error: error.message });
  }
};
