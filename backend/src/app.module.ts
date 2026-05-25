import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
})
export class AppModule {}
