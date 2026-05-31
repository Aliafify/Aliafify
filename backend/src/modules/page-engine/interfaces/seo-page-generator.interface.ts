import { SeoPageRow } from '../../../shared/interfaces/knowledge-graph.interface';

export type SeoPageGenerationStatus =
  | 'generated'
  | 'pending_inventory'
  | 'pending_volume'
  | 'pending_intent_confidence';

export interface GenerateSeoPageInput {
  entityId: string;
  intentId: string;
  attributeValueIds: string[];
  primaryKeyword: string;
  keywordVolume: number;
  intentConfidence: number;
  productsCount?: number;
  canonicalBaseUrl?: string;
  publishWhenValid?: boolean;
}

export interface PageGenerationValidationResult {
  isValid: boolean;
  status: 'Draft' | 'Published' | 'Pending Inventory' | 'Pending Volume';
  reasons: string[];
}

export interface SeoPageBuildResult {
  slug: string;
  title: string;
  canonicalUrl: string | null;
  templateId: string;
  variables: Record<string, string | number>;
}

export interface SeoPageGenerationResult {
  status: SeoPageGenerationStatus;
  page: SeoPageRow;
  signature: string;
  productsCount: number;
  validationReasons: string[];
  templateId: string;
  requiresLinkRecalculation: boolean;
}
