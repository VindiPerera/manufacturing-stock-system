import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Show({ product }) {
    return (
        <AuthenticatedLayout>
            <Head title={product.name} />

            <div className="bg-gray-50 min-h-screen py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                <p className="text-gray-600 mt-2">SKU: {product.sku}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.visit(`/products/${product.id}/edit`)}
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => router.visit('/products')}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition"
                                >
                                    Back
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column - Image */}
                            <div>
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Details */}
                            <div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Category</p>
                                        <p className="text-lg font-semibold text-gray-900">{product.category}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Unit</p>
                                        <p className="text-lg font-semibold text-gray-900">{product.unit}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Barcode</p>
                                        <p className="text-lg font-semibold text-gray-900">{product.barcode || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="text-lg font-semibold text-green-600">${product.price || '0.00'}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm text-gray-600">Current Stock</p>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                product.minimum_stock && product.stock <= product.minimum_stock
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {product.stock || 0} {product.unit}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">Minimum Stock: {product.minimum_stock || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mt-8 border-t border-gray-200 pt-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                            </div>
                        )}

                        {/* Meta Information */}
                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Information</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Created</p>
                                    <p className="text-gray-900">{new Date(product.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Last Updated</p>
                                    <p className="text-gray-900">{new Date(product.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
