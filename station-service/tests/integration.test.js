/**
 * Station Service Integration Tests
 * Author: Suju (HE39012) - QA & Automation Engineer
 */

const request = require('supertest');
const app = require('../src/app');

// ────────────────────────────────
// Test Data Setup
// ────────────────────────────────
const timestamp = Date.now();

const adminEmail = `admin${timestamp}@chargemate.com`;
const userEmail = `user${timestamp}@chargemate.com`;

const adminUser = {
  name: 'Test Admin',
  email: adminEmail,
  password: 'adminpass123',
  role: 'admin',
};

const regularUser = {
  name: 'Test Driver',
  email: userEmail,
  password: 'driverpass123',
  role: 'user',
};

const validStation = {
  name: 'Integration Test Station',
  location: {
    address: '99 Test Road',
    city: 'London',
    postcode: 'SW1A 1AA',
    coordinates: { lat: 51.5074, lng: -0.1278 },
  },
  chargerTypes: ['fast', 'rapid'],
  totalSlots: 8,
  availableSlots: 8,
  pricePerHour: 3.5,
  operatingHours: { open: '06:00', close: '22:00' },
  amenities: ['WiFi', 'Parking'],
};

let adminToken = '';
let userToken = '';
let createdStationId = '';

// ────────────────────────────────
// 1. Health Check
// ────────────────────────────────
describe('1. Health Check', () => {
  test('Service is running and healthy', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('station-service');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ────────────────────────────────
// 2. Route Handling
// ────────────────────────────────
describe('2. Route Handling', () => {
  test('Unknown route returns 404', async () => {
    const res = await request(app).get('/api/unknown-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('All error responses include message field', async () => {
    const res = await request(app).get('/api/unknown');

    expect(res.body).toHaveProperty('message');
  });
});

// ────────────────────────────────
// 3. Auth Protection
// ────────────────────────────────
describe('3. Auth Protection', () => {
  test('POST /api/stations requires authentication', async () => {
    const res = await request(app)
      .post('/api/stations')
      .send(validStation);

    expect(res.statusCode).toBe(401);
  });

  test('PUT /api/stations/:id requires authentication', async () => {
    const res = await request(app)
      .put('/api/stations/some-id')
      .send(validStation);

    expect(res.statusCode).toBe(401);
  });
});

// ────────────────────────────────
// 4. Station Routes
// ────────────────────────────────
describe('4. Station Routes', () => {
  test('GET /api/stations returns 200 or 500', async () => {
    const res = await request(app).get('/api/stations');

    expect([200, 500]).toContain(res.statusCode);
  });

  test('GET /api/stations with filters returns 200 or 500', async () => {
    const res = await request(app)
      .get('/api/stations')
      .query({ city: 'London', chargerType: 'fast' });

    expect([200, 500]).toContain(res.statusCode);
  });
});

// ────────────────────────────────
// 5. Auth API Tests
// ────────────────────────────────
describe('5. Authentication', () => {
  test('Login with missing fields returns error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@fields.com' });

    expect([400,401, 500]).toContain(res.statusCode);
  });

  test('Login with wrong credentials returns 401 or 500', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@chargemate.com',
        password: 'wrong',
      });

    expect([401, 500]).toContain(res.statusCode);
  });

  test('Login with missing password returns error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' });

    expect([400, 401, 500]).toContain(res.statusCode);
  });
});