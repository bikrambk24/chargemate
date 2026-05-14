import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { authAPI, saveAuth } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(function(f) {
      return { ...f, [e.target.name]: e.target.value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Explicitly send role in request
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };

      console.log('Registering with role:', form.role);

      const res = await authAPI.register(payload);

      console.log('Response user role:', res.data.user.role);

      saveAuth(res.data.token, res.data.user);

      // Redirect based on role
      if (res.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/stations');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Register – ChargeMate">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card cm-card p-4 p-md-5">
              <div className="text-center mb-4">
                <i
                  className="bi bi-person-plus-fill mb-2"
                  style={{ fontSize: '3rem', color: '#2ecc71' }}
                ></i>
                <h3 className="fw-bold mb-1">Create Account</h3>
                <p className="text-muted small">
                  Join ChargeMate today
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm"
                    className="form-control"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">
                    Account Type
                  </label>
                  <select
                    name="role"
                    className="form-select"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="user">EV Driver</option>
                    <option value="admin">Station Admin</option>
                  </select>
                  <small className="text-muted">
                    Selected: <strong>{form.role}</strong>
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-cm w-100"
                  disabled={loading}
                  style={{ padding: '10px' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check me-2"></i>
                      Create {form.role === 'admin' ? 'Admin' : 'Driver'} Account
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4" />
              <p className="text-center text-muted small mb-0">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="fw-semibold"
                  style={{ color: '#2ecc71' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}