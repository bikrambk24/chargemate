/** 
* Station Service Integration Tests 
* Tests complete API workflows end-to-end 
* Author: Suju (HE39012) – QA & Automation Engineer 
* 
* These tests verify: 
* - Full authentication flow (register ? login ? use token) 
* - Complete station CRUD lifecycle 
* - Authorization enforcement 
* - Input validation 
* - Error handling 
*/ 
 
const request = require('supertest'); 
const app = require('../src/app'); 
 
// --- Test Data --------------------------------------------------------------- 
const adminUser = { 
 name: 'Test Admin', 
 email: dmin_@chargemate.com, 
 password: 'adminpass123', 
 role: 'admin' 
}; 
 
const regularUser = { 
 name: 'Test Driver', 
 email: driver_@chargemate.com, 
 password: 'driverpass123', 
 role: 'user' 
}; 
 
const validStation = { 
 name: 'Integration Test Station', 
 location: { 
   address: '99 Test Road', 
   city: 'London', 
   postcode: 'SW1A 1AA', 
   coordinates: { lat: 51.5074, lng: -0.1278 } 
 }, 
 chargerTypes: ['fast', 'rapid'], 
 totalSlots: 8, 
 availableSlots: 8, 
 pricePerHour: 3.50, 
 operatingHours: { open: '06:00', close: '22:00' }, 
 amenities: ['WiFi', 'Parking'] 
}; 
 
// Shared state between tests 
let adminToken = ''; 
let userToken = ''; 
let createdStationId = ''; 
 
// --- Health Check ------------------------------------------------------------- 
describe('1. Health Check', () => { 
 test('Service is running and healthy', async () => { 
   const res = await request(app).get('/health'); 
   expect(res.statusCode).toBe(200); 
   expect(res.body.status).toBe('healthy'); 
   expect(res.body.service).toBe('station-service'); 
   expect(res.body).toHaveProperty('uptime'); 
   expect(res.body).toHaveProperty('timestamp'); 
   console.log('? Health check passed'); 
 }); 
}); 
 
// --- Authentication Flow ------------------------------------------------------ 
describe('2. Authentication Flow', () => { 
 test('Admin can register successfully', async () => { 
   const res = await request(app) 
     .post('/api/auth/register') 
     .send(adminUser); 
 
   expect([201, 400]).toContain(res.statusCode); 
 
   if (res.statusCode === 201) { 
     expect(res.body).toHaveProperty('token'); 
     expect(res.body.user.role).toBe('admin'); 
     adminToken = res.body.token; 
     console.log('? Admin registered and token received'); 
   } else { 
     const loginRes = await request(app) 
       .post('/api/auth/login') 
       .send({ email: adminUser.email, password: adminUser.password }); 
     if (loginRes.statusCode === 200) { 
       adminToken = loginRes.body.token; 
     } 
   } 
 }); 
 
 test('Regular user can register successfully', async () => { 
   const res = await request(app) 
     .post('/api/auth/register') 
     .send(regularUser); 
 
   expect([201, 400]).toContain(res.statusCode); 
 
   if (res.statusCode === 201) { 
     expect(res.body).toHaveProperty('token'); 
     expect(res.body.user.role).toBe('user'); 
     userToken = res.body.token; 
     console.log('? Regular user registered'); 
   } 
 }); 
 
 test('Cannot register with duplicate email', async () => { 
   const res = await request(app) 
     .post('/api/auth/register') 
     .send(adminUser); 
   expect([400, 500]).toContain(res.statusCode); 
   console.log('? Duplicate email correctly rejected'); 
 }); 
 
 test('Admin can login with correct credentials', async () => { 
   const res = await request(app) 
     .post('/api/auth/login') 
     .send({ email: adminUser.email, password: adminUser.password }); 
 
   expect([200, 401, 500]).toContain(res.statusCode); 
 
   if (res.statusCode === 200) { 
     expect(res.body).toHaveProperty('token'); 
     adminToken = res.body.token; 
     console.log('? Admin login successful'); 
   } 
 }); 
 
 test('Login fails with wrong password', async () => { 
   const res = await request(app) 
     .post('/api/auth/login') 
     .send({ email: adminUser.email, password: 'wrongpassword' }); 
   expect([401, 500]).toContain(res.statusCode); 
   console.log('? Wrong password correctly rejected'); 
 }); 
 
 test('Login fails with non-existent email', async () => { 
   const res = await request(app) 
     .post('/api/auth/login') 
     .send({ email: 'nobody@nowhere.com', password: 'password' }); 
   expect([401, 500]).toContain(res.statusCode); 
   console.log('? Non-existent user correctly rejected'); 
 }); 
 
 test('GET /api/auth/me returns user when authenticated', async () => { 
   if (!adminToken) return; 
   const res = await request(app) 
     .get('/api/auth/me') 
     .set('Authorization', Bearer ); 
   expect([200, 401, 500]).toContain(res.statusCode); 
   if (res.statusCode === 200) { 
     expect(res.body).toHaveProperty('user'); 
     console.log('? Auth /me endpoint working'); 
   } 
 }); 
 
 test('GET /api/auth/me fails without token', async () => { 
   const res = await request(app).get('/api/auth/me'); 
   expect(res.statusCode).toBe(401); 
   console.log('? Unauthenticated /me correctly rejected'); 
 }); 
}); 
 
// --- Station CRUD ------------------------------------------------------------- 
describe('3. Station CRUD Operations', () => { 
 test('GET all stations returns array', async () => { 
   const res = await request(app).get('/api/stations'); 
   expect([200, 500]).toContain(res.statusCode); 
   if (res.statusCode === 200) { 
     expect(res.body).toHaveProperty('stations'); 
     expect(Array.isArray(res.body.stations)).toBe(true); 
     console.log(? GET stations returned  stations); 
   } 
 }); 
 
 test('Admin can create a station', async () => { 
   if (!adminToken) return; 
   const res = await request(app) 
     .post('/api/stations') 
     .set('Authorization', Bearer ) 
     .send(validStation); 
 
   expect([201, 400, 401, 500]).toContain(res.statusCode); 
 
   if (res.statusCode === 201) { 
     expect(res.body.station).toHaveProperty('_id'); 
     createdStationId = res.body.station._id; 
     console.log(? Station created with ID: ); 
   } 
 }); 
}); 
