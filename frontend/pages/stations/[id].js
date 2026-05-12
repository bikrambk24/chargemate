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
 const [user, setUser] = useState(null); 
 const [form, setForm] = useState({ 
   chargerType: '', startTime: '', endTime: '' 
 }); 
 const [booking, setBooking] = useState({ 
   loading: false, success: '', error: '' 
 }); 
 
 useEffect(() => { setUser(getUser()); }, []); 
 
 useEffect(() => { 
   if (!id) return; 
   stationAPI.getById(id) 
     .then((res) => { 
       const s = res.data.station; 
       setStation(s); 
       if (s.chargerTypes?.length > 0) { 
         setForm((f) => ({ ...f, chargerType: s.chargerTypes[0] })); 
       } 
     }) 
     .catch(() => setStation(null)) 
     .finally(() => setLoading(false)); 
 }, [id]); 
 
 const minDateTime = new Date().toISOString().slice(0, 16); 
 
 const estimatedCost = () => { 
   if (!form.startTime || !form.endTime || !station) return null; 
   const hours = 
     (new Date(form.endTime) - new Date(form.startTime)) / 3600000; 
   if (hours <= 0) return null; 
   return (hours * station.pricePerHour).toFixed(2); 
 }; 
 
 const handleBook = async (e) => { 
   e.preventDefault(); 
   if (!user) { router.push('/auth/login'); return; } 
   setBooking({ loading: true, success: '', error: '' }); 
   try { 
     await bookingAPI.create({ stationId: id, ...form }); 
     setBooking({ 
       loading: false, 
       success: 'Booking confirmed! View it in My Bookings.', 
       error: '' 
     }); 
     const res = await stationAPI.getById(id); 
     setStation(res.data.station); 
   } catch (err) { 
     setBooking({ 
       loading: false, 
       success: '', 
       error: err.response?.data?.message || 'Booking failed. Please try again.' 
     }); 
   } 
 }; 
 
 if (loading) return ( 
   <Layout> 
     <div className="text-center py-5"> 
       <div className="spinner-border cm-spinner"></div> 
     </div> 
   </Layout> 
 ); 
 
 if (!station) return ( 
   <Layout> 
     <div className="container py-5"> 
       <div className="alert alert-danger"> 
         Station not found. <Link href="/stations">Back to stations</Link> 
       </div> 
     </div> 
   </Layout> 
 ); 
 
 const pct = (station.availableSlots / station.totalSlots) * 100; 
 const barClass = pct > 50 ? 'bg-success' : pct > 20 ? 'bg-warning' : 'bg-danger'; 
 const cost = estimatedCost(); 
 
 return ( 
   <Layout title={`${station.name} – ChargeMate`}> 
     <div className="container py-4"> 
 
       <Link 
         href="/stations" 
         className="btn btn-outline-secondary btn-sm mb-4" 
       > 
         <i className="bi bi-arrow-left me-1"></i>Back to Stations 
       </Link> 
 
       <div className="row g-4"> 
         <div className="col-md-7"> 
           <div className="card cm-card p-4"> 
             <h2 className="fw-bold mb-1">{station.name}</h2> 
             <p className="text-muted mb-3"> 
               <i className="bi bi-geo-alt me-1"></i> 
               {station.location.address}, {station.location.city} {station.location.postcode} 
             </p> 
 
             <div className={`alert alert-${ 
               station.availableSlots === 0 ? 'danger' : 
               pct < 30 ? 'warning' : 'success' 
             } d-flex align-items-center`}> 
               <i className={`bi bi-${ 
                 station.availableSlots === 0 ? 'x-circle-fill' : 'check-circle-fill' 
               } me-2`}></i> 
               <strong> 
                 {station.availableSlots} of {station.totalSlots} slots available 
               </strong> 
             </div> 
 
             <div className="progress mb-3" style={{ height: '8px' }}> 
               <div 
                 className={`progress-bar ${barClass}`} 
                 style={{ width: `${pct}%` }} 
               ></div> 
             </div> 
 
             <div className="row g-3"> 
               <div className="col-6"> 
                 <small className="text-muted fw-semibold d-block">CHARGER TYPES</small> 
                 {station.chargerTypes.map((t) => ( 
                   <span key={t} className={`badge badge-${t} me-1`}> 
                     {t.charAt(0).toUpperCase() + t.slice(1)} 
                   </span> 
                 ))} 
               </div> 
               <div className="col-6"> 
                 <small className="text-muted fw-semibold d-block">PRICE</small> 
                 <span className="fw-bold text-success fs-5">£{station.pricePerHour}/hour</span> 
               </div> 
             </div> 
 
           </div> 
         </div> 
 
         <div className="col-md-5"> 
           <div className="card cm-card p-4"> 
             <h5 className="fw-bold mb-3"> 
               <i className="bi bi-calendar-plus me-2" style={{ color: '#2ecc71' }}></i> 
               Book a Slot 
             </h5> 
 
             {!user && ( 
               <div className="alert alert-info small"> 
                 <Link href="/auth/login" className="alert-link">Login</Link> to book. 
               </div> 
             )} 
 
             <form onSubmit={handleBook}> 
               <button 
                 type="submit" 
                 className="btn btn-cm w-100" 
                 disabled={booking.loading || station.availableSlots === 0 || !user} 
               > 
                 Confirm Booking 
               </button> 
             </form> 
           </div> 
         </div> 
       </div> 
     </div> 
   </Layout> 
 ); 
} 
