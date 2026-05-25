import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttributeType } from '../../common/enums/attribute-type.enum';
import { Attribute } from '../../database/schemas/attribute.schema';
import { Product } from '../../database/schemas/product.schema';
import { Rule } from '../../database/schemas/rule.schema';
import { GenerateDto } from './dto/generate.dto';

@Injectable()
export class GeneratorService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Attribute.name) private readonly attributeModel: Model<Attribute>,
    @InjectModel(Rule.name) private readonly ruleModel: Model<Rule>,
  ) {}

  async generate(dto: GenerateDto): Promise<string[]> {
    const product = await this.productModel.findById(dto.productId).lean();
    if (!product) throw new NotFoundException('Product not found');

    const rule = await this.ruleModel.findOne({ productId: dto.productId }).lean();
    const restrictedSet = new Set((rule?.restrictedAttributeIds ?? []).map((id) => id.toString()));
    const allowedSet = new Set((rule?.allowedAttributeIds ?? []).map((id) => id.toString()));

    const attrs = await this.attributeModel
      .find({ type: { $in: dto.attributeTypeOrder as AttributeType[] } })
      .lean();

    const buckets = dto.attributeTypeOrder.map((type) =>
      attrs.filter((a) => {
        if (a.type !== type) return false;
        const id = a._id.toString();
        if (restrictedSet.has(id)) return false;
        return allowedSet.size === 0 || allowedSet.has(id);
      }),
    );

    if (buckets.some((bucket) => bucket.length === 0)) return [];

    return this.cartesianProductOptimized(product.name, buckets.map((x) => x.map((v) => v.value)), dto.chunkSize ?? 1000);
  }

  private asyncYield(): Promise<void> {
    return new Promise((resolve) => setImmediate(resolve));
  }

  private async cartesianProductOptimized(productName: string, lists: string[][], chunkSize: number): Promise<string[]> {
    const out: string[] = [];
    const stack: { depth: number; current: string[] }[] = [{ depth: 0, current: [productName] }];
    let ticks = 0;

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;

      if (node.depth === lists.length) {
        out.push(node.current.join(' '));
      } else {
        const list = lists[node.depth];
        for (let i = list.length - 1; i >= 0; i -= 1) {
          stack.push({ depth: node.depth + 1, current: [...node.current, list[i]] });
        }
      }

      ticks += 1;
      if (ticks % chunkSize === 0) {
        await this.asyncYield();
      }
    }

    return out;
  }
}
