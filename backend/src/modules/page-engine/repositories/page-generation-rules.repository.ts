import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { PageGenerationRuleRow } from '../../../shared/interfaces/knowledge-graph.interface';

@Injectable()
export class PageGenerationRulesRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async findByIntent(intentId: string): Promise<PageGenerationRuleRow | null> {
    const result = await this.db.query<PageGenerationRuleRow>(
      'SELECT * FROM page_generation_rules WHERE intent_id = $1',
      [intentId],
    );
    return result.rows[0] ?? null;
  }

  async upsert(
    intentId: string,
    minVolume: number,
    minProducts: number,
    minIntentConfidence: number,
  ) {
    const result = await this.db.query<PageGenerationRuleRow>(
      `INSERT INTO page_generation_rules (intent_id, min_volume, min_products, min_intent_confidence)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (intent_id) DO UPDATE SET
         min_volume = EXCLUDED.min_volume,
         min_products = EXCLUDED.min_products,
         min_intent_confidence = EXCLUDED.min_intent_confidence
       RETURNING *`,
      [intentId, minVolume, minProducts, minIntentConfidence],
    );
    return result.rows[0];
  }
}
