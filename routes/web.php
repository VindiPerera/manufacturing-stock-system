<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ManufacturingOrderController;
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
    Route::resource('manufacturing', ManufacturingOrderController::class);
});

require __DIR__.'/auth.php';
