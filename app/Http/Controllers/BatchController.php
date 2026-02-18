<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Product;
use App\Models\ManufacturingOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BatchController extends Controller
{
    /**
     * Display a listing of all batches.
     */
    public function index(Request $request)
    {
        $query = Batch::with('product', 'manufacturingOrder')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('batch_number', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('printed') && $request->printed !== '') {
            $query->where('label_printed', $request->printed === 'true');
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('manufacturing_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('manufacturing_date', '<=', $request->date_to);
        }

        $batches = $query->get()->map(function ($batch) {
            return [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product_code' => $batch->product_code,
                'serial_number' => $batch->serial_number,
                'product' => [
                    'id' => $batch->product->id,
                    'name' => $batch->product->name,
                    'sku' => $batch->product->sku,
                ],
                'quantity' => $batch->quantity,
                'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : null,
                'label_printed' => $batch->label_printed,
                'label_print_count' => $batch->label_print_count,
                'notes' => $batch->notes,
                'created_at' => $batch->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Get statistics
        $stats = [
            'total' => Batch::count(),
            'today' => Batch::today()->count(),
            'unprinted' => Batch::unprinted()->count(),
            'expiring_soon' => Batch::expiringSoon(30)->count(),
        ];

        return Inertia::render('Batches/Index', [
            'batches' => $batches,
            'stats' => $stats,
            'filters' => $request->only(['search', 'printed', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified batch for label printing.
     */
    public function show(Batch $batch)
    {
        $batch->load('product', 'manufacturingOrder');

        return Inertia::render('Batches/Show', [
            'batch' => [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product_code' => $batch->product_code,
                'serial_number' => $batch->serial_number,
                'product' => [
                    'id' => $batch->product->id,
                    'name' => $batch->product->name,
                    'sku' => $batch->product->sku,
                    'category' => $batch->product->category,
                    'unit' => $batch->product->unit,
                ],
                'quantity' => $batch->quantity,
                'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : null,
                'label_printed' => $batch->label_printed,
                'label_print_count' => $batch->label_print_count,
                'notes' => $batch->notes,
                'manufacturing_order_id' => $batch->manufacturing_order_id,
            ],
        ]);
    }

    /**
     * Show the printable label view.
     */
    public function printLabel(Batch $batch)
    {
        $batch->load('product');

        return Inertia::render('Batches/PrintLabel', [
            'batch' => [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product' => [
                    'name' => $batch->product->name,
                    'sku' => $batch->product->sku,
                    'category' => $batch->product->category,
                ],
                'quantity' => $batch->quantity,
                'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : null,
            ],
        ]);
    }

    /**
     * Print multiple labels at once.
     */
    public function printMultiple(Request $request)
    {
        $validated = $request->validate([
            'batch_ids' => 'required|array|min:1',
            'batch_ids.*' => 'exists:batches,id',
        ]);

        $batches = Batch::with('product')
            ->whereIn('id', $validated['batch_ids'])
            ->get()
            ->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'product' => [
                        'name' => $batch->product->name,
                        'sku' => $batch->product->sku,
                    ],
                    'quantity' => $batch->quantity,
                    'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                    'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : null,
                ];
            });

        return Inertia::render('Batches/PrintMultiple', [
            'batches' => $batches,
        ]);
    }

    /**
     * Mark a batch label as printed.
     */
    public function markPrinted(Batch $batch)
    {
        $batch->markLabelPrinted();

        return redirect()->back()->with('success', 'Label marked as printed.');
    }

    /**
     * Mark multiple batch labels as printed.
     */
    public function markMultiplePrinted(Request $request)
    {
        $validated = $request->validate([
            'batch_ids' => 'required|array|min:1',
            'batch_ids.*' => 'exists:batches,id',
        ]);

        Batch::whereIn('id', $validated['batch_ids'])->each(function ($batch) {
            $batch->markLabelPrinted();
        });

        return redirect()->back()->with('success', 'Labels marked as printed.');
    }

    /**
     * Store a manually created batch.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'manufacturing_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:manufacturing_date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $manufacturingDate = Carbon::parse($validated['manufacturing_date']);

        // Generate batch number
        $batchData = Batch::generateBatchNumber($product, $manufacturingDate);

        $batch = Batch::create([
            'manufacturing_order_id' => null, // Manual batch without manufacturing order
            'product_id' => $validated['product_id'],
            'batch_number' => $batchData['batch_number'],
            'product_code' => $batchData['product_code'],
            'serial_number' => $batchData['serial_number'],
            'quantity' => $validated['quantity'],
            'manufacturing_date' => $manufacturingDate,
            'expiry_date' => $validated['expiry_date'] ? Carbon::parse($validated['expiry_date']) : null,
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('batches.index')->with('success', 'Batch created successfully.');
    }

    /**
     * Generate batch preview (for testing batch number generation).
     */
    public function preview(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'manufacturing_date' => 'required|date',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $manufacturingDate = Carbon::parse($validated['manufacturing_date']);

        $batchData = Batch::generateBatchNumber($product, $manufacturingDate);

        return response()->json([
            'preview_batch_number' => $batchData['batch_number'],
            'product_code' => $batchData['product_code'],
            'serial_number' => $batchData['serial_number'],
        ]);
    }

    /**
     * Get batch history for a product.
     */
    public function productHistory(Product $product)
    {
        $batches = Batch::where('product_id', $product->id)
            ->with('manufacturingOrder')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'quantity' => $batch->quantity,
                    'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                    'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : null,
                    'label_printed' => $batch->label_printed,
                    'label_print_count' => $batch->label_print_count,
                ];
            });

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
            ],
            'batches' => $batches,
        ]);
    }

    /**
     * Search batches by batch number (for barcode scanning).
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:1',
        ]);

        $batch = Batch::with('product')
            ->where('batch_number', $validated['query'])
            ->first();

        if (!$batch) {
            return response()->json([
                'found' => false,
                'message' => 'Batch not found',
            ], 404);
        }

        return response()->json([
            'found' => true,
            'batch' => [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product' => [
                    'id' => $batch->product->id,
                    'name' => $batch->product->name,
                    'sku' => $batch->product->sku,
                    'current_stock' => $batch->product->current_stock,
                ],
                'quantity' => $batch->quantity,
                'manufacturing_date' => $batch->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $batch->expiry_date ? $batch->expiry_date->format('Y-m-d') : null,
            ],
        ]);
    }

    /**
     * Delete a batch.
     */
    public function destroy(Batch $batch)
    {
        $batch->delete();

        return redirect()->route('batches.index')->with('success', 'Batch deleted successfully.');
    }
}
