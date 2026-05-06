/** @type {import('next').NextConfig} */ 
const nextConfig = { 
 reactStrictMode: true, 
 env: { 
   NEXT_PUBLIC_STATION_API: process.env.NEXT_PUBLIC_STATION_API || 'http://localhost:4001', 
   NEXT_PUBLIC_BOOKING_API: process.env.NEXT_PUBLIC_BOOKING_API || 'http://localhost:4002', 
 } 
} 
 
module.exports = nextConfig
