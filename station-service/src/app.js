require('dotenv').config(); 
const express = require('express'); 
const cors = require('cors'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 
 
const stationRoutes = require('./routes/station.routes'); 
const authRoutes = require('./routes/auth.routes'); 
const { errorHandler } = require('./middleware/error.middleware'); 
 
const app = express(); 
const PORT = process.env.PORT || 4001; 
 
// Middleware 
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 

app.get('/health', (req, res) => { 
 res.status(200).json({ 
   status: 'healthy', 
   service: 'station-service', 
   timestamp: new Date().toISOString(), 
   uptime: process.uptime() 
 }); 
}); 
 
// Routes 
app.use('/api/auth', authRoutes); 
app.use('/api/stations', stationRoutes); 
 
// 404 handler 
app.use((req, res) => { 
 res.status(404).json({ message: 'Route not found' }); 
}); 
 
// Global error handler 
app.use(errorHandler); 
 
// Start server only when not under test 
const startServer = async () => { 
 try { 
   await mongoose.connect(process.env.MONGO_URI); 
   console.log('Connected to MongoDB Atlas'); 
   app.listen(PORT, () => { 
     console.log(`🚀 Station Service running on port ${PORT}`); 
   }); 
 } catch (err) { 
   console.error('❌ MongoDB connection failed:', err.message); 
   process.exit(1); 
 } 
}; 
 
if (process.env.NODE_ENV !== 'test') { 
 startServer(); 
} 
 
module.exports = app; 
