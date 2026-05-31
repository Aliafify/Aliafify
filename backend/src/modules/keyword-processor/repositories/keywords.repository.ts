import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { KeywordRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface UpsertKeywordInput {
  keyword: string;
  entityId?: string | null;
  volume?: number;
  difficulty?: number;
  trafficPotential?: number;
  parentTopicId?: string | null;
}

@Injectable()
export class KeywordsRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async upsert(input: UpsertKeywordInput): Promise<KeywordRow> {
    const result = await this.db.query<KeywordRow>(
      `INSERT INTO keywords (keyword, entity_id, volume, difficulty, traffic_potential, parent_topic_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (keyword) DO UPDATE SET
         entity_id = EXCLUDED.entity_id,
         volume = EXCLUDED.volume,
         difficulty = EXCLUDED.difficulty,
         traffic_potential = EXCLUDED.traffic_potential,
         parent_topic_id = EXCLUDED.parent_topic_id,
         last_updated = NOW()
       RETURNING *`,
      [
        input.keyword,
        input.entityId ?? null,
        input.volume ?? 0,
        input.difficulty ?? 0,
        input.trafficPotential ?? 0,
        input.parentTopicId ?? null,
      ],
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<KeywordRow | null> {
    const result = await this.db.query<KeywordRow>(
      'SELECT * FROM keywords WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByKeyword(keyword: string): Promise<KeywordRow | null> {
    const result = await this.db.query<KeywordRow>(
      'SELECT * FROM keywords WHERE keyword = $1',
      [keyword],
    );
    return result.rows[0] ?? null;
  }

  async findByEntity(entityId: string, limit = 100): Promise<KeywordRow[]> {
    const result = await this.db.query<KeywordRow>(
      'SELECT * FROM keywords WHERE entity_id = $1 ORDER BY volume DESC LIMIT $2',
      [entityId, limit],
    );
    return result.rows;
  }
}
