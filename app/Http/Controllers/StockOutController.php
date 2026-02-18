<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\StockOutTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class StockOutController extends Controller
{
    /**
     * Display the scanner interface.
     */
    public function index(Request $request)
    {
        // Get recent transactions for the sidebar/history
        $recentTransactions = StockOutTransaction::with(['batch.product', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'batch_number' => $transaction->batch->batch_number,
                    'product_name' => $transaction->batch->product->name,
                    'quantity' => $transaction->quantity,
                    'user_name' => $transaction->user ? $transaction->user->name : 'System',
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'time_ago' => $transaction->created_at->diffForHumans(),
                ];
            });

        // Get today's statistics
        $todayStats = [
            'total_scans' => StockOutTransaction::today()->count(),
            'total_quantity' => StockOutTransaction::today()->sum('quantity'),
            'unique_batches' => StockOutTransaction::today()->distinct('batch_id')->count('batch_id'),
        ];

        return Inertia::render('StockOut/Scanner', [
            'recentTransactions' => $recentTransactions,
            'todayStats' => $todayStats,
        ]);
    }

    /**
     * Process a scanned batch ID and deduct stock.
     * This is the main API endpoint for the scan-to-deduct feature.
     */
    public function scan(Request $request)
    {
        $validated = $request->validate([
            'batch_id' => 'required|string|max:100',
            'quantity' => 'nullable|integer|min:1|max:1000',
        ]);

        $batchNumber = trim($validated['batch_id']);
        $quantityToDeduct = $validated['quantity'] ?? 1;

        // Find the batch by batch_number
        $batch = Batch::with('product')->where('batch_number', $batchNumber)->first();

        // Validation: Check if batch exists
        if (!$batch) {
            return response()->json([
                'success' => false,
                'error' => 'batch_not_found',
                'message' => 'Batch not found: ' . $batchNumber,
            ], 404);
        }

        // Validation: Check if stock is available
        if ($batch->quantity <= 0) {
            return response()->json([
                'success' => false,
                'error' => 'out_of_stock',
                'message' => 'This batch is out of stock!',
                'batch' => [
                    'batch_number' => $batch->batch_number,
                    'product_name' => $batch->product->name,
                    'current_quantity' => $batch->quantity,
                ],
            ], 400);
        }

        // Validation: Check if enough stock for the requested quantity
        if ($batch->quantity < $quantityToDeduct) {
            return response()->json([
                'success' => false,
                'error' => 'insufficient_stock',
                'message' => "Insufficient stock! Only {$batch->quantity} remaining.",
                'batch' => [
                    'batch_number' => $batch->batch_number,
                    'product_name' => $batch->product->name,
                    'current_quantity' => $batch->quantity,
                    'requested_quantity' => $quantityToDeduct,
                ],
            ], 400);
        }

        // Check for expiry (warning only, not blocking)
        $expiryWarning = null;
        if ($batch->expiry_date && $batch->expiry_date->isPast()) {
            $expiryWarning = 'Warning: This batch has expired on ' . $batch->expiry_date->format('Y-m-d');
        } elseif ($batch->expiry_date && $batch->expiry_date->diffInDays(now()) <= 7) {
            $expiryWarning = 'Warning: This batch expires soon on ' . $batch->expiry_date->format('Y-m-d');
        }

        // Use database transaction to ensure data integrity
        try {
            DB::transaction(function () use ($batch, $quantityToDeduct, $request) {
                // Decrement the batch quantity
                $batch->decrement('quantity', $quantityToDeduct);

                // Also decrement the product's total current stock
                $batch->product->decrement('current_stock', $quantityToDeduct);

                // Log the transaction
                StockOutTransaction::create([
                    'batch_id' => $batch->id,
                    'user_id' => $request->user()?->id,
                    'quantity' => $quantityToDeduct,
                    'reason' => 'scan_checkout',
                ]);
            });

            // Refresh batch to get updated quantity
            $batch->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully!',
                'warning' => $expiryWarning,
                'batch' => [
                    'id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'product_name' => $batch->product->name,
                    'product_sku' => $batch->product->sku,
                    'previous_quantity' => $batch->quantity + $quantityToDeduct,
                    'current_quantity' => $batch->quantity,
                    'deducted' => $quantityToDeduct,
                    'expiry_date' => $batch->expiry_date?->format('Y-m-d'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'transaction_failed',
                'message' => 'Failed to process transaction. Please try again.',
            ], 500);
        }
    }

    /**
     * Get transaction history with filtering.
     */
    public function history(Request $request)
    {
        $query = StockOutTransaction::with(['batch.product', 'user'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('batch_number') && $request->batch_number) {
            $query->whereHas('batch', function ($q) use ($request) {
                $q->where('batch_number', 'like', '%' . $request->batch_number . '%');
            });
        }

        $transactions = $query->paginate(50)->through(function ($transaction) {
            return [
                'id' => $transaction->id,
                'batch_number' => $transaction->batch->batch_number,
                'product_name' => $transaction->batch->product->name,
                'product_sku' => $transaction->batch->product->sku,
                'quantity' => $transaction->quantity,
                'reason' => $transaction->reason,
                'user_name' => $transaction->user ? $transaction->user->name : 'System',
                'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Get summary stats
        $stats = [
            'total_transactions' => StockOutTransaction::count(),
            'today_transactions' => StockOutTransaction::today()->count(),
            'today_quantity' => StockOutTransaction::today()->sum('quantity'),
        ];

        return Inertia::render('StockOut/History', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['date_from', 'date_to', 'batch_number']),
        ]);
    }

    /**
     * Clear all stock out transaction history.
     */
    public function clearHistory(Request $request)
    {
        try {
            $deletedCount = StockOutTransaction::count();
            StockOutTransaction::truncate();

            return redirect()->route('stock-out.history')
                ->with('success', "Successfully cleared {$deletedCount} transaction(s) from history.");
        } catch (\Exception $e) {
            return redirect()->route('stock-out.history')
                ->with('error', 'Failed to clear history. Please try again.');
        }
    }

    /**
     * Get batch info for display (AJAX endpoint).
     */
    public function getBatchInfo(Request $request)
    {
        $validated = $request->validate([
            'batch_number' => 'required|string|max:100',
        ]);

        $batch = Batch::with('product')
            ->where('batch_number', trim($validated['batch_number']))
            ->first();

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'batch' => [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product_name' => $batch->product->name,
                'product_sku' => $batch->product->sku,
                'current_quantity' => $batch->quantity,
                'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $batch->expiry_date?->format('Y-m-d'),
                'is_expired' => $batch->expiry_date && $batch->expiry_date->isPast(),
                'days_until_expiry' => $batch->expiry_date ? $batch->expiry_date->diffInDays(now(), false) : null,
            ],
        ]);
    }
}
