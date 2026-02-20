import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

export default function LowStock({ products = [], totalLowStock = 0 }) {
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Low Stock Products" />

            <div className="bg-gray-50 min-h-screen py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-3xl font-bold text-gray-700 hover:text-gray-900"
                            >
                                ‹
                            </Link>
                            <div className="flex items-center space-x-3">
                                <FiAlertTriangle className="w-8 h-8 text-red-600" />
                                <h1 className="text-3xl font-bold text-gray-900">LOW STOCK PRODUCTS</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="bg-red-100 text-red-800 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                                {totalLowStock}
                            </div>
                            <span className="text-gray-700 font-semibold">Products Below Minimum</span>
                        </div>
                    </div>

                    {/* Alert Message */}
                    {totalLowStock > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                            <FiAlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-800">Attention Required</h3>
                                <p className="text-red-700 text-sm">
                                    You have {totalLowStock} product(s) below their minimum stock level. Consider replenishing stock immediately.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    {products.length > 0 ? (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.length === products.length && products.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SKU
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Minimum Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => {
                                        const stockPercentage = (product.stock / product.minimum_stock) * 100;
                                        const isOutOfStock = product.stock === 0;

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.includes(product.id)}
                                                        onChange={() => handleSelectProduct(product.id)}
                                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        {product.image && (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="h-10 w-10 rounded object-cover"
                                                            />
                                                        )}
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">{product.sku}</td>
                                                <td className="px-6 py-3 text-sm text-gray-600">{product.category}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-700' : 'text-orange-700'}`}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">{product.minimum_stock}</td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${isOutOfStock ? 'bg-red-600' : 'bg-orange-500'}`}
                                                                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 w-8 text-right">
                                                            {Math.round(stockPercentage)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-sm">
                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <FiAlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Low Stock Products</h3>
                            <p className="text-gray-600">
                                All your products are currently above their minimum stock levels.
                            </p>
                            <Link
                                href="/products"
                                className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View All Products
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
