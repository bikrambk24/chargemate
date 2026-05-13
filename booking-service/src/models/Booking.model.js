const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  userName: {
    type: String,
    required: true,
    default: 'ChargeMate User'
  },
  userEmail: {
    type: String,
    required: false,       // not required
    default: 'unknown@chargemate.com'  // fallback if token has no email
  },
  stationId: {
    type: String,
    required: [true, 'Station ID is required']
  },
  stationName: {
    type: String,
    required: true
  },
  chargerType: {
    type: String,
    enum: ['slow', 'fast', 'rapid'],
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  durationHours: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ stationId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);