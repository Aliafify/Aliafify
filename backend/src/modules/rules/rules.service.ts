import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rule } from '../../database/schemas/rule.schema';
import { CreateRuleDto } from './dto/create-rule.dto';

@Injectable()
export class RulesService {
  constructor(@InjectModel(Rule.name) private readonly model: Model<Rule>) {}
  createOrUpdate(dto: CreateRuleDto) {
    return this.model.findOneAndUpdate(
      { productId: dto.productId },
      { $set: dto },
      { upsert: true, new: true },
    );
  }
  findAll() { return this.model.find().populate('productId').populate('allowedAttributeIds').populate('restrictedAttributeIds').lean(); }
  async findByProduct(productId: string) {
    const rule = await this.model.findOne({ productId }).lean();
    if (!rule) throw new NotFoundException('Rule not found for product');
    return rule;
  }
}
