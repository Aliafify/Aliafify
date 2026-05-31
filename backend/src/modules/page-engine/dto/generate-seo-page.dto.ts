import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GenerateSeoPageDto {
  @IsUUID()
  entityId!: string;

  @IsUUID()
  intentId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  attributeValueIds!: string[];

  @IsString()
  primaryKeyword!: string;

  @IsNumber()
  @Min(0)
  keywordVolume!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  intentConfidence!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  productsCount?: number;

  @IsOptional()
  @IsString()
  canonicalBaseUrl?: string;

  @IsOptional()
  @IsBoolean()
  publishWhenValid?: boolean;
}
