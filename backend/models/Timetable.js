import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  period: {
    type: Number,
    required: true, // e.g., 1 for Period 1
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
  }
}, {
  timestamps: true,
});

// A faculty can't have two classes at the same day & period
timetableSchema.index({ facultyId: 1, day: 1, period: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
