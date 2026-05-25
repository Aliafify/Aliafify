import { AttributeType } from '../enums/attribute-type.enum';

export interface CartesianGenerateRequest {
  productId: string;
  attributeTypeOrder: AttributeType[];
  chunkSize?: number;
}
