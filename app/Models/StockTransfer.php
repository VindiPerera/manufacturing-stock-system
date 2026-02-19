<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class StockTransfer extends Model
{
    protected $fillable = [
        'transfer_number',
        'batch_number',
        'to_store_id',
        'transferred_by',
        'transfer_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'transfer_date' => 'date',
    ];

    // Relationship with Store
    public function store()
    {
        return $this->belongsTo(Store::class, 'to_store_id');
    }

    // Relationship with User (who transferred)
    public function transferredByUser()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }

    // Relationship with StockTransferItems
    public function items()
    {
        return $this->hasMany(StockTransferItem::class);
    }

    // Generate unique transfer number
    public static function generateTransferNumber()
    {
        $prefix = 'TRANSFER';
        $date = Carbon::now()->format('Ymd');
        $datePrefix = $prefix . '-' . $date . '-';
        
        // Find the highest existing transfer number for today
        $lastTransfer = self::where('transfer_number', 'like', $datePrefix . '%')
            ->orderBy('transfer_number', 'desc')
            ->first();
        
        if ($lastTransfer) {
            $lastNumber = (int) substr($lastTransfer->transfer_number, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $datePrefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    // Boot method to auto-generate transfer number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transfer) {
            if (empty($transfer->transfer_number)) {
                $transfer->transfer_number = self::generateTransferNumber();
            }
        });
    }
}
