import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RuleDocument = HydratedDocument<Rule>;

@Schema({ timestamps: true })
export class Rule {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attribute' }], default: [] })
  allowedAttributeIds!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attribute' }], default: [] })
  restrictedAttributeIds!: Types.ObjectId[];
}

export const RuleSchema = SchemaFactory.createForClass(Rule);
RuleSchema.index({ productId: 1 }, { unique: true });
