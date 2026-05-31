import { Injectable } from '@nestjs/common';
import { PageGenerationRuleRow } from '../../../shared/interfaces/knowledge-graph.interface';
import { PageGenerationValidationResult } from '../interfaces/seo-page-generator.interface';

export interface ValidatePageGenerationInput {
  rule: PageGenerationRuleRow;
  keywordVolume: number;
  productsCount: number;
  intentConfidence: number;
  publishWhenValid?: boolean;
}

@Injectable()
export class PageGenerationRuleValidatorService {
  validate(input: ValidatePageGenerationInput): PageGenerationValidationResult {
    const reasons: string[] = [];
    const minIntentConfidence = Number(input.rule.min_intent_confidence);

    if (input.keywordVolume < input.rule.min_volume) {
      reasons.push(
        `Keyword volume ${input.keywordVolume} is below required minimum ${input.rule.min_volume}.`,
      );
    }

    if (input.productsCount < input.rule.min_products) {
      reasons.push(
        `Products count ${input.productsCount} is below required minimum ${input.rule.min_products}.`,
      );
    }

    if (input.intentConfidence < minIntentConfidence) {
      reasons.push(
        `Intent confidence ${input.intentConfidence} is below required minimum ${minIntentConfidence}.`,
      );
    }

    if (reasons.length === 0) {
      return {
        isValid: true,
        status: input.publishWhenValid ? 'Published' : 'Draft',
        reasons,
      };
    }

    return {
      isValid: false,
      status:
        input.keywordVolume < input.rule.min_volume
          ? 'Pending Volume'
          : 'Pending Inventory',
      reasons,
    };
  }
}
