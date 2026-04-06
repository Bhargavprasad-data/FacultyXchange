import Timetable from '../models/Timetable.js';

// @desc    Create/Upload timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
const createTimetableEntry = async (req, res) => {
  const { facultyId, day, period, subject, section, room } = req.body;

  try {
    const entryExists = await Timetable.findOne({ facultyId, day, period });
    
    if (entryExists) {
      entryExists.subject = subject;
      entryExists.section = section;
      entryExists.room = room;
      const updatedEntry = await entryExists.save();
      res.status(200).json(updatedEntry);
    } else {
      const newEntry = await Timetable.create({
        facultyId,
        day,
        period,
        subject,
        section,
        room,
      });
      res.status(201).json(newEntry);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get timetable by faculty ID
// @route   GET /api/timetable/:facultyId
// @access  Private
const getTimetable = async (req, res) => {
  const timetable = await Timetable.find({ facultyId: req.params.facultyId }).sort({ day: 1, period: 1 });

  if (timetable) {
    res.json(timetable);
  } else {
    res.status(404);
    throw new Error('Timetable not found');
  }
};

// @desc    Get all timetables
// @route   GET /api/timetable/all
// @access  Private/Admin
const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find({})
      .populate('facultyId', 'name department email')
      .sort({ day: 1, period: 1 });
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create my timetable entry
// @route   POST /api/timetable/my
// @access  Private/Faculty
const createMyTimetableEntry = async (req, res) => {
  const { day, period, subject, section, room } = req.body;
  const facultyId = req.user._id;

  try {
    const entryExists = await Timetable.findOne({ facultyId, day, period });
    
    if (entryExists) {
      entryExists.subject = subject;
      entryExists.section = section;
      entryExists.room = room;
      const updatedEntry = await entryExists.save();
      res.status(200).json(updatedEntry);
    } else {
      const newEntry = await Timetable.create({
        facultyId,
        day,
        period,
        subject,
        section,
        room,
      });
      res.status(201).json(newEntry);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update my timetable entry
// @route   PUT /api/timetable/my/:id
// @access  Private/Faculty
const updateMyTimetableEntry = async (req, res) => {
  const { subject, section, room, day, period } = req.body;

  try {
    const timetable = await Timetable.findById(req.params.id);

    if (timetable) {
      if (timetable.facultyId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this timetable');
      }

      // Check if trying to change day/period to an existing slot
      if (day && period && (day !== timetable.day || period !== timetable.period)) {
        const entryExists = await Timetable.findOne({ facultyId: req.user._id, day, period });
        if (entryExists) {
          res.status(400);
          throw new Error('A class is already scheduled for this day and period');
        }
      }

      timetable.subject = subject || timetable.subject;
      timetable.section = section || timetable.section;
      timetable.room = room || timetable.room;
      timetable.day = day || timetable.day;
      timetable.period = period || timetable.period;

      const updatedTimetable = await timetable.save();
      res.json(updatedTimetable);
    } else {
      res.status(404);
      throw new Error('Timetable entry not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

// @desc    Delete my timetable entry
// @route   DELETE /api/timetable/my/:id
// @access  Private/Faculty
const deleteMyTimetableEntry = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (timetable) {
      if (timetable.facultyId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this timetable');
      }

      await Timetable.deleteOne({ _id: timetable._id });
      res.json({ message: 'Timetable entry removed' });
    } else {
      res.status(404);
      throw new Error('Timetable entry not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export { createTimetableEntry, getAllTimetables, getTimetable, createMyTimetableEntry, updateMyTimetableEntry, deleteMyTimetableEntry };
