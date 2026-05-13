import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import Navbar with SSR disabled
// This means Navbar only runs on client where localStorage exists
// Solves hydration mismatch AND removes need for mounted/useEffect
const Navbar = dynamic(
  () => import('./Navbar'),
  {
    ssr: false,
    loading: () => (
      <nav
        style={{ backgroundColor: '#1a1a2e', height: '56px' }}
        className="navbar navbar-dark"
      >
        <div className="container">
          <span className="navbar-brand">
            <i
              className="bi bi-lightning-charge-fill me-2"
              style={{ color: '#2ecc71' }}
            ></i>
            ChargeMate
          </span>
        </div>
      </nav>
    )
  }
);

export default function Layout({
  children,
  title = 'ChargeMate – EV Charging Station Finder'
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Find and book EV charging stations across the UK" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main style={{ minHeight: 'calc(100vh - 160px)' }}>
        {children}
      </main>

      <footer className="cm-footer">
        <div className="container text-center">
          <p className="mb-1">
            <i
              className="bi bi-lightning-charge-fill me-2"
              style={{ color: '#2ecc71' }}
            ></i>
            <strong style={{ color: 'white' }}>ChargeMate</strong>
          </p>
          <p className="mb-0 small">
            © 2025 ChargeMate · SWE7303 DevOps Module
          </p>
        </div>
      </footer>
    </>
  );
}