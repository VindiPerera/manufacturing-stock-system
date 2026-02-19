<?php

namespace App\Http\Controllers;

use App\Models\ManufacturingOrder;
use App\Models\Product;
use App\Models\Batch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManufacturingOrderController extends Controller
{
    /**
     * Get next batch number
     */
    public function getNextBatchNumber()
    {
        return response()->json([
            'batch_number' => ManufacturingOrder::generateBatchNumber()
        ]);
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

        $products = Product::select('id', 'name', 'sku', 'current_stock')->get();

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
            'batch_number' => 'required|string',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.production_quantity' => 'required|integer|min:1',
            'products.*.manufacturing_date' => 'required|date',
            'products.*.expiry_date' => 'nullable|date',
        ]);

        $createdOrders = [];

        // Loop through each product and create manufacturing orders
        foreach ($validated['products'] as $productData) {
            // Get the product
            $product = Product::findOrFail($productData['product_id']);

            // Create the manufacturing order
            $manufacturingOrder = ManufacturingOrder::create([
                'batch_number' => $validated['batch_number'],
                'product_id' => $productData['product_id'],
                'production_quantity' => $productData['production_quantity'],
                'manufacturing_date' => $productData['manufacturing_date'],
                'expiry_date' => $productData['expiry_date'] ?? null,
            ]);

            // Update product stock
            $product->increment('current_stock', $productData['production_quantity']);

            // Automatically create a batch for labeling
            $batch = Batch::createFromManufacturingOrder($manufacturingOrder);

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

        return redirect()->route('manufacturing.index')->with('newOrders', $createdOrders);
    }

    /**
     * Display the specified resource.
     */
    public function show(ManufacturingOrder $manufacturingOrder)
    {
        $manufacturingOrder->load('product');
        
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
        // Manufacturing orders are immutable after creation
        // If updates are needed in the future, add specific fields here
        return redirect()->route('manufacturing.index')->with('error', 'Manufacturing orders cannot be modified.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ManufacturingOrder $manufacturingOrder)
    {
        // Revert stock changes when deleting
        $product = $manufacturingOrder->product;
        $product->decrement('current_stock', $manufacturingOrder->production_quantity);

        $manufacturingOrder->delete();

        return redirect()->route('manufacturing.index')->with('success', 'Manufacturing order deleted successfully.');
    }
}
