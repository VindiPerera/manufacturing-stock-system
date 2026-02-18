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
                    'stock_before' => $order->stock_before,
                    'stock_after' => $order->stock_after,
                    'manufacturing_date' => $order->manufacturing_date->format('Y-m-d'),
                    'expiry_date' => $order->expiry_date ? $order->expiry_date->format('Y-m-d') : null,
                    'status' => $order->status,
                    'notes' => $order->notes,
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
            'product_id' => 'required|exists:products,id',
            'production_quantity' => 'required|integer|min:1',
            'manufacturing_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:manufacturing_date',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Get the product and calculate stock values
        $product = Product::findOrFail($validated['product_id']);
        $stockBefore = $product->current_stock;

        // Add stock values to validated data
        $validated['stock_before'] = $stockBefore;
        $validated['stock_after'] = $stockBefore + $validated['production_quantity'];

        // Create the manufacturing order
        $manufacturingOrder = ManufacturingOrder::create($validated);

        // Update product stock
        $product->increment('current_stock', $validated['production_quantity']);

        // Automatically create a batch for labeling
        $batch = Batch::createFromManufacturingOrder($manufacturingOrder);

        // Return manufacturing order data for dynamic addition
        $orderData = [
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
            'stock_before' => $manufacturingOrder->stock_before,
            'stock_after' => $manufacturingOrder->stock_after,
            'manufacturing_date' => $manufacturingOrder->manufacturing_date->format('Y-m-d'),
            'expiry_date' => $manufacturingOrder->expiry_date ? $manufacturingOrder->expiry_date->format('Y-m-d') : null,
            'status' => $manufacturingOrder->status,
            'notes' => $manufacturingOrder->notes,
            'created_at' => $manufacturingOrder->created_at,
            'updated_at' => $manufacturingOrder->updated_at,
        ];

        return redirect()->route('manufacturing.index')->with('newOrder', $orderData);
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
                'stock_before' => $manufacturingOrder->stock_before,
                'stock_after' => $manufacturingOrder->stock_after,
                'manufacturing_date' => $manufacturingOrder->manufacturing_date->format('Y-m-d'),
                'expiry_date' => $manufacturingOrder->expiry_date ? $manufacturingOrder->expiry_date->format('Y-m-d') : null,
                'status' => $manufacturingOrder->status,
                'notes' => $manufacturingOrder->notes,
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
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        $manufacturingOrder->update($validated);

        return redirect()->route('manufacturing.index')->with('success', 'Manufacturing order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ManufacturingOrder $manufacturingOrder)
    {
        // Revert stock changes if order is deleted
        if ($manufacturingOrder->status === 'completed') {
            $product = $manufacturingOrder->product;
            $product->decrement('current_stock', $manufacturingOrder->production_quantity);
        }

        $manufacturingOrder->delete();

        return redirect()->route('manufacturing.index')->with('success', 'Manufacturing order deleted successfully.');
    }
}
