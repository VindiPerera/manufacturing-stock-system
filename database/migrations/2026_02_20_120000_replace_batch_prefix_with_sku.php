<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migrates existing batch rows whose `batch_number` starts with
     * the literal prefix `BATCH-` so that the prefix is replaced by the
     * product `sku`. The rest of the batch number (date/serial) is kept.
     */
    public function up(): void
    {
        DB::table('batches')
            ->where('batch_number', 'like', 'BATCH-%')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $product = DB::table('products')->where('id', $row->product_id)->first();
                    if (!$product || !isset($product->sku) || $product->sku === '') {
                        // skip if product or sku missing
                        continue;
                    }

                    $rest = substr($row->batch_number, strlen('BATCH-'));
                    $sku = $product->sku;
                    $candidate = $sku . '-' . $rest;

                    // Ensure uniqueness: if candidate exists, append incremental suffix
                    if (DB::table('batches')->where('batch_number', $candidate)->exists()) {
                        $suffix = 1;
                        $base = $candidate;
                        while (DB::table('batches')->where('batch_number', $candidate)->exists()) {
                            $candidate = $base . '-' . $suffix;
                            $suffix++;
                        }
                    }

                    DB::table('batches')->where('id', $row->id)->update([
                        'batch_number' => $candidate,
                        'product_code' => $sku,
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     *
     * This attempts to revert rows changed by `up()` by replacing a prefix
     * matching the product `sku` with `BATCH`. This is best-effort and
     * intended for rollbacks during development; for production rollbacks
     * prefer a database backup.
     */
    public function down(): void
    {
        DB::table('batches')
            ->where('batch_number', 'not like', 'BATCH-%')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $product = DB::table('products')->where('id', $row->product_id)->first();
                    if (!$product || !isset($product->sku) || $product->sku === '') {
                        continue;
                    }

                    $sku = $product->sku;

                    // If the batch_number begins with the sku + '-', replace it with 'BATCH-'
                    $prefix = $sku . '-';
                    if (strpos($row->batch_number, $prefix) === 0) {
                        $rest = substr($row->batch_number, strlen($prefix));
                        $original = 'BATCH-' . $rest;

                        // Avoid overwriting an existing BATCH-... row
                        if (!DB::table('batches')->where('batch_number', $original)->exists()) {
                            DB::table('batches')->where('id', $row->id)->update([
                                'batch_number' => $original,
                                'product_code' => 'BATCH',
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            });
    }
};
