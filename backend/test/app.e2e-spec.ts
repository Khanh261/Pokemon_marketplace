import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Pokemon Store API (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let createdPokemonId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth flow', () => {
    it('POST /auth/register - should register a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User', email: 'testuser@test.com', password: 'password123' })
        .expect(201);
      userToken = res.body.token;
      expect(userToken).toBeDefined();
    });

    it('POST /auth/login - admin login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@pokemon.com', password: 'admin123' })
        .expect(200);
      adminToken = res.body.token;
      expect(adminToken).toBeDefined();
    });

    it('POST /auth/register - duplicate email returns 409', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Dup', email: 'testuser@test.com', password: 'password123' })
        .expect(409);
    });
  });

  describe('Pokemon CRUD flow', () => {
    it('GET /pokemon - returns paginated list', async () => {
      const res = await request(app.getHttpServer()).get('/pokemon').expect(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
    });

    it('POST /pokemon - unauthenticated returns 401', async () => {
      await request(app.getHttpServer())
        .post('/pokemon')
        .send({ name: 'TestMon', type: 'Fire', price: 10 })
        .expect(401);
    });

    it('POST /pokemon - user role returns 403', async () => {
      await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'TestMon', type: 'Fire', price: 10 })
        .expect(403);
    });

    it('POST /pokemon - admin can create', async () => {
      const res = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'TestMon', type: 'Fire', price: 10.99 })
        .expect(201);
      createdPokemonId = res.body.id;
      expect(res.body.name).toBe('TestMon');
    });

    it('GET /pokemon/:id - get single pokemon', async () => {
      const res = await request(app.getHttpServer())
        .get(`/pokemon/${createdPokemonId}`)
        .expect(200);
      expect(res.body.name).toBe('TestMon');
    });

    it('PATCH /pokemon/:id - admin can update', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/pokemon/${createdPokemonId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 19.99 })
        .expect(200);
      expect(Number(res.body.price)).toBe(19.99);
    });

    it('DELETE /pokemon/:id - admin can delete', async () => {
      await request(app.getHttpServer())
        .delete(`/pokemon/${createdPokemonId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('GET /pokemon/:id - returns 404 after delete', async () => {
      await request(app.getHttpServer())
        .get(`/pokemon/${createdPokemonId}`)
        .expect(404);
    });
  });
});
