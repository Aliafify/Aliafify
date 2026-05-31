import { Module } from '@nestjs/common';
import { PostgresModule } from '../../database/postgres/postgres.module';
import { KeywordProcessorModule } from '../keyword-processor/keyword-processor.module';
import { KnowledgeGraphModule } from '../knowledge-graph/knowledge-graph.module';
import { ShopifySyncModule } from '../shopify-sync/shopify-sync.module';
import { TemplateModule } from '../template/template.module';
import { PageEngineController } from './page-engine.controller';
import { PageGenerationRulesRepository } from './repositories/page-generation-rules.repository';
import { SeoPagesRepository } from './repositories/seo-pages.repository';
import { CannibalizationGuardService } from './services/cannibalization-guard.service';
import { PageBuilderService } from './services/page-builder.service';
import { PageEngineService } from './services/page-engine.service';
import { PageGenerationRuleValidatorService } from './services/page-generation-rule-validator.service';
import { SeoPageGeneratorService } from './services/seo-page-generator.service';

@Module({
  imports: [PostgresModule, KeywordProcessorModule, KnowledgeGraphModule, TemplateModule, ShopifySyncModule],
  controllers: [PageEngineController],
  providers: [
    SeoPagesRepository,
    PageGenerationRulesRepository,
    CannibalizationGuardService,
    PageBuilderService,
    PageGenerationRuleValidatorService,
    SeoPageGeneratorService,
    PageEngineService,
  ],
  exports: [
    SeoPagesRepository,
    PageGenerationRulesRepository,
    CannibalizationGuardService,
    PageBuilderService,
    PageGenerationRuleValidatorService,
    SeoPageGeneratorService,
    PageEngineService,
  ],
})
export class PageEngineModule {}
