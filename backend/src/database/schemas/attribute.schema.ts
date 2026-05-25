import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AttributeType } from '../../common/enums/attribute-type.enum';

export type AttributeDocument = HydratedDocument<Attribute>;

@Schema({ timestamps: true })
export class Attribute {
  @Prop({ required: true, trim: true })
  value!: string;

  @Prop({ required: true, enum: AttributeType })
  type!: AttributeType;
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);
AttributeSchema.index({ value: 1, type: 1 }, { unique: true });
