import { Injectable, NotFoundException } from '@nestjs/common';
import { KeywordAttributesRepository } from '../../keyword-processor/repositories/keyword-attributes.repository';
import { KeywordIntentsRepository } from '../../keyword-processor/repositories/keyword-intents.repository';
import { KeywordsRepository } from '../../keyword-processor/repositories/keywords.repository';
import { AttributeValuesRepository } from '../../knowledge-graph/repositories/attribute-values.repository';
import { EntitiesRepository } from '../../knowledge-graph/repositories/entities.repository';
import { ShopifySyncService } from '../../shopify-sync/services/shopify-sync.service';
import { TemplateService } from '../../template/services/template.service';
import { PageGenerationRulesRepository } from '../repositories/page-generation-rules.repository';
import { SeoPagesRepository } from '../repositories/seo-pages.repository';
import { CannibalizationGuardService } from './cannibalization-guard.service';
import { PageBuilderService } from './page-builder.service';
import { PageGenerationRuleValidatorService } from './page-generation-rule-validator.service';
import {
  GenerateSeoPageInput,
  SeoPageGenerationResult,
  SeoPageGenerationStatus,
} from '../interfaces/seo-page-generator.interface';

@Injectable()
export class SeoPageGeneratorService {
  constructor(
    private readonly keywords: KeywordsRepository,
    private readonly keywordAttributes: KeywordAttributesRepository,
    private readonly keywordIntents: KeywordIntentsRepository,
    private readonly entities: EntitiesRepository,
    private readonly attributeValues: AttributeValuesRepository,
    private readonly templates: TemplateService,
    private readonly shopify: ShopifySyncService,
    private readonly pages: SeoPagesRepository,
    private readonly rules: PageGenerationRulesRepository,
    private readonly cannibalizationGuard: CannibalizationGuardService,
    private readonly pageBuilder: PageBuilderService,
    private readonly ruleValidator: PageGenerationRuleValidatorService,
  ) {}

  async generateFromKeyword(
    keywordId: string,
    options: Pick<
      GenerateSeoPageInput,
      'canonicalBaseUrl' | 'publishWhenValid'
    > = {},
  ): Promise<SeoPageGenerationResult> {
    const keyword = await this.keywords.findById(keywordId);
    if (!keyword) throw new NotFoundException('Keyword not found');
    if (!keyword.entity_id) {
      throw new NotFoundException('Keyword is not mapped to an entity');
    }

    const [attributeValues, intent] = await Promise.all([
      this.keywordAttributes.findValuesForKeyword(keyword.id),
      this.keywordIntents.findBestIntent(keyword.id),
    ]);

    if (!intent) {
      throw new NotFoundException('Keyword is not mapped to an intent');
    }

    return this.generate({
      entityId: keyword.entity_id,
      intentId: intent.intent_id,
      attributeValueIds: attributeValues.map(
        (attributeValue) => attributeValue.id,
      ),
      primaryKeyword: keyword.keyword,
      keywordVolume: keyword.volume,
      intentConfidence: Number(intent.confidence_score),
      canonicalBaseUrl: options.canonicalBaseUrl,
      publishWhenValid: options.publishWhenValid,
    });
  }

  async generate(
    input: GenerateSeoPageInput,
  ): Promise<SeoPageGenerationResult> {
    const [entity, attributes, template, rule] = await Promise.all([
      this.entities.findById(input.entityId),
      this.attributeValues.findByIds(input.attributeValueIds),
      this.templates.findDefaultByIntent(input.intentId),
      this.rules.findByIntent(input.intentId),
    ]);

    if (!entity) throw new NotFoundException('Entity not found');
    if (attributes.length !== new Set(input.attributeValueIds).size) {
      throw new NotFoundException(
        'One or more attribute values were not found',
      );
    }
    if (!template) {
      throw new NotFoundException('SEO template not found for intent');
    }
    if (!rule) {
      throw new NotFoundException('Page generation rule not found for intent');
    }

    const signature = this.cannibalizationGuard.generateSignature(
      input.entityId,
      input.intentId,
      input.attributeValueIds,
    );
    const productsCount =
      input.productsCount ??
      (await this.shopify.countMatchingProducts({
        entityId: input.entityId,
        attributeValueIds: input.attributeValueIds,
      }));
    const validation = this.ruleValidator.validate({
      rule,
      keywordVolume: input.keywordVolume,
      productsCount,
      intentConfidence: input.intentConfidence,
      publishWhenValid: input.publishWhenValid,
    });
    const build = this.pageBuilder.build({
      entity,
      attributeValues: attributes,
      template,
      primaryKeyword: input.primaryKeyword,
      signature,
      canonicalBaseUrl: input.canonicalBaseUrl,
    });
    const page = await this.pages.upsertBySignature({
      slug: build.slug,
      entityId: input.entityId,
      intentId: input.intentId,
      attributeSignature: signature,
      title: build.title,
      status: validation.status,
      productsCount,
      canonicalUrl: build.canonicalUrl,
    });

    return {
      status: this.toGenerationStatus(validation),
      page,
      signature,
      productsCount,
      validationReasons: validation.reasons,
      templateId: build.templateId,
      requiresLinkRecalculation: validation.isValid,
    };
  }

  private toGenerationStatus(validation: {
    isValid: boolean;
    status: string;
    reasons: string[];
  }): SeoPageGenerationStatus {
    if (validation.isValid) return 'generated';
    if (validation.status === 'Pending Volume') return 'pending_volume';
    if (
      validation.reasons.some((reason) =>
        reason.startsWith('Intent confidence'),
      )
    ) {
      return 'pending_intent_confidence';
    }
    return 'pending_inventory';
  }
}
