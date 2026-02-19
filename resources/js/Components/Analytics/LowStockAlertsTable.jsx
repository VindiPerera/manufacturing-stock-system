import React from 'react';
import { Link } from '@inertiajs/react';

export default function LowStockAlertsTable({ products }) {
    if (!products || products.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-slate-600 text-lg">✅ All products are at or above minimum stock levels</p>
            </div>
        );
    }

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

    // Sort by stock deficit (highest first) - products that need restocking most urgently
    const sortedProducts = [...products].sort((a, b) => b.stock_deficit - a.stock_deficit);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">Product</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">SKU</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Current Stock</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Minimum Stock</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Deficit</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Stock Level %</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedProducts.map((product) => {
                        const stockLevel = getStockLevel(product.stock_percentage);
                        const rowColor = getRowColor(product.stock_percentage);
                        const progressPercentage = Math.min(
                            product.stock_percentage,
                            100
                        );

                        return (
                            <tr key={product.id} className={`${rowColor} transition`}>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                        {product.sku}
                                    </code>
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                                    {product.current_stock}
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                    {product.minimum_stock}
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-bold text-red-600">
                                    -{product.stock_deficit}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-24 bg-slate-200 rounded-full h-2">
                                            <div
                                                className={`${stockLevel.color} h-2 rounded-full transition-all duration-300`}
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 w-12">
                                            {product.stock_percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`${stockLevel.textColor} bg-white px-3 py-1 rounded-full text-xs font-bold`}>
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

            {/* ACTION SUMMARY */}
            <div className="bg-amber-50 border-t-2 border-amber-500 p-4">
                <p className="text-sm text-amber-900 font-semibold">
                    📌 <strong>Action Required:</strong> {sortedProducts.length} product(s) need restocking. 
                    Highest deficits are listed first. Click "Manufacture" to create new batches.
                </p>
            </div>
        </div>
    );
}
