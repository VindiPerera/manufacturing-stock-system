<?php

namespace Database\Seeders;

use App\Models\Store;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Store::firstOrCreate(
            ['name' => 'Main Store'],
            ['location' => 'New York']
        );

        Store::firstOrCreate(
            ['name' => 'Downtown Branch'],
            ['location' => 'Downtown']
        );

        Store::firstOrCreate(
            ['name' => 'Warehouse #1'],
            ['location' => 'Industrial Zone']
        );

        Store::firstOrCreate(
            ['name' => 'Retail Shop'],
            ['location' => 'Shopping Mall']
        );

        Store::firstOrCreate(
            ['name' => 'Distribution Center'],
            ['location' => 'Logistics Hub']
        );
    }
}
