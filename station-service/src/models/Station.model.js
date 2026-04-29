const mongoose = require('mongoose'); 
 
const stationSchema = new mongoose.Schema({ 
 name: { 
   type: String, 
   required: [true, 'Station name is required'], 
   trim: true 
 }, 
 location: { 
   address: { type: String, required: true }, 
   city:    { type: String, required: true }, 
   postcode:{ type: String, required: true }, 
   coordinates: { 
     lat: { type: Number, required: true }, 
     lng: { type: Number, required: true } 
   } 
 }, 
 chargerTypes: [{ 
   type: String, 
   enum: ['slow', 'fast', 'rapid'], 
   required: true 
 }], 
 totalSlots: { 
   type: Number, 
   required: true, 
   min: 1 
 }, 
 availableSlots: { 
   type: Number, 
   required: true, 
   min: 0 
 }, 
 pricePerHour: { 
   type: Number, 
   required: true, 
   min: 0 
 }, 
 operatingHours: { 
   open:  { type: String, default: '00:00' }, 
   close: { type: String, default: '23:59' } 
 }, 
 amenities: [String], 
 isActive: { 
   type: Boolean, 
   default: true 
 }, 
 createdBy: { 
   type: mongoose.Schema.Types.ObjectId, 
   ref: 'User' 
 } 
}, { timestamps: true }); 
 
// Indexes for fast filtering queries 
stationSchema.index({ 'location.city': 1 }); 
stationSchema.index({ chargerTypes: 1 }); 
stationSchema.index({ availableSlots: 1 }); 
 
module.exports = mongoose.model('Station', stationSchema); 
