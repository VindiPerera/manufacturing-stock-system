<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index()
    {
        $products = Product::all()->map(function ($product) {
            // Handle image path properly
            $imageUrl = null;
            if ($product->image) {
                // If image path already starts with /storage/, use it as is
                if (str_starts_with($product->image, '/storage/')) {
                    $imageUrl = $product->image;
                } else {
                    // Otherwise, use Storage::url() to add /storage/ prefix
                    $imageUrl = Storage::url($product->image);
                }
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
                'unit' => $product->unit,
                'barcode' => $product->barcode,
                'description' => $product->description,
                'minimum_stock' => $product->minimum_stock,
                'stock' => $product->current_stock,
                'price' => $product->price,
                'image' => $imageUrl,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        $categories = Category::all();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        return Inertia::render('Products/Create');
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:products',
            'sku' => 'required|string|max:255|unique:products',
            'category' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:255|unique:products',
            'description' => 'nullable|string',
            'minimum_stock' => 'nullable|integer|min:0',
            'current_stock' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath; // Store without /storage/ prefix
        }

        $product = Product::create($validated);

        // Return product data for dynamic addition
        $imageUrl = null;
        if ($product->image) {
            $imageUrl = Storage::url($product->image);
        }

        $productData = [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'category' => $product->category,
            'unit' => $product->unit,
            'barcode' => $product->barcode,
            'description' => $product->description,
            'minimum_stock' => $product->minimum_stock,
            'stock' => $product->current_stock,
            'price' => $product->price,
            'image' => $imageUrl,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];

        // Check if it's an AJAX request and return JSON
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => $productData
            ], 201);
        }

        return redirect()->route('products.index')->with('newProduct', $productData);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        // Handle image path properly
        $imageUrl = null;
        if ($product->image) {
            if (str_starts_with($product->image, '/storage/')) {
                $imageUrl = $product->image;
            } else {
                $imageUrl = Storage::url($product->image);
            }
        }

        return Inertia::render('Products/Show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
                'unit' => $product->unit,
                'barcode' => $product->barcode,
                'description' => $product->description,
                'minimum_stock' => $product->minimum_stock,
                'stock' => $product->current_stock,
                'price' => $product->price,
                'image' => $imageUrl,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product)
    {
        // Handle image path properly
        $imageUrl = null;
        if ($product->image) {
            if (str_starts_with($product->image, '/storage/')) {
                $imageUrl = $product->image;
            } else {
                $imageUrl = Storage::url($product->image);
            }
        }

        return Inertia::render('Products/Edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
                'unit' => $product->unit,
                'barcode' => $product->barcode,
                'description' => $product->description,
                'minimum_stock' => $product->minimum_stock,
                'stock' => $product->current_stock,
                'price' => $product->price,
                'image' => $imageUrl,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ],
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:products,name,' . $product->id,
            'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
            'category' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:255|unique:products,barcode,' . $product->id,
            'description' => 'nullable|string',
            'minimum_stock' => 'nullable|integer|min:0',
            'current_stock' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath; // Store without /storage/ prefix
        }

        $product->update($validated);

        // Return product data for dynamic update
        $imageUrl = null;
        if ($product->image) {
            if (str_starts_with($product->image, '/storage/')) {
                $imageUrl = $product->image;
            } else {
                $imageUrl = Storage::url($product->image);
            }
        }

        $productData = [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'category' => $product->category,
            'unit' => $product->unit,
            'barcode' => $product->barcode,
            'description' => $product->description,
            'minimum_stock' => $product->minimum_stock,
            'stock' => $product->current_stock,
            'price' => $product->price,
            'image' => $imageUrl,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];

        // Check if it's an AJAX request and return JSON
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'product' => $productData
            ], 200);
        }

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        // Delete image if exists
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    /**
     * Get low stock products
     */
    public function lowStock()
    {
        $products = Product::lowStock()->get()->map(function ($product) {
            // Handle image path properly
            $imageUrl = null;
            if ($product->image) {
                if (str_starts_with($product->image, '/storage/')) {
                    $imageUrl = $product->image;
                } else {
                    $imageUrl = Storage::url($product->image);
                }
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
                'unit' => $product->unit,
                'barcode' => $product->barcode,
                'description' => $product->description,
                'minimum_stock' => $product->minimum_stock,
                'stock' => $product->current_stock,
                'price' => $product->price,
                'image' => $imageUrl,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        return Inertia::render('Products/LowStock', [
            'products' => $products,
            'totalLowStock' => count($products),
        ]);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = Product::getCategories();

        return response()->json($categories);
    }

    /**
     * Bulk delete products
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:products,id',
        ]);

        Product::whereIn('id', $validated['ids'])->delete();

        return redirect()->route('products.index')->with('success', 'Products deleted successfully.');
    }
}
