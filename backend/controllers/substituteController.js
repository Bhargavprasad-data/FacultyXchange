import { query } from '../config/pgClient.js';

// @desc    Assign a substitute class
// @route   POST /api/substitute
// @access  Private
const createSubstituteClass = async (req, res) => {
  const { date, subject, year, semester, section, period, classroom, substituteFacultyId } = req.body;

  try {
    const { rows: origRows } = await query('SELECT * FROM faculty WHERE id = $1', [req.user.id]);
    const originalFaculty = origRows[0];

    const { rows: subRows } = await query('SELECT * FROM faculty WHERE id = $1', [substituteFacultyId]);
    const substituteFaculty = subRows[0];

    if (!substituteFaculty) {
      return res.status(404).json({ message: 'Substitute faculty not found' });
    }

    const { rows: newSubRows } = await query(
      `INSERT INTO substitute_class (date, subject, department, year, semester, section, period, classroom, original_faculty_id, substitute_faculty_id, compensation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending')
       RETURNING *`,
      [date, subject, originalFaculty.department, year, semester, section, period, classroom, originalFaculty.id, substituteFaculty.id]
    );
    const substituteClass = newSubRows[0];

    // Create Notification for the Substitute Faculty
    const dateFormatted = new Date(date).toLocaleDateString();
    await query(
      `INSERT INTO notification (recipient_id, message, type, related_id)
       VALUES ($1, $2, 'Substitute', $3)`,
      [
        substituteFaculty.id,
        `You have been assigned to cover a ${subject} class on ${dateFormatted} (Period ${period}) by ${originalFaculty.name}.`,
        substituteClass.id
      ]
    );

    res.status(201).json({
      _id: substituteClass.id,
      id: substituteClass.id,
      date: substituteClass.date,
      subject: substituteClass.subject,
      department: substituteClass.department,
      year: substituteClass.year,
      semester: substituteClass.semester,
      section: substituteClass.section,
      period: substituteClass.period,
      classroom: substituteClass.classroom,
      originalFaculty: substituteClass.original_faculty_id,
      substituteFaculty: substituteClass.substitute_faculty_id,
      compensationStatus: substituteClass.compensation_status,
      createdAt: substituteClass.created_at
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get substitute classes involving the user
// @route   GET /api/substitute
// @access  Private
const getSubstituteClasses = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT sc.*, 
              ofac.name AS "original_name", ofac."facultyId" AS "original_facultyId",
              sfac.name AS "substitute_name", sfac."facultyId" AS "substitute_facultyId"
       FROM substitute_class sc
       LEFT JOIN faculty ofac ON sc.original_faculty_id = ofac.id
       LEFT JOIN faculty sfac ON sc.substitute_faculty_id = sfac.id
       WHERE sc.original_faculty_id = $1 OR sc.substitute_faculty_id = $1
       ORDER BY sc.date DESC`,
      [req.user.id]
    );
      
    res.json(rows.map(r => ({
      _id: r.id,
      id: r.id,
      date: r.date,
      subject: r.subject,
      department: r.department,
      year: r.year,
      semester: r.semester,
      section: r.section,
      period: r.period,
      classroom: r.classroom,
      compensationStatus: r.compensation_status,
      originalFaculty: {
        _id: r.original_faculty_id,
        id: r.original_faculty_id,
        name: r.original_name,
        facultyId: r.original_facultyId
      },
      substituteFaculty: {
        _id: r.substitute_faculty_id,
        id: r.substitute_faculty_id,
        name: r.substitute_name,
        facultyId: r.substitute_facultyId
      },
      createdAt: r.created_at
    })));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all substitute classes (Admin only)
// @route   GET /api/substitute/all
// @access  Private/Admin
const getAllSubstituteClasses = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT sc.*, 
              ofac.name AS "original_name", ofac."facultyId" AS "original_facultyId", ofac.department AS "original_dept",
              sfac.name AS "substitute_name", sfac."facultyId" AS "substitute_facultyId", sfac.department AS "substitute_dept"
       FROM substitute_class sc
       LEFT JOIN faculty ofac ON sc.original_faculty_id = ofac.id
       LEFT JOIN faculty sfac ON sc.substitute_faculty_id = sfac.id
       ORDER BY sc.date DESC`
    );
      
    res.json(rows.map(r => ({
      _id: r.id,
      id: r.id,
      date: r.date,
      subject: r.subject,
      department: r.department,
      year: r.year,
      semester: r.semester,
      section: r.section,
      period: r.period,
      classroom: r.classroom,
      compensationStatus: r.compensation_status,
      originalFaculty: {
        _id: r.original_faculty_id,
        id: r.original_faculty_id,
        name: r.original_name,
        facultyId: r.original_facultyId,
        department: r.original_dept
      },
      substituteFaculty: {
        _id: r.substitute_faculty_id,
        id: r.substitute_faculty_id,
        name: r.substitute_name,
        facultyId: r.substitute_facultyId,
        department: r.substitute_dept
      },
      createdAt: r.created_at
    })));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createSubstituteClass, getSubstituteClasses, getAllSubstituteClasses };
