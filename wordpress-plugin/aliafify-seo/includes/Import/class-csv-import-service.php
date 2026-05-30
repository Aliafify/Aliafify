<?php

namespace AliafifySEO\Import;

if (!defined('ABSPATH')) {
    exit;
}

class CsvImportService
{
    public function registerHooks(): void
    {
        add_action('admin_post_aliafify_seo_upload_csv', [$this, 'handleUpload']);
        add_action('admin_post_aliafify_seo_retry_import', [$this, 'retryImport']);
        add_action('aliafify_seo_process_csv_batch', [CsvImportWorker::class, 'processBatch'], 10, 1);
    }

    public function handleUpload(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        check_admin_referer('aliafify_seo_upload_csv');

        if (!isset($_FILES['csv_file'])) {
            wp_die('No file');
        }

        $file = $_FILES['csv_file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($ext !== 'csv' || !is_uploaded_file($file['tmp_name'])) {
            wp_die('Invalid file type');
        }

        $uploads = wp_upload_dir();
        $target = trailingslashit($uploads['basedir']) . 'aliafify-seo-imports/' . uniqid('import_', true) . '.csv';
        wp_mkdir_p(dirname($target));
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            wp_die('Unable to store upload');
        }

        CsvImportWorker::queueFile($target);

        wp_safe_redirect(admin_url('admin.php?page=aliafify-seo-imports'));
        exit;
    }

    public function retryImport(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        check_admin_referer('aliafify_seo_retry_import');
        $importId = isset($_POST['import_id']) ? (int) $_POST['import_id'] : 0;
        if ($importId <= 0) {
            wp_die('Invalid import id');
        }

        CsvImportWorker::retryImport($importId);
        wp_safe_redirect(admin_url('admin.php?page=aliafify-seo-imports'));
        exit;
    }
}
