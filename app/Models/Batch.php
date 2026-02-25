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
     * Format: CATEGORY-### (e.g., Cat-001, Electronics-002)
     * 
     * The 3-digit number is sequential, starting from 001
     * 
     * @param Product $product
     * @param Carbon|null $manufacturingDate
     * @return array ['batch_number' => string, 'product_code' => string, 'serial_number' => int]
     */
    public static function generateBatchNumber(Product $product, ?Carbon $manufacturingDate = null): array
    {
        // Get category name or use default
        $category = !empty($product->category) ? $product->category : 'PROD';
        
        // Sanitize category name (remove special characters, keep letters and numbers)
        $categoryCode = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $category));
        
        // Use database locking to prevent race conditions
        // Lock the table to ensure we get an accurate count
        $lastBatch = self::where('product_code', $categoryCode)
            ->lockForUpdate()
            ->orderBy('serial_number', 'desc')
            ->first();
        
        // Increment serial number or start at 1
        $serialNumber = $lastBatch ? $lastBatch->serial_number + 1 : 1;
        
        // Format: CATEGORY-###
        $batchNumber = sprintf('%s-%03d', $categoryCode, $serialNumber);
        
        return [
            'batch_number' => $batchNumber,
            'product_code' => $categoryCode,
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
        // Prefer full SKU as prefix so batch numbers directly reference SKU
        if (!empty($product->sku)) {
            // Keep hyphens in SKU but remove whitespace
            return strtoupper(preg_replace('/\s+/', '', $product->sku));
        }

        // Fallback: Generate from product name (first word up to 6 chars)
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
        // If manufacturing order already computed a batch_number, reuse it so both sections match
        if (!empty($order->batch_number)) {
            $batchNumber = $order->batch_number;

            // Try to parse serial and product code from batch number
            // New format: CATEGORY-### (e.g., CAT-001)
            $serial = null;
            $productCode = null;
            if (preg_match('/^(.+)-(\d{3})$/', $batchNumber, $matches)) {
                $productCode = strtoupper($matches[1]);
                $serial = (int) $matches[2];
            }

            return self::create([
                'manufacturing_order_id' => $order->id,
                'product_id' => $product->id,
                'batch_number' => $batchNumber,
                'product_code' => $productCode ?? self::generateProductCode($product),
                'serial_number' => $serial ?? 0,
                'quantity' => $order->production_quantity,
                'manufacturing_date' => $manufacturingDate,
                'expiry_date' => $order->expiry_date,
                'notes' => $order->notes,
            ]);
        }

        // Otherwise generate a new batch number using SKU prefix
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
