const Station = require('../models/Station.model'); 
 
// GET /api/stations – list all active stations with optional filters 
const getAllStations = async (req, res, next) => { 
 try { 
   const { city, chargerType, minSlots, search } = req.query; 
   const filter = { isActive: true }; 
 
   if (city)        filter['location.city'] = new RegExp(city, 'i'); 
   if (chargerType) filter.chargerTypes = chargerType; 
   if (minSlots)    filter.availableSlots = { $gte: parseInt(minSlots) }; 
   if (search) { 
     filter.$or = [ 
       { name: new RegExp(search, 'i') }, 
       { 'location.city': new RegExp(search, 'i') }, 
       { 'location.address': new RegExp(search, 'i') } 
     ]; 
   } 
 
   const stations = await Station.find(filter).sort({ createdAt: -1 }); 
   res.json({ count: stations.length, stations }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
// GET /api/stations/:id – get a single station 
const getStationById = async (req, res, next) => { 
 try { 
   const station = await Station.findById(req.params.id); 
   if (!station) return res.status(404).json({ message: 'Station not found' }); 
   res.json({ station }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
// POST /api/stations – admin creates a new station 
const createStation = async (req, res, next) => { 
 try { 
   const station = await Station.create({ 
     ...req.body, 
     createdBy: req.user._id 
   }); 
   res.status(201).json({ message: 'Station created successfully', station }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
// PUT /api/stations/:id – admin updates a station 
const updateStation = async (req, res, next) => { 
 try { 
   const station = await Station.findByIdAndUpdate( 
     req.params.id, 
     req.body, 
     { new: true, runValidators: true } 
   ); 
   if (!station) return res.status(404).json({ message: 'Station not found' }); 
   res.json({ message: 'Station updated', station }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
// DELETE /api/stations/:id – admin deletes a station 
const deleteStation = async (req, res, next) => { 
 try { 
   const station = await Station.findByIdAndDelete(req.params.id); 
   if (!station) return res.status(404).json({ message: 'Station not found' }); 
   res.json({ message: 'Station deleted successfully' }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
// PATCH /api/stations/:id/slots – called internally by booking service 
const updateSlots = async (req, res, next) => { 
 try { 
   const { action } = req.body; // 'increment' or 'decrement' 
   const station = await Station.findById(req.params.id); 
   if (!station) return res.status(404).json({ message: 'Station not found' }); 
 
   if (action === 'decrement') { 
     if (station.availableSlots <= 0) { 
       return res.status(400).json({ message: 'No available slots to decrement' }); 
     } 
     station.availableSlots -= 1; 
   } else if (action === 'increment') { 
     if (station.availableSlots < station.totalSlots) { 
       station.availableSlots += 1; 
     } 
   } else { 
     return res.status(400).json({ message: 'Invalid action. Use increment or decrement' }); 
   } 
 
   await station.save(); 
   res.json({ message: 'Slots updated', station }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
module.exports = { 
 getAllStations, 
 getStationById, 
 createStation, 
 updateStation, 
 deleteStation, 
 updateSlots 
}; 
