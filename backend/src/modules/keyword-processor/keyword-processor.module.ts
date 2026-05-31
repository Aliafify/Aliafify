import { Module } from '@nestjs/common';
import { PostgresModule } from '../../database/postgres/postgres.module';
import { KnowledgeGraphModule } from '../knowledge-graph/knowledge-graph.module';
import { KeywordAttributesRepository } from './repositories/keyword-attributes.repository';
import { KeywordIntentsRepository } from './repositories/keyword-intents.repository';
import { KeywordsRepository } from './repositories/keywords.repository';
import { KeywordProcessorService } from './services/keyword-processor.service';

@Module({
  imports: [PostgresModule, KnowledgeGraphModule],
  providers: [
    KeywordsRepository,
    KeywordAttributesRepository,
    KeywordIntentsRepository,
    KeywordProcessorService,
  ],
  exports: [
    KeywordsRepository,
    KeywordAttributesRepository,
    KeywordIntentsRepository,
    KeywordProcessorService,
  ],
})
export class KeywordProcessorModule {}
