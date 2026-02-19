<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Product;
use App\Models\StockOutTransaction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Dashboard Main Page - Returns all key metrics
     * Loads dashboard with aggregated data from database
     */
    public function dashboard()
    {
        $metrics = $this->getKeyMetrics();
        $expiringBatches = $this->getExpiringBatches();
        $lowStockAlerts = $this->getLowStockProducts();
        
        return Inertia::render('Analytics/Dashboard', [
            'metrics' => $metrics,
            'expiringBatches' => $expiringBatches,
            'lowStockAlerts' => $lowStockAlerts,
        ]);
    }

    /**
     * Batch Traceability - Search by Batch ID/Number
     * Returns complete history of a specific batch
     */
    public function batchTraceability()
    {
        return Inertia::render('Analytics/BatchTraceability');
    }

    /**
     * API: Get all key metrics for dashboard cards
     * Uses EFFICIENT DATABASE AGGREGATIONS
     */
    public function getKeyMetrics()
    {
        $today = Carbon::today();
        
        return [
            'totalManufacturedToday' => $this->getTotalManufacturedToday($today),
            'liveStoreStock' => $this->getLiveStoreStock(),
            'salesToday' => $this->getSalesToday($today),
            'lowStockCount' => $this->getLowStockCount(),
        ];
    }

    /**
     * QUERY 1: Total Manufactured Today
     * 
     * Efficient Aggregation:
     * Sum of initial quantities from batches created today using GROUP functions
     * 
     * @param Carbon $date
     * @return array
     */
    private function getTotalManufacturedToday(Carbon $date): array
    {
        $result = Batch::selectRaw('
            COUNT(*) as batch_count,
            SUM(quantity) as total_quantity
        ')
        ->whereDate('manufacturing_date', $date->toDateString())
        ->first();

        return [
            'count' => $result->batch_count ?? 0,
            'quantity' => $result->total_quantity ?? 0,
        ];
    }

    /**
     * QUERY 2: Live Store Stock (Current Stock Across All Batches)
     * 
     * Efficient Aggregation:
     * Calculate remaining quantity in each batch:
     * remaining = initial_quantity - SUM(stock_out_quantity)
     * Then SUM all remaining quantities
     * 
     * Uses SQL subquery for efficiency (single DB hit)
     * 
     * @return array
     */
    private function getLiveStoreStock(): array
    {
        // Get total quantity in all batches
        $totalBatchQuantity = Batch::sum('quantity');

        // Get total quantity sold from all batches
        $totalSoldQuantity = StockOutTransaction::sum('quantity');

        $currentStock = ($totalBatchQuantity ?? 0) - ($totalSoldQuantity ?? 0);

        return [
            'total_batches' => Batch::count(),
            'total_quantity' => $currentStock,
            'initial_quantity' => $totalBatchQuantity ?? 0,
            'sold_quantity' => $totalSoldQuantity ?? 0,
        ];
    }

    /**
     * QUERY 3: Sales Today (Stock-Out Transactions Count)
     * 
     * Efficient Aggregation:
     * Count rows and SUM quantities from stock_out_transactions 
     * where created_at is TODAY using DATE function
     * 
     * @param Carbon $date
     * @return array
     */
    private function getSalesToday(Carbon $date): array
    {
        $result = StockOutTransaction::selectRaw('
            COUNT(*) as transaction_count,
            SUM(quantity) as total_quantity
        ')
        ->whereDate('created_at', $date->toDateString())
        ->first();

        return [
            'count' => $result->transaction_count ?? 0,
            'quantity' => $result->total_quantity ?? 0,
        ];
    }

    /**
     * QUERY 4: Low Stock Alerts
     * 
     * Efficient Aggregation:
     * Find all products where current_stock < minimum_stock
     * Uses scope defined in Product model
     * 
     * @return int
     */
    private function getLowStockCount(): int
    {
        return Product::lowStock()->count();
    }

    /**
     * QUERY 5: Expiry Alert Logic
     * 
     * Find all batches expiring within next 7 days
     * Sorted by expiry_date ASC (FIFO - soonest first)
     * Only includes batches with quantity > 0 (not sold out)
     * 
     * Uses LEFT JOIN to exclude fully sold-out batches efficiently
     * 
     * @return array
     */
    public function getExpiringBatches(): array
    {
        $today = Carbon::today();
        $expiryThreshold = $today->copy()->addDays(7);

        $batches = Batch::with(['product'])
            ->selectRaw('
                batches.id,
                batches.batch_number,
                batches.product_id,
                batches.quantity as initial_quantity,
                batches.expiry_date,
                batches.manufacturing_date,
                (batches.quantity - COALESCE(SUM(stock_out_transactions.quantity), 0)) as remaining_quantity
            ')
            ->leftJoin('stock_out_transactions', 'batches.id', '=', 'stock_out_transactions.batch_id')
            ->whereDate('batches.expiry_date', '>=', $today->toDateString())
            ->whereDate('batches.expiry_date', '<=', $expiryThreshold->toDateString())
            ->groupBy('batches.id', 'batches.batch_number', 'batches.product_id', 
                      'batches.quantity', 'batches.expiry_date', 'batches.manufacturing_date')
            ->havingRaw('(batches.quantity - COALESCE(SUM(stock_out_transactions.quantity), 0)) > 0')
            ->orderBy('batches.expiry_date', 'asc')
            ->limit(50)
            ->get();

        return $batches->map(function ($batch) {
            $daysUntilExpiry = Carbon::parse($batch->expiry_date)->diffInDays(Carbon::today());
            
            return [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product_id' => $batch->product_id,
                'product_name' => $batch->product->name ?? 'N/A',
                'product_sku' => $batch->product->sku ?? 'N/A',
                'manufacturing_date' => $batch->manufacturing_date->format('M d, Y'),
                'expiry_date' => $batch->expiry_date->format('M d, Y'),
                'days_until_expiry' => $daysUntilExpiry,
                'initial_quantity' => $batch->initial_quantity,
                'remaining_quantity' => $batch->remaining_quantity,
                'urgency' => $daysUntilExpiry <= 3 ? 'critical' : ($daysUntilExpiry <= 5 ? 'warning' : 'normal'),
            ];
        })->toArray();
    }

    /**
     * QUERY 6: Low Stock Products (Products below minimum stock)
     * 
     * Returns products where current_stock < minimum_stock
     * Ordered by how much below minimum (stock deficit)
     * 
     * @return array
     */
    public function getLowStockProducts(): array
    {
        $products = Product::selectRaw('
            id,
            name,
            sku,
            current_stock,
            minimum_stock,
            (minimum_stock - current_stock) as stock_deficit,
            ROUND((current_stock / NULLIF(minimum_stock, 0)) * 100, 2) as stock_percentage
        ')
        ->whereColumn('current_stock', '<=', 'minimum_stock')
        ->orderByRaw('(minimum_stock - current_stock) DESC')
        ->limit(20)
        ->get();

        return $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'current_stock' => $product->current_stock,
                'minimum_stock' => $product->minimum_stock,
                'stock_deficit' => $product->stock_deficit,
                'stock_percentage' => $product->stock_percentage ?? 0,
            ];
        })->toArray();
    }

    /**
     * QUERY 7: Batch Traceability - Get Full History
     * 
     * Input: Batch ID or Batch Number
     * Returns:
     * - Batch details (manufacturing date, quantity)
     * - Current quantity vs Initial quantity (identifies leakage/loss)
     * - Complete list of every stock-out transaction
     * - Transaction user info and timestamps
     * 
     * @param mixed $batchIdentifier (id or batch_number)
     * @return array|null
     */
    public function getBatchTraceability($batchIdentifier)
    {
        // Find batch by ID or batch_number
        $batch = Batch::with(['product', 'manufacturingOrder'])
            ->where('id', $batchIdentifier)
            ->orWhere('batch_number', $batchIdentifier)
            ->first();

        if (!$batch) {
            return null;
        }

        // Get all stock-out transactions for this batch
        $stockOutTransactions = StockOutTransaction::with('user')
            ->where('batch_id', $batch->id)
            ->selectRaw('
                id,
                batch_id,
                user_id,
                quantity,
                reason,
                notes,
                created_at
            ')
            ->orderBy('created_at', 'asc')
            ->get();

        // Calculate current quantity
        $totalSoldQuantity = $stockOutTransactions->sum('quantity');
        $currentQuantity = $batch->quantity - $totalSoldQuantity;

        // Build traceability record
        return [
            'id' => $batch->id,
            'batch_number' => $batch->batch_number,
            'product' => [
                'id' => $batch->product->id,
                'name' => $batch->product->name,
                'sku' => $batch->product->sku,
                'category' => $batch->product->category,
                'unit' => $batch->product->unit,
            ],
            'manufacturing_date' => $batch->manufacturing_date->format('M d, Y'),
            'expiry_date' => $batch->expiry_date?->format('M d, Y'),
            'initial_quantity' => $batch->quantity,
            'total_sold_quantity' => $totalSoldQuantity,
            'current_quantity' => $currentQuantity,
            'quantity_loss' => 0, // Placeholder for loss tracking (theft/damage)
            'labels_printed' => $batch->label_print_count,
            'notes' => $batch->notes,
            'stock_out_transactions' => $stockOutTransactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'sold_quantity' => $transaction->quantity,
                    'reason' => $transaction->reason,
                    'notes' => $transaction->notes,
                    'user_name' => $transaction->user->name ?? 'System',
                    'timestamp' => $transaction->created_at->format('M d, Y h:i A'),
                    'timestamp_iso' => $transaction->created_at->toIso8601String(),
                ];
            })->toArray(),
        ];
    }

    /**
     * API ENDPOINT: Search Batch by ID or Number
     * JSON response for AJAX requests
     */
    public function searchBatch($batchIdentifier)
    {
        $traceability = $this->getBatchTraceability($batchIdentifier);

        if (!$traceability) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $traceability,
        ]);
    }

    /**
     * API ENDPOINT: Get Dashboard Metrics (JSON)
     */
    public function apiMetrics()
    {
        return response()->json([
            'success' => true,
            'data' => $this->getKeyMetrics(),
        ]);
    }

    /**
     * API ENDPOINT: Get Expiring Batches (JSON)
     */
    public function apiExpiringBatches()
    {
        return response()->json([
            'success' => true,
            'data' => $this->getExpiringBatches(),
        ]);
    }

    /**
     * API ENDPOINT: Get Low Stock Alerts (JSON)
     */
    public function apiLowStockAlerts()
    {
        return response()->json([
            'success' => true,
            'data' => $this->getLowStockProducts(),
        ]);
    }

    /**
     * Export Report - Summary of today's analytics
     */
    public function exportReport()
    {
        $today = Carbon::today();
        $metrics = $this->getKeyMetrics();
        $expiringBatches = $this->getExpiringBatches();
        $lowStockAlerts = $this->getLowStockProducts();

        return response()->json([
            'report_date' => $today->format('M d, Y'),
            'metrics' => $metrics,
            'expiring_batches_count' => count($expiringBatches),
            'expiring_batches' => $expiringBatches,
            'low_stock_alerts_count' => count($lowStockAlerts),
            'low_stock_alerts' => $lowStockAlerts,
        ]);
    }

    /**
     * Get Detailed Manufactured Batches for Today
     * API Endpoint for Modal Details
     */
    public function getManufacturedDetails()
    {
        $today = Carbon::today();

        $batches = Batch::with('product')
            ->whereDate('manufacturing_date', $today->toDateString())
            ->select([
                'id',
                'batch_number',
                'product_id',
                'quantity',
                'manufacturing_date',
                'expiry_date',
                'notes',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $batches->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'product_name' => $batch->product->name ?? 'N/A',
                    'sku' => $batch->product->sku ?? 'N/A',
                    'quantity' => $batch->quantity,
                    'manufacturing_date' => $batch->manufacturing_date->format('M d, Y H:i'),
                    'expiry_date' => $batch->expiry_date?->format('M d, Y') ?? 'N/A',
                    'notes' => $batch->notes ?? '',
                ];
            })->toArray(),
        ]);
    }

    /**
     * Get Detailed Store Stock by Batch
     * API Endpoint for Modal Details
     */
    public function getStoreStockDetails()
    {
        $batches = Batch::with('product')
            ->selectRaw('
                batches.id,
                batches.batch_number,
                batches.product_id,
                batches.quantity as initial_quantity,
                batches.manufacturing_date,
                batches.expiry_date,
                (batches.quantity - COALESCE(SUM(stock_out_transactions.quantity), 0)) as current_quantity
            ')
            ->leftJoin('stock_out_transactions', 'batches.id', '=', 'stock_out_transactions.batch_id')
            ->groupBy('batches.id', 'batches.batch_number', 'batches.product_id', 'batches.quantity', 'batches.manufacturing_date', 'batches.expiry_date')
            ->having('current_quantity', '>', 0)
            ->orderBy('batches.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $batches->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'product_name' => $batch->product->name ?? 'N/A',
                    'sku' => $batch->product->sku ?? 'N/A',
                    'initial_quantity' => $batch->initial_quantity,
                    'current_quantity' => $batch->current_quantity,
                    'sold_quantity' => $batch->initial_quantity - $batch->current_quantity,
                    'manufacturing_date' => $batch->manufacturing_date->format('M d, Y'),
                    'expiry_date' => $batch->expiry_date?->format('M d, Y') ?? 'N/A',
                ];
            })->toArray(),
        ]);
    }

    /**
     * Get Detailed Sales Transactions for Today
     * API Endpoint for Modal Details
     */
    public function getSalesDetails()
    {
        $today = Carbon::today();

        $transactions = StockOutTransaction::with(['user', 'batch.product'])
            ->whereDate('created_at', $today->toDateString())
            ->select([
                'id',
                'batch_id',
                'user_id',
                'quantity',
                'reason',
                'notes',
                'created_at',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $transactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'batch_number' => $transaction->batch->batch_number ?? 'N/A',
                    'product_name' => $transaction->batch->product->name ?? 'N/A',
                    'product_sku' => $transaction->batch->product->sku ?? 'N/A',
                    'quantity' => $transaction->quantity,
                    'reason' => $transaction->reason ?? 'Not specified',
                    'notes' => $transaction->notes ?? '',
                    'user_name' => $transaction->user->name ?? 'System',
                    'timestamp' => $transaction->created_at->format('M d, Y H:i A'),
                ];
            })->toArray(),
        ]);
    }
}
