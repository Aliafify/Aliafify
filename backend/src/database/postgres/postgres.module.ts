import { Module } from '@nestjs/common';
import { POSTGRES_QUERY_RUNNER } from './postgres-query-runner';
import { UnconfiguredPostgresQueryRunner } from './unconfigured-postgres-query.runner';

@Module({
  providers: [
    UnconfiguredPostgresQueryRunner,
    {
      provide: POSTGRES_QUERY_RUNNER,
      useExisting: UnconfiguredPostgresQueryRunner,
    },
  ],
  exports: [POSTGRES_QUERY_RUNNER],
})
export class PostgresModule {}
