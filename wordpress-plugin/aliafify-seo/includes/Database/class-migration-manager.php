<?php

namespace AliafifySEO\Database;

if (!defined('ABSPATH')) {
    exit;
}

class MigrationManager
{
    public static function run(): void
    {
        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset = $wpdb->get_charset_collate();
        $projects = $wpdb->prefix . 'seo_projects';
        $intents = $wpdb->prefix . 'seo_intents';
        $keywords = $wpdb->prefix . 'seo_keywords';
        $keywordIntent = $wpdb->prefix . 'seo_keyword_intent';
        $faqs = $wpdb->prefix . 'seo_faqs';
        $imports = $wpdb->prefix . 'seo_csv_imports';
        $importRows = $wpdb->prefix . 'seo_csv_import_rows';

        dbDelta("CREATE TABLE $projects (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(191) NOT NULL,
            slug VARCHAR(191) NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_slug (slug)
        ) $charset;");

        dbDelta("CREATE TABLE $intents (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            project_id BIGINT UNSIGNED NULL,
            parent_id BIGINT UNSIGNED NULL,
            label VARCHAR(191) NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_project_id (project_id),
            KEY idx_parent_id (parent_id)
        ) $charset;");

        dbDelta("CREATE TABLE $keywords (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            project_id BIGINT UNSIGNED NULL,
            parent_id BIGINT UNSIGNED NULL,
            keyword VARCHAR(255) NOT NULL,
            source VARCHAR(50) NOT NULL DEFAULT 'manual',
            search_volume BIGINT UNSIGNED NULL,
            intents_cache_json LONGTEXT NULL,
            dynamic_object LONGTEXT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_project_keyword (project_id, keyword),
            KEY idx_project_id (project_id),
            KEY idx_parent_id (parent_id),
            KEY idx_source (source)
        ) $charset;");

        dbDelta("CREATE TABLE $keywordIntent (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            keyword_id BIGINT UNSIGNED NOT NULL,
            intent_id BIGINT UNSIGNED NOT NULL,
            probability DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_keyword_intent (keyword_id, intent_id),
            KEY idx_keyword_id (keyword_id),
            KEY idx_intent_id (intent_id)
        ) $charset;");

        dbDelta("CREATE TABLE $faqs (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            project_id BIGINT UNSIGNED NOT NULL,
            keyword_id BIGINT UNSIGNED NULL,
            question TEXT NOT NULL,
            answer LONGTEXT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_project_id (project_id),
            KEY idx_keyword_id (keyword_id)
        ) $charset;");

        dbDelta("CREATE TABLE $imports (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            file_path TEXT NOT NULL,
            file_hash VARCHAR(64) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'queued',
            total_rows BIGINT UNSIGNED NOT NULL DEFAULT 0,
            processed_rows BIGINT UNSIGNED NOT NULL DEFAULT 0,
            failed_rows BIGINT UNSIGNED NOT NULL DEFAULT 0,
            started_at TIMESTAMP NULL,
            finished_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_status (status)
        ) $charset;");

        dbDelta("CREATE TABLE $importRows (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            import_id BIGINT UNSIGNED NOT NULL,
            row_number BIGINT UNSIGNED NOT NULL,
            payload LONGTEXT NULL,
            error_message TEXT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_import_id (import_id),
            KEY idx_status (status)
        ) $charset;");

        self::addConstraints();
    }

    private static function addConstraints(): void
    {
        global $wpdb;

        $p = $wpdb->prefix;
        $queries = [
            "ALTER TABLE {$p}seo_intents ADD CONSTRAINT fk_intents_project FOREIGN KEY (project_id) REFERENCES {$p}seo_projects(id) ON DELETE SET NULL",
            "ALTER TABLE {$p}seo_intents ADD CONSTRAINT fk_intents_parent FOREIGN KEY (parent_id) REFERENCES {$p}seo_intents(id) ON DELETE SET NULL",
            "ALTER TABLE {$p}seo_keywords ADD CONSTRAINT fk_keywords_project FOREIGN KEY (project_id) REFERENCES {$p}seo_projects(id) ON DELETE SET NULL",
            "ALTER TABLE {$p}seo_keywords ADD CONSTRAINT fk_keywords_parent FOREIGN KEY (parent_id) REFERENCES {$p}seo_keywords(id) ON DELETE SET NULL",
            "ALTER TABLE {$p}seo_keyword_intent ADD CONSTRAINT fk_keyword_intent_keyword FOREIGN KEY (keyword_id) REFERENCES {$p}seo_keywords(id) ON DELETE CASCADE",
            "ALTER TABLE {$p}seo_keyword_intent ADD CONSTRAINT fk_keyword_intent_intent FOREIGN KEY (intent_id) REFERENCES {$p}seo_intents(id) ON DELETE CASCADE",
            "ALTER TABLE {$p}seo_faqs ADD CONSTRAINT fk_faq_project FOREIGN KEY (project_id) REFERENCES {$p}seo_projects(id) ON DELETE CASCADE",
            "ALTER TABLE {$p}seo_faqs ADD CONSTRAINT fk_faq_keyword FOREIGN KEY (keyword_id) REFERENCES {$p}seo_keywords(id) ON DELETE SET NULL",
            "ALTER TABLE {$p}seo_csv_import_rows ADD CONSTRAINT fk_import_rows_import FOREIGN KEY (import_id) REFERENCES {$p}seo_csv_imports(id) ON DELETE CASCADE",
        ];

        foreach ($queries as $query) {
            $wpdb->query($query); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        }
    }
}
