import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUser, clearAuth } from '../lib/api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  // Refresh user when route changes (e.g. after login) 
  useEffect(() => {
    setUser(getUser());
  }, [router.pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/');
  };

  const isActive = (path) => router.pathname.startsWith(path);

  if (!mounted) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark cm-navbar">
      <div className="container">
        {/* Brand */}
        <Link href="/" className="navbar-brand">
          <i
            className="bi bi-lightning-charge-fill me-2"
            style={{ color: '#2ecc71' }}
          ></i>
          ChargeMate
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cmNav"
          aria-controls="cmNav"
          aria-expanded="false"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="cmNav">
          {/* Left links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                href="/stations"
                className={`nav-link ${isActive('/stations') ? 'active' : ''}`}
              >
                <i className="bi bi-geo-alt me-1"></i>Stations
              </Link>
            </li>

            {user && (
              <li className="nav-item">
                <Link
                  href="/bookings"
                  className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}
                >
                  <i className="bi bi-calendar-check me-1"></i>My Bookings
                </Link>
              </li>
            )}

            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link
                  href="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  <i className="bi bi-gear me-1"></i>Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Right links */}
          <ul className="navbar-nav">
            {user ? (
              <li className="nav-item dropdown">
                {/* FIXED LINE BELOW: Added the missing <a */}
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-1"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user.name}</span>
                  {user.role === 'admin' && (
                    <span
                      className="badge ms-1"
                      style={{ backgroundColor: '#2ecc71', fontSize: '0.65rem' }}
                    >
                      Admin
                    </span>
                  )}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text text-muted small">
                      {user.email}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link href="/bookings" className="dropdown-item">
                      <i className="bi bi-calendar-check me-2"></i>My Bookings
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link href="/auth/login" className="nav-link">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/auth/register"
                    className="btn btn-sm btn-cm ms-2 mt-1"
                  >
                    Register Free
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}