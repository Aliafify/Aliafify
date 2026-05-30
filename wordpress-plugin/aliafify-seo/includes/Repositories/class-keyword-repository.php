<?php

namespace AliafifySEO\Repositories;

if (!defined('ABSPATH')) {
    exit;
}

class KeywordRepository
{
    public function listWithIntents(array $args = []): array
    {
        global $wpdb;

        $keywords = $wpdb->prefix . 'seo_keywords';
        $pivot = $wpdb->prefix . 'seo_keyword_intent';
        $intents = $wpdb->prefix . 'seo_intents';

        $limit = isset($args['limit']) ? (int) $args['limit'] : 100;
        $sql = "SELECT k.id, k.keyword, k.source, k.dynamic_object, ki.intent_id, ki.probability, i.label AS intent_label
                FROM $keywords k
                LEFT JOIN $pivot ki ON ki.keyword_id = k.id
                LEFT JOIN $intents i ON i.id = ki.intent_id
                ORDER BY k.id DESC
                LIMIT %d";

        return $wpdb->get_results($wpdb->prepare($sql, $limit), ARRAY_A);
    }
}
