<?php

namespace AliafifySEO\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class AdminController
{
    public function register(): void
    {
        add_action('admin_menu', [$this, 'registerMenu']);
    }

    public function registerMenu(): void
    {
        add_menu_page('SEO Engine', 'SEO Engine', 'manage_options', 'aliafify-seo', [$this, 'renderProjects']);
        add_submenu_page('aliafify-seo', 'Projects', 'Projects', 'manage_options', 'aliafify-seo', [$this, 'renderProjects']);
        add_submenu_page('aliafify-seo', 'Intents', 'Intents', 'manage_options', 'aliafify-seo-intents', [$this, 'renderIntents']);
        add_submenu_page('aliafify-seo', 'Keywords', 'Keywords', 'manage_options', 'aliafify-seo-keywords', [$this, 'renderKeywords']);
        add_submenu_page('aliafify-seo', 'FAQs', 'FAQs', 'manage_options', 'aliafify-seo-faqs', [$this, 'renderFaqs']);
        add_submenu_page('aliafify-seo', 'CSV Imports', 'CSV Imports', 'manage_options', 'aliafify-seo-imports', [$this, 'renderImports']);
    }

    public function renderProjects(): void { echo '<div class="wrap"><h1>Projects</h1></div>'; }
    public function renderIntents(): void { echo '<div class="wrap"><h1>Intents</h1></div>'; }
    public function renderKeywords(): void { echo '<div class="wrap"><h1>Keywords</h1></div>'; }
    public function renderFaqs(): void { echo '<div class="wrap"><h1>FAQs</h1></div>'; }
    public function renderImports(): void
    {
        global $wpdb;
        $imports = $wpdb->prefix . 'seo_csv_imports';
        $rows = $wpdb->prefix . 'seo_csv_import_rows';
        $history = $wpdb->get_results("SELECT * FROM $imports ORDER BY id DESC LIMIT 20");

        echo '<div class="wrap"><h1>CSV Imports</h1>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" enctype="multipart/form-data">';
        wp_nonce_field('aliafify_seo_upload_csv');
        echo '<input type="hidden" name="action" value="aliafify_seo_upload_csv"/>';
        echo '<input type="file" name="csv_file" accept=".csv" required/>';
        submit_button('Upload & Queue Import', 'primary', 'submit', false);
        echo '</form>';

        echo '<h2>Import History</h2><table class="widefat"><thead><tr><th>ID</th><th>Status</th><th>Processed</th><th>Failed</th><th>Created</th><th>Actions</th></tr></thead><tbody>';
        foreach ($history as $item) {
            $failedRows = $wpdb->get_results($wpdb->prepare("SELECT row_number, error_message FROM $rows WHERE import_id = %d AND status = 'failed' ORDER BY id DESC LIMIT 5", (int) $item->id));
            echo '<tr>';
            echo '<td>' . (int) $item->id . '</td>';
            echo '<td>' . esc_html($item->status) . '</td>';
            echo '<td>' . (int) $item->processed_rows . '</td>';
            echo '<td>' . (int) $item->failed_rows . '</td>';
            echo '<td>' . esc_html((string) $item->created_at) . '</td>';
            echo '<td>';
            if (in_array($item->status, ['failed', 'completed'], true)) {
                echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:inline">';
                wp_nonce_field('aliafify_seo_retry_import');
                echo '<input type="hidden" name="action" value="aliafify_seo_retry_import"/>';
                echo '<input type="hidden" name="import_id" value="' . (int) $item->id . '"/>';
                submit_button('Retry', 'secondary', 'submit', false);
                echo '</form>';
            }

            if ($failedRows) {
                echo '<details><summary>Failed rows</summary><ul>';
                foreach ($failedRows as $failed) {
                    echo '<li>Row ' . (int) $failed->row_number . ': ' . esc_html((string) $failed->error_message) . '</li>';
                }
                echo '</ul></details>';
            }
            echo '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
}
