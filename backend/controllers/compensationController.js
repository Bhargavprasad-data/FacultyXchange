import { query } from '../config/pgClient.js';
import { notifyAdmins } from '../utils/notify.js';

// @desc    Schedule/Mark a compensation class
// @route   POST /api/compensation
// @access  Private
const createCompensationClass = async (req, res) => {
  const { substituteClassId, classDate, period, subject, section, room } = req.body;

  try {
    const { rows: subRequests } = await query('SELECT * FROM substitute_class WHERE id = $1', [substituteClassId]);
    const substituteRequest = subRequests[0];

    if (!substituteRequest) {
      return res.status(404).json({ message: 'Original substitute request not found' });
    }

    if (substituteRequest.compensation_status === 'Completed') {
      return res.status(400).json({ message: 'Compensation already completed for this request' });
    }

    // Security check: Only the person who ORIGINALY took the leave can do the compensation
    if (substituteRequest.original_faculty_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to compensate this class' });
    }

    const { rows: compClasses } = await query(
      `INSERT INTO compensation_class (original_faculty_id, substitute_faculty_id, substitute_class_reference_id, class_date, period, subject, section, room, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Completed')
       RETURNING *`,
      [req.user.id, substituteRequest.substitute_faculty_id, substituteRequest.id, classDate, period, subject, section, room]
    );
    const compensationClass = compClasses[0];

    // Update the substitute request to completed
    await query('UPDATE substitute_class SET compensation_status = $1 WHERE id = $2', ['Completed', substituteRequest.id]);

    // Create Notification for the recipient faculty (the one who originally subbed)
    const dateFormatted = new Date(classDate).toLocaleDateString();
    await query(
      `INSERT INTO notification (recipient_id, message, type, related_id)
       VALUES ($1, $2, 'Compensation', $3)`,
      [
        substituteRequest.substitute_faculty_id,
        `${req.user.name} has scheduled to teach your ${subject} class on ${dateFormatted} (Period ${period}) as compensation.`,
        compensationClass.id
      ]
    );

    await notifyAdmins(`${req.user.name} logged a compensation class on ${dateFormatted}.`, 'Compensation', compensationClass.id);

    res.status(201).json({
      _id: compensationClass.id,
      id: compensationClass.id,
      originalFaculty: compensationClass.original_faculty_id,
      substituteFaculty: compensationClass.substitute_faculty_id,
      substituteClassReference: compensationClass.substitute_class_reference_id,
      classDate: compensationClass.class_date,
      period: compensationClass.period,
      subject: compensationClass.subject,
      section: compensationClass.section,
      room: compensationClass.room,
      status: compensationClass.status,
      createdAt: compensationClass.created_at
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get compensation classes involving the user
// @route   GET /api/compensation
// @access  Private
const getCompensationClasses = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT cc.*, 
              ofac.name AS "original_name", ofac."facultyId" AS "original_facultyId",
              sfac.name AS "substitute_name", sfac."facultyId" AS "substitute_facultyId"
       FROM compensation_class cc
       LEFT JOIN faculty ofac ON cc.original_faculty_id = ofac.id
       LEFT JOIN faculty sfac ON cc.substitute_faculty_id = sfac.id
       WHERE cc.original_faculty_id = $1 OR cc.substitute_faculty_id = $1
       ORDER BY cc.class_date DESC`,
      [req.user.id]
    );
      
    res.json(rows.map(r => ({
      _id: r.id,
      id: r.id,
      classDate: r.class_date,
      period: r.period,
      subject: r.subject,
      section: r.section,
      room: r.room,
      status: r.status,
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

// @desc    Get all compensation classes (Admin only)
// @route   GET /api/compensation/all
// @access  Private/Admin
const getAllCompensationClasses = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT cc.*, 
              ofac.name AS "original_name", ofac."facultyId" AS "original_facultyId", ofac.department AS "original_dept",
              sfac.name AS "substitute_name", sfac."facultyId" AS "substitute_facultyId", sfac.department AS "substitute_dept"
       FROM compensation_class cc
       LEFT JOIN faculty ofac ON cc.original_faculty_id = ofac.id
       LEFT JOIN faculty sfac ON cc.substitute_faculty_id = sfac.id
       ORDER BY cc.class_date DESC`
    );
      
    res.json(rows.map(r => ({
      _id: r.id,
      id: r.id,
      classDate: r.class_date,
      period: r.period,
      subject: r.subject,
      section: r.section,
      room: r.room,
      status: r.status,
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

export { createCompensationClass, getCompensationClasses, getAllCompensationClasses };
