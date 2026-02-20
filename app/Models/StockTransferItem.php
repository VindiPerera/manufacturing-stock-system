<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTransferItem extends Model
{
    protected $fillable = [
        'stock_transfer_id',
        'product_id',
        'batch_id',
        'quantity_transferred',
        'store_remaining_quantity',
    ];

    protected $casts = [
        'quantity_transferred' => 'integer',
        'store_remaining_quantity' => 'integer',
    ];

    // Relationship with StockTransfer
    public function stockTransfer()
    {
        return $this->belongsTo(StockTransfer::class);
    }

    // Relationship with Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Relationship with Batch
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}
