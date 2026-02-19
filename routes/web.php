<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ManufacturingOrderController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\StockOutController;
use App\Http\Controllers\StockTransferController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $features = [
        [
            'id' => 1,
            'name' => 'PRODUCT MANAGEMENT',
            'description' => 'Create, edit, and delete products. Set attributes like SKU, Category, Unit, Barcode, and Minimum stock level.',
            'color' => 'bg-red-600',
            'image' => '/images/product-png.png',
            'link' => '/products',
        ],
        [
            'id' => 2,
            'name' => 'MANUFACTURING',
            'description' => 'Create manufacturing orders, select products, enter quantities and dates. Auto-generate batch numbers and update stock.',
            'color' => 'bg-blue-900',
            'image' => '/images/Manufacturing.png',
            'link' => '/manufacturing',
        ],
        [
            'id' => 3,
            'name' => 'BATCH & LABELING',
            'description' => 'Manage batch creation, print labels with product info and barcode. Reprint, search, and view batch history.',
            'color' => 'bg-yellow-400',
            'image' => '/images/product-png.png',
            'link' => '/batches',
        ],
        [
            'id' => 4,
            'name' => 'STORE MANAGEMENT',
            'description' => 'View store-wise stock, batch inventory levels, movement history, and receive low stock alerts.',
            'color' => 'bg-green-600',
            'image' => '/images/Store.png',
            'link' => '/stores',
        ],
        [
            'id' => 5,
            'name' => 'BARCODE SCANNING',
            'description' => 'Scan product barcodes, reduce stock automatically, and record stock-out transactions with batch tracking.',
            'color' => 'bg-purple-900',
            'image' => '/images/product-png.png',
            'link' => '/stock-out',
        ],
        [
            'id' => 6,
            'name' => 'ANALYTICS DASHBOARD',
            'description' => 'Real-time manufacturing analytics, expiry alerts, low stock warnings, and complete batch traceability for inventory management.',
            'color' => 'bg-orange-500',
            'image' => '/images/report.png',
            'link' => '/analytics',
        ],
        [
            'id' => 7,
            'name' => 'CATEGORIES',
            'description' => 'Organize products into categories for better structure and easy navigation throughout the system.',
            'color' => 'bg-indigo-600',
            'image' => '/images/product-png.png',
            'link' => '/categories',
        ],
        [
            'id' => 8,
            'name' => 'USERS',
            'description' => 'Manage user accounts, roles, and permissions. Control access to different modules and features.',
            'color' => 'bg-pink-500',
            'image' => '/images/users.png',
            'link' => '/users',
        ],
    ];

    return Inertia::render('Dashboard', [
        'features' => $features
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // Analytics & Dashboard Routes
    Route::get('/analytics', [AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
    Route::get('/analytics/batch/{batchIdentifier}', [AnalyticsController::class, 'batchTraceability'])->name('analytics.batch');
    Route::get('/api/analytics/metrics', [AnalyticsController::class, 'apiMetrics'])->name('analytics.api.metrics');
    Route::get('/api/analytics/expiring-batches', [AnalyticsController::class, 'apiExpiringBatches'])->name('analytics.api.expiring');
    Route::get('/api/analytics/low-stock', [AnalyticsController::class, 'apiLowStockAlerts'])->name('analytics.api.lowStock');
    Route::get('/api/analytics/batch/{batchIdentifier}', [AnalyticsController::class, 'searchBatch'])->name('analytics.api.batch');
    Route::get('/api/analytics/report', [AnalyticsController::class, 'exportReport'])->name('analytics.api.report');
    Route::get('/api/analytics/manufactured-details', [AnalyticsController::class, 'getManufacturedDetails'])->name('analytics.api.manufactured');
    Route::get('/api/analytics/store-stock-details', [AnalyticsController::class, 'getStoreStockDetails'])->name('analytics.api.storeStock');
    Route::get('/api/analytics/sales-details', [AnalyticsController::class, 'getSalesDetails'])->name('analytics.api.sales');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Product Management Routes
    Route::resource('products', ProductController::class);
    Route::get('/products/low-stock', [ProductController::class, 'lowStock'])->name('products.lowStock');
    Route::get('/products/categories', [ProductController::class, 'categories'])->name('products.categories');
    Route::post('/products/bulk-delete', [ProductController::class, 'bulkDelete'])->name('products.bulkDelete');

    // Manufacturing Management Routes
    Route::get('/manufacturing/next-batch-number', [ManufacturingOrderController::class, 'getNextBatchNumber'])->name('manufacturing.nextBatchNumber');
    Route::resource('manufacturing', ManufacturingOrderController::class);

    // Batch & Labeling Routes
    Route::resource('batches', BatchController::class)->except(['create', 'edit', 'update']);
    Route::get('/batches/{batch}/print', [BatchController::class, 'printLabel'])->name('batches.print');
    Route::post('/batches/{batch}/mark-printed', [BatchController::class, 'markPrinted'])->name('batches.markPrinted');
    Route::post('/batches/print-multiple', [BatchController::class, 'printMultiple'])->name('batches.printMultiple');
    Route::post('/batches/mark-multiple-printed', [BatchController::class, 'markMultiplePrinted'])->name('batches.markMultiplePrinted');
    Route::post('/batches/preview', [BatchController::class, 'preview'])->name('batches.preview');
    Route::get('/batches/search', [BatchController::class, 'search'])->name('batches.search');
    Route::get('/products/{product}/batches', [BatchController::class, 'productHistory'])->name('batches.productHistory');

    // Stock Out / Checkout Routes (Scan-to-Deduct)
    Route::get('/stock-out', [StockOutController::class, 'index'])->name('stock-out.index');
    Route::post('/stock-out/scan', [StockOutController::class, 'scan'])->name('stock-out.scan');
    Route::get('/stock-out/history', [StockOutController::class, 'history'])->name('stock-out.history');
    Route::delete('/stock-out/clear-history', [StockOutController::class, 'clearHistory'])->name('stock-out.clearHistory');
    Route::get('/stock-out/batch-info', [StockOutController::class, 'getBatchInfo'])->name('stock-out.batch-info');

    // Stock Transfer Routes (Store Management)
    Route::get('/stock-transfers', [StockTransferController::class, 'index'])->name('stock-transfers.index');
    Route::post('/stock-transfers', [StockTransferController::class, 'store'])->name('stock-transfers.store');
    Route::get('/stock-transfers/history', [StockTransferController::class, 'history'])->name('stock-transfers.history');
    Route::get('/stock-transfers/stores', [StockTransferController::class, 'stores'])->name('stock-transfers.stores');
    Route::post('/stock-transfers/stores', [StockTransferController::class, 'storeStore'])->name('stock-transfers.stores.store');
});

require __DIR__.'/auth.php';
