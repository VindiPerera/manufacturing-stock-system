<?php

namespace App\Http\Controllers;

use App\Models\ManufacturingOrder;
use App\Models\Product;
use App\Models\Batch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ManufacturingOrderController extends Controller
{
    /**
     * Get next batch number (optionally product-specific using SKU prefix)
     */
    public function getNextBatchNumber(Request $request)
    {
        $productId = $request->query('product_id');

        if ($productId) {
            $product = Product::find($productId);
            if ($product) {
                $batchData = Batch::generateBatchNumber($product);
                return response()->json(['batch_number' => $batchData['batch_number']]);
            }
        }

        // Fallback: no product known yet — just acknowledge SKU-based generation
        return response()->json(['batch_number' => null]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $manufacturingOrders = ManufacturingOrder::with('product')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'batch_number' => $order->batch_number,
                    'product' => [
                        'id' => $order->product->id,
                        'name' => $order->product->name,
                        'sku' => $order->product->sku,
                    ],
                    'production_quantity' => $order->production_quantity,
                    'manufacturing_date' => $order->manufacturing_date->format('Y-m-d'),
                    'expiry_date' => $order->expiry_date ? $order->expiry_date->format('Y-m-d') : null,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                ];
            });

        $products = Product::select('id', 'name', 'sku', 'category', 'current_stock')->get();

        return Inertia::render('Manufacturing/Index', [
            'manufacturingOrders' => $manufacturingOrders,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.production_quantity' => 'required|integer|min:1',
            'products.*.manufacturing_date' => 'required|date',
            'products.*.expiry_date' => 'nullable|date',
        ]);

        $createdOrders = [];

        // Loop through each product and create manufacturing orders
        foreach ($validated['products'] as $productData) {
            // Use database transaction to ensure batch number uniqueness
            $orderData = DB::transaction(function () use ($productData) {
                // Get the product
                $product = Product::findOrFail($productData['product_id']);

                // Generate a unique SKU-based batch number for this product
                $manufacturingDate = Carbon::parse($productData['manufacturing_date']);
                $batchData = Batch::generateBatchNumber($product, $manufacturingDate);

                // Create the manufacturing order
                $manufacturingOrder = ManufacturingOrder::create([
                    'batch_number' => $batchData['batch_number'],
                    'product_id' => $productData['product_id'],
                    'production_quantity' => $productData['production_quantity'],
                    'manufacturing_date' => $productData['manufacturing_date'],
                    'expiry_date' => $productData['expiry_date'] ?? null,
                ]);

                // Update product stock
                $product->increment('current_stock', $productData['production_quantity']);

                // Automatically create a batch for labeling
                $batch = Batch::createFromManufacturingOrder($manufacturingOrder);

                return [
                    'order' => $manufacturingOrder,
                    'batch' => $batch,
                ];
            });

            $manufacturingOrder = $orderData['order'];
            $batch = $orderData['batch'];

            $createdOrders[] = [
                'id' => $manufacturingOrder->id,
                'batch_number' => $manufacturingOrder->batch_number,
                'batch' => [
                    'id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                ],
                'product' => [
                    'id' => $manufacturingOrder->product->id,
                    'name' => $manufacturingOrder->product->name,
                    'sku' => $manufacturingOrder->product->sku,
                ],
                'production_quantity' => $manufacturingOrder->production_quantity,
                'manufacturing_date' => $manufacturingOrder->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $manufacturingOrder->expiry_date ? $manufacturingOrder->expiry_date->format('Y-m-d') : null,
                'created_at' => $manufacturingOrder->created_at,
                'updated_at' => $manufacturingOrder->updated_at,
            ];
        }

        return back()
            ->with('success', 'Manufacturing orders created successfully')
            ->with('newOrders', $createdOrders);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $manufacturingOrder = ManufacturingOrder::with('product')->findOrFail($id);
        
        if (!$manufacturingOrder->product) {
            return redirect()->route('manufacturing.index')->with('error', 'Product not found for this order.');
        }
        
        return Inertia::render('Manufacturing/Show', [
            'manufacturingOrder' => [
                'id' => $manufacturingOrder->id,
                'batch_number' => $manufacturingOrder->batch_number,
                'product' => [
                    'id' => $manufacturingOrder->product->id,
                    'name' => $manufacturingOrder->product->name,
                    'sku' => $manufacturingOrder->product->sku,
                ],
                'production_quantity' => $manufacturingOrder->production_quantity,
                'manufacturing_date' => $manufacturingOrder->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $manufacturingOrder->expiry_date ? $manufacturingOrder->expiry_date->format('Y-m-d') : null,
                'created_at' => $manufacturingOrder->created_at,
                'updated_at' => $manufacturingOrder->updated_at,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ManufacturingOrder $manufacturingOrder)
    {
        $manufacturingOrder->load('product');
        
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'production_quantity' => 'required|integer|min:1',
            'manufacturing_date' => 'required|date',
            'expiry_date' => 'nullable|date',
        ]);

        try {
            $oldQuantity = $manufacturingOrder->production_quantity;
            $newQuantity = $validated['production_quantity'];
            $quantityDifference = $newQuantity - $oldQuantity;

            // Update the manufacturing order
            $manufacturingOrder->update($validated);

            // Update product stock based on quantity difference
            if ($quantityDifference !== 0) {
                $product = Product::find($manufacturingOrder->product_id);
                if ($product) {
                    if ($quantityDifference > 0) {
                        $product->increment('current_stock', $quantityDifference);
                    } else {
                        $product->decrement('current_stock', abs($quantityDifference));
                    }
                }
            }

            // Update related batch
            $batch = Batch::where('manufacturing_order_id', $manufacturingOrder->id)->first();
            if ($batch) {
                $batch->update([
                    'quantity' => $newQuantity,
                    'manufacturing_date' => $validated['manufacturing_date'],
                    'expiry_date' => $validated['expiry_date'],
                ]);
            }

            return redirect()->route('manufacturing.index')->with('success', 'Manufacturing order updated successfully.');
        } catch (\Exception $e) {
            return redirect()->route('manufacturing.index')->with('error', 'Error updating manufacturing order: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ManufacturingOrder $manufacturingOrder)
    {
        try {
            // Revert stock changes when deleting
            $product = Product::find($manufacturingOrder->product_id);
            if ($product) {
                $product->decrement('current_stock', $manufacturingOrder->production_quantity);
            }

            // Delete related batch's stock transfer items first
            $batches = Batch::where('manufacturing_order_id', $manufacturingOrder->id)->get();
            foreach ($batches as $batch) {
                $batch->stockTransferItems()->delete();
                $batch->delete();
            }

            $manufacturingOrder->delete();
            
            return redirect()->route('manufacturing.index')->with('success', 'Manufacturing order deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('manufacturing.index')->with('error', 'Error deleting manufacturing order: ' . $e->getMessage());
        }
    }
}
