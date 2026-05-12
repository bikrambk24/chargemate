/** 
* ChargeMate API Client 
* Centralises all HTTP calls to station-service and booking-service 
* Author: Akashdeep (HE38702) 
*/ 
 
import axios from 'axios'; 
 
// Base URLs from environment variables 
const STATION_API = process.env.NEXT_PUBLIC_STATION_API || 'http://localhost:4001'; 
const BOOKING_API = process.env.NEXT_PUBLIC_BOOKING_API || 'http://localhost:4002'; 
 
// ── Helper: get auth headers from localStorage ───────── 
const getHeaders = () => { 
 if (typeof window === 'undefined') return {}; 
 const token = localStorage.getItem('cm_token'); 
 return token 
   ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } 
   : { 'Content-Type': 'application/json' }; 
}; 
 
// ── Auth API ─────────────────────────────────────────── 
export const authAPI = { 
 register: (data) => 
   axios.post(`${STATION_API}/api/auth/register`, data), 
 
 login: (data) => 
   axios.post(`${STATION_API}/api/auth/login`, data), 
 
 me: () => 
   axios.get(`${STATION_API}/api/auth/me`, { headers: getHeaders() }), 
}; 
 
// ── Station API ──────────────────────────────────────── 
export const stationAPI = { 
 getAll: (params = {}) => 
   axios.get(`${STATION_API}/api/stations`, { params }), 
 
 getById: (id) => 
   axios.get(`${STATION_API}/api/stations/${id}`), 
 
 create: (data) => 
   axios.post(`${STATION_API}/api/stations`, data, { headers: getHeaders() }), 
 
 update: (id, data) => 
   axios.put(`${STATION_API}/api/stations/${id}`, data, { headers: getHeaders() }), 
 
 delete: (id) => 
   axios.delete(`${STATION_API}/api/stations/${id}`, { headers: getHeaders() }), 
}; 
 
// ── Booking API ──────────────────────────────────────── 
export const bookingAPI = { 
 create: (data) => 
   axios.post(`${BOOKING_API}/api/bookings`, data, { headers: getHeaders() }), 
 
 getMy: () => 
   axios.get(`${BOOKING_API}/api/bookings/my`, { headers: getHeaders() }), 
 
 getById: (id) => 
   axios.get(`${BOOKING_API}/api/bookings/${id}`, { headers: getHeaders() }), 
 
 cancel: (id, reason) => 
   axios.patch(`${BOOKING_API}/api/bookings/${id}/cancel`, { reason }, { headers: getHeaders() }), 
 
 getAll: (params = {}) => 
   axios.get(`${BOOKING_API}/api/bookings`, { headers: getHeaders(), params }), 
 
 complete: (id) => 
   axios.patch(`${BOOKING_API}/api/bookings/${id}/complete`, {}, { headers: getHeaders() }), 
}; 
 
// ── Auth Helpers ─────────────────────────────────────── 
export const saveAuth = (token, user) => { 
 localStorage.setItem('cm_token', token); 
 localStorage.setItem('cm_user', JSON.stringify(user)); 
}; 
 
export const getUser = () => { 
 if (typeof window === 'undefined') return null; 
 const stored = localStorage.getItem('cm_user'); 
 return stored ? JSON.parse(stored) : null; 
}; 
 
export const clearAuth = () => { 
 localStorage.removeItem('cm_token'); 
 localStorage.removeItem('cm_user'); 
}; 
 
export const isLoggedIn = () => { 
 if (typeof window === 'undefined') return false; 
 return !!localStorage.getItem('cm_token'); 
}; 
