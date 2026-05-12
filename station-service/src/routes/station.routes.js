const express = require('express'); 
const router = express.Router(); 
const { 
 getAllStations, 
 getStationById, 
 createStation, 
 updateStation, 
 deleteStation, 
 updateSlots 
} = require('../controllers/station.controller'); 
const { protect, adminOnly } = require('../middleware/auth.middleware'); 
 
// Public – anyone can view stations 
router.get('/', getAllStations); 
router.get('/:id', getStationById); 
 
// Internal – called by booking service (no auth to keep it simple within VPC) 
router.patch('/:id/slots', updateSlots); 
 
// Protected – admin only 
router.post('/', protect, adminOnly, createStation); 
router.put('/:id', protect, adminOnly, updateStation); 
router.delete('/:id', protect, adminOnly, deleteStation); 
 
module.exports = router; 
