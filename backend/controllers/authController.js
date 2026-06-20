import bcrypt from 'bcryptjs';
import { query } from '../config/pgClient.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user/faculty & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { facultyId, password } = req.body;

  try {
    const { rows } = await query('SELECT * FROM faculty WHERE "facultyId" = $1', [facultyId]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(res, user.id);
      
      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        facultyId: user.facultyId,
        department: user.department,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid faculty ID or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user/faculty
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  // the client handles clearing the token directly
  res.status(200).json({ message: 'Logged out successfully' });
};

export { authUser, logoutUser };
