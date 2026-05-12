/** 
* StationCard Component 
* Displays a charging station summary with availability indicator 
*/ 
 
import Link from 'next/link'; 
 
export default function StationCard({ station }) { 
 const pct = station.totalSlots > 0 
   ? (station.availableSlots / station.totalSlots) * 100 
   : 0; 
 
 const slotClass = 
   pct > 50 ? 'slot-high' : 
   pct > 20 ? 'slot-medium' : 'slot-low'; 
 
 const slotLabel = 
   pct > 50 ? 'Good Availability' : 
   pct > 20 ? 'Limited Slots' : 
   station.availableSlots === 0 ? 'No Slots' : 'Almost Full'; 
 
 const barClass = 
   pct > 50 ? 'bg-success' : 
   pct > 20 ? 'bg-warning' : 'bg-danger'; 
 
 return ( 
   <div className="card cm-card h-100"> 
     <div className="card-body d-flex flex-column p-3"> 
       {/* Header */} 
       <div className="d-flex justify-content-between align-items-start mb-2"> 
         <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}> 
           {station.name} 
         </h6> 
         <span className={`small ${slotClass}`} style={{ whiteSpace: 'nowrap' }}> 
           <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i> 
           {slotLabel} 
         </span> 
       </div> 
 
       {/* Address */} 
       <p className="text-muted small mb-2"> 
         <i className="bi bi-geo-alt me-1"></i> 
         {station.location.address}, {station.location.city} 
       </p> 
 
       {/* Charger type badges */} 
       <div className="mb-2"> 
         {station.chargerTypes.map((type) => ( 
           <span 
             key={type} 
             className={`badge badge-${type} me-1`} 
             style={{ fontSize: '0.7rem' }} 
           > 
             {type.charAt(0).toUpperCase() + type.slice(1)} 
           </span> 
         ))} 
       </div> 
 
       {/* Stats */} 
       <div className="row text-center g-0 mb-2"> 
         <div className="col-4"> 
           <div className="small text-muted">Available</div> 
           <div className={`fw-bold ${slotClass}`}> 
             {station.availableSlots} 
           </div> 
         </div> 
         <div className="col-4"> 
           <div className="small text-muted">Total</div> 
           <div className="fw-bold">{station.totalSlots}</div> 
         </div> 
         <div className="col-4"> 
           <div className="small text-muted">Per Hour</div> 
           <div className="fw-bold text-success"> 
             £{station.pricePerHour.toFixed(2)} 
           </div> 
         </div> 
       </div> 
 
       {/* Progress bar */} 
       <div className="progress mb-2" style={{ height: '5px' }}> 
         <div 
           className={`progress-bar ${barClass}`} 
           style={{ width: `${pct}%`, transition: 'width 0.4s' }} 
         ></div> 
       </div> 
 
       {/* Hours */} 
       <p className="text-muted small mb-3"> 
         <i className="bi bi-clock me-1"></i> 
         {station.operatingHours?.open} – {station.operatingHours?.close} 
       </p> 
 
       {/* CTA Button */} 
       <div className="mt-auto"> 
         <Link 
           href={`/stations/${station._id}`} 
           className={`btn btn-sm w-100 ${ 
             station.availableSlots > 0 ? 'btn-cm' : 'btn-secondary' 
           }`} 
         > 
           <i className={`bi ${ 
             station.availableSlots > 0 
               ? 'bi-lightning-charge' : 'bi-eye' 
           } me-1`}></i> 
           {station.availableSlots > 0 ? 'Book Now' : 'View Details'} 
         </Link> 
       </div> 
     </div> 
   </div> 
 ); 
} 
