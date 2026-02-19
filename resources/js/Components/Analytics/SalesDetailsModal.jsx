import React from 'react';

export default function SalesDetailsModal({ isOpen, onClose, transactionCount, quantitySold, transactions = [] }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-purple-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Sales Today</h2>
                        <p className="text-purple-100">{quantitySold} units sold in {transactionCount} transactions</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-purple-700 rounded-full p-2 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No sales transactions today</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Batch #</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Product</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">SKU</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Qty</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Reason</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">User</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm text-gray-700">{transaction.timestamp}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">{transaction.batch_number}</td>
                                            <td className="px-4 py-3 text-gray-700">{transaction.product_name}</td>
                                            <td className="px-4 py-3">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                    {transaction.product_sku}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-purple-600">{transaction.quantity}</td>
                                            <td className="px-4 py-3 text-gray-700 text-sm">{transaction.reason}</td>
                                            <td className="px-4 py-3 text-gray-700 text-sm">{transaction.user_name}</td>
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
