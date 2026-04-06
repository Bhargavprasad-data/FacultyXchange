import SubstituteClass from '../models/SubstituteClass.js';
import Faculty from '../models/Faculty.js';
import Notification from '../models/Notification.js';

// @desc    Assign a substitute class
// @route   POST /api/substitute
// @access  Private
const createSubstituteClass = async (req, res) => {
  const { date, subject, year, semester, section, period, classroom, substituteFacultyId } = req.body;

  try {
    const originalFaculty = await Faculty.findById(req.user._id);
    const substituteFaculty = await Faculty.findById(substituteFacultyId);

    if (!substituteFaculty) {
      return res.status(404).json({ message: 'Substitute faculty not found' });
    }

    const substituteClass = await SubstituteClass.create({
      date,
      subject,
      department: originalFaculty.department,
      year,
      semester,
      section,
      period,
      classroom,
      originalFaculty: originalFaculty._id,
      substituteFaculty: substituteFaculty._id,
      compensationStatus: 'Pending',
    });

    // Create Notification for the Substitute Faculty
    await Notification.create({
      recipient: substituteFaculty._id,
      message: `You have been assigned to cover a ${subject} class on ${new Date(date).toLocaleDateString()} (Period ${period}) by ${originalFaculty.name}.`,
      type: 'Substitute',
      relatedId: substituteClass._id
    });

    res.status(201).json(substituteClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get substitute classes involving the user
// @route   GET /api/substitute
// @access  Private
const getSubstituteClasses = async (req, res) => {
  try {
    const classes = await SubstituteClass.find({
      $or: [{ originalFaculty: req.user._id }, { substituteFaculty: req.user._id }],
    }).populate('originalFaculty', 'name facultyId')
      .populate('substituteFaculty', 'name facultyId')
      .sort({ date: -1 });
      
    res.json(classes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// @desc    Get all substitute classes (Admin only)
// @route   GET /api/substitute/all
// @access  Private/Admin
const getAllSubstituteClasses = async (req, res) => {
  try {
    const classes = await SubstituteClass.find({})
      .populate('originalFaculty', 'name facultyId department')
      .populate('substituteFaculty', 'name facultyId department')
      .sort({ date: -1 });
      
    res.json(classes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export { createSubstituteClass, getSubstituteClasses, getAllSubstituteClasses };
