import request from 'supertest';
import { app } from '../../src/app';
import { getUserAuthHeader, cleanupTestData, useIntegrationFixture } from '../helpers/testUtils';

const fixture = useIntegrationFixture();

describe('Support API (/api/support)', () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  it('POST /api/support - should fail with 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/support')
      .send({ subject: 'Need help', message: 'I need assistance' });

    expect(res.status).toBe(401);
  });

  it('POST /api/support - should fail with 400 when subject or message is missing', async () => {
    const res = await request(app)
      .post('/api/support')
      .set(getUserAuthHeader(fixture.user.id))
      .send({ subject: 'Help' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/support - should create support ticket with 201', async () => {
    const res = await request(app)
      .post('/api/support')
      .set(getUserAuthHeader(fixture.user.id))
      .send({
        subject: 'Test Subject Assistance',
        message: 'Please assist with boarding point verification.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticket).toHaveProperty('id');
    expect(res.body.data.ticket.status).toBe('Open');
  });

  it('GET /api/support - should retrieve user tickets', async () => {
    const res = await request(app)
      .get('/api/support')
      .set(getUserAuthHeader(fixture.user.id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
