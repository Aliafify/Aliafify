import { Inject, Injectable } from '@nestjs/common';
import {
  POSTGRES_QUERY_RUNNER,
  PostgresQueryRunner,
} from '../../../database/postgres/postgres-query-runner';
import { AttributeValueRow } from '../../../shared/interfaces/knowledge-graph.interface';

@Injectable()
export class KeywordAttributesRepository {
  constructor(
    @Inject(POSTGRES_QUERY_RUNNER) private readonly db: PostgresQueryRunner,
  ) {}

  async replaceKeywordAttributes(
    keywordId: string,
    attributeValueIds: string[],
  ): Promise<void> {
    await this.db.query(
      'DELETE FROM keyword_attributes WHERE keyword_id = $1',
      [keywordId],
    );

    for (const attributeValueId of attributeValueIds) {
      await this.db.query(
        `INSERT INTO keyword_attributes (keyword_id, attribute_value_id)
         VALUES ($1, $2)
         ON CONFLICT (keyword_id, attribute_value_id) DO NOTHING`,
        [keywordId, attributeValueId],
      );
    }
  }

  async findValuesForKeyword(keywordId: string): Promise<AttributeValueRow[]> {
    const result = await this.db.query<AttributeValueRow>(
      `SELECT av.*
       FROM attribute_values av
       INNER JOIN keyword_attributes ka ON ka.attribute_value_id = av.id
       WHERE ka.keyword_id = $1
       ORDER BY av.slug ASC`,
      [keywordId],
    );
    return result.rows;
  }
}
