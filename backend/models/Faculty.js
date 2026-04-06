import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  facultyId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Faculty', 'Admin'],
    default: 'Faculty',
  }
}, {
  timestamps: true,
});

facultySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

facultySchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;
