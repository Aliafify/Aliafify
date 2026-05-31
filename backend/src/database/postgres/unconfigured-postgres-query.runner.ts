import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  PostgresQueryResult,
  PostgresQueryRunner,
} from './postgres-query-runner';

@Injectable()
export class UnconfiguredPostgresQueryRunner implements PostgresQueryRunner {
  query<T>(): Promise<PostgresQueryResult<T>> {
    throw new ServiceUnavailableException(
      'PostgreSQL query runner is not configured. Bind POSTGRES_QUERY_RUNNER to a pg/TypeORM/Prisma adapter before using knowledge graph repositories.',
    );
  }
}
