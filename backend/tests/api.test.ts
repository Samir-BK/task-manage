import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/server.js';

describe('API Health Check', () => {
  it('should return 200 for health check endpoint', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'API is running');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});

describe('API Rate Limiting', () => {
  it('should limit excessive authentication requests', async () => {
    for (let i = 0; i < 20; i++) {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    }

    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty(
      'message',
      'Too many authentication requests. Please try again later.'
    );
  });
  it('should limit excessive task requests', async () => {
    for (let i = 0; i < 100; i++) {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(401);
    }

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty(
      'message',
      'Too many task requests. Please try again later.'
    );
  });
});