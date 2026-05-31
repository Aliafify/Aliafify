import { Module } from '@nestjs/common';
import { ShopifyInventoryRepository } from './repositories/shopify-inventory.repository';
import { ShopifySyncService } from './services/shopify-sync.service';

@Module({
  providers: [ShopifyInventoryRepository, ShopifySyncService],
  exports: [ShopifyInventoryRepository, ShopifySyncService],
})
export class ShopifySyncModule {}
