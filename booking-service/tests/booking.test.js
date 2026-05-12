const request = require('supertest');
const app = require('../src/app');

// ─── Health Check ────────────────────────────────────────────────────────────
describe('Health Check', () => {
  test('GET /health → 200 with correct body', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('booking-service');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
describe('404 Handler', () => {
  test('GET /unknown → 404', async () => {
    const res = await request(app).get('/unknown-route');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Route not found');
  });
});

// ─── Auth Protection ─────────────────────────────────────────────────────────
describe('Booking Routes - Auth Protection', () => {
  test('POST /api/bookings without token → 401', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        stationId: 'abc123',
        chargerType: 'fast',
        startTime: '2025-06-01T10:00:00Z',
        endTime: '2025-06-01T12:00:00Z'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/bookings/my without token → 401', async () => {
    const res = await request(app).get('/api/bookings/my');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/bookings without token → 401', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.statusCode).toBe(401);
  });

  test('PATCH /api/bookings/:id/cancel without token → 401', async () => {
    const res = await request(app)
      .patch('/api/bookings/somebookingid/cancel')
      .send({ reason: 'Changed plans' });

    expect(res.statusCode).toBe(401);
  });

  test('PATCH /api/bookings/:id/complete without token → 401', async () => {
    const res = await request(app).patch(
      '/api/bookings/somebookingid/complete'
    );

    expect(res.statusCode).toBe(401);
  });
});

// ─── Invalid Token ────────────────────────────────────────────────────────────
describe('Booking Routes - Invalid Token', () => {
  test('POST /api/bookings with invalid token → 401', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', 'Bearer this.is.not.a.valid.token')
      .send({
        stationId: 'abc123',
        chargerType: 'fast',
        startTime: '2025-06-01T10:00:00Z',
        endTime: '2025-06-01T12:00:00Z'
      });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/bookings/my with malformed token → 401', async () => {
    const res = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', 'Bearer badtoken');

    expect(res.statusCode).toBe(401);
  });
});

// ─── Response Structure ──────────────────────────────────────────────────────
describe('Response Structure', () => {
  test('All error responses have message field', async () => {
    const res = await request(app).get('/api/bookings/my');

    expect(res.body).toHaveProperty('message');
  });
});
