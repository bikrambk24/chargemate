import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { bookingAPI, getUser } from '../../lib/api';

export default function MyBookingsPage() {
  const router = useRouter();

  const [user] = useState(() => getUser());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    bookingAPI.getMy()
      .then((res) => {
        setBookings(res.data.bookings || []);
        setError('');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load bookings. Please try again.');
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This function is only called from handleCancel (user interaction)
  // Not called from useEffect so no linter issue here
  async function refreshBookings() {
    try {
      const res = await bookingAPI.getMy();
      setBookings(res.data.bookings || []);
      setError('');
    } catch {
      setError('Failed to refresh bookings.');
    }
  }

  async function handleCancel(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await bookingAPI.cancel(bookingId, 'Cancelled by user');
      await refreshBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelling('');
    }
  }

  const statusConfig = {
    confirmed: { badge: 'success', icon: 'bi-check-circle-fill' },
    pending:   { badge: 'warning', icon: 'bi-clock-fill' },
    cancelled: { badge: 'danger',  icon: 'bi-x-circle-fill' },
    completed: { badge: 'primary', icon: 'bi-check-all' }
  };

  const activeBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  const pastBookings = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'completed'
  );

  return (
    <Layout title="My Bookings – ChargeMate">
      <div className="container py-4">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              <i
                className="bi bi-calendar-check-fill me-2"
                style={{ color: '#2ecc71' }}
              ></i>
              My Bookings
            </h2>
            <p className="text-muted mb-0">
              {loading
                ? 'Loading...'
                : bookings.length + ' booking' + (bookings.length !== 1 ? 's' : '')}
            </p>
          </div>
          <Link
            href="/stations"
            className="btn btn-sm"
            style={{ backgroundColor: '#2ecc71', color: 'white' }}
          >
            <i className="bi bi-plus me-1"></i>New Booking
          </Link>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#2ecc71' }}></div>
            <p className="text-muted mt-2">Loading your bookings...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <h5 className="mt-3 text-muted">No bookings yet</h5>
            <p className="text-muted small">
              Find a charging station and make your first booking
            </p>
            <Link
              href="/stations"
              className="btn mt-2"
              style={{ backgroundColor: '#2ecc71', color: 'white' }}
            >
              <i className="bi bi-search me-2"></i>Find a Station
            </Link>
          </div>
        )}

        {!loading && activeBookings.length > 0 && (
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#2ecc71' }}>
              <i className="bi bi-check-circle me-2"></i>
              Active ({activeBookings.length})
            </h5>
            {activeBookings.map((b) => {
              const cfg = statusConfig[b.status] || statusConfig.confirmed;
              return (
                <div key={b._id} className="card border-0 shadow-sm mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col">
                        <h6 className="fw-bold mb-1">
                          <i
                            className="bi bi-ev-station me-2"
                            style={{ color: '#2ecc71' }}
                          ></i>
                          {b.stationName}
                        </h6>
                        <p className="text-muted small mb-1">
                          <i className="bi bi-calendar3 me-1"></i>
                          <strong>
                            {new Date(b.startTime).toLocaleDateString('en-GB')}
                          </strong>
                          {' · '}
                          <i className="bi bi-clock me-1"></i>
                          {new Date(b.startTime).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                          {' → '}
                          {new Date(b.endTime).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                        <div>
                          <span className={'badge badge-' + b.chargerType + ' me-2'}>
                            {b.chargerType.charAt(0).toUpperCase() + b.chargerType.slice(1)} Charger
                          </span>
                          <span className="badge bg-light text-dark border">
                            {b.durationHours}h · £{b.totalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="col-auto text-end">
                        <span className={'badge bg-' + cfg.badge + ' d-block mb-2'}>
                          <i className={'bi ' + cfg.icon + ' me-1'}></i>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancel(b._id)}
                          disabled={cancelling === b._id}
                        >
                          {cancelling === b._id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <><i className="bi bi-x me-1"></i>Cancel</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && pastBookings.length > 0 && (
          <div>
            <h5 className="fw-bold mb-3 text-muted">
              <i className="bi bi-clock-history me-2"></i>
              Past ({pastBookings.length})
            </h5>
            {pastBookings.map((b) => {
              const cfg = statusConfig[b.status] || statusConfig.cancelled;
              return (
                <div
                  key={b._id}
                  className="card border-0 shadow-sm mb-3"
                  style={{ opacity: '0.75' }}
                >
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col">
                        <h6 className="fw-bold mb-1">{b.stationName}</h6>
                        <p className="text-muted small mb-1">
                          {new Date(b.startTime).toLocaleDateString('en-GB')}
                          {' · '}
                          {b.durationHours}h · £{b.totalCost.toFixed(2)}
                        </p>
                        <span className={'badge badge-' + b.chargerType}>
                          {b.chargerType}
                        </span>
                      </div>
                      <div className="col-auto">
                        <span className={'badge bg-' + cfg.badge}>
                          <i className={'bi ' + cfg.icon + ' me-1'}></i>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
}