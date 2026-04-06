import Faculty from '../models/Faculty.js';

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
const getFaculty = async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const faculty = await Faculty.find({ ...keyword }).select('-password');
  res.json(faculty);
};

// @desc    Get faculty by ID
// @route   GET /api/faculty/:id
// @access  Private/Admin
const getFacultyById = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).select('-password');

  if (faculty) {
    res.json(faculty);
  } else {
    res.status(404);
    throw new Error('Faculty not found');
  }
};

// @desc    Register a new faculty
// @route   POST /api/faculty
// @access  Private/Admin
const registerFaculty = async (req, res) => {
  const { name, facultyId, department, email, password, role } = req.body;

  const userExists = await Faculty.findOne({ facultyId });

  if (userExists) {
    res.status(400);
    throw new Error('Faculty user already exists');
  }

  const faculty = await Faculty.create({
    name,
    facultyId,
    department,
    email,
    password,
    role: role || 'Faculty',
  });

  if (faculty) {
    res.status(201).json({
      _id: faculty._id,
      name: faculty.name,
      facultyId: faculty.facultyId,
      department: faculty.department,
      email: faculty.email,
      role: faculty.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid faculty data');
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private/Admin
const updateFaculty = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);

  if (faculty) {
    faculty.name = req.body.name || faculty.name;
    faculty.facultyId = req.body.facultyId || faculty.facultyId;
    faculty.department = req.body.department || faculty.department;
    faculty.email = req.body.email || faculty.email;
    faculty.role = req.body.role || faculty.role;

    if (req.body.password) {
      faculty.password = req.body.password;
    }

    const updatedFaculty = await faculty.save();

    res.json({
      _id: updatedFaculty._id,
      name: updatedFaculty.name,
      facultyId: updatedFaculty.facultyId,
      department: updatedFaculty.department,
      email: updatedFaculty.email,
      role: updatedFaculty.role,
    });
  } else {
    res.status(404);
    throw new Error('Faculty not found');
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
const deleteFaculty = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);

  if (faculty) {
    await Faculty.deleteOne({ _id: faculty._id });
    res.json({ message: 'Faculty removed' });
  } else {
    res.status(404);
    throw new Error('Faculty not found');
  }
};

export { getFaculty, getFacultyById, registerFaculty, updateFaculty, deleteFaculty };
