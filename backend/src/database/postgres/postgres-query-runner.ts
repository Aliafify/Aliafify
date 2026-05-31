export interface PostgresQueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface PostgresQueryRunner {
  query<T>(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgresQueryResult<T>>;
}

export const POSTGRES_QUERY_RUNNER = Symbol('POSTGRES_QUERY_RUNNER');
