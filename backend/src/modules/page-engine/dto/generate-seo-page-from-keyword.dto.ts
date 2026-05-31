import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateSeoPageFromKeywordDto {
  @IsUUID()
  keywordId!: string;

  @IsOptional()
  @IsString()
  canonicalBaseUrl?: string;

  @IsOptional()
  @IsBoolean()
  publishWhenValid?: boolean;
}
