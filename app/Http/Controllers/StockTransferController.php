<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Store;
use App\Models\Batch;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockTransferController extends Controller
{
    /**
     * Display batches available for transfer grouped by batch_number
     */
    public function index()
    {
        // Get all batches with available quantity, grouped by batch_number
        $batches = Batch::with(['product'])
            ->selectRaw('batch_number, 
                         MIN(id) as id,
                         SUM(quantity) as total_quantity,
                         SUM(transferred_quantity) as total_transferred,
                         MIN(manufacturing_date) as manufacturing_date,
                         MAX(expiry_date) as expiry_date,
                         MIN(created_at) as created_at')
            ->groupBy('batch_number')
            ->havingRaw('SUM(quantity) > SUM(transferred_quantity)')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($batch) {
                $batchItems = Batch::where('batch_number', $batch->batch_number)
                    ->with('product')
                    ->get();
                
                return [
                    'batch_number' => $batch->batch_number,
                    'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                    'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : null,
                    'total_quantity' => $batch->total_quantity,
                    'total_transferred' => $batch->total_transferred,
                    'available_quantity' => $batch->total_quantity - $batch->total_transferred,
                    'products' => $batchItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'batch_id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->name,
                            'product_sku' => $item->product->sku,
                            'quantity' => $item->quantity,
                            'transferred_quantity' => $item->transferred_quantity,
                            'available_quantity' => $item->quantity - $item->transferred_quantity,
                        ];
                    })->filter(function ($item) {
                        return $item['available_quantity'] > 0;
                    })->values()->toArray(),
                ];
            })->filter(function ($batch) {
                return count($batch['products']) > 0;
            })->values();

        $stores = Store::where('is_active', true)->get();

        return Inertia::render('StockTransfer/Index', [
            'batches' => $batches,
            'stores' => $stores,
        ]);
    }

    /**
     * Store a new stock transfer
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_number' => 'required|string',
            'to_store_id' => 'required|exists:stores,id',
            'transfer_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.batch_id' => 'required|exists:batches,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_transferred' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            // Create the stock transfer
            $transfer = StockTransfer::create([
                'batch_number' => $validated['batch_number'],
                'to_store_id' => $validated['to_store_id'],
                'transferred_by' => Auth::id(),
                'transfer_date' => $validated['transfer_date'],
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create transfer items and update batch quantities
            foreach ($validated['items'] as $item) {
                $batch = Batch::findOrFail($item['batch_id']);
                
                // Check if enough quantity is available
                $available = $batch->quantity - $batch->transferred_quantity;
                if ($item['quantity_transferred'] > $available) {
                    throw new \Exception("Insufficient quantity for batch. Available: {$available}");
                }

                // Create transfer item
                StockTransferItem::create([
                    'stock_transfer_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'batch_id' => $item['batch_id'],
                    'quantity_transferred' => $item['quantity_transferred'],
                    'store_remaining_quantity' => $item['quantity_transferred'], // Initially, all transferred quantity remains in store
                ]);

                // Update batch transferred quantity
                $batch->increment('transferred_quantity', $item['quantity_transferred']);

                // Update product stock in the main inventory
                $product = Product::findOrFail($item['product_id']);
                $product->decrement('current_stock', $item['quantity_transferred']);
            }

            DB::commit();

            return redirect()->route('stock-transfers.history')
                ->with('success', 'Stock transfer completed successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display transfer history
     */
    public function history()
    {
        $transfers = StockTransfer::with(['store', 'transferredByUser', 'items.product', 'items.batch'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transfer) {
                return [
                    'id' => $transfer->id,
                    'transfer_number' => $transfer->transfer_number,
                    'batch_number' => $transfer->batch_number,
                    'store' => [
                        'id' => $transfer->store->id,
                        'name' => $transfer->store->name,
                        'location' => $transfer->store->location,
                    ],
                    'transferred_by' => $transfer->transferredByUser->name,
                    'transfer_date' => $transfer->transfer_date->format('Y-m-d'),
                    'status' => $transfer->status,
                    'total_items' => $transfer->items->sum('quantity_transferred'),
                    'items' => $transfer->items->map(function ($item) {
                        return [
                            'product_name' => $item->product->name,
                            'product_sku' => $item->product->sku,
                            'quantity' => $item->quantity_transferred,
                            'batch_number' => $item->batch->batch_number,
                        ];
                    }),
                    'notes' => $transfer->notes,
                    'created_at' => $transfer->created_at,
                ];
            });

        return Inertia::render('StockTransfer/History', [
            'transfers' => $transfers,
        ]);
    }

    /**
     * Display store management page
     */
    public function stores()
    {
        $stores = Store::withCount('stockTransfers')->get();

        return Inertia::render('StockTransfer/Stores', [
            'stores' => $stores,
        ]);
    }

    /**
     * Store a new store
     */
    public function storeStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'manager_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        Store::create($validated);

        return redirect()->route('stock-transfers.stores')
            ->with('success', 'Store created successfully');
    }
}

