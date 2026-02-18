<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Database Schema for Batch & Labeling Module:
     * 
     * Fields:
     * - id: Primary key (bigint, auto-increment)
     * - manufacturing_order_id: Foreign key to manufacturing_orders table (bigint)
     * - product_id: Foreign key to products table (bigint)
     * - batch_number: Unique batch identifier format: PRODUCTCODE-YYYYMMDD-### (string, unique)
     * - product_code: Extracted product code used in batch number (string)
     * - serial_number: Daily serial number that resets each day per product (integer)
     * - quantity: Quantity in this batch (integer)
     * - manufacturing_date: Date of manufacture (date)
     * - expiry_date: Product expiry date (date, nullable)
     * - label_printed: Whether label has been printed (boolean, default false)
     * - label_print_count: How many times label was printed (integer, default 0)
     * - notes: Additional notes (text, nullable)
     * - created_at/updated_at: Timestamps
     */
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manufacturing_order_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('batch_number')->unique();
            $table->string('product_code', 50);
            $table->integer('serial_number');
            $table->integer('quantity');
            $table->date('manufacturing_date');
            $table->date('expiry_date')->nullable();
            $table->boolean('label_printed')->default(false);
            $table->integer('label_print_count')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index for efficient batch number generation query
            $table->index(['product_code', 'manufacturing_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
