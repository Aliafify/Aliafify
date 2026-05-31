import { Injectable } from '@nestjs/common';
import { KeywordAttributesRepository } from '../repositories/keyword-attributes.repository';
import { KeywordIntentsRepository } from '../repositories/keyword-intents.repository';
import {
  KeywordsRepository,
  UpsertKeywordInput,
} from '../repositories/keywords.repository';

export interface ProcessKeywordInput extends UpsertKeywordInput {
  attributeValueIds?: string[];
  intentId?: string;
  confidenceScore?: number;
}

@Injectable()
export class KeywordProcessorService {
  constructor(
    private readonly keywords: KeywordsRepository,
    private readonly keywordAttributes: KeywordAttributesRepository,
    private readonly keywordIntents: KeywordIntentsRepository,
  ) {}

  async process(input: ProcessKeywordInput) {
    const keyword = await this.keywords.upsert(input);

    if (input.attributeValueIds) {
      await this.keywordAttributes.replaceKeywordAttributes(
        keyword.id,
        input.attributeValueIds,
      );
    }

    if (input.intentId && input.confidenceScore !== undefined) {
      await this.keywordIntents.upsert(
        keyword.id,
        input.intentId,
        input.confidenceScore,
      );
    }

    return keyword;
  }
}
