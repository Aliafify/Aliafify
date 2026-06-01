<?php

namespace AliafifySEO;

use AliafifySEO\Admin\AdminController;
use AliafifySEO\Database\MigrationManager;
use AliafifySEO\Import\CsvImportService;

if (!defined('ABSPATH')) {
    exit;
}

require_once ALIAFIFY_SEO_PATH . 'includes/Database/class-migration-manager.php';
require_once ALIAFIFY_SEO_PATH . 'includes/Admin/class-admin-controller.php';
require_once ALIAFIFY_SEO_PATH . 'includes/Import/class-csv-import-service.php';
require_once ALIAFIFY_SEO_PATH . 'includes/Import/class-csv-import-worker.php';
require_once ALIAFIFY_SEO_PATH . 'includes/Services/class-hierarchy-validator-service.php';
require_once ALIAFIFY_SEO_PATH . 'includes/Filters/class-keyword-filter-interface.php';
require_once ALIAFIFY_SEO_PATH . 'includes/Filters/class-abstract-keyword-filter.php';
require_once ALIAFIFY_SEO_PATH . 'includes/Filters/class-keyword-filter-manager.php';

class Plugin
{
    public static function activate(): void
    {
        MigrationManager::run();
    }

    public static function boot(): void
    {
        (new AdminController())->register();
        (new CsvImportService())->registerHooks();
    }
}
