import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../database/schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  create(dto: CreateProductDto) { return this.productModel.create(dto); }
  findAll() { return this.productModel.find().sort({ name: 1 }).lean(); }
  async findOne(id: string) {
    const item = await this.productModel.findById(id).lean();
    if (!item) throw new NotFoundException('Product not found');
    return item;
  }
}
