<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use App\Models\Product;
use App\Models\Batch;

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
        // Default legacy generator (uses BATCH prefix)
        $prefix = 'BATCH';
        $date = Carbon::now()->format('Ymd');
        $datePrefix = $prefix . '-' . $date . '-';

        // Find the highest existing batch number for today
        $lastBatch = self::where('batch_number', 'like', $datePrefix . '%')
            ->orderBy('batch_number', 'desc')
            ->first();

        if ($lastBatch) {
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
            // If a product is specified, generate batch number using the product SKU as the prefix
            if (empty($manufacturingOrder->batch_number) && !empty($manufacturingOrder->product_id)) {
                $product = Product::find($manufacturingOrder->product_id);
                $manufacturingDate = $manufacturingOrder->manufacturing_date ?? Carbon::now();

                if ($product) {
                    $dateString = Carbon::parse($manufacturingDate)->format('Ymd');

                    // Use full SKU as prefix (remove whitespace)
                    $skuPrefix = strtoupper(preg_replace('/\s+/', '', $product->sku ?? 'PROD'));

                    // Look for the last batch in the batches table using this SKU and date
                    $likePrefix = $skuPrefix . '-' . $dateString . '-%';
                    $lastBatch = Batch::where('batch_number', 'like', $likePrefix)
                        ->orderBy('serial_number', 'desc')
                        ->first();

                    if ($lastBatch) {
                        $lastNumber = (int) substr($lastBatch->batch_number, -3);
                        $serial = $lastNumber + 1;
                    } else {
                        $serial = 1;
                    }

                    $manufacturingOrder->batch_number = sprintf('%s-%s-%03d', $skuPrefix, $dateString, $serial);
                } else {
                    // fallback to legacy
                    $manufacturingOrder->batch_number = self::generateBatchNumber();
                }
            } elseif (empty($manufacturingOrder->batch_number)) {
                // fallback if no product specified
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
