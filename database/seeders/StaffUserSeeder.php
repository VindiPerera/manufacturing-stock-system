<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class StaffUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'operator@stock.com'],
            [
                'name' => 'Staff Operator',
                'password' => Hash::make('operator@'),
                'role' => 'staff',
            ]
        );
    }
}
