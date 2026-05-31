import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { AttributeRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface CreateAttributeInput {
  name: string;
  type: string;
  isFilterable?: boolean;
}

@Injectable()
export class KgAttributesRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async create(input: CreateAttributeInput): Promise<AttributeRow> {
    const result = await this.db.query<AttributeRow>(
      `INSERT INTO attributes (name, type, is_filterable)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.name, input.type, input.isFilterable ?? true],
    );
    return result.rows[0];
  }

  async findAll(): Promise<AttributeRow[]> {
    const result = await this.db.query<AttributeRow>(
      'SELECT * FROM attributes ORDER BY name ASC',
    );
    return result.rows;
  }

  async findByName(name: string): Promise<AttributeRow | null> {
    const result = await this.db.query<AttributeRow>(
      'SELECT * FROM attributes WHERE name = $1',
      [name],
    );
    return result.rows[0] ?? null;
  }
}
