import { query } from '../config/pgClient.js';

// @desc    Create/Upload timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
const createTimetableEntry = async (req, res) => {
  const { facultyId, day, period, subject, section, room } = req.body;

  try {
    const { rows } = await query(
      `INSERT INTO timetable (faculty_id, day, period, subject, section, room)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (faculty_id, day, period) 
       DO UPDATE SET subject = EXCLUDED.subject, section = EXCLUDED.section, room = EXCLUDED.room
       RETURNING *`,
      [facultyId, day, period, subject, section, room]
    );
    const entry = rows[0];
    res.status(201).json({ ...entry, _id: entry.id, facultyId: entry.faculty_id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get timetable by faculty ID
// @route   GET /api/timetable/:facultyId
// @access  Private
const getTimetable = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM timetable WHERE faculty_id = $1 ORDER BY day, period',
      [req.params.facultyId]
    );
    res.json(rows.map(r => ({ ...r, _id: r.id, facultyId: r.faculty_id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all timetables
// @route   GET /api/timetable/all
// @access  Private/Admin
const getAllTimetables = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT t.*, f.name, f.department, f.email 
       FROM timetable t 
       LEFT JOIN faculty f ON t.faculty_id = f.id 
       ORDER BY t.day, t.period`
    );
    const timetables = rows.map(r => ({
      _id: r.id,
      id: r.id,
      day: r.day,
      period: r.period,
      subject: r.subject,
      section: r.section,
      room: r.room,
      facultyId: {
        _id: r.faculty_id,
        id: r.faculty_id,
        name: r.name,
        department: r.department,
        email: r.email
      }
    }));
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
  const facultyId = req.user.id;

  try {
    const { rows } = await query(
      `INSERT INTO timetable (faculty_id, day, period, subject, section, room)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (faculty_id, day, period) 
       DO UPDATE SET subject = EXCLUDED.subject, section = EXCLUDED.section, room = EXCLUDED.room
       RETURNING *`,
      [facultyId, day, period, subject, section, room]
    );
    const entry = rows[0];
    res.status(201).json({ ...entry, _id: entry.id, facultyId: entry.faculty_id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update my timetable entry
// @route   PUT /api/timetable/my/:id
// @access  Private/Faculty
const updateMyTimetableEntry = async (req, res) => {
  const { subject, section, room, day, period } = req.body;
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows: checkRows } = await query('SELECT * FROM timetable WHERE id = $1', [id]);
    const timetable = checkRows[0];

    if (timetable) {
      if (timetable.faculty_id !== userId) {
        return res.status(401).json({ message: 'Not authorized to update this timetable' });
      }

      // Check if trying to change day/period to an existing slot
      if (day && period && (day !== timetable.day || period !== timetable.period)) {
        const { rows: conflictRows } = await query(
          'SELECT * FROM timetable WHERE faculty_id = $1 AND day = $2 AND period = $3',
          [userId, day, period]
        );
        if (conflictRows.length) {
          return res.status(400).json({ message: 'A class is already scheduled for this day and period' });
        }
      }

      const fields = [];
      const values = [];
      let idx = 1;
      if (subject) { fields.push(`subject = $${idx++}`); values.push(subject); }
      if (section) { fields.push(`section = $${idx++}`); values.push(section); }
      if (room) { fields.push(`room = $${idx++}`); values.push(room); }
      if (day) { fields.push(`day = $${idx++}`); values.push(day); }
      if (period) { fields.push(`period = $${idx++}`); values.push(period); }

      if (fields.length > 0) {
        const queryText = `UPDATE timetable SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
        values.push(id);
        const { rows: updatedRows } = await query(queryText, values);
        res.json({ ...updatedRows[0], _id: updatedRows[0].id, facultyId: updatedRows[0].faculty_id });
      } else {
        res.json({ ...timetable, _id: timetable.id, facultyId: timetable.faculty_id });
      }
    } else {
      res.status(404).json({ message: 'Timetable entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete my timetable entry
// @route   DELETE /api/timetable/my/:id
// @access  Private/Faculty
const deleteMyTimetableEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await query('SELECT * FROM timetable WHERE id = $1', [id]);
    const timetable = rows[0];

    if (timetable) {
      if (timetable.faculty_id !== userId) {
        return res.status(401).json({ message: 'Not authorized to delete this timetable' });
      }

      await query('DELETE FROM timetable WHERE id = $1', [id]);
      res.json({ message: 'Timetable entry removed' });
    } else {
      res.status(404).json({ message: 'Timetable entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createTimetableEntry, getAllTimetables, getTimetable, createMyTimetableEntry, updateMyTimetableEntry, deleteMyTimetableEntry };
