import { Injectable } from '@nestjs/common';
import { GenerateSeoPageInput } from '../interfaces/seo-page-generator.interface';
import { PageGenerationRulesRepository } from '../repositories/page-generation-rules.repository';
import {
  SeoPagesRepository,
  UpsertSeoPageInput,
} from '../repositories/seo-pages.repository';
import { SeoPageGeneratorService } from './seo-page-generator.service';

@Injectable()
export class PageEngineService {
  constructor(
    private readonly pages: SeoPagesRepository,
    private readonly rules: PageGenerationRulesRepository,
    private readonly generator: SeoPageGeneratorService,
  ) {}

  generatePage(input: GenerateSeoPageInput) {
    return this.generator.generate(input);
  }

  generateFromKeyword(
    keywordId: string,
    options: Pick<
      GenerateSeoPageInput,
      'canonicalBaseUrl' | 'publishWhenValid'
    > = {},
  ) {
    return this.generator.generateFromKeyword(keywordId, options);
  }

  createOrUpdatePage(input: UpsertSeoPageInput) {
    return this.pages.upsertBySignature(input);
  }

  findRule(intentId: string) {
    return this.rules.findByIntent(intentId);
  }
}
