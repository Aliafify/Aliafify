import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeGraphModule } from './modules/knowledge-graph/knowledge-graph.module';
import { KeywordProcessorModule } from './modules/keyword-processor/keyword-processor.module';
import { LinkGraphModule } from './modules/link-graph/link-graph.module';
import { PageEngineModule } from './modules/page-engine/page-engine.module';
import { ShopifySyncModule } from './modules/shopify-sync/shopify-sync.module';
import { TemplateModule } from './modules/template/template.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { ProductsModule } from './modules/products/products.module';
import { RulesModule } from './modules/rules/rules.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/taxonomy-generator'),
    ProductsModule,
    AttributesModule,
    RulesModule,
    GeneratorModule,
    KnowledgeGraphModule,
    KeywordProcessorModule,
    TemplateModule,
    PageEngineModule,
    LinkGraphModule,
    ShopifySyncModule,
  ],
})
export class AppModule {}
