import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { EntityRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface CreateEntityInput {
  parentId?: string | null;
  name: string;
  slug: string;
  level: number;
}

@Injectable()
export class EntitiesRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async create(input: CreateEntityInput): Promise<EntityRow> {
    const result = await this.db.query<EntityRow>(
      `INSERT INTO entities (parent_id, name, slug, level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.parentId ?? null, input.name, input.slug, input.level],
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<EntityRow | null> {
    const result = await this.db.query<EntityRow>(
      'SELECT * FROM entities WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findBySlug(slug: string): Promise<EntityRow | null> {
    const result = await this.db.query<EntityRow>(
      'SELECT * FROM entities WHERE slug = $1',
      [slug],
    );
    return result.rows[0] ?? null;
  }

  async findChildren(parentId: string): Promise<EntityRow[]> {
    const result = await this.db.query<EntityRow>(
      'SELECT * FROM entities WHERE parent_id = $1 ORDER BY name ASC',
      [parentId],
    );
    return result.rows;
  }

  async findRoots(): Promise<EntityRow[]> {
    const result = await this.db.query<EntityRow>(
      'SELECT * FROM entities WHERE parent_id IS NULL ORDER BY name ASC',
    );
    return result.rows;
  }
}
