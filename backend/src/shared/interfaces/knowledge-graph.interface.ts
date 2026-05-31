export interface EntityRow {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  level: number;
  created_at: Date;
}

export interface AttributeRow {
  id: string;
  name: string;
  type: string;
  is_filterable: boolean;
}

export interface AttributeValueRow {
  id: string;
  attribute_id: string;
  value: string;
  slug: string;
}

export interface IntentRow {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export interface KeywordRow {
  id: string;
  keyword: string;
  entity_id: string | null;
  volume: number;
  difficulty: number;
  traffic_potential: number;
  parent_topic_id: string | null;
  last_updated: Date;
}

export interface KeywordIntentRow {
  keyword_id: string;
  intent_id: string;
  confidence_score: string;
}

export interface SeoTemplateRow {
  id: string;
  intent_id: string;
  name: string;
  title_template: string;
  h1_template: string;
  content_structure: Record<string, unknown>;
}

export interface PageGenerationRuleRow {
  id: string;
  intent_id: string;
  min_volume: number;
  min_products: number;
  min_intent_confidence: string;
}

export interface SeoPageRow {
  id: string;
  slug: string;
  entity_id: string;
  intent_id: string;
  attribute_signature: string;
  title: string;
  status: string;
  products_count: number;
  canonical_url: string | null;
}

export interface SeoPageRelationRow {
  id: string;
  source_page_id: string;
  target_page_id: string;
  relation_type: string;
  anchor_text: string;
}

export interface KeywordClusterKey {
  entityId: string;
  intentId: string;
  attributeValueIds: string[];
}
