import { createHash } from 'crypto';

export function generateAttributeSignature(
  entityId: string,
  intentId: string,
  attributeValueIds: string[],
): string {
  const sortedAttributeIds = [...attributeValueIds].sort();
  return createHash('md5')
    .update(`${entityId}:${intentId}:${sortedAttributeIds.join(',')}`)
    .digest('hex');
}
