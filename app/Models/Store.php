<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $fillable = [
        'name',
        'location',
        'manager_name',
        'contact_number',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationship with StockTransfers
    public function stockTransfers()
    {
        return $this->hasMany(StockTransfer::class, 'to_store_id');
    }
}
