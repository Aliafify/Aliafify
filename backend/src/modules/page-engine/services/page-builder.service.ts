import { Injectable } from '@nestjs/common';
import {
  AttributeValueRow,
  EntityRow,
  SeoTemplateRow,
} from '../../../shared/interfaces/knowledge-graph.interface';
import { generateSeoSlug } from '../../../shared/utils/slug-generator.util';
import { TemplateService } from '../../template/services/template.service';
import { SeoPageBuildResult } from '../interfaces/seo-page-generator.interface';

export interface BuildSeoPageInput {
  entity: EntityRow;
  attributeValues: AttributeValueRow[];
  template: SeoTemplateRow;
  primaryKeyword: string;
  signature: string;
  canonicalBaseUrl?: string;
}

@Injectable()
export class PageBuilderService {
  constructor(private readonly templates: TemplateService) {}

  build(input: BuildSeoPageInput): SeoPageBuildResult {
    const sortedAttributes = [...input.attributeValues].sort((a, b) =>
      a.slug.localeCompare(b.slug),
    );
    const variables = this.buildVariables(
      input.entity,
      sortedAttributes,
      input.primaryKeyword,
    );
    const slug = generateSeoSlug(input.primaryKeyword, input.signature);
    const title = this.templates.hydrate(
      input.template.title_template,
      variables,
    );

    return {
      slug,
      title,
      canonicalUrl: input.canonicalBaseUrl
        ? `${input.canonicalBaseUrl.replace(/\/$/, '')}/${slug}`
        : null,
      templateId: input.template.id,
      variables,
    };
  }

  private buildVariables(
    entity: EntityRow,
    attributes: AttributeValueRow[],
    primaryKeyword: string,
  ): Record<string, string | number> {
    const attributeValues = attributes.map((attribute) => attribute.value);
    const trendYear = attributeValues.find((value) => /^20\d{2}$/.test(value));

    return {
      entity: entity.name,
      entity_slug: entity.slug,
      attribute: attributeValues.join(' '),
      attribute_1: attributeValues[0] ?? '',
      attribute_2: attributeValues[1] ?? '',
      attributes: attributeValues.join(' '),
      primary_keyword: primaryKeyword,
      year: trendYear ?? new Date().getUTCFullYear(),
    };
  }
}
