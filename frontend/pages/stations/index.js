import { useState, useEffect, useCallback } from 'react'; 
import Layout from '../../components/Layout'; 
import StationCard from '../../components/StationCard'; 
import { stationAPI } from '../../lib/api'; 
 
export default function StationsPage() { 
 const [stations, setStations] = useState([]); 
 const [loading, setLoading] = useState(true); 
 const [error, setError] = useState(''); 
 const [filters, setFilters] = useState({ 
   search: '', chargerType: '', minSlots: '' 
 }); 
 
 const fetchStations = useCallback(async () => { 
   setLoading(true); 
   setError(''); 
   try { 
     const params = {}; 
     if (filters.search) params.search = filters.search; 
     if (filters.chargerType) params.chargerType = filters.chargerType; 
     if (filters.minSlots) params.minSlots = filters.minSlots; 
     const res = await stationAPI.getAll(params); 
     setStations(res.data.stations || []); 
   } catch { 
     setError('Failed to load stations. Please check your connection.'); 
   } finally { 
     setLoading(false); 
   } 
 }, [filters]); 
 
 useEffect(() => { 
   const timer = setTimeout(fetchStations, 300); 
   return () => clearTimeout(timer); 
 }, [fetchStations]); 
 
 const clearFilters = () => 
   setFilters({ search: '', chargerType: '', minSlots: '' }); 
 
 return ( 
   <Layout title="Charging Stations – ChargeMate"> 
     <div className="container py-4"> 
 
       {/* Heading */} 
       <div className="mb-4"> 
         <h2 className="page-heading"> 
           <i className="bi bi-ev-station me-2" style={{ color: '#2ecc71' }}></i> 
           Charging Stations 
         </h2> 
         <p className="text-muted"> 
           {loading ? 'Loading...' : 
             `${stations.length} station${stations.length !== 1 ? 's' : ''} found`} 
         </p> 
       </div> 
 
       {/* Filter Bar */} 
       <div className="card cm-card mb-4"> 
         <div className="card-body py-3"> 
           <div className="row g-2 align-items-end"> 
             <div className="col-md-4"> 
               <label className="form-label small text-muted mb-1"> 
                 Search by name or city 
               </label> 
               <input 
                 type="text" 
                 className="form-control" 
                 placeholder="e.g. London, Oxford Street..." 
                 value={filters.search} 
                 onChange={(e) => 
                   setFilters((f) => ({ ...f, search: e.target.value })) 
                 } 
               /> 
             </div> 
             <div className="col-md-3"> 
               <label className="form-label small text-muted mb-1"> 
                 Charger Type 
               </label> 
               <select 
                 className="form-select" 
                 value={filters.chargerType} 
                 onChange={(e) => 
                   setFilters((f) => ({ ...f, chargerType: e.target.value })) 
                 } 
               > 
                 <option value="">All Types</option> 
                 <option value="slow">🟢 Slow</option> 
                 <option value="fast">🟠 Fast</option> 
                 <option value="rapid">🔴 Rapid</option> 
               </select> 
             </div> 
             <div className="col-md-3"> 
               <label className="form-label small text-muted mb-1"> 
                 Minimum Slots 
               </label> 
               <select 
                 className="form-select" 
                 value={filters.minSlots} 
                 onChange={(e) => 
                   setFilters((f) => ({ ...f, minSlots: e.target.value })) 
                 } 
               > 
                 <option value="">Any Availability</option> 
                 <option value="1">At least 1</option> 
                 <option value="3">At least 3</option> 
                 <option value="5">At least 5</option> 
               </select> 
             </div> 
             <div className="col-md-2"> 
               <button 
                 className="btn btn-outline-secondary w-100" 
                 onClick={clearFilters} 
               > 
                 <i className="bi bi-x me-1"></i>Clear 
               </button> 
             </div> 
           </div> 
         </div> 
       </div> 
 
       {/* Loading */} 
       {loading && ( 
         <div className="text-center py-5"> 
           <div className="spinner-border cm-spinner"></div> 
           <p className="text-muted mt-2">Loading stations...</p> 
         </div> 
       )} 
 
       {/* Error */} 
       {error && ( 
         <div className="alert alert-danger"> 
           <i className="bi bi-exclamation-triangle me-2"></i>{error} 
         </div> 
       )} 
 
       {/* Empty state */} 
       {!loading && !error && stations.length === 0 && ( 
         <div className="text-center py-5"> 
           <i className="bi bi-search" style={{ fontSize: '3rem', color: '#ccc' }}></i> 
           <h5 className="mt-3 text-muted">No stations found</h5> 
           <p className="text-muted small">Try adjusting your filters</p> 
           <button className="btn btn-cm mt-2" onClick={clearFilters}> 
             Clear Filters 
           </button> 
         </div> 
       )} 
 
       {/* Station Grid */} 
       <div className="row g-4"> 
         {stations.map((station) => ( 
           <div key={station._id} className="col-sm-6 col-lg-4"> 
             <StationCard station={station} /> 
           </div> 
         ))} 
       </div> 
 
     </div> 
   </Layout> 
 ); 
} 
