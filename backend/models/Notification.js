import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Faculty',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Substitute', 'Compensation', 'System'],
      default: 'System'
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can point to SubstituteClass or CompensationClass depending on type
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
