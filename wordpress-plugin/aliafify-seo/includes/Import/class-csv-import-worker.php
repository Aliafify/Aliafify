<?php

namespace AliafifySEO\Import;

if (!defined('ABSPATH')) {
    exit;
}

class CsvImportWorker
{
    private const BATCH_SIZE = 500;

    public static function queueFile(string $filePath): void
    {
        global $wpdb;

        $imports = $wpdb->prefix . 'seo_csv_imports';
        $wpdb->insert($imports, [
            'file_path' => $filePath,
            'file_hash' => hash_file('sha256', $filePath),
            'status' => 'queued',
            'started_at' => current_time('mysql'),
        ], ['%s', '%s', '%s']);

        $importId = (int) $wpdb->insert_id;
        as_enqueue_async_action('aliafify_seo_process_csv_batch', [
            'import_id' => $importId,
            'offset' => 0,
        ], 'aliafify_seo');
    }

    public static function processBatch(array $payload): void
    {
        global $wpdb;
        $importId = (int) ($payload['import_id'] ?? 0);
        $offset = (int) ($payload['offset'] ?? 0);
        $imports = $wpdb->prefix . 'seo_csv_imports';
        $importRows = $wpdb->prefix . 'seo_csv_import_rows';
        $keywordsTable = $wpdb->prefix . 'seo_keywords';

        $import = $wpdb->get_row($wpdb->prepare("SELECT * FROM $imports WHERE id = %d", $importId));
        if (!$import) {
            return;
        }

        $handle = fopen($import->file_path, 'r');
        if (!$handle) {
            return;
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return;
        }

        $current = 0;
        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            if ($current++ < $offset) {
                continue;
            }
            $mapped = array_combine($header, $row);
            if ($mapped === false) {
                $wpdb->insert($importRows, [
                    'import_id' => $importId,
                    'row_number' => $current,
                    'payload' => wp_json_encode($row),
                    'error_message' => 'Malformed row/column mismatch',
                    'status' => 'failed',
                ], ['%d', '%d', '%s', '%s', '%s']);
                continue;
            }
            $rows[] = $mapped;
            if (count($rows) >= self::BATCH_SIZE) {
                break;
            }
        }
        fclose($handle);

        if (!$rows) {
            $wpdb->update($imports, ['status' => 'completed', 'finished_at' => current_time('mysql')], ['id' => $importId], ['%s', '%s'], ['%d']);
            return;
        }

        $wpdb->query('START TRANSACTION');
        try {
            foreach ($rows as $item) {
                $keyword = sanitize_text_field((string) ($item['keyword'] ?? ''));
                if ($keyword === '') {
                    $wpdb->insert($importRows, [
                        'import_id' => $importId,
                        'row_number' => $offset,
                        'payload' => wp_json_encode($item),
                        'error_message' => 'Missing keyword field',
                        'status' => 'failed',
                    ], ['%d', '%d', '%s', '%s', '%s']);
                    continue;
                }

                $probability = isset($item['probability']) ? (float) $item['probability'] : 0.0;
                if ($probability < 0 || $probability > 1) {
                    $wpdb->insert($importRows, [
                        'import_id' => $importId,
                        'row_number' => $offset,
                        'payload' => wp_json_encode($item),
                        'error_message' => 'Invalid probability value',
                        'status' => 'failed',
                    ], ['%d', '%d', '%s', '%s', '%s']);
                    continue;
                }

                $dynamic = wp_json_encode($item);
                $wpdb->query($wpdb->prepare(
                    "INSERT INTO $keywordsTable (keyword, source, dynamic_object) VALUES (%s, %s, %s)
                     ON DUPLICATE KEY UPDATE dynamic_object = VALUES(dynamic_object)",
                    $keyword,
                    sanitize_text_field((string) ($item['source'] ?? 'csv')),
                    $dynamic
                ));

                $wpdb->insert($importRows, [
                    'import_id' => $importId,
                    'row_number' => $offset,
                    'payload' => $dynamic,
                    'status' => 'processed',
                ], ['%d', '%d', '%s', '%s']);
            }

            $failed = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $importRows WHERE import_id = %d AND status = 'failed'", $importId));
            $wpdb->update($imports, ['status' => 'processing', 'processed_rows' => $offset + count($rows), 'failed_rows' => $failed], ['id' => $importId], ['%s', '%d', '%d'], ['%d']);
            $wpdb->query('COMMIT');
        } catch (\Throwable $e) {
            $wpdb->query('ROLLBACK');
            $wpdb->update($imports, ['status' => 'failed'], ['id' => $importId], ['%s'], ['%d']);
            return;
        }

        as_enqueue_async_action('aliafify_seo_process_csv_batch', [
            'import_id' => $importId,
            'offset' => $offset + count($rows),
        ], 'aliafify_seo');
    }

    public static function retryImport(int $importId): void
    {
        global $wpdb;
        $imports = $wpdb->prefix . 'seo_csv_imports';
        $rows = $wpdb->prefix . 'seo_csv_import_rows';

        $wpdb->update($imports, [
            'status' => 'queued',
            'processed_rows' => 0,
            'failed_rows' => 0,
            'finished_at' => null,
        ], ['id' => $importId], ['%s', '%d', '%d', '%s'], ['%d']);

        $wpdb->delete($rows, ['import_id' => $importId], ['%d']);

        as_enqueue_async_action('aliafify_seo_process_csv_batch', [
            'import_id' => $importId,
            'offset' => 0,
        ], 'aliafify_seo');
    }
}
