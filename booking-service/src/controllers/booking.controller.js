const axios = require('axios');
const Booking = require('../models/Booking.model');

// Station service base URL (set via environment variable)
const STATION_SERVICE_URL =
  process.env.STATION_SERVICE_URL || 'http://localhost:4001';

/**
 * POST /api/bookings
 * Create a new charging session booking.
 * Steps:
 *  1. Fetch station details from station-service
 *  2. Validate slot availability and charger type
 *  3. Calculate cost
 *  4. Decrement station slot via station-service
 *  5. Save booking to MongoDB
 */
const createBooking = async (req, res, next) => {
  try {
    const { stationId, chargerType, startTime, endTime } = req.body;

    // Validate required fields
    if (!stationId || !chargerType || !startTime || !endTime) {
      return res.status(400).json({
        message:
          'stationId, chargerType, startTime, and endTime are all required'
      });
    }

    // Step 1: Get station details from station-service
    let station;
    try {
      const response = await axios.get(
        `${STATION_SERVICE_URL}/api/stations/${stationId}`,
        { timeout: 5000 }
      );
      station = response.data.station;
    } catch (err) {
      return res.status(404).json({
        message: 'Station not found or station service unavailable'
      });
    }

    // Step 2a: Check slot availability
    if (station.availableSlots <= 0) {
      return res.status(400).json({
        message:
          'No slots available at this station. Please try another station.'
      });
    }

    // Step 2b: Check charger type is offered at this station
    if (!station.chargerTypes.includes(chargerType)) {
      return res.status(400).json({
        message: `Charger type '${chargerType}' is not available at this station`
      });
    }

    // Step 3: Calculate duration and total cost
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format for startTime or endTime'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: 'End time must be after start time'
      });
    }

    const durationHours = (end - start) / (1000 * 60 * 60);
    const totalCost = parseFloat(
      (durationHours * station.pricePerHour).toFixed(2)
    );

    // Step 4: Decrement available slot in station-service
    try {
      await axios.patch(
        `${STATION_SERVICE_URL}/api/stations/${stationId}/slots`,
        { action: 'decrement' },
        { timeout: 5000 }
      );
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to reserve slot. Please try again.'
      });
    }

    // Step 5: Create booking record in database
    const booking = await Booking.create({
      userId: req.user.id,
      userName: req.user.name || 'ChargeMate User',
      userEmail: req.user.email || '',
      stationId,
      stationName: station.name,
      chargerType,
      startTime: start,
      endTime: end,
      durationHours: parseFloat(durationHours.toFixed(2)),
      totalCost,
      status: 'confirmed'
    });

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/my
 * Get all bookings belonging to the currently logged-in user.
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({
      createdAt: -1
    });

    res.json({
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/:id
 * Get a single booking by ID.
 * Users can only see their own bookings; admins can see all.
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 * Cancel a booking and restore the station slot.
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res
        .status(400)
        .json({ message: 'Cannot cancel a completed booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason =
      req.body.reason || 'Cancelled by user';
    await booking.save();

    try {
      await axios.patch(
        `${STATION_SERVICE_URL}/api/stations/${booking.stationId}/slots`,
        { action: 'increment' },
        { timeout: 5000 }
      );
    } catch (err) {
      console.error(
        'Warning: Failed to restore slot in station service:',
        err.message
      );
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings
 * Admin only: get all bookings with optional filters.
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status, stationId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (stationId) filter.stationId = stationId;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });

    res.json({
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/complete
 * Admin only: mark a booking as completed.
 */
const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking marked as completed',
      booking
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  completeBooking
};
