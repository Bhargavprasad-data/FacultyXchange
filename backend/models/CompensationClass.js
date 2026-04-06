import mongoose from 'mongoose';

const compensationClassSchema = new mongoose.Schema({
  originalFaculty: { // The one who originally asked for substitute, now doing the comp
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  substituteFaculty: { // The one who did the substitute, now receiving the comp
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  substituteClassReference: { // Link to the original substitute request
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubstituteClass',
    required: true,
  },
  classDate: {
    type: Date,
    required: true,
  },
  period: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed'],
    default: 'Completed',
  }
}, {
  timestamps: true,
});

const CompensationClass = mongoose.model('CompensationClass', compensationClassSchema);

export default CompensationClass;
