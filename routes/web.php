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
    // Sample data - will be replaced with real data from database later
    $stats = [
        'totalManufacturedToday' => 1250,
        'totalStockInStores' => 45680,
        'lowStockAlerts' => 12,
        'batchesExpiringSoon' => 8,
        'recentManufacturing' => [
            [
                'product' => 'Premium Coffee Beans',
                'batch' => 'PCB-20260217-001',
                'quantity' => 500,
                'date' => 'Today 09:30 AM'
            ],
            [
                'product' => 'Organic Tea Leaves',
                'batch' => 'OTL-20260217-002',
                'quantity' => 300,
                'date' => 'Today 11:15 AM'
            ],
            [
                'product' => 'Chocolate Bars',
                'batch' => 'CHB-20260217-003',
                'quantity' => 450,
                'date' => 'Today 02:45 PM'
            ],
        ],
        'lowStockProducts' => [
            [
                'product' => 'Almond Cookies',
                'sku' => 'AC-1001',
                'currentStock' => 45,
                'minStock' => 100
            ],
            [
                'product' => 'Protein Powder',
                'sku' => 'PP-2005',
                'currentStock' => 78,
                'minStock' => 150
            ],
            [
                'product' => 'Energy Drinks',
                'sku' => 'ED-3010',
                'currentStock' => 125,
                'minStock' => 200
            ],
        ],
        'expiringBatches' => [
            [
                'product' => 'Fresh Milk',
                'batch' => 'FM-20260201-045',
                'quantity' => 180,
                'expiryDate' => '2026-02-25'
            ],
            [
                'product' => 'Yogurt Cups',
                'batch' => 'YC-20260205-078',
                'quantity' => 240,
                'expiryDate' => '2026-03-01'
            ],
            [
                'product' => 'Cheese Slices',
                'batch' => 'CS-20260208-112',
                'quantity' => 95,
                'expiryDate' => '2026-03-05'
            ],
            [
                'product' => 'Bread Loaves',
                'batch' => 'BL-20260210-156',
                'quantity' => 320,
                'expiryDate' => '2026-02-20'
            ],
        ],
    ];

    return Inertia::render('Dashboard', [
        'stats' => $stats
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

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
