export default function ProductList({ products, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {products.length === 0 ? (
                <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 text-lg">No products yet. Create your first product!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SKU</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Unit</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Min Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody divide-y divide-gray-200>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        {product.imagePreview ? (
                                            <img 
                                                src={product.imagePreview} 
                                                alt={product.name} 
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            {product.barcode && (
                                                <p className="text-xs text-gray-500">Barcode: {product.barcode}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                                            {product.sku}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{product.unit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                            product.minimumStock && product.stock <= product.minimumStock
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {product.stock || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{product.minimumStock || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${product.price || '0.00'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onDelete(product.id)}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
