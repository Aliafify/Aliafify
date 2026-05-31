import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { AttributeValueRow } from '../../../shared/interfaces/knowledge-graph.interface';

export interface CreateAttributeValueInput {
  attributeId: string;
  value: string;
  slug: string;
}

@Injectable()
export class AttributeValuesRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async create(input: CreateAttributeValueInput): Promise<AttributeValueRow> {
    const result = await this.db.query<AttributeValueRow>(
      `INSERT INTO attribute_values (attribute_id, value, slug)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.attributeId, input.value, input.slug],
    );
    return result.rows[0];
  }

  async findByAttribute(attributeId: string): Promise<AttributeValueRow[]> {
    const result = await this.db.query<AttributeValueRow>(
      'SELECT * FROM attribute_values WHERE attribute_id = $1 ORDER BY value ASC',
      [attributeId],
    );
    return result.rows;
  }

  async findByIds(ids: string[]): Promise<AttributeValueRow[]> {
    if (ids.length === 0) return [];
    const result = await this.db.query<AttributeValueRow>(
      'SELECT * FROM attribute_values WHERE id = ANY($1::uuid[]) ORDER BY slug ASC',
      [ids],
    );
    return result.rows;
  }

  async findBySlugs(slugs: string[]): Promise<AttributeValueRow[]> {
    if (slugs.length === 0) return [];
    const result = await this.db.query<AttributeValueRow>(
      'SELECT * FROM attribute_values WHERE slug = ANY($1::varchar[])',
      [slugs],
    );
    return result.rows;
  }
}
