import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import BatchTraceabilitySearch from '@/Components/Analytics/BatchTraceabilitySearch';

export default function BatchTraceability() {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleBatchSelect = async (batchIdentifier) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/analytics/batch/${batchIdentifier}`);
            const data = await response.json();
            
            if (data.success) {
                setSelectedBatch(data.data);
            } else {
                alert('Batch not found');
                setSelectedBatch(null);
            }
        } catch (error) {
            console.error('Error fetching batch:', error);
            alert('Error fetching batch details');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Batch Traceability" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            Batch Traceability & History
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Track complete batch history, from manufacturing to sales
                        </p>
                    </div>

                    {/* Search Component */}
                    <BatchTraceabilitySearch 
                        onBatchSelect={handleBatchSelect}
                        isLoading={isLoading}
                    />

                    {/* Batch Details */}
                    {selectedBatch && (
                        <BatchTraceabilityDetails batch={selectedBatch} />
                    )}

                    {/* No Selection */}
                    {!selectedBatch && !isLoading && (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-slate-600 text-xl mb-4">
                                🔍 Search for a batch using the ID or batch number above
                            </p>
                            <p className="text-slate-500 text-sm">
                                Example: JUICE-20260217-001 or batch ID: 5
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/**
 * Batch Details Component - Shows complete traceability
 */
function BatchTraceabilityDetails({ batch }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            
            {/* LEFT COLUMN - BATCH INFO */}
            <div className="lg:col-span-1">
                <div className="space-y-4">
                    
                    {/* BATCH HEADER */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            {batch.batch_number}
                        </h2>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs uppercase font-semibold text-slate-500">Product</p>
                                <p className="text-lg font-semibold text-slate-900">{batch.product.name}</p>
                                <p className="text-sm text-slate-600 font-mono">{batch.product.sku}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-semibold text-slate-500">Category</p>
                                <p className="text-sm font-medium text-slate-900">{batch.product.category || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-semibold text-slate-500">Unit</p>
                                <p className="text-sm font-medium text-slate-900">{batch.product.unit || 'pcs'}</p>
                            </div>
                        </div>
                    </div>

                    {/* MANUFACTURING INFO */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">📦 Manufacturing</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs uppercase font-semibold text-slate-500">Manufacturing Date</p>
                                <p className="text-sm font-semibold text-slate-900">{batch.manufacturing_date}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-semibold text-slate-500">Expiry Date</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {batch.expiry_date || 'No expiry'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-semibold text-slate-500">Labels Printed</p>
                                <p className="text-sm font-semibold text-slate-900">{batch.labels_printed} times</p>
                            </div>
                        </div>
                    </div>

                    {/* NOTES */}
                    {batch.notes && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">📝 Notes</h3>
                            <p className="text-sm text-slate-700">{batch.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN - QUANTITY & TRANSACTIONS */}
            <div className="lg:col-span-2">
                
                {/* QUANTITY SUMMARY */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-green-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">📊 Quantity Summary</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {/* Initial Quantity */}
                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                            <p className="text-xs uppercase font-semibold text-blue-700">Initial Quantity</p>
                            <p className="text-3xl font-bold text-blue-900">{batch.initial_quantity}</p>
                            <p className="text-xs text-blue-600 mt-1">Manufactured</p>
                        </div>

                        {/* Sold Quantity */}
                        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                            <p className="text-xs uppercase font-semibold text-purple-700">Sold</p>
                            <p className="text-3xl font-bold text-purple-900">{batch.total_sold_quantity}</p>
                            <p className="text-xs text-purple-600 mt-1">{batch.stock_out_transactions.length} transactions</p>
                        </div>

                        {/* Current Quantity */}
                        <div className={`rounded-lg p-4 border-l-4 ${
                            batch.current_quantity > 0
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-500'
                        }`}>
                            <p className={`text-xs uppercase font-semibold ${
                                batch.current_quantity > 0
                                    ? 'text-green-700'
                                    : 'text-red-700'
                            }`}>
                                Current
                            </p>
                            <p className={`text-3xl font-bold ${
                                batch.current_quantity > 0
                                    ? 'text-green-900'
                                    : 'text-red-900'
                            }`}>
                                {batch.current_quantity}
                            </p>
                            <p className={`text-xs mt-1 ${
                                batch.current_quantity > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}>
                                {batch.current_quantity > 0 ? 'In Stock' : 'SOLD OUT'}
                            </p>
                        </div>
                    </div>

                    {/* LEAKAGE INDICATOR */}
                    {batch.current_quantity < 0 && (
                        <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 rounded">
                            <p className="text-sm text-red-800 font-semibold">
                                ⚠️ Warning: Negative stock detected! This indicates overselling or data inconsistency.
                            </p>
                        </div>
                    )}
                </div>

                {/* STOCK-OUT TRANSACTIONS TABLE */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-slate-50 border-b-2 border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900">
                            📤 Stock-Out Transactions ({batch.stock_out_transactions.length})
                        </h3>
                    </div>

                    {batch.stock_out_transactions.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-slate-600">No transactions yet. This batch hasn't been sold.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date & Time</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {batch.stock_out_transactions.map((transaction, index) => (
                                        <tr key={transaction.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 text-sm font-mono text-slate-700">
                                                {transaction.timestamp}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                                                -{transaction.sold_quantity}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {transaction.reason || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                {transaction.user_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {transaction.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
