<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ManufacturingOrder;
use App\Models\Product;
use Carbon\Carbon;

class ManufacturingOrderSeeder extends Seeder
{
    public function run()
    {
        $products = Product::inRandomOrder()->limit(6)->get();
        
        if ($products->count() === 0) {
            $this->command->warn('No products found. Please run the ProductSeeder first.');
            return;
        }

        $sampleOrders = [
            [
                'product_id' => $products[0]->id ?? 1,
                'batch_number' => 'BATCH-20260217-001', 
                'production_quantity' => 500,
                'manufacturing_date' => Carbon::today(),
                'expiry_date' => Carbon::today()->addDays(180),
                'status' => 'completed',
                'notes' => 'Regular production batch - high quality control standards applied.',
            ],
            [
                'product_id' => $products[1]->id ?? 2,
                'batch_number' => 'BATCH-20260217-002',
                'production_quantity' => 300,
                'manufacturing_date' => Carbon::today()->subDays(1),
                'expiry_date' => Carbon::today()->addDays(120),
                'status' => 'completed',
                'notes' => 'Premium quality batch for export markets.',
            ],
            [
                'product_id' => $products[2]->id ?? 3,
                'batch_number' => 'BATCH-20260217-003',
                'production_quantity' => 750,
                'manufacturing_date' => Carbon::today(),
                'expiry_date' => null, // No expiry
                'status' => 'in_progress',
                'notes' => 'Large batch for seasonal demand - currently in production.',
            ],
            [
                'product_id' => $products[3]->id ?? 4,
                'batch_number' => 'BATCH-20260216-004',
                'production_quantity' => 200,
                'manufacturing_date' => Carbon::today()->subDays(2),
                'expiry_date' => Carbon::today()->addDays(90),
                'status' => 'pending',
                'notes' => 'Special order batch - awaiting quality inspection.',
            ],
            [
                'product_id' => $products[4]->id ?? 1,
                'batch_number' => 'BATCH-20260216-005',
                'production_quantity' => 1000,
                'manufacturing_date' => Carbon::today()->subDays(3),
                'expiry_date' => Carbon::today()->addDays(365),
                'status' => 'completed',
                'notes' => 'Bulk production batch - distributed to multiple warehouses.',
            ],
            [
                'product_id' => $products[5]->id ?? 2,
                'batch_number' => 'BATCH-20260215-006',
                'production_quantity' => 150,
                'manufacturing_date' => Carbon::today()->subDays(4),
                'expiry_date' => Carbon::today()->addDays(60),
                'status' => 'cancelled',
                'notes' => 'Order cancelled due to material shortage.',
            ],
        ];

        foreach ($sampleOrders as $orderData) {
            $product = Product::find($orderData['product_id']);
            if (!$product) continue;

            // Store current stock before creating order
            $stockBefore = $product->current_stock;
            
            $order = ManufacturingOrder::create([
                'product_id' => $orderData['product_id'],
                'batch_number' => $orderData['batch_number'],
                'production_quantity' => $orderData['production_quantity'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockBefore + ($orderData['status'] === 'completed' ? $orderData['production_quantity'] : 0),
                'manufacturing_date' => $orderData['manufacturing_date'],
                'expiry_date' => $orderData['expiry_date'],
                'status' => $orderData['status'],
                'notes' => $orderData['notes'],
                'created_at' => $orderData['manufacturing_date'],
                'updated_at' => $orderData['manufacturing_date'],
            ]);

            // Manually update stock for completed orders (bypassing the model events)
            if ($orderData['status'] === 'completed') {
                $product->update([
                    'current_stock' => $product->current_stock + $orderData['production_quantity']
                ]);
            }
        }

        $this->command->info('Manufacturing orders seeded successfully!');
    }
}
