import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Product (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdProductId: string;

  // ✅ Create product (success case)
  it('POST /products - should create product with translations', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .send({
        sku: 'SKU-12345',
        translations: [
          { languageCode: 'en', name: 'Laptop', description: 'Gaming laptop' },
          {
            languageCode: 'fr',
            name: 'Ordinateur',
            description: 'Portable de jeu',
          },
        ],
      })
      .expect(201);

    expect(res.body).toHaveProperty('sku', 'SKU-12345');
    expect(res.body.translations.length).toBe(2);
    createdProductId = res.body.id;
  });

  // ❌ Invalid body (missing name)
  it('POST /products - should fail validation if translation is missing name', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        sku: 'SKU-12346',
        translations: [
          { languageCode: 'en', description: 'Missing name field' },
        ],
      })
      .expect(400);
  });

  // ✅ Search by name (success)
  it('GET /products/search - should return products by name in any language', async () => {
    const res = await request(app.getHttpServer())
      .get('/products/search')
      .query({
        name: 'Laptop',
        page: 1,
        limit: 10,
      })
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.data[0].translations).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Laptop' })]),
    );
  });

  // ✅ Search by name and languageCode
  it('GET /products/search - should return products by name and language', async () => {
    const res = await request(app.getHttpServer())
      .get('/products/search')
      .query({
        name: 'Ordinateur',
        languageCode: 'fr',
        page: 1,
        limit: 10,
      })
      .expect(200);

    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ languageCode: 'fr', name: 'Ordinateur' }),
      ]),
    );
  });

  // ❌ Search missing required query param
  it('GET /products/search - should return 400 if required query is missing', async () => {
    await request(app.getHttpServer())
      .get('/products/search')
      .query({
        page: 1,
        limit: 10,
      })
      .expect(400);
  });
});
