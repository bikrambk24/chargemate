import { useState, useEffect, useCallback } from 'react'; 
import { useRouter } from 'next/router'; 
import Link from 'next/link'; 
import Layout from '../../components/Layout'; 
import { bookingAPI, getUser } from '../../lib/api'; 
 
export default function MyBookingsPage() { 
 const router = useRouter(); 
 const [bookings, setBookings] = useState([]); 
 const [loading, setLoading] = useState(true); 
 const [error, setError] = useState(''); 
 const [cancelling, setCancelling] = useState(''); 
 
 useEffect(() => { 
   if (!getUser()) { router.push('/auth/login'); return; } 
   fetchBookings(); 
 }, []); 
 
 const fetchBookings = useCallback(async () => { 
   try { 
     const res = await bookingAPI.getMy(); 
     setBookings(res.data.bookings || []); 
   } catch { 
     setError('Failed to load bookings.'); 
   } finally { 
     setLoading(false); 
   } 
 }, []); 
 
 const handleCancel = async (id) => { 
   if (!window.confirm('Cancel this booking?')) return; 
   setCancelling(id); 
   try { 
     await bookingAPI.cancel(id, 'Cancelled by user'); 
     fetchBookings(); 
   } catch (err) { 
     alert(err.response?.data?.message || 'Cancellation failed.'); 
   } finally { 
     setCancelling(''); 
   } 
 }; 
 
 const statusConfig = { 
   confirmed:  { badge: 'success',   icon: 'bi-check-circle-fill' }, 
   pending:    { badge: 'warning',   icon: 'bi-clock-fill' }, 
   cancelled:  { badge: 'danger',    icon: 'bi-x-circle-fill' }, 
   completed:  { badge: 'primary',   icon: 'bi-check-all' } 
 }; 
 
 const active = bookings.filter( 
   (b) => ['confirmed', 'pending'].includes(b.status) 
 ); 
 const past = bookings.filter( 
   (b) => ['cancelled', 'completed'].includes(b.status) 
 ); 
 
 return ( 
   <Layout title="My Bookings – ChargeMate"> 
     <div className="container py-4"> 
       <div className="d-flex justify-content-between align-items-center mb-4"> 
         <div> 
           <h2 className="page-heading"> 
             <i className="bi bi-calendar-check-fill me-2" style={{ color: '#2ecc71' }}></i> 
             My Bookings 
           </h2> 
           <p className="text-muted mb-0"> 
             {bookings.length} total booking{bookings.length !== 1 ? 's' : ''} 
           </p> 
         </div> 
         <Link href="/stations" className="btn btn-cm btn-sm"> 
           <i className="bi bi-plus me-1"></i>New Booking 
         </Link> 
       </div> 
 
       {loading && ( 
         <div className="text-center py-5"> 
           <div className="spinner-border cm-spinner"></div> 
         </div> 
       )} 
 
       {error && <div className="alert alert-danger">{error}</div>} 
 
       {!loading && bookings.length === 0 && ( 
         <div className="text-center py-5"> 
           <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i> 
           <h5 className="mt-3 text-muted">No bookings yet</h5> 
           <Link href="/stations" className="btn btn-cm mt-3"> 
             Find a Station 
           </Link> 
         </div> 
       )} 
 
       {active.length > 0 && ( 
         <> 
           <h5 className="fw-bold mb-3 text-success"> 
             <i className="bi bi-check-circle me-2"></i>Active ({active.length}) 
           </h5> 
           {active.map((b) => { 
             const cfg = statusConfig[b.status]; 
             return ( 
               <div key={b._id} className="card cm-card mb-3"> 
                 <div className="card-body"> 
                   <div className="row align-items-center"> 
                     <div className="col"> 
                       <h6 className="fw-bold mb-1">{b.stationName}</h6> 
                       <p className="text-muted small mb-1"> 
                         {new Date(b.startTime).toLocaleDateString('en-GB')} 
                         {' · '} 
                         {new Date(b.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} 
                         {' → '} 
                         {new Date(b.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} 
                       </p> 
                       <div> 
                         <span className={`badge badge-${b.chargerType} me-2`}> 
                           {b.chargerType} 
                         </span> 
                         <span className="badge bg-light text-dark border"> 
                           {b.durationHours}h · £{b.totalCost.toFixed(2)} 
                         </span> 
                       </div> 
                     </div> 
                     <div className="col-auto text-end"> 
                       <span className={`badge bg-${cfg.badge} d-block mb-2`}> 
                         <i className={`bi ${cfg.icon} me-1`}></i>{b.status} 
                       </span> 
                       <button 
                         className="btn btn-outline-danger btn-sm" 
                         onClick={() => handleCancel(b._id)} 
                         disabled={cancelling === b._id} 
                       > 
                         Cancel 
                       </button> 
                     </div> 
                   </div> 
                 </div> 
               </div> 
             ); 
           })} 
         </> 
       )} 
 
     </div> 
   </Layout> 
 ); 
}
