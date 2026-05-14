import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { stationAPI, bookingAPI, getUser } from '../../lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [stationForm, setStationForm] = useState({
    name: '', address: '', city: '', postcode: '',
    lat: '', lng: '', chargerTypes: [],
    totalSlots: '', availableSlots: '',
    pricePerHour: '', open: '00:00', close: '23:59'
  });
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      var sRes = await stationAPI.getAll({});
      setStations(sRes.data.stations || []);
      try {
        var bRes = await bookingAPI.getAll({});
        setBookings(bRes.data.bookings || []);
      } catch (bookingErr) {
        console.error('Bookings load error:', bookingErr.message);
        setBookings([]);
      }
    } catch (err) {
      console.error('Load error:', err.message);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
    const init = async () => {
      const currentUser = getUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      if (currentUser.role !== 'admin') {
        router.push('/');
        return;
      }
      await loadAll();
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleCharger(type) {
    setStationForm(function(f) {
      return {
        ...f,
        chargerTypes: f.chargerTypes.includes(type)
          ? f.chargerTypes.filter(function(t) { return t !== type; })
          : [...f.chargerTypes, type]
      };
    });
  }

  async function handleCreateStation(e) {
    e.preventDefault();
    if (stationForm.chargerTypes.length === 0) {
      setFormMsg({ type: 'danger', text: 'Please select at least one charger type.' });
      return;
    }
    setSaving(true);
    setFormMsg({ type: '', text: '' });
    try {
      await stationAPI.create({
        name: stationForm.name,
        location: {
          address: stationForm.address,
          city: stationForm.city,
          postcode: stationForm.postcode,
          coordinates: {
            lat: parseFloat(stationForm.lat) || 51.5074,
            lng: parseFloat(stationForm.lng) || -0.1278
          }
        },
        chargerTypes: stationForm.chargerTypes,
        totalSlots: parseInt(stationForm.totalSlots),
        availableSlots: parseInt(stationForm.availableSlots),
        pricePerHour: parseFloat(stationForm.pricePerHour),
        operatingHours: { open: stationForm.open, close: stationForm.close }
      });
      setFormMsg({ type: 'success', text: 'Station created successfully!' });
      setStationForm({
        name: '', address: '', city: '', postcode: '',
        lat: '', lng: '', chargerTypes: [],
        totalSlots: '', availableSlots: '',
        pricePerHour: '', open: '00:00', close: '23:59'
      });
      loadAll();
    } catch (err) {
      setFormMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to create station.'
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this station permanently?')) return;
    try {
      await stationAPI.delete(id);
      setStations(function(prev) {
        return prev.filter(function(s) { return s._id !== id; });
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  }

  async function handleComplete(id) {
    try {
      await bookingAPI.complete(id);
      loadAll();
    } catch (err) {
      alert('Failed to update booking: ' + (err.response?.data?.message || err.message));
    }
  }

  var revenue = bookings
    .filter(function(b) { return b.status !== 'cancelled'; })
    .reduce(function(sum, b) { return sum + b.totalCost; }, 0);

  function statusBadge(status) {
    var map = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
      completed: 'primary'
    };
    return (
      <span className={'badge bg-' + (map[status] || 'secondary')}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  if (loading) {
    return (
      <Layout title="Admin – ChargeMate">
        <div className="container py-5 text-center">
          <div className="spinner-border" style={{ color: '#2ecc71' }}></div>
          <p className="mt-2 text-muted">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard – ChargeMate">
      <div className="container py-4">

        <h2 className="fw-bold mb-4">
          <i className="bi bi-speedometer2 me-2" style={{ color: '#2ecc71' }}></i>
          Admin Dashboard
        </h2>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Stations', value: stations.length, icon: 'bi-geo-alt-fill', color: '#2ecc71' },
            { label: 'Total Bookings', value: bookings.length, icon: 'bi-calendar-fill', color: '#3498db' },
            {
              label: 'Active Bookings',
              value: bookings.filter(function(b) { return b.status === 'confirmed'; }).length,
              icon: 'bi-check-circle-fill',
              color: '#e67e22'
            },
            { label: 'Total Revenue', value: '£' + revenue.toFixed(2), icon: 'bi-currency-pound', color: '#9b59b6' }
          ].map(function(s, i) {
            return (
              <div key={i} className="col-6 col-md-3">
                <div className="card border-0 shadow-sm text-center p-3">
                  <i className={'bi ' + s.icon + ' mb-2'} style={{ fontSize: '1.8rem', color: s.color }}></i>
                  <div className="fw-bold fs-4">{s.value}</div>
                  <small className="text-muted">{s.label}</small>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          {[
            { key: 'overview', label: 'Overview', icon: 'bi-house' },
            { key: 'stations', label: 'Stations (' + stations.length + ')', icon: 'bi-geo-alt' },
            { key: 'bookings', label: 'All Bookings (' + bookings.length + ')', icon: 'bi-calendar' },
            { key: 'add', label: 'Add Station', icon: 'bi-plus-circle' }
          ].map(function(t) {
            return (
              <li key={t.key} className="nav-item">
                <button
                  className={'nav-link ' + (tab === t.key ? 'active' : '')}
                  onClick={function() { setTab(t.key); }}
                >
                  <i className={'bi ' + t.icon + ' me-1'}></i>
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-3">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-clock-history me-2"></i>Recent Bookings
                </h6>
                {bookings.length === 0 ? (
                  <p className="text-muted small">No bookings yet.</p>
                ) : (
                  bookings.slice(0, 5).map(function(b) {
                    return (
                      <div key={b._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                          <div className="small fw-semibold">{b.stationName}</div>
                          <div className="small text-muted">{b.userName}</div>
                        </div>
                        {statusBadge(b.status)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-3">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-ev-station me-2"></i>Stations Overview
                </h6>
                {stations.length === 0 ? (
                  <p className="text-muted small">No stations yet.</p>
                ) : (
                  stations.slice(0, 5).map(function(s) {
                    return (
                      <div key={s._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                          <div className="small fw-semibold">{s.name}</div>
                          <div className="small text-muted">{s.location.city}</div>
                        </div>
                        <span className={'badge ' + (s.availableSlots === 0 ? 'bg-danger' : s.availableSlots < 3 ? 'bg-warning text-dark' : 'bg-success')}>
                          {s.availableSlots}/{s.totalSlots} slots
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stations Tab */}
        {tab === 'stations' && (
          <div>
            {stations.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-geo-alt" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="mt-2 text-muted">No stations yet.</p>
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#2ecc71', color: 'white' }}
                  onClick={function() { setTab('add'); }}
                >
                  Add First Station
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th><th>City</th><th>Chargers</th>
                      <th>Slots</th><th>Price/hr</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map(function(s) {
                      return (
                        <tr key={s._id}>
                          <td className="fw-semibold">{s.name}</td>
                          <td>{s.location.city}</td>
                          <td>
                            {s.chargerTypes.map(function(t) {
                              return (
                                <span key={t} className={'badge badge-' + t + ' me-1'}>{t}</span>
                              );
                            })}
                          </td>
                          <td>
                            <span className={s.availableSlots === 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                              {s.availableSlots}/{s.totalSlots}
                            </span>
                          </td>
                          <td>£{s.pricePerHour}/hr</td>
                          <td>
                            <span className={'badge bg-' + (s.isActive ? 'success' : 'secondary')}>
                              {s.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <Link href={'/stations/' + s._id} className="btn btn-sm btn-outline-primary me-1">
                              View
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={function() { handleDelete(s._id); }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Bookings Tab */}
        {tab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="mt-2 text-muted">No bookings yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Station</th><th>User</th><th>Charger</th>
                      <th>Start Time</th><th>Duration</th><th>Cost</th>
                      <th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(function(b) {
                      return (
                        <tr key={b._id}>
                          <td className="fw-semibold">{b.stationName}</td>
                          <td>
                            <div>{b.userName}</div>
                            <small className="text-muted">{b.userEmail}</small>
                          </td>
                          <td>
                            <span className={'badge badge-' + b.chargerType}>{b.chargerType}</span>
                          </td>
                          <td>
                            <small>
                              {new Date(b.startTime).toLocaleDateString('en-GB')}
                              <br />
                              {new Date(b.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </td>
                          <td>{b.durationHours}h</td>
                          <td>£{b.totalCost.toFixed(2)}</td>
                          <td>{statusBadge(b.status)}</td>
                          <td>
                            {b.status === 'confirmed' && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={function() { handleComplete(b._id); }}
                              >
                                Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Station Tab */}
        {tab === 'add' && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-plus-circle me-2" style={{ color: '#2ecc71' }}></i>
              Add New Charging Station
            </h5>
            {formMsg.text && (
              <div className={'alert alert-' + formMsg.type}>{formMsg.text}</div>
            )}
            <form onSubmit={handleCreateStation}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold small">Station Name *</label>
                  <input className="form-control" placeholder="e.g. London Central EV Hub" required
                    value={stationForm.name}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, name: e.target.value }; }); }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Address *</label>
                  <input className="form-control" placeholder="e.g. 123 Oxford Street" required
                    value={stationForm.address}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, address: e.target.value }; }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">City *</label>
                  <input className="form-control" placeholder="e.g. London" required
                    value={stationForm.city}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, city: e.target.value }; }); }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Postcode *</label>
                  <input className="form-control" placeholder="e.g. W1D 1BS" required
                    value={stationForm.postcode}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, postcode: e.target.value }; }); }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Latitude (optional)</label>
                  <input type="number" step="any" className="form-control" placeholder="e.g. 51.5074"
                    value={stationForm.lat}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, lat: e.target.value }; }); }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Longitude (optional)</label>
                  <input type="number" step="any" className="form-control" placeholder="e.g. -0.1278"
                    value={stationForm.lng}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, lng: e.target.value }; }); }} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold small d-block">Charger Types * (select at least one)</label>
                  {['slow', 'fast', 'rapid'].map(function(t) {
                    return (
                      <div key={t} className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id={'ct-' + t}
                          checked={stationForm.chargerTypes.includes(t)}
                          onChange={function() { toggleCharger(t); }} />
                        <label className="form-check-label" htmlFor={'ct-' + t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </label>
                      </div>
                    );
                  })}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Total Slots *</label>
                  <input type="number" min="1" className="form-control" required
                    value={stationForm.totalSlots}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, totalSlots: e.target.value }; }); }} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Available Slots *</label>
                  <input type="number" min="0" className="form-control" required
                    value={stationForm.availableSlots}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, availableSlots: e.target.value }; }); }} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Price Per Hour (£) *</label>
                  <input type="number" step="0.01" min="0" className="form-control" required
                    value={stationForm.pricePerHour}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, pricePerHour: e.target.value }; }); }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Opening Time</label>
                  <input type="time" className="form-control" value={stationForm.open}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, open: e.target.value }; }); }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Closing Time</label>
                  <input type="time" className="form-control" value={stationForm.close}
                    onChange={function(e) { setStationForm(function(f) { return { ...f, close: e.target.value }; }); }} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn"
                    style={{ backgroundColor: '#2ecc71', color: 'white' }} disabled={saving}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                    ) : (
                      <><i className="bi bi-plus-circle me-2"></i>Create Station</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </Layout>
  );
}