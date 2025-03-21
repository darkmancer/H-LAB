import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';

describe('ProductService', () => {
  let service: ProductService;
  let prismaMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaMock = {
      product: mockDeep<Prisma.ProductDelegate>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should create a product', async () => {
    const mockProductData = {
      sku: 'SKU-12345',
      translations: [
        { languageCode: 'en', name: 'Laptop', description: 'A laptop' },
      ],
    };

    prismaMock.product!.create = jest.fn().mockResolvedValue(mockProductData);

    const result = await service.createProduct(mockProductData);

    expect(prismaMock.product!.create).toHaveBeenCalled();
    expect(result.sku).toBe('SKU-12345');
  });
});
