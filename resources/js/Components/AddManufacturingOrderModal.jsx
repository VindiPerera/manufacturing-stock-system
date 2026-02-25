import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AddManufacturingOrderModal({ products, onClose, onSuccess }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [productForm, setProductForm] = useState({
        production_quantity: '',
        manufacturing_date: '',
        expiry_date: '',
    });
    const [addedProducts, setAddedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDropdown, setShowDropdown] = useState(false);

    // Compute batch number preview from category (server will assign final random digits)
    const computeBatchPreview = (category, manufacturingDate) => {
        if (!category) return null;
        const categoryCode = category.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        return `${categoryCode}-###`;
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProductSelect = (productId) => {
        setSelectedProductId(productId);
        const product = products.find(p => p.id === productId);
        setSearchTerm(product ? `${product.name} (${product.sku})` : '');
        setShowDropdown(false);
    };

    const handleAddProduct = () => {
        // Validation
        const errors = {};
        if (!selectedProductId) errors.product = 'Please select a product';
        if (!productForm.production_quantity || productForm.production_quantity < 1) {
            errors.quantity = 'Quantity must be at least 1';
        }
        if (!productForm.manufacturing_date) errors.manufacturing_date = 'Manufacturing date is required';
        if (productForm.expiry_date && productForm.expiry_date <= productForm.manufacturing_date) {
            errors.expiry_date = 'Expiry date must be after manufacturing date';
        }

        // Check if product already added
        if (addedProducts.find(p => p.product_id === parseInt(selectedProductId))) {
            errors.product = 'This product has already been added to this batch';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProductId));
        
        setAddedProducts([...addedProducts, {
            product_id: parseInt(selectedProductId),
            product_name: product.name,
            product_sku: product.sku,
            product_category: product.category,
            current_stock: product.current_stock,
            production_quantity: parseInt(productForm.production_quantity),
            manufacturing_date: productForm.manufacturing_date,
            expiry_date: productForm.expiry_date || null,
        }]);

        // Reset form
        setSelectedProductId('');
        setSearchTerm('');
        setProductForm({
            production_quantity: '',
            manufacturing_date: '',
            expiry_date: '',
        });
        setValidationErrors({});
    };

    const handleRemoveProduct = (index) => {
        setAddedProducts(addedProducts.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationErrors({});

        if (addedProducts.length === 0) {
            setValidationErrors({ submit: 'Please add at least one product to the batch' });
            return;
        }

        setLoading(true);

        router.post('/manufacturing', {
            products: addedProducts,
        }, {
            onSuccess: (page) => {
                setLoading(false);
                // Get the created orders from the response
                const newOrders = page.props.flash?.newOrders || [];
                if (onSuccess && newOrders.length > 0) {
                    onSuccess(newOrders);
                } else {
                    onClose();
                }
            },
            onError: (errors) => {
                setLoading(false);
                console.error('Error creating manufacturing order:', errors);
                
                if (errors && typeof errors === 'object') {
                    setValidationErrors(errors);
                } else {
                    alert('Error creating manufacturing order. Please try again.');
                }
            }
        });
    };

    const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create Manufacturing Order</h2>
                        <p className="mt-1 text-sm text-gray-500">Batch numbers are auto-generated from product category + sequential 3-digit number (001, 002, 003...)</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    {/* Error Alert */}
                    {validationErrors.submit && (
                        <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{validationErrors.submit}</span>
                            </div>
                        </div>
                    )}

                    {/* Add Product Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Products to Batch</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Product Search Dropdown */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Product <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                        setSelectedProductId('');
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Search by product name or SKU..."
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        validationErrors.product ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.product && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.product}</p>
                                )}
                                
                                {/* Dropdown */}
                                {showDropdown && searchTerm && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleProductSelect(product.id)}
                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        SKU: {product.sku} | Stock: {product.current_stock}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 text-sm">No products found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Production Quantity */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Production Quantity <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={productForm.production_quantity}
                                    onChange={(e) => setProductForm({...productForm, production_quantity: e.target.value})}
                                    min="1"
                                    placeholder="Enter quantity"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        validationErrors.quantity ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.quantity && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.quantity}</p>
                                )}
                            </div>

                            {/* Manufacturing Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Manufacturing Date <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={productForm.manufacturing_date}
                                    onChange={(e) => setProductForm({...productForm, manufacturing_date: e.target.value})}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        validationErrors.manufacturing_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.manufacturing_date && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.manufacturing_date}</p>
                                )}
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Expiry Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={productForm.expiry_date}
                                    onChange={(e) => setProductForm({...productForm, expiry_date: e.target.value})}
                                    min={productForm.manufacturing_date}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        validationErrors.expiry_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.expiry_date && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.expiry_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Product Preview */}
                        {selectedProduct && productForm.production_quantity && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                                <div className="text-sm">
                                    <span className="font-medium">Stock After Production:</span>{' '}
                                    {parseInt(selectedProduct.current_stock) + parseInt(productForm.production_quantity || 0)}
                                </div>
                                {computeBatchPreview(selectedProduct.category, productForm.manufacturing_date) && (
                                    <div className="text-sm">
                                        <span className="font-medium">Batch # Preview:</span>{' '}
                                        <span className="font-mono text-blue-700">
                                            {computeBatchPreview(selectedProduct.category, productForm.manufacturing_date)}
                                        </span>
                                        <span className="text-gray-400 text-xs ml-1">(sequential number assigned automatically)</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleAddProduct}
                            className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Product to Batch
                        </button>
                    </div>

                    {/* Added Products List */}
                    {addedProducts.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Products in Batch ({addedProducts.length})
                            </h3>
                            <div className="space-y-3">
                                {addedProducts.map((product, index) => (
                                    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{product.product_name}</h4>
                                                <button
                                                    onClick={() => handleRemoveProduct(index)}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                                <div><span className="font-medium">SKU:</span> {product.product_sku}</div>
                                                <div><span className="font-medium">Quantity:</span> {product.production_quantity}</div>
                                                <div><span className="font-medium">Mfg Date:</span> {product.manufacturing_date}</div>
                                                <div>
                                                    <span className="font-medium">Exp Date:</span> {product.expiry_date || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Stock:</span> {product.current_stock} → {product.current_stock + product.production_quantity}
                                            </div>
                                            <div className="text-sm text-blue-700 mt-1 font-mono">
                                                <span className="font-sans font-medium text-gray-600">Batch #:</span>{' '}
                                                {computeBatchPreview(product.product_category, product.manufacturing_date)}
                                                <span className="font-sans text-gray-400 text-xs ml-1">(auto)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                            disabled={loading || addedProducts.length === 0}
                        >
                            {loading ? 'Creating...' : 'Create Manufacturing Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}