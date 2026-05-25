import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { AttributeType } from '../../../common/enums/attribute-type.enum';

export class CreateAttributeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  value!: string;

  @IsEnum(AttributeType)
  type!: AttributeType;
}
