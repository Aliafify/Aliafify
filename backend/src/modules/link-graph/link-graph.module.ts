import { Module } from '@nestjs/common';
import { PostgresModule } from '../../database/postgres/postgres.module';
import { SeoPageRelationsRepository } from './repositories/seo-page-relations.repository';
import { LinkGraphService } from './services/link-graph.service';

@Module({
  imports: [PostgresModule],
  providers: [SeoPageRelationsRepository, LinkGraphService],
  exports: [SeoPageRelationsRepository, LinkGraphService],
})
export class LinkGraphModule {}
