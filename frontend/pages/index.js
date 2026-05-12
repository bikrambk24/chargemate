/** 
* Homepage 
* Hero, live stats, features, and CTA 
*/ 
 
import { useEffect, useState } from 'react'; 
import Link from 'next/link'; 
import Layout from '../components/Layout'; 
import { stationAPI } from '../lib/api'; 
 
export default function HomePage() { 
 const [stats, setStats] = useState({ 
   stations: 0, 
   availableSlots: 0, 
   loading: true 
 }); 
 
 useEffect(() => { 
   stationAPI.getAll() 
     .then((res) => { 
       const stations = res.data.stations || []; 
       const slots = stations.reduce( 
         (sum, s) => sum + s.availableSlots, 0 
       ); 
       setStats({ stations: stations.length, availableSlots: slots, loading: false }); 
     }) 
     .catch(() => setStats((s) => ({ ...s, loading: false }))); 
 }, []); 
 
 const features = [ 
   { 
     icon: 'bi-geo-alt-fill', 
     color: '#2ecc71', 
     title: 'Find Nearby Stations', 
     desc: 'Search by city, charger type, and real-time slot availability across the UK.' 
   }, 
   { 
     icon: 'bi-calendar-check-fill', 
     color: '#3498db', 
     title: 'Instant Booking', 
     desc: 'Reserve your charging slot in seconds with automatic cost calculation.' 
   }, 
   { 
     icon: 'bi-shield-check-fill', 
     color: '#e67e22', 
     title: 'Always Available', 
     desc: 'Our AWS cloud infrastructure ensures 99.9% uptime around the clock.' 
   }, 
   { 
     icon: 'bi-lightning-charge-fill', 
     color: '#e74c3c', 
     title: 'All Charger Types', 
     desc: 'Slow, fast, and rapid chargers. Filter to find exactly what your EV needs.' 
   } 
 ]; 
 
 return ( 
   <Layout title="ChargeMate – Find & Book EV Charging Stations"> 
 
     {/* ── Hero ──────────────────────────────────────────── */} 
     <section className="hero-section"> 
       <div className="container text-center w-100"> 
         <i 
           className="bi bi-lightning-charge-fill mb-3" 
           style={{ fontSize: '4rem', color: '#2ecc71' }} 
         ></i> 
         <h1 className="display-4 fw-bold mb-3"> 
           Power Up Your EV Journey 
         </h1> 
         <p className="lead mb-4 opacity-75 mx-auto" style={{ maxWidth: '600px' }}> 
           Find, book, and manage EV charging sessions at stations 
           across the UK. Real-time availability, instant confirmation. 
         </p> 
         <div className="d-flex gap-3 justify-content-center flex-wrap"> 
           <Link href="/stations" className="btn btn-lg btn-cm px-5"> 
             <i className="bi bi-search me-2"></i>Find Stations 
           </Link> 
           <Link 
             href="/auth/register" 
             className="btn btn-lg btn-outline-light px-5" 
             style={{ borderRadius: '10px' }} 
           > 
             <i className="bi bi-person-plus me-2"></i>Get Started Free 
           </Link> 
         </div> 
       </div> 
     </section> 
 
     {/* ── Live Stats ─────────────────────────────────────── */} 
     <section className="py-5 bg-white"> 
       <div className="container"> 
         <div className="row g-4 justify-content-center"> 
           {[ 
             { 
               icon: 'bi-ev-station', 
               color: '#2ecc71', 
               value: stats.loading ? '...' : stats.stations, 
               label: 'Charging Stations' 
             }, 
             { 
               icon: 'bi-plug', 
               color: '#3498db', 
               value: stats.loading ? '...' : stats.availableSlots, 
               label: 'Slots Available Now' 
             }, 
             { 
               icon: 'bi-clock', 
               color: '#e67e22', 
               value: '24/7', 
               label: 'Platform Uptime' 
             }, 
             { 
               icon: 'bi-lightning', 
               color: '#e74c3c', 
               value: '3', 
               label: 'Charger Types' 
             } 
           ].map((s, i) => ( 
             <div key={i} className="col-6 col-md-3"> 
               <div className="stat-card"> 
                 <i 
                   className={`bi ${s.icon} mb-2`} 
                   style={{ fontSize: '2rem', color: s.color }} 
                 ></i> 
                 <div className="stat-number">{s.value}</div> 
                 <p className="text-muted small mb-0">{s.label}</p> 
               </div> 
             </div> 
           ))} 
         </div> 
       </div> 
     </section> 
 
     {/* ── Features ───────────────────────────────────────── */} 
     <section className="py-5"> 
       <div className="container"> 
         <div className="text-center mb-5"> 
           <h2 className="fw-bold">Why Choose ChargeMate?</h2> 
           <p className="text-muted"> 
             Everything you need to manage your EV charging in one place 
           </p> 
         </div> 
         <div className="row g-4"> 
           {features.map((f, i) => ( 
             <div key={i} className="col-sm-6 col-lg-3"> 
               <div className="card cm-card text-center p-4 h-100"> 
                 <i 
                   className={`bi ${f.icon} mb-3`} 
                   style={{ fontSize: '2.5rem', color: f.color }} 
                 ></i> 
                 <h6 className="fw-bold mb-2">{f.title}</h6> 
                 <p className="text-muted small mb-0">{f.desc}</p> 
               </div> 
             </div> 
           ))} 
         </div> 
       </div> 
     </section> 
 
     {/* ── CTA Banner ─────────────────────────────────────── */} 
     <section 
       className="py-5" 
       style={{ backgroundColor: '#1a1a2e', color: 'white' }} 
     > 
       <div className="container text-center"> 
         <h2 className="fw-bold mb-3">Ready to charge smarter?</h2> 
         <p className="opacity-75 mb-4"> 
           Join EV drivers already using ChargeMate across the UK. 
         </p> 
         <Link href="/auth/register" className="btn btn-lg btn-cm px-5"> 
           <i className="bi bi-rocket me-2"></i>Get Started – It&apos;s Free 
         </Link> 
       </div> 
     </section> 
 
   </Layout> 
 ); 
} 
