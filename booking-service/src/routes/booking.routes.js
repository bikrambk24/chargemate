const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  completeBooking
} = require('../controllers/booking.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes below require a valid JWT token
router.use(protect);

// ── User Routes ───────────────────────────────────────────────
// POST   /api/bookings            → create a new booking
// GET    /api/bookings/my         → get my bookings
// GET    /api/bookings/:id        → get one booking by ID
// PATCH  /api/bookings/:id/cancel → cancel a booking

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

// ── Admin Routes ──────────────────────────────────────────────
// GET    /api/bookings              → get ALL bookings
// PATCH  /api/bookings/:id/complete → mark booking complete

router.get('/', adminOnly, getAllBookings);
router.patch('/:id/complete', adminOnly, completeBooking);

module.exports = router;
