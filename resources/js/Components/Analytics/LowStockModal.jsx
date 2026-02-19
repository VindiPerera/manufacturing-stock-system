import React from 'react';
import { Link } from '@inertiajs/react';

export default function LowStockModal({ isOpen, onClose, products }) {
    if (!isOpen) return null;

    const getStockLevel = (percentage) => {
        if (percentage === 0) return { label: 'OUT OF STOCK', color: 'bg-red-500', textColor: 'text-red-600' };
        if (percentage <= 25) return { label: 'CRITICAL', color: 'bg-red-400', textColor: 'text-red-600' };
        if (percentage <= 50) return { label: 'LOW', color: 'bg-orange-400', textColor: 'text-orange-600' };
        if (percentage <= 75) return { label: 'MEDIUM', color: 'bg-yellow-400', textColor: 'text-yellow-600' };
        return { label: 'ADEQUATE', color: 'bg-green-400', textColor: 'text-green-600' };
    };

    const getRowColor = (percentage) => {
        if (percentage === 0) return 'bg-red-50 hover:bg-red-100';
        if (percentage <= 25) return 'bg-red-50 hover:bg-red-100';
        if (percentage <= 50) return 'bg-orange-50 hover:bg-orange-100';
        if (percentage <= 75) return 'bg-yellow-50 hover:bg-yellow-100';
        return 'hover:bg-slate-50';
    };

    const sortedProducts = [...(products || [])].sort((a, b) => b.stock_deficit - a.stock_deficit);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-red-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Low Stock Alerts</h2>
                        <p className="text-red-100">{sortedProducts.length} products below minimum stock</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-red-700 rounded-full p-2 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {sortedProducts.length === 0 ? (
                        <div className="text-center py-8 bg-green-50 rounded-lg">
                            <p className="text-green-600 text-lg font-semibold">✅ All products are at or above minimum stock levels</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Product</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">SKU</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Current Stock</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Minimum Stock</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Deficit</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Stock Level %</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedProducts.map((product) => {
                                        const stockLevel = getStockLevel(product.stock_percentage);
                                        const rowColor = getRowColor(product.stock_percentage);
                                        const progressPercentage = Math.min(product.stock_percentage, 100);

                                        return (
                                            <tr key={product.id} className={`${rowColor} transition`}>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {product.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                        {product.sku}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                                                    {product.current_stock}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                                    {product.minimum_stock}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-bold text-red-600">
                                                    -{product.stock_deficit}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`${stockLevel.color} h-2 rounded-full transition-all duration-300`}
                                                                style={{ width: `${progressPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-600 w-12">
                                                            {product.stock_percentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`${stockLevel.textColor} ${stockLevel.color} bg-opacity-20 px-3 py-1 rounded-full text-xs font-bold`}>
                                                        {stockLevel.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link
                                                        href={`/manufacturing?product=${product.id}`}
                                                        className="text-blue-600 hover:text-blue-900 font-semibold text-sm underline"
                                                    >
                                                        Manufacture
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
