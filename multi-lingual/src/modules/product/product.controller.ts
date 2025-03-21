import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductDto } from './dto/search-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createMultilingualProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Get('search')
  searchMultilingualProducts(@Query() searchDto: SearchProductDto) {
    return this.productService.searchProducts(searchDto);
  }
}
