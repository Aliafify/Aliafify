import { Injectable } from '@nestjs/common';
import { generateAttributeSignature } from '../../../shared/utils/signature-generator.util';

@Injectable()
export class CannibalizationGuardService {
  generateSignature(
    entityId: string,
    intentId: string,
    attributeValueIds: string[],
  ): string {
    return generateAttributeSignature(entityId, intentId, attributeValueIds);
  }
}
