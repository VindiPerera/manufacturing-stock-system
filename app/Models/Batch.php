<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Batch extends Model
{
    use HasFactory;

    protected $fillable = [
        'manufacturing_order_id',
        'product_id',
        'batch_number',
        'product_code',
        'serial_number',
        'quantity',
        'manufacturing_date',
        'expiry_date',
        'label_printed',
        'label_print_count',
        'notes',
    ];

    protected $casts = [
        'manufacturing_date' => 'date',
        'expiry_date' => 'date',
        'label_printed' => 'boolean',
        'serial_number' => 'integer',
        'quantity' => 'integer',
        'label_print_count' => 'integer',
    ];

    /**
     * Relationship with Product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relationship with ManufacturingOrder
     */
    public function manufacturingOrder()
    {
        return $this->belongsTo(ManufacturingOrder::class);
    }

    /**
     * Generate a unique batch number
     * Format: PRODUCTCODE-YYYYMMDD-### (e.g., JUICE-20260217-001)
     * 
     * The serial number restarts at 001 for each new day per product
     * 
     * @param Product $product
     * @param Carbon|null $manufacturingDate
     * @return array ['batch_number' => string, 'product_code' => string, 'serial_number' => int]
     */
    public static function generateBatchNumber(Product $product, ?Carbon $manufacturingDate = null): array
    {
        $date = $manufacturingDate ?? Carbon::now();
        $dateString = $date->format('Ymd');
        
        // Generate product code from SKU or name
        // Remove special characters and take first part, uppercase
        $productCode = self::generateProductCode($product);
        
        // Find the last batch created today for this product code
        $lastBatch = self::where('product_code', $productCode)
            ->whereDate('manufacturing_date', $date->toDateString())
            ->orderBy('serial_number', 'desc')
            ->first();
        
        // Increment serial number or start at 1
        $serialNumber = $lastBatch ? $lastBatch->serial_number + 1 : 1;
        
        // Format: PRODUCTCODE-YYYYMMDD-###
        $batchNumber = sprintf(
            '%s-%s-%03d',
            $productCode,
            $dateString,
            $serialNumber
        );
        
        return [
            'batch_number' => $batchNumber,
            'product_code' => $productCode,
            'serial_number' => $serialNumber,
        ];
    }

    /**
     * Generate a product code from the product
     * Takes the SKU prefix or generates from product name
     * 
     * @param Product $product
     * @return string
     */
    public static function generateProductCode(Product $product): string
    {
        // Try to use SKU first
        if ($product->sku) {
            // Extract meaningful part from SKU (e.g., "SKU-COFFEE-001" -> "COFFEE")
            $skuParts = explode('-', $product->sku);
            
            // If SKU has format like SKU-XXXX-###, use the middle part
            if (count($skuParts) >= 2) {
                // Skip 'SKU' prefix if exists
                $codeIndex = strtoupper($skuParts[0]) === 'SKU' ? 1 : 0;
                if (isset($skuParts[$codeIndex])) {
                    return strtoupper($skuParts[$codeIndex]);
                }
            }
            
            // Otherwise use first part of SKU
            return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $skuParts[0]));
        }
        
        // Fallback: Generate from product name
        // Take first word or first 6 characters, uppercase
        $name = preg_replace('/[^A-Za-z0-9\s]/', '', $product->name);
        $words = explode(' ', trim($name));
        $code = strtoupper(substr($words[0], 0, 6));
        
        return $code ?: 'PROD';
    }

    /**
     * Create a batch from a manufacturing order
     * 
     * @param ManufacturingOrder $order
     * @return Batch
     */
    public static function createFromManufacturingOrder(ManufacturingOrder $order): Batch
    {
        $product = $order->product;
        $manufacturingDate = $order->manufacturing_date ?? Carbon::now();
        
        // Generate unique batch number
        $batchData = self::generateBatchNumber($product, $manufacturingDate);
        
        return self::create([
            'manufacturing_order_id' => $order->id,
            'product_id' => $product->id,
            'batch_number' => $batchData['batch_number'],
            'product_code' => $batchData['product_code'],
            'serial_number' => $batchData['serial_number'],
            'quantity' => $order->production_quantity,
            'manufacturing_date' => $manufacturingDate,
            'expiry_date' => $order->expiry_date,
            'notes' => $order->notes,
        ]);
    }

    /**
     * Mark label as printed and increment print count
     * 
     * @return bool
     */
    public function markLabelPrinted(): bool
    {
        $this->label_printed = true;
        $this->label_print_count = $this->label_print_count + 1;
        return $this->save();
    }

    /**
     * Scope for batches with labels not yet printed
     */
    public function scopeUnprinted($query)
    {
        return $query->where('label_printed', false);
    }

    /**
     * Scope for batches created today
     */
    public function scopeToday($query)
    {
        return $query->whereDate('manufacturing_date', Carbon::today());
    }

    /**
     * Scope for batches expiring soon (within given days)
     */
    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', Carbon::now()->addDays($days))
            ->where('expiry_date', '>=', Carbon::now());
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate batch number if not provided
        static::creating(function ($batch) {
            if (empty($batch->batch_number) && $batch->product_id) {
                $product = Product::find($batch->product_id);
                if ($product) {
                    $manufacturingDate = $batch->manufacturing_date 
                        ? Carbon::parse($batch->manufacturing_date) 
                        : Carbon::now();
                    
                    $batchData = self::generateBatchNumber($product, $manufacturingDate);
                    $batch->batch_number = $batchData['batch_number'];
                    $batch->product_code = $batchData['product_code'];
                    $batch->serial_number = $batchData['serial_number'];
                }
            }
        });
    }
}
