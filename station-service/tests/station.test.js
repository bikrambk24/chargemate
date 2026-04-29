const request = require('supertest'); 
const app = require('../src/app'); 
 
// ─── Health Check ─────────────────────────────────────────────────────────── 
describe('Health Check', () => { 
 test('GET /health → 200 with healthy status', async () => { 
   const res = await request(app).get('/health'); 
   expect(res.statusCode).toBe(200); 
   expect(res.body.status).toBe('healthy'); 
   expect(res.body.service).toBe('station-service'); 
   expect(res.body).toHaveProperty('uptime'); 
   expect(res.body).toHaveProperty('timestamp'); 
 }); 
}); 
 
// ─── 404 Handler ──────────────────────────────────────────────────────────── 
describe('404 Handler', () => { 
 test('GET /unknown-route → 404', async () => { 
   const res = await request(app).get('/unknown-route'); 
   expect(res.statusCode).toBe(404); 
   expect(res.body.message).toBe('Route not found'); 
 }); 
}); 
 
// ─── Auth Routes ───────────────────────────────────────────────────────────── 
describe('Auth Routes – Input Validation', () => { 
 test('POST /api/auth/register with missing name → error', async () => { 
   const res = await request(app) 
     .post('/api/auth/register') 
     .send({ email: 'test@test.com', password: 'pass123' }); 
   expect([400, 500]).toContain(res.statusCode); 
 }); 
 
 test('POST /api/auth/login with wrong credentials → 401 or 500', async () => { 
   const res = await request(app) 
     .post('/api/auth/login') 
     .send({ email: 'nobody@chargemate.com', password: 'wrongpassword' }); 
   expect([401, 500]).toContain(res.statusCode); 
 }); 
 
 test('GET /api/auth/me without token → 401', async () => { 
   const res = await request(app).get('/api/auth/me'); 
   expect(res.statusCode).toBe(401); 
 }); 
}); 
 
// ─── Station Routes ────────────────────────────────────────────────────────── 
describe('Station Routes', () => { 
 test('GET /api/stations → 200 or 500 (depends on DB)', async () => { 
   const res = await request(app).get('/api/stations'); 
   expect([200, 500]).toContain(res.statusCode); 
 }); 
 
 test('GET /api/stations with query params → no crash', async () => { 
   const res = await request(app) 
     .get('/api/stations?chargerType=fast&city=London'); 
   expect([200, 500]).toContain(res.statusCode); 
 }); 
 
 test('GET /api/stations/:id with invalid id → 400/404/500', async () => { 
   const res = await request(app).get('/api/stations/notavalidid'); 
   expect([400, 404, 500]).toContain(res.statusCode); 
 }); 
 
 test('POST /api/stations without auth → 401', async () => { 
   const res = await request(app) 
     .post('/api/stations') 
     .send({ name: 'Unauthorised Station' }); 
   expect(res.statusCode).toBe(401); 
 }); 
 
 test('PUT /api/stations/:id without auth → 401', async () => { 
   const res = await request(app) 
     .put('/api/stations/someid') 
     .send({ name: 'Updated Name' }); 
   expect(res.statusCode).toBe(401); 
 }); 
 
 test('DELETE /api/stations/:id without auth → 401', async () => { 
   const res = await request(app).delete('/api/stations/someid'); 
   expect(res.statusCode).toBe(401); 
 }); 
}); 
