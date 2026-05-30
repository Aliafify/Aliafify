<?php
/**
 * Plugin Name: Aliafify SEO Engine
 * Description: SEO data platform with normalized custom tables, async CSV imports, and modular repositories.
 * Version: 0.1.0
 * Author: Aliafify
 */

if (!defined('ABSPATH')) {
    exit;
}

define('ALIAFIFY_SEO_VERSION', '0.1.0');
define('ALIAFIFY_SEO_FILE', __FILE__);
define('ALIAFIFY_SEO_PATH', plugin_dir_path(__FILE__));

require_once ALIAFIFY_SEO_PATH . 'includes/class-plugin.php';

register_activation_hook(__FILE__, ['AliafifySEO\\Plugin', 'activate']);
add_action('plugins_loaded', ['AliafifySEO\\Plugin', 'boot']);
