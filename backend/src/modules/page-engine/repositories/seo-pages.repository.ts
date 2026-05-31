import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { SeoPageRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface UpsertSeoPageInput {
  slug: string;
  entityId: string;
  intentId: string;
  attributeSignature: string;
  title: string;
  status?: string;
  productsCount?: number;
  canonicalUrl?: string | null;
}

@Injectable()
export class SeoPagesRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async upsertBySignature(input: UpsertSeoPageInput): Promise<SeoPageRow> {
    const result = await this.db.query<SeoPageRow>(
      `INSERT INTO seo_pages (slug, entity_id, intent_id, attribute_signature, title, status, products_count, canonical_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (entity_id, intent_id, attribute_signature) DO UPDATE SET
         slug = EXCLUDED.slug,
         title = EXCLUDED.title,
         status = EXCLUDED.status,
         products_count = EXCLUDED.products_count,
         canonical_url = EXCLUDED.canonical_url
       RETURNING *`,
      [
        input.slug,
        input.entityId,
        input.intentId,
        input.attributeSignature,
        input.title,
        input.status ?? 'Draft',
        input.productsCount ?? 0,
        input.canonicalUrl ?? null,
      ],
    );
    return result.rows[0];
  }

  async findBySlug(slug: string): Promise<SeoPageRow | null> {
    const result = await this.db.query<SeoPageRow>(
      'SELECT * FROM seo_pages WHERE slug = $1',
      [slug],
    );
    return result.rows[0] ?? null;
  }

  async findRelatedHubs(
    entityId: string,
    intentId: string,
    limit = 20,
  ): Promise<SeoPageRow[]> {
    const result = await this.db.query<SeoPageRow>(
      `SELECT * FROM seo_pages
       WHERE entity_id = $1 AND intent_id = $2 AND status = 'Published'
       ORDER BY products_count DESC
       LIMIT $3`,
      [entityId, intentId, limit],
    );
    return result.rows;
  }
}
