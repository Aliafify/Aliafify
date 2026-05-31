-- Baseline taxonomy, attributes, intents, generation rules, and templates.
-- This file is intentionally idempotent so it can be applied repeatedly.

INSERT INTO entities (name, slug, level) VALUES
  ('Bedrooms', 'bedrooms', 0),
  ('Living Rooms', 'living-rooms', 0),
  ('Dining Rooms', 'dining-rooms', 0),
  ('Kids Rooms', 'kids-rooms', 0),
  ('Office Furniture', 'office-furniture', 0),
  ('Decor & Accessories', 'decor-accessories', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO entities (name, slug, parent_id, level)
SELECT child.name, child.slug, parent.id, 1
FROM (VALUES
  ('Beds', 'beds', 'bedrooms'),
  ('Wardrobes', 'wardrobes', 'bedrooms'),
  ('Dressers', 'dressers', 'bedrooms'),
  ('Dressing Rooms', 'dressing-rooms', 'bedrooms'),
  ('Corner Sofas', 'corner-sofas', 'living-rooms'),
  ('Sofas', 'sofas', 'living-rooms'),
  ('Salons', 'salons', 'living-rooms'),
  ('TV Units', 'tv-units', 'living-rooms'),
  ('Coffee Tables', 'coffee-tables', 'living-rooms'),
  ('Dining Tables', 'dining-tables', 'dining-rooms'),
  ('Dining Chairs', 'dining-chairs', 'dining-rooms'),
  ('Carpets', 'carpets', 'decor-accessories'),
  ('Curtains', 'curtains', 'decor-accessories'),
  ('Lighting', 'lighting', 'decor-accessories')
) AS child(name, slug, parent_slug)
JOIN entities parent ON parent.slug = child.parent_slug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO attributes (name, type, is_filterable) VALUES
  ('Style', 'style', TRUE),
  ('Color', 'color', TRUE),
  ('Shape', 'shape', TRUE),
  ('Size', 'size', TRUE),
  ('Feature', 'feature', TRUE),
  ('Audience', 'audience', TRUE),
  ('Trend', 'trend', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO attribute_values (attribute_id, value, slug)
SELECT a.id, v.value, v.slug
FROM (VALUES
  ('Style', 'Modern', 'modern'),
  ('Style', 'Classic', 'classic'),
  ('Style', 'Neo Classic', 'neo-classic'),
  ('Style', 'Turkish', 'turkish'),
  ('Color', 'Beige', 'beige'),
  ('Color', 'Gray', 'gray'),
  ('Color', 'White', 'white'),
  ('Color', 'Black', 'black'),
  ('Color', 'Wood', 'wood'),
  ('Shape', 'L Shape', 'l-shape'),
  ('Shape', 'U Shape', 'u-shape'),
  ('Shape', 'Round', 'round'),
  ('Shape', 'Square', 'square'),
  ('Size', 'Small', 'small'),
  ('Size', 'Medium', 'medium'),
  ('Size', 'Large', 'large'),
  ('Size', 'King', 'king'),
  ('Size', 'Queen', 'queen'),
  ('Feature', 'Storage', 'storage'),
  ('Feature', 'Sofa Bed', 'sofa-bed'),
  ('Feature', 'Expandable', 'expandable'),
  ('Audience', 'Bride', 'bride'),
  ('Audience', 'Kids', 'kids'),
  ('Audience', 'Teen', 'teen'),
  ('Audience', 'Master', 'master'),
  ('Trend', '2026', '2026'),
  ('Trend', 'New', 'new'),
  ('Trend', 'Latest', 'latest')
) AS v(attribute_name, value, slug)
JOIN attributes a ON a.name = v.attribute_name
ON CONFLICT (attribute_id, slug) DO NOTHING;

INSERT INTO intents (name, slug, type) VALUES
  ('Commercial', 'commercial', 'conversion'),
  ('Transactional', 'transactional', 'conversion'),
  ('Gallery', 'gallery', 'visual'),
  ('Comparison', 'comparison', 'evaluation'),
  ('FAQ', 'faq', 'informational'),
  ('Trend', 'trend', 'seasonal'),
  ('Guide', 'guide', 'informational'),
  ('Inspiration', 'inspiration', 'visual'),
  ('Local', 'local', 'geo')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO page_generation_rules (intent_id, min_volume, min_products, min_intent_confidence)
SELECT i.id, r.min_volume, r.min_products, r.min_intent_confidence
FROM (VALUES
  ('commercial', 50, 4, 0.85),
  ('gallery', 100, 10, 0.90),
  ('comparison', 20, 2, 0.80),
  ('trend', 10, 6, 0.95),
  ('faq', 10, 0, 0.80)
) AS r(intent_slug, min_volume, min_products, min_intent_confidence)
JOIN intents i ON i.slug = r.intent_slug
ON CONFLICT (intent_id) DO UPDATE SET
  min_volume = EXCLUDED.min_volume,
  min_products = EXCLUDED.min_products,
  min_intent_confidence = EXCLUDED.min_intent_confidence;

INSERT INTO seo_templates (intent_id, name, title_template, h1_template, content_structure)
SELECT i.id, t.name, t.title_template, t.h1_template, t.content_structure::jsonb
FROM (VALUES
  ('commercial', 'Commercial PLP', '{entity} {attribute_1} {attribute_2}', '{entity} {attribute_1} {attribute_2}', '{"blocks":["product_grid","filters","related_searches"]}'),
  ('gallery', 'Gallery Grid', 'صور {entity} {attribute} | احدث تصميمات {year}', 'صور {entity} {attribute}', '{"blocks":["image_grid","style_notes","commercial_links"]}'),
  ('comparison', 'Comparison Guide', 'أفضل {entity} {attribute} - مقارنة الاسعار والمميزات', 'أفضل {entity} {attribute}', '{"blocks":["comparison_table","pros_cons","winner_products"]}'),
  ('trend', 'Annual Trend', 'احدث كولكشن {entity} {attribute} لعام {year}', 'احدث كولكشن {entity} {attribute}', '{"blocks":["trend_intro","product_grid","refresh_notes"]}'),
  ('faq', 'FAQ Accordion', 'اسئلة شائعة عن {entity} {attribute} واجاباتها', 'اسئلة شائعة عن {entity} {attribute}', '{"blocks":["faq_schema","accordion","commercial_links"]}'),
  ('guide', 'Buying Guide', 'دليل شراء {entity}: كيف تختار الافضل لمنزلك', 'دليل شراء {entity}', '{"blocks":["longform_content","decision_tree","related_categories"]}')
) AS t(intent_slug, name, title_template, h1_template, content_structure)
JOIN intents i ON i.slug = t.intent_slug
WHERE NOT EXISTS (
  SELECT 1 FROM seo_templates existing
  WHERE existing.intent_id = i.id AND existing.name = t.name
);
