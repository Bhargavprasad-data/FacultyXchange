import bcrypt from 'bcryptjs';
import { query } from '../config/pgClient.js';
import { notifyFaculty } from '../utils/notify.js';

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
export const getFaculty = async (req, res) => {
  const { rows } = await query('SELECT id, name, "facultyId", department, email, role, created_at, updated_at FROM faculty');
  // Return _id along with id for frontend compatibility
  res.json(rows.map(r => ({ ...r, _id: r.id })));
};

// @desc    Get faculty by ID
// @route   GET /api/faculty/:id
// @access  Private/Admin
export const getFacultyById = async (req, res) => {
  const { id } = req.params;
  const { rows } = await query('SELECT id, name, "facultyId", department, email, role FROM faculty WHERE id = $1', [id]);
  if (rows.length) {
    res.json({ ...rows[0], _id: rows[0].id });
  } else {
    res.status(404).json({ message: 'Faculty not found' });
  }
};

// @desc    Register a new faculty
// @route   POST /api/faculty
// @access  Private/Admin
export const registerFaculty = async (req, res) => {
  const { name, facultyId, department, email, password, role } = req.body;
  // Check if exists
  const { rows: existRows } = await query('SELECT id FROM faculty WHERE "facultyId" = $1', [facultyId]);
  if (existRows.length) {
    return res.status(400).json({ message: 'Faculty user already exists' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const { rows } = await query(
    'INSERT INTO faculty (name, "facultyId", department, email, password, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, "facultyId", department, email, role',
    [name, facultyId, department, email, hashedPassword, role || 'Faculty']
  );
  
  await notifyFaculty(rows[0].id, 'Welcome to FacultyXchange! Your account has been successfully created.', 'System');
  
  res.status(201).json({ ...rows[0], _id: rows[0].id });
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private/Admin
export const updateFaculty = async (req, res) => {
  const { id } = req.params;
  const { name, facultyId, department, email, password, role } = req.body;
  const fields = [];
  const values = [];
  let idx = 1;
  if (name) { fields.push(`name = $${idx++}`); values.push(name); }
  if (facultyId) { fields.push(`"facultyId" = $${idx++}`); values.push(facultyId); }
  if (department) { fields.push(`department = $${idx++}`); values.push(department); }
  if (email) { fields.push(`email = $${idx++}`); values.push(email); }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    fields.push(`password = $${idx++}`);
    values.push(hashedPassword);
  }
  if (role) { fields.push(`role = $${idx++}`); values.push(role); }
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }
  const queryText = `UPDATE faculty SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, "facultyId", department, email, role`;
  values.push(id);
  const { rows } = await query(queryText, values);
  
  await notifyFaculty(rows[0].id, 'Your account details have been updated by the Admin.', 'System');
  
  res.json({ ...rows[0], _id: rows[0].id });
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
export const deleteFaculty = async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM faculty WHERE id = $1', [id]);
  res.json({ message: 'Faculty removed' });
};

// Duplicate Mongoose implementation removed
