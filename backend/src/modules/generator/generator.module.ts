import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attribute, AttributeSchema } from '../../database/schemas/attribute.schema';
import { Product, ProductSchema } from '../../database/schemas/product.schema';
import { Rule, RuleSchema } from '../../database/schemas/rule.schema';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Attribute.name, schema: AttributeSchema },
      { name: Rule.name, schema: RuleSchema },
    ]),
  ],
  controllers: [GeneratorController],
  providers: [GeneratorService],
})
export class GeneratorModule {}
