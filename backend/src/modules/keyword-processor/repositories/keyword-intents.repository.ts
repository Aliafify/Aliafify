import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { KeywordIntentRow } from '../../../shared/interfaces/knowledge-graph.interface';

@Injectable()
export class KeywordIntentsRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async upsert(
    keywordId: string,
    intentId: string,
    confidenceScore: number,
  ): Promise<KeywordIntentRow> {
    const result = await this.db.query<KeywordIntentRow>(
      `INSERT INTO keyword_intents (keyword_id, intent_id, confidence_score)
       VALUES ($1, $2, $3)
       ON CONFLICT (keyword_id, intent_id) DO UPDATE SET
         confidence_score = EXCLUDED.confidence_score
       RETURNING *`,
      [keywordId, intentId, confidenceScore],
    );
    return result.rows[0];
  }

  async findBestIntent(keywordId: string): Promise<KeywordIntentRow | null> {
    const result = await this.db.query<KeywordIntentRow>(
      `SELECT * FROM keyword_intents
       WHERE keyword_id = $1
       ORDER BY confidence_score DESC
       LIMIT 1`,
      [keywordId],
    );
    return result.rows[0] ?? null;
  }
}
