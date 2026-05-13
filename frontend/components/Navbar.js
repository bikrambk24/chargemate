import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { clearAuth } from '../lib/api';


export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/');
  };

  const isActive = (path) => router.pathname.startsWith(path);

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <div className="container">
        <Link href="/" className="navbar-brand">
          <i
            className="bi bi-lightning-charge-fill me-2"
            style={{ color: '#2ecc71' }}
          ></i>
          ChargeMate
        </Link>

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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                href="/stations"
                className={'nav-link ' + (isActive('/stations') ? 'active' : '')}
              >
                <i className="bi bi-geo-alt me-1"></i>Find Stations
              </Link>
            </li>

            {user && user.role !== 'admin' && (
              <li className="nav-item">
                <Link
                  href="/bookings"
                  className={'nav-link ' + (isActive('/bookings') ? 'active' : '')}
                >
                  <i className="bi bi-calendar-check me-1"></i>My Bookings
                </Link>
              </li>
            )}

            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link
                  href="/admin"
                  className={'nav-link ' + (isActive('/admin') ? 'active' : '')}
                >
                  <i className="bi bi-speedometer2 me-1"></i>Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name}
                  {user.role === 'admin' && (
                    <span
                      className="badge ms-2"
                      style={{
                        backgroundColor: '#2ecc71',
                        fontSize: '0.65rem'
                      }}
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
                  <li>
                    <span className="dropdown-item-text text-muted small">
                      Role: {user.role}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>

                  {user.role !== 'admin' && (
                    <li>
                      <Link href="/bookings" className="dropdown-item">
                        <i className="bi bi-calendar-check me-2"></i>
                        My Bookings
                      </Link>
                    </li>
                  )}

                  {user.role === 'admin' && (
                    <li>
                      <Link href="/admin" className="dropdown-item">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Admin Dashboard
                      </Link>
                    </li>
                  )}

                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
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
                    className="btn btn-sm ms-2 mt-1"
                    style={{
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      borderRadius: '8px'
                    }}
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