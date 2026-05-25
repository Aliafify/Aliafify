import { IsArray, IsEnum, IsMongoId, IsOptional, Min } from 'class-validator';
import { AttributeType } from '../../../common/enums/attribute-type.enum';

export class GenerateDto {
  @IsMongoId()
  productId!: string;

  @IsArray()
  @IsEnum(AttributeType, { each: true })
  attributeTypeOrder!: AttributeType[];

  @IsOptional()
  @Min(100)
  chunkSize?: number;
}
