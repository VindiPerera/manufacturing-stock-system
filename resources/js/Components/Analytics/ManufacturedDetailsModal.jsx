import React, { useState, useEffect } from 'react';

export default function ManufacturedDetailsModal({ isOpen, onClose, quantity, batchCount }) {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchManufacturedDetails();
        }
    }, [isOpen]);

    const fetchManufacturedDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics/manufactured-details');
            const data = await response.json();
            if (data.success) {
                setBatches(data.data);
            }
        } catch (error) {
            console.error('Error fetching manufactured details:', error);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Manufactured Today</h2>
                        <p className="text-blue-100">{quantity} units across {batchCount} batches</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-blue-700 rounded-full p-2 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading details...</p>
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No batches manufactured today</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {batches.map((batch) => (
                                <div
                                    key={batch.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Batch Number</p>
                                            <p className="font-bold text-gray-900">{batch.batch_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Product</p>
                                            <p className="font-bold text-gray-900">{batch.product_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">SKU</p>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                {batch.sku}
                                            </code>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Quantity</p>
                                            <p className="font-bold text-gray-900">{batch.quantity} units</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Manufacturing Date</p>
                                            <p className="text-gray-900">{batch.manufacturing_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Expiry Date</p>
                                            <p className="text-gray-900">{batch.expiry_date}</p>
                                        </div>
                                    </div>
                                    {batch.notes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm text-gray-600">Notes</p>
                                            <p className="text-gray-700">{batch.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
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
