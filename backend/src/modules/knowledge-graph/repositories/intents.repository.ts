import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { IntentRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface CreateIntentInput {
  name: string;
  slug: string;
  type: string;
}

@Injectable()
export class IntentsRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async create(input: CreateIntentInput): Promise<IntentRow> {
    const result = await this.db.query<IntentRow>(
      `INSERT INTO intents (name, slug, type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.name, input.slug, input.type],
    );
    return result.rows[0];
  }

  async findAll(): Promise<IntentRow[]> {
    const result = await this.db.query<IntentRow>(
      'SELECT * FROM intents ORDER BY name ASC',
    );
    return result.rows;
  }

  async findBySlug(slug: string): Promise<IntentRow | null> {
    const result = await this.db.query<IntentRow>(
      'SELECT * FROM intents WHERE slug = $1',
      [slug],
    );
    return result.rows[0] ?? null;
  }
}
