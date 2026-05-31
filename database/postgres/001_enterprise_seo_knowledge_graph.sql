-- Enterprise SEO Knowledge Graph PostgreSQL schema
-- Designed for normalized entity/attribute/intent modeling, page generation,
-- cannibalization prevention, and high-throughput internal-link graph reads.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NULL REFERENCES entities(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  level INT NOT NULL DEFAULT 0 CHECK (level >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_entities_slug UNIQUE (slug),
  CONSTRAINT chk_entities_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE INDEX idx_entities_slug ON entities(slug);
CREATE INDEX idx_entities_parent ON entities(parent_id);

CREATE TABLE attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  type VARCHAR(80) NOT NULL,
  is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_attributes_name UNIQUE (name)
);

CREATE INDEX idx_attributes_name ON attributes(name);

CREATE TABLE attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  value VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  CONSTRAINT uq_attribute_values_attribute_slug UNIQUE (attribute_id, slug)
);

CREATE INDEX idx_attr_values_slug ON attribute_values(slug);
CREATE INDEX idx_attr_values_attribute ON attribute_values(attribute_id);

CREATE TABLE intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  type VARCHAR(80) NOT NULL,
  CONSTRAINT uq_intents_slug UNIQUE (slug)
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(500) NOT NULL,
  entity_id UUID NULL REFERENCES entities(id) ON DELETE SET NULL,
  volume INT NOT NULL DEFAULT 0 CHECK (volume >= 0),
  difficulty INT NOT NULL DEFAULT 0 CHECK (difficulty BETWEEN 0 AND 100),
  traffic_potential INT NOT NULL DEFAULT 0 CHECK (traffic_potential >= 0),
  parent_topic_id UUID NULL REFERENCES keywords(id) ON DELETE SET NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_keywords_keyword UNIQUE (keyword),
  CONSTRAINT chk_keywords_no_self_parent_topic CHECK (parent_topic_id IS NULL OR parent_topic_id <> id)
);

CREATE INDEX idx_keywords_kw ON keywords(keyword);
CREATE INDEX idx_keywords_volume ON keywords(volume DESC);
CREATE INDEX idx_keywords_entity ON keywords(entity_id);
CREATE INDEX idx_keywords_parent_topic ON keywords(parent_topic_id);

CREATE TABLE keyword_attributes (
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  attribute_value_id UUID NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
  PRIMARY KEY (keyword_id, attribute_value_id)
);

CREATE INDEX idx_keyword_attributes_value ON keyword_attributes(attribute_value_id);

CREATE TABLE keyword_intents (
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  confidence_score NUMERIC(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  PRIMARY KEY (keyword_id, intent_id)
);

CREATE INDEX idx_kw_intents_confidence ON keyword_intents(confidence_score DESC);
CREATE INDEX idx_keyword_intents_intent ON keyword_intents(intent_id);

CREATE TABLE seo_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title_template TEXT NOT NULL,
  h1_template TEXT NOT NULL,
  content_structure JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_seo_templates_intent ON seo_templates(intent_id);

CREATE TABLE page_generation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  min_volume INT NOT NULL DEFAULT 0 CHECK (min_volume >= 0),
  min_products INT NOT NULL DEFAULT 0 CHECK (min_products >= 0),
  min_intent_confidence NUMERIC(5,4) NOT NULL CHECK (min_intent_confidence >= 0 AND min_intent_confidence <= 1),
  CONSTRAINT uq_page_generation_rules_intent UNIQUE (intent_id)
);

CREATE TABLE seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(500) NOT NULL,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE RESTRICT,
  attribute_signature VARCHAR(64) NOT NULL,
  title VARCHAR(500) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Pending Inventory', 'Pending Volume', 'Archived')),
  products_count INT NOT NULL DEFAULT 0 CHECK (products_count >= 0),
  canonical_url VARCHAR(1000),
  CONSTRAINT uq_seo_pages_slug UNIQUE (slug),
  CONSTRAINT uq_seo_pages_cannibalization UNIQUE (entity_id, intent_id, attribute_signature)
);

CREATE INDEX idx_seo_pages_slug ON seo_pages(slug);
CREATE INDEX idx_seo_pages_entity_intent ON seo_pages(entity_id, intent_id);
CREATE INDEX idx_seo_pages_status ON seo_pages(status);

CREATE TABLE seo_page_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_page_id UUID NOT NULL REFERENCES seo_pages(id) ON DELETE CASCADE,
  target_page_id UUID NOT NULL REFERENCES seo_pages(id) ON DELETE CASCADE,
  relation_type VARCHAR(80) NOT NULL,
  anchor_text VARCHAR(255) NOT NULL,
  CONSTRAINT uq_seo_page_relations_pair UNIQUE (source_page_id, target_page_id),
  CONSTRAINT chk_seo_page_relations_no_self_link CHECK (source_page_id <> target_page_id)
);

CREATE INDEX idx_relations_source ON seo_page_relations(source_page_id);
CREATE INDEX idx_relations_target ON seo_page_relations(target_page_id);
CREATE INDEX idx_relations_type ON seo_page_relations(relation_type);
