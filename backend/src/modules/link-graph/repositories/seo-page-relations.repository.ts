import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { SeoPageRelationRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface UpsertSeoPageRelationInput {
  sourcePageId: string;
  targetPageId: string;
  relationType: string;
  anchorText: string;
}

@Injectable()
export class SeoPageRelationsRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async upsert(input: UpsertSeoPageRelationInput): Promise<SeoPageRelationRow> {
    const result = await this.db.query<SeoPageRelationRow>(
      `INSERT INTO seo_page_relations (source_page_id, target_page_id, relation_type, anchor_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (source_page_id, target_page_id) DO UPDATE SET
         relation_type = EXCLUDED.relation_type,
         anchor_text = EXCLUDED.anchor_text
       RETURNING *`,
      [
        input.sourcePageId,
        input.targetPageId,
        input.relationType,
        input.anchorText,
      ],
    );
    return result.rows[0];
  }

  async findOutgoing(sourcePageId: string): Promise<SeoPageRelationRow[]> {
    const result = await this.db.query<SeoPageRelationRow>(
      'SELECT * FROM seo_page_relations WHERE source_page_id = $1 ORDER BY relation_type ASC, anchor_text ASC',
      [sourcePageId],
    );
    return result.rows;
  }

  async findIncoming(targetPageId: string): Promise<SeoPageRelationRow[]> {
    const result = await this.db.query<SeoPageRelationRow>(
      'SELECT * FROM seo_page_relations WHERE target_page_id = $1 ORDER BY relation_type ASC, anchor_text ASC',
      [targetPageId],
    );
    return result.rows;
  }

  async deleteOutgoing(sourcePageId: string): Promise<number> {
    const result = await this.db.query<never>(
      'DELETE FROM seo_page_relations WHERE source_page_id = $1',
      [sourcePageId],
    );
    return result.rowCount;
  }
}
