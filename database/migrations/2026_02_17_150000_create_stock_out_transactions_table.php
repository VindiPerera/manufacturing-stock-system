<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Database Schema for Stock Out Transactions:
     * 
     * Fields:
     * - id: Primary key (bigint, auto-increment)
     * - batch_id: Foreign key to batches table (bigint)
     * - user_id: Foreign key to users table - who performed the checkout (bigint, nullable)
     * - quantity: Quantity deducted (integer, default 1)
     * - reason: Optional reason for stock out (string, nullable)
     * - notes: Additional notes (text, nullable)
     * - created_at/updated_at: Timestamps
     */
    public function up(): void
    {
        Schema::create('stock_out_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('quantity')->default(1);
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index for efficient querying by batch and date
            $table->index(['batch_id', 'created_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_out_transactions');
    }
};
