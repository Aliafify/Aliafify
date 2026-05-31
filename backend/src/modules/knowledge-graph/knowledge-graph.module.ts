import { Module } from '@nestjs/common';
import { PostgresModule } from '../../database/postgres/postgres.module';
import { AttributeValuesRepository } from './repositories/attribute-values.repository';
import { KgAttributesRepository } from './repositories/attributes.repository';
import { EntitiesRepository } from './repositories/entities.repository';
import { IntentsRepository } from './repositories/intents.repository';
import { KnowledgeGraphService } from './services/knowledge-graph.service';

@Module({
  imports: [PostgresModule],
  providers: [
    EntitiesRepository,
    KgAttributesRepository,
    AttributeValuesRepository,
    IntentsRepository,
    KnowledgeGraphService,
  ],
  exports: [
    EntitiesRepository,
    KgAttributesRepository,
    AttributeValuesRepository,
    IntentsRepository,
    KnowledgeGraphService,
  ],
})
export class KnowledgeGraphModule {}
