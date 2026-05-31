import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { SeoTemplateRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface CreateSeoTemplateInput {
  intentId: string;
  name: string;
  titleTemplate: string;
  h1Template: string;
  contentStructure: Record<string, unknown>;
}

@Injectable()
export class SeoTemplatesRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async create(input: CreateSeoTemplateInput): Promise<SeoTemplateRow> {
    const result = await this.db.query<SeoTemplateRow>(
      `INSERT INTO seo_templates (intent_id, name, title_template, h1_template, content_structure)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [
        input.intentId,
        input.name,
        input.titleTemplate,
        input.h1Template,
        JSON.stringify(input.contentStructure),
      ],
    );
    return result.rows[0];
  }

  async findDefaultByIntent(intentId: string): Promise<SeoTemplateRow | null> {
    const result = await this.db.query<SeoTemplateRow>(
      'SELECT * FROM seo_templates WHERE intent_id = $1 ORDER BY name ASC LIMIT 1',
      [intentId],
    );
    return result.rows[0] ?? null;
  }

  async findByIntent(intentId: string): Promise<SeoTemplateRow[]> {
    const result = await this.db.query<SeoTemplateRow>(
      'SELECT * FROM seo_templates WHERE intent_id = $1 ORDER BY name ASC',
      [intentId],
    );
    return result.rows;
  }

  async findById(id: string): Promise<SeoTemplateRow | null> {
    const result = await this.db.query<SeoTemplateRow>(
      'SELECT * FROM seo_templates WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }
}
