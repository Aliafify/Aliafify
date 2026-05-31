import { Injectable } from '@nestjs/common';

export interface ShopifyInventoryCountInput {
  entityId: string;
  attributeValueIds: string[];
}

@Injectable()
export class ShopifyInventoryRepository {
  countMatchingProducts(input: ShopifyInventoryCountInput): Promise<number> {
    void input;
    return Promise.resolve(0);
  }
}
