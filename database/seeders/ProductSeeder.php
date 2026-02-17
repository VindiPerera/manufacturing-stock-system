<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample products using firstOrCreate to avoid duplicates
        Product::firstOrCreate(
            ['sku' => 'SKU-COFFEE-001'],
            [
                'name' => 'Premium Coffee Beans',
                'category' => 'Beverages',
                'unit' => 'kg',
                'barcode' => '1234567890123',
                'description' => 'High-quality arabica coffee beans sourced from premium estates',
                'minimum_stock' => 50,
                'current_stock' => 250,
                'price' => 15.99,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-TEA-001'],
            [
                'name' => 'Organic Tea Leaves',
                'category' => 'Beverages',
                'unit' => 'kg',
                'barcode' => '1234567890124',
                'description' => 'Premium organic green and black tea blend',
                'minimum_stock' => 30,
                'current_stock' => 180,
                'price' => 12.50,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-CHOC-001'],
            [
                'name' => 'Chocolate Bars',
                'category' => 'Food',
                'unit' => 'box',
                'barcode' => '1234567890125',
                'description' => 'Delicious dark chocolate bars made with premium cocoa',
                'minimum_stock' => 100,
                'current_stock' => 450,
                'price' => 8.99,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-ALMOND-001'],
            [
                'name' => 'Almond Cookies',
                'category' => 'Food',
                'unit' => 'box',
                'barcode' => '1234567890126',
                'description' => 'Crispy almond cookies with a touch of sweetness',
                'minimum_stock' => 100,
                'current_stock' => 45,
                'price' => 6.50,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-PROTEIN-001'],
            [
                'name' => 'Protein Powder',
                'category' => 'Food',
                'unit' => 'kg',
                'barcode' => '1234567890127',
                'description' => 'High-protein powder for fitness enthusiasts',
                'minimum_stock' => 150,
                'current_stock' => 78,
                'price' => 45.99,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-ENERGY-001'],
            [
                'name' => 'Energy Drinks',
                'category' => 'Beverages',
                'unit' => 'box',
                'barcode' => '1234567890128',
                'description' => 'Refreshing energy drinks with natural ingredients',
                'minimum_stock' => 200,
                'current_stock' => 125,
                'price' => 3.99,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-MILK-001'],
            [
                'name' => 'Fresh Milk',
                'category' => 'Beverages',
                'unit' => 'ltr',
                'barcode' => '1234567890129',
                'description' => 'Fresh pasteurized milk from local farms',
                'minimum_stock' => 200,
                'current_stock' => 180,
                'price' => 2.99,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-YOGURT-001'],
            [
                'name' => 'Yogurt Cups',
                'category' => 'Beverages',
                'unit' => 'box',
                'barcode' => '1234567890130',
                'description' => 'Creamy yogurt cups available in multiple flavors',
                'minimum_stock' => 150,
                'current_stock' => 240,
                'price' => 4.50,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-CHEESE-001'],
            [
                'name' => 'Cheese Slices',
                'category' => 'Food',
                'unit' => 'box',
                'barcode' => '1234567890131',
                'description' => 'Mild cheddar cheese slices perfect for sandwiches',
                'minimum_stock' => 100,
                'current_stock' => 95,
                'price' => 7.99,
            ]
        );

        Product::firstOrCreate(
            ['sku' => 'SKU-BREAD-001'],
            [
                'name' => 'Bread Loaves',
                'category' => 'Food',
                'unit' => 'pcs',
                'barcode' => '1234567890132',
                'description' => 'Freshly baked whole wheat bread loaves',
                'minimum_stock' => 50,
                'current_stock' => 320,
                'price' => 3.50,
            ]
        );
    }
}
