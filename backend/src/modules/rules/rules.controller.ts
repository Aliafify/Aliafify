import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { RulesService } from './rules.service';

@Controller('rules')
export class RulesController {
  constructor(private readonly service: RulesService) {}
  @Post() upsert(@Body() dto: CreateRuleDto) { return this.service.createOrUpdate(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get('product/:productId') findByProduct(@Param('productId') productId: string) { return this.service.findByProduct(productId); }
}
