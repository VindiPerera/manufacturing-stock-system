<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\App\Models\Product>
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Electronics', 'Clothing', 'Food', 'Beverages', 'Furniture', 'Other'];
        $units = ['pcs', 'box', 'kg', 'ltr', 'meter', 'dozen', 'set', 'piece'];

        return [
            'name' => $this->faker->unique()->word() . ' ' . $this->faker->word(),
            'sku' => 'SKU-' . strtoupper($this->faker->unique()->bothify('??????-######')),
            'category' => $this->faker->randomElement($categories),
            'unit' => $this->faker->randomElement($units),
            'barcode' => $this->faker->unique()->ean13(),
            'description' => $this->faker->paragraph(),
            'minimum_stock' => $this->faker->numberBetween(10, 100),
            'current_stock' => $this->faker->numberBetween(50, 500),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'image' => null,
        ];
    }
}
