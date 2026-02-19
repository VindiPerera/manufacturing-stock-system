<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockOutTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'user_id',
        'quantity',
        'remaining_quantity',
        'reason',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'remaining_quantity' => 'integer',
    ];

    /**
     * Relationship with Batch
     */
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Relationship with User (who performed the checkout)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter transactions by date range
     */
    public function scopeDateRange($query, $from, $to)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    /**
     * Scope to filter transactions for today
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', now()->toDateString());
    }

    /**
     * Get total quantity deducted for a batch
     */
    public static function getTotalDeductedForBatch($batchId)
    {
        return self::where('batch_id', $batchId)->sum('quantity');
    }
}
