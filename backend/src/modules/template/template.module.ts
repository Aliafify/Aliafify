import { Module } from '@nestjs/common';
import { PostgresModule } from '../../database/postgres/postgres.module';
import { SeoTemplatesRepository } from './repositories/seo-templates.repository';
import { TemplateService } from './services/template.service';

@Module({
  imports: [PostgresModule],
  providers: [SeoTemplatesRepository, TemplateService],
  exports: [SeoTemplatesRepository, TemplateService],
})
export class TemplateModule {}
