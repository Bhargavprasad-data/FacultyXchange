import mongoose from 'mongoose';

const substituteClassSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  period: {
    type: Number,
    required: true,
  },
  classroom: {
    type: String,
    required: true,
  },
  originalFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  substituteFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  compensationStatus: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

const SubstituteClass = mongoose.model('SubstituteClass', substituteClassSchema);

export default SubstituteClass;
