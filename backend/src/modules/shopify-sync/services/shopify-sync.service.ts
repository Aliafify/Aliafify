import { Injectable } from '@nestjs/common';
import {
  ShopifyInventoryCountInput,
  ShopifyInventoryRepository,
} from '../repositories/shopify-inventory.repository';

@Injectable()
export class ShopifySyncService {
  constructor(private readonly inventory: ShopifyInventoryRepository) {}

  countMatchingProducts(input: ShopifyInventoryCountInput) {
    return this.inventory.countMatchingProducts(input);
  }
}
