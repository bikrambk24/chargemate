import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { stationAPI, bookingAPI, getUser } from '../../lib/api';

export default function StationDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    chargerType: '',
    startTime: '',
    endTime: ''
  });
  const [bookingState, setBookingState] = useState({
    loading: false,
    success: '',
    error: ''
  });

  const [user] = useState(() => getUser());

  useEffect(() => {
    if (!id) return;
    stationAPI.getById(id)
      .then((res) => {
        const s = res.data.station;
        setStation(s);
        if (s.chargerTypes && s.chargerTypes.length > 0) {
          setForm((f) => ({ ...f, chargerType: s.chargerTypes[0] }));
        }
      })
      .catch(() => setStation(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Calculate estimated cost
  const getEstimatedCost = () => {
    if (!form.startTime || !form.endTime || !station) return null;
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const hours = (end - start) / (1000 * 60 * 60);
    if (hours <= 0) return null;
    return (hours * station.pricePerHour).toFixed(2);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingState({ loading: false, success: '', error: '' });

    // Client side validation
    if (!form.chargerType) {
      setBookingState({ loading: false, success: '', error: 'Please select a charger type.' });
      return;
    }

    if (!form.startTime || !form.endTime) {
      setBookingState({ loading: false, success: '', error: 'Please select both start and end times.' });
      return;
    }

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setBookingState({ loading: false, success: '', error: 'Invalid date/time selected.' });
      return;
    }

    if (end <= start) {
      setBookingState({ loading: false, success: '', error: 'End time must be after start time.' });
      return;
    }

    const hours = (end - start) / (1000 * 60 * 60);
    if (hours <= 0) {
      setBookingState({ loading: false, success: '', error: 'Booking duration must be greater than 0.' });
      return;
    }

    setBookingState({ loading: true, success: '', error: '' });

    try {
      // Send ISO strings to avoid timezone confusion
      await bookingAPI.create({
        stationId: id,
        chargerType: form.chargerType,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });

      setBookingState({
        loading: false,
        success: 'Booking confirmed! Check My Bookings to view it.',
        error: ''
      });

      // Refresh station to show updated slot count
      const res = await stationAPI.getById(id);
      setStation(res.data.station);

      // Reset form
      setForm((f) => ({ ...f, startTime: '', endTime: '' }));

    } catch (err) {
      const message = err.response?.data?.message || 'Booking failed. Please try again.';
      setBookingState({ loading: false, success: '', error: message });
    }
  };

  // Minimum datetime is now (can't book in the past)
  const minDateTime = new Date().toISOString().slice(0, 16);
  const estimatedCost = getEstimatedCost();

  const pct = station
    ? (station.availableSlots / station.totalSlots) * 100
    : 0;

  const barClass =
    pct > 50 ? 'bg-success' :
    pct > 20 ? 'bg-warning' : 'bg-danger';

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#2ecc71' }}></div>
          <p className="text-muted mt-2">Loading station...</p>
        </div>
      </Layout>
    );
  }

  if (!station) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="alert alert-danger">
            Station not found.{' '}
            <Link href="/stations">Back to stations</Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if current user is admin
  const isAdmin = user && user.role === 'admin';

  return (
    <Layout title={station.name + ' – ChargeMate'}>
      <div className="container py-4">

        <Link href="/stations" className="btn btn-outline-secondary btn-sm mb-4">
          <i className="bi bi-arrow-left me-1"></i>Back to Stations
        </Link>

        <div className="row g-4">

          {/* Station Info */}
          <div className={isAdmin ? 'col-12' : 'col-md-7'}>
            <div className="card border-0 shadow-sm p-4">
              <h2 className="fw-bold mb-1">{station.name}</h2>
              <p className="text-muted mb-3">
                <i className="bi bi-geo-alt me-1"></i>
                {station.location.address}, {station.location.city}{' '}
                {station.location.postcode}
              </p>

              {/* Availability */}
              <div
                className={
                  'alert d-flex align-items-center alert-' +
                  (station.availableSlots === 0 ? 'danger' :
                   pct < 30 ? 'warning' : 'success')
                }
              >
                <i
                  className={
                    'bi me-2 ' +
                    (station.availableSlots === 0
                      ? 'bi-x-circle-fill'
                      : 'bi-check-circle-fill')
                  }
                ></i>
                <strong>
                  {station.availableSlots} of {station.totalSlots} slots available
                </strong>
              </div>

              {/* Progress bar */}
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div
                  className={'progress-bar ' + barClass}
                  style={{ width: pct + '%' }}
                ></div>
              </div>

              {/* Details */}
              <div className="row g-3">
                <div className="col-6">
                  <small className="text-muted d-block fw-semibold">
                    CHARGER TYPES
                  </small>
                  <div className="mt-1">
                    {station.chargerTypes.map((t) => (
                      <span key={t} className={'badge badge-' + t + ' me-1'}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block fw-semibold">PRICE</small>
                  <span className="fw-bold text-success fs-5">
                    £{station.pricePerHour}/hour
                  </span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block fw-semibold">
                    OPERATING HOURS
                  </small>
                  <span>
                    {station.operatingHours?.open} – {station.operatingHours?.close}
                  </span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block fw-semibold">STATUS</small>
                  <span
                    className={'badge bg-' + (station.isActive ? 'success' : 'secondary')}
                  >
                    {station.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {station.amenities && station.amenities.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block fw-semibold mb-1">
                    AMENITIES
                  </small>
                  {station.amenities.map((a) => (
                    <span key={a} className="badge bg-light text-dark border me-1">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Admin notice – no booking for admin */}
              {isAdmin && (
                <div className="alert alert-info mt-3 mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Admin View:</strong> Booking is available to EV drivers only.
                  Manage all bookings from the{' '}
                  <Link href="/admin" className="alert-link">Admin Dashboard</Link>.
                </div>
              )}
            </div>
          </div>

          {/* Booking Form – hidden for admin */}
          {!isAdmin && (
            <div className="col-md-5">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">
                  <i
                    className="bi bi-calendar-plus me-2"
                    style={{ color: '#2ecc71' }}
                  ></i>
                  Book a Slot
                </h5>

                {/* Not logged in */}
                {!user && (
                  <div className="alert alert-info small">
                    <i className="bi bi-info-circle me-2"></i>
                    Please{' '}
                    <Link href="/auth/login" className="alert-link">
                      login
                    </Link>
                    {' '}to book a charging slot.
                  </div>
                )}

                {/* Success */}
                {bookingState.success && (
                  <div className="alert alert-success small">
                    <i className="bi bi-check-circle me-2"></i>
                    {bookingState.success}
                    {' '}
                    <Link href="/bookings" className="alert-link">
                      View Bookings →
                    </Link>
                  </div>
                )}

                {/* Error */}
                {bookingState.error && (
                  <div className="alert alert-danger small">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {bookingState.error}
                  </div>
                )}

                {/* No slots */}
                {station.availableSlots === 0 && (
                  <div className="alert alert-warning small">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No slots available. Please check another station.
                  </div>
                )}

                <form onSubmit={handleBook}>
                  {/* Charger Type */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Charger Type
                    </label>
                    <select
                      className="form-select"
                      value={form.chargerType}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, chargerType: e.target.value }))
                      }
                      required
                    >
                      <option value="">Select charger type</option>
                      {station.chargerTypes.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)} Charger
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      min={minDateTime}
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startTime: e.target.value }))
                      }
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      min={form.startTime || minDateTime}
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endTime: e.target.value }))
                      }
                      required
                    />
                    <small className="text-muted">
                      Must be after start time
                    </small>
                  </div>

                  {/* Cost estimate */}
                  {estimatedCost && (
                    <div className="alert alert-light border mb-3">
                      <i className="bi bi-calculator me-2"></i>
                      <strong>Estimated Cost: £{estimatedCost}</strong>
                      <span className="text-muted small ms-2">
                        ({((new Date(form.endTime) - new Date(form.startTime)) / 3600000).toFixed(1)} hours
                        × £{station.pricePerHour}/hr)
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn w-100"
                    style={{ backgroundColor: '#2ecc71', color: 'white' }}
                    disabled={
                      bookingState.loading ||
                      station.availableSlots === 0 ||
                      !user
                    }
                  >
                    {bookingState.loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Booking...
                      </>
                    ) : station.availableSlots === 0 ? (
                      'No Slots Available'
                    ) : !user ? (
                      'Login to Book'
                    ) : (
                      <>
                        <i className="bi bi-lightning-charge me-2"></i>
                        Confirm Booking
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}