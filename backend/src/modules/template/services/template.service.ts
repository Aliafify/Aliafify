import { Injectable } from '@nestjs/common';
import { SeoTemplatesRepository } from '../repositories/seo-templates.repository';

@Injectable()
export class TemplateService {
  constructor(private readonly templates: SeoTemplatesRepository) {}

  hydrate(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    return Object.entries(variables).reduce(
      (output, [key, value]) => output.replaceAll(`{${key}}`, String(value)),
      template,
    );
  }

  findDefaultByIntent(intentId: string) {
    return this.templates.findDefaultByIntent(intentId);
  }

  findByIntent(intentId: string) {
    return this.templates.findByIntent(intentId);
  }
}
