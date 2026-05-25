import { IsArray, IsMongoId } from 'class-validator';

export class CreateRuleDto {
  @IsMongoId()
  productId!: string;

  @IsArray()
  @IsMongoId({ each: true })
  allowedAttributeIds!: string[];

  @IsArray()
  @IsMongoId({ each: true })
  restrictedAttributeIds!: string[];
}
