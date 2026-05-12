const mongoose = require('mongoose');

/**
 * Booking Model
 * Stores all EV charging session reservations.
 * Links a user to a station with time slot and cost info.
 */
const bookingSchema = new mongoose.Schema(
  {
    // User information
    userId: {
      type: String,
      required: [true, 'User ID is required']
    },
    userName: {
      type: String,
      required: [true, 'User name is required']
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required']
    },

    // Station information
    stationId: {
      type: String,
      required: [true, 'Station ID is required']
    },
    stationName: {
      type: String,
      required: [true, 'Station name is required']
    },

    // Booking details
    chargerType: {
      type: String,
      enum: ['slow', 'fast', 'rapid'],
      required: [true, 'Charger type is required']
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

    // Booking status lifecycle
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed'
    },
    cancellationReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ stationId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
