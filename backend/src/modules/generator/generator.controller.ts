import { Body, Controller, Post } from '@nestjs/common';
import { GenerateDto } from './dto/generate.dto';
import { GeneratorService } from './generator.service';

@Controller('generate')
export class GeneratorController {
  constructor(private readonly service: GeneratorService) {}

  @Post()
  async generate(@Body() dto: GenerateDto) {
    const keywords = await this.service.generate(dto);
    return { count: keywords.length, keywords };
  }
}
