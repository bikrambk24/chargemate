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
  const [stationForm, setStationForm] = useState({
    name: '', address: '', city: '', postcode: '',
    lat: '', lng: '', chargerTypes: [],
    totalSlots: '', availableSlots: '',
    pricePerHour: '', open: '00:00', close: '23:59'
  });
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([
        stationAPI.getAll({}),
        bookingAPI.getAll({})
      ]);
      setStations(sRes.data.stations || []);
      setBookings(bRes.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCharger = (type) => {
    setStationForm((f) => ({
      ...f,
      chargerTypes: f.chargerTypes.includes(type)
        ? f.chargerTypes.filter((t) => t !== type)
        : [...f.chargerTypes, type]
    }));
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    if (stationForm.chargerTypes.length === 0) {
      setFormMsg({ type: 'danger', text: 'Select at least one charger type.' });
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
            lat: parseFloat(stationForm.lat),
            lng: parseFloat(stationForm.lng)
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this station permanently?')) return;
    try {
      await stationAPI.delete(id);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await bookingAPI.complete(id);
      loadAll();
    } catch {
      alert('Failed to update booking.');
    }
  };

  const revenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalCost, 0);

  const statsBadge = [
    { label: 'Stations', value: stations.length, icon: 'bi-geo-alt-fill', color: '#2ecc71' },
    { label: 'Total Bookings', value: bookings.length, icon: 'bi-calendar-fill', color: '#3498db' },
    { label: 'Active', value: bookings.filter((b) => b.status === 'confirmed').length, icon: 'bi-check-circle-fill', color: '#e67e22' },
    { label: 'Revenue', value: `£${revenue.toFixed(2)}`, icon: 'bi-currency-pound', color: '#9b59b6' }
  ];

  if (loading) return (
    <Layout>
      <div className="text-center py-5">
        <div className="spinner-border cm-spinner"></div>
      </div>
    </Layout>
  );

  return (
    <Layout title="Admin Dashboard – ChargeMate">
      <div className="container py-4">
        <h2 className="page-heading mb-4">
          <i className="bi bi-speedometer2 me-2" style={{ color: '#2ecc71' }}></i>
          Admin Dashboard
        </h2>

        <div className="row g-3 mb-4">
          {statsBadge.map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="stat-card">
                <i className={`bi ${s.icon} mb-2`}
                  style={{ fontSize: '1.8rem', color: s.color }}></i>
                <div className="stat-number" style={{ fontSize: '1.8rem' }}>
                  {s.value}
                </div>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          ))}
        </div>

        <ul className="nav nav-tabs mb-4">
          {[
            { key: 'overview', label: 'Overview', icon: 'bi-house' },
            { key: 'stations', label: 'Stations', icon: 'bi-geo-alt' },
            { key: 'bookings', label: 'All Bookings', icon: 'bi-calendar' },
            { key: 'add', label: 'Add Station', icon: 'bi-plus-circle' }
          ].map((t) => (
            <li key={t.key} className="nav-item">
              <button
                className={`nav-link ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <i className={`bi ${t.icon} me-1`}></i>{t.label}
              </button>
            </li>
          ))}
        </ul>

        {tab === 'overview' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card cm-card p-3">
                <h6 className="fw-bold mb-3">Recent Bookings</h6>
                {bookings.slice(0, 5).map((b) => (
                  <div key={b._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="small fw-semibold">{b.stationName}</div>
                      <div className="small text-muted">{b.userName}</div>
                    </div>
                    <span className={`badge bg-${b.status === 'confirmed' ? 'success' :
                      b.status === 'cancelled' ? 'danger' :
                        b.status === 'completed' ? 'primary' : 'warning'
                      }`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-6">
              <div className="card cm-card p-3">
                <h6 className="fw-bold mb-3">Stations Overview</h6>
                {stations.slice(0, 5).map((s) => (
                  <div key={s._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="small fw-semibold">{s.name}</div>
                      <div className="small text-muted">{s.location.city}</div>
                    </div>
                    <span className={`badge ${s.availableSlots === 0 ? 'bg-danger' :
                      s.availableSlots < 3 ? 'bg-warning text-dark' : 'bg-success'
                      }`}>
                      {s.availableSlots}/{s.totalSlots}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
} 
