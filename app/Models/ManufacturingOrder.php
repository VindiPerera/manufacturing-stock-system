<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ManufacturingOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'batch_number',
        'production_quantity',
        'stock_before',
        'stock_after',
        'manufacturing_date',
        'expiry_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'manufacturing_date' => 'date',
        'expiry_date' => 'date',
    ];

    // Relationship with Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Relationship with Batch (one-to-one)
    public function batch()
    {
        return $this->hasOne(Batch::class);
    }

    // Generate unique batch number
    public static function generateBatchNumber()
    {
        $prefix = 'BATCH';
        $date = Carbon::now()->format('Ymd');
        $datePrefix = $prefix . '-' . $date . '-';
        
        // Find the highest existing batch number for today
        $lastBatch = self::where('batch_number', 'like', $datePrefix . '%')
            ->orderBy('batch_number', 'desc')
            ->first();
        
        if ($lastBatch) {
            // Extract the number part and increment
            $lastNumber = (int) substr($lastBatch->batch_number, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $datePrefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    // Boot method to auto-generate batch number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($manufacturingOrder) {
            if (empty($manufacturingOrder->batch_number)) {
                $manufacturingOrder->batch_number = self::generateBatchNumber();
            }
        });
    }

    // Scope for filtering by status
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope for recent orders
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', Carbon::now()->subDays($days));
    }
}
