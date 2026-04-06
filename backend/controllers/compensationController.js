import CompensationClass from '../models/CompensationClass.js';
import SubstituteClass from '../models/SubstituteClass.js';
import Faculty from '../models/Faculty.js';
import Notification from '../models/Notification.js';

// @desc    Schedule/Mark a compensation class
// @route   POST /api/compensation
// @access  Private
const createCompensationClass = async (req, res) => {
  const { substituteClassId, classDate, period, subject, section, room } = req.body;

  try {
    const substituteRequest = await SubstituteClass.findById(substituteClassId);

    if (!substituteRequest) {
      return res.status(404).json({ message: 'Original substitute request not found' });
    }

    if (substituteRequest.compensationStatus === 'Completed') {
      return res.status(400).json({ message: 'Compensation already completed for this request' });
    }

    // Security check: Only the person who ORIGINALY took the leave can do the compensation
    if (substituteRequest.originalFaculty.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to compensate this class' });
    }

    const compensationClass = await CompensationClass.create({
      originalFaculty: req.user._id, // The one doing the work now
      substituteFaculty: substituteRequest.substituteFaculty, // The one receiving the work now
      substituteClassReference: substituteRequest._id,
      classDate,
      period,
      subject,
      section,
      room,
      status: 'Completed'
    });

    // Update the substitute request to completed
    substituteRequest.compensationStatus = 'Completed';
    await substituteRequest.save();

    // Create Notification for the recipient faculty (the one who originally subbed)
    await Notification.create({
      recipient: substituteRequest.substituteFaculty,
      message: `${req.user.name} has scheduled to teach your ${subject} class on ${new Date(classDate).toLocaleDateString()} (Period ${period}) as compensation.`,
      type: 'Compensation',
      relatedId: compensationClass._id
    });

    res.status(201).json(compensationClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get compensation classes involving the user
// @route   GET /api/compensation
// @access  Private
const getCompensationClasses = async (req, res) => {
  try {
    const classes = await CompensationClass.find({
      $or: [{ originalFaculty: req.user._id }, { substituteFaculty: req.user._id }],
    }).populate('originalFaculty', 'name facultyId')
      .populate('substituteFaculty', 'name facultyId')
      .sort({ classDate: -1 });
      
    res.json(classes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all compensation classes (Admin only)
// @route   GET /api/compensation/all
// @access  Private/Admin
const getAllCompensationClasses = async (req, res) => {
  try {
    const classes = await CompensationClass.find({})
      .populate('originalFaculty', 'name facultyId department')
      .populate('substituteFaculty', 'name facultyId department')
      .sort({ classDate: -1 });
      
    res.json(classes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createCompensationClass, getCompensationClasses, getAllCompensationClasses };
