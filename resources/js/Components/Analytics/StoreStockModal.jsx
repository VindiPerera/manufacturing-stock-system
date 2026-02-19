import React, { useState, useEffect } from 'react';

export default function StoreStockModal({ isOpen, onClose, totalQuantity, totalBatches, initialQuantity, soldQuantity }) {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStoreStockDetails();
        }
    }, [isOpen]);

    const fetchStoreStockDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics/store-stock-details');
            const data = await response.json();
            if (data.success) {
                setBatches(data.data);
            }
        } catch (error) {
            console.error('Error fetching store stock details:', error);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-green-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Live Store Stock</h2>
                        <p className="text-green-100">{totalQuantity} units across {totalBatches} batches</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-green-700 rounded-full p-2 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="bg-green-50 p-6 border-b border-green-200 grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-gray-600">Initial Quantity</p>
                        <p className="text-2xl font-bold text-green-600">{initialQuantity}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-gray-600">Sold Quantity</p>
                        <p className="text-2xl font-bold text-purple-600">{soldQuantity}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-gray-600">Current Stock</p>
                        <p className="text-2xl font-bold text-blue-600">{totalQuantity}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading store stock details...</p>
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No batches in stock</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Batch #</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Product</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">SKU</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Initial</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Sold</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Current</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Mfg Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {batches.map((batch) => (
                                        <tr key={batch.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-semibold text-gray-900">{batch.batch_number}</td>
                                            <td className="px-4 py-3 text-gray-700">{batch.product_name}</td>
                                            <td className="px-4 py-3">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                    {batch.sku}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold">{batch.initial_quantity}</td>
                                            <td className="px-4 py-3 text-center font-semibold text-purple-600">{batch.sold_quantity}</td>
                                            <td className="px-4 py-3 text-center font-bold text-green-600">{batch.current_quantity}</td>
                                            <td className="px-4 py-3 text-gray-700">{batch.manufacturing_date}</td>
                                            <td className="px-4 py-3 text-gray-700">{batch.expiry_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
