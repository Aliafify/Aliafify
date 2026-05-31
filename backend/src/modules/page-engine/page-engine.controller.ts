import { Body, Controller, Post } from '@nestjs/common';
import { GenerateSeoPageFromKeywordDto } from './dto/generate-seo-page-from-keyword.dto';
import { GenerateSeoPageDto } from './dto/generate-seo-page.dto';
import { SeoPageGeneratorService } from './services/seo-page-generator.service';

@Controller('seo-pages')
export class PageEngineController {
  constructor(private readonly generator: SeoPageGeneratorService) {}

  @Post('generate')
  generate(@Body() dto: GenerateSeoPageDto) {
    return this.generator.generate(dto);
  }

  @Post('generate/from-keyword')
  generateFromKeyword(@Body() dto: GenerateSeoPageFromKeywordDto) {
    return this.generator.generateFromKeyword(dto.keywordId, {
      canonicalBaseUrl: dto.canonicalBaseUrl,
      publishWhenValid: dto.publishWhenValid,
    });
  }
}
