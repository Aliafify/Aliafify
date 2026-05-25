import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attribute } from '../../database/schemas/attribute.schema';
import { CreateAttributeDto } from './dto/create-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(@InjectModel(Attribute.name) private readonly model: Model<Attribute>) {}
  create(dto: CreateAttributeDto) { return this.model.create(dto); }
  findAll() { return this.model.find().sort({ type: 1, value: 1 }).lean(); }
  async findOne(id: string) {
    const item = await this.model.findById(id).lean();
    if (!item) throw new NotFoundException('Attribute not found');
    return item;
  }
}
