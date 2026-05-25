import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
