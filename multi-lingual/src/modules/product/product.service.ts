// src/modules/product/product.service.ts
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        sku: dto.sku,
        translations: {
          create: dto.translations.map((t) => ({
            languageCode: t.languageCode,
            name: t.name,
            description: t.description,
          })),
        },
      },
      include: {
        translations: true,
      },
    });
  }

  async searchProducts(dto: SearchProductDto) {
    const { name, languageCode, page, limit } = dto;
    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause: any = {
      translations: {
        some: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
          ...(languageCode ? { languageCode } : {}),
        },
      },
    };

    const [products, totalCount] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        include: {
          translations: true,
        },
      }),
      this.prisma.product.count({
        where: whereClause,
      }),
    ]);

    return {
      data: products,
      total: totalCount,
      page,
      limit,
    };
  }
}
