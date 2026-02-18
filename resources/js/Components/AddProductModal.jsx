import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function AddProductModal({ onClose, onSuccess }) {
    // Function to generate a 12-digit barcode
    const generateBarcode = () => {
        const min = 100000000000; // 12 digits starting from 100000000000
        const max = 999999999999; // 12 digits ending at 999999999999
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    };

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        unit: '',
        barcode: generateBarcode(), // Auto-generate on initialization
        description: '',
        minimum_stock: '0',
        current_stock: '0',
        price: '0.00',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const units = ['pcs', 'box', 'kg', 'ltr', 'meter', 'dozen', 'set', 'piece'];
    const categories = ['Electronics', 'Clothing', 'Food', 'Beverages', 'Furniture', 'Other'];

    // Handler to regenerate barcode
    const handleRegenerateBarcode = () => {
        setFormData(prev => ({
            ...prev,
            barcode: generateBarcode()
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        // Client-side validation
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Product name is required';
        if (!formData.sku.trim()) errors.sku = 'SKU is required';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.unit) errors.unit = 'Unit is required';

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);

        const form = new FormData();
        form.append('name', formData.name.trim());
        form.append('sku', formData.sku.trim());
        form.append('category', formData.category);
        form.append('unit', formData.unit);
        form.append('barcode', formData.barcode.trim());
        form.append('description', formData.description.trim());
        form.append('minimum_stock', formData.minimum_stock || '0');
        form.append('current_stock', '0');
        form.append('price', formData.price || '0.00');

        const imageInput = document.querySelector('#image-input');
        if (imageInput && imageInput.files[0]) {
            form.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch('/products', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json',
                },
                body: form
            });

            const data = await response.json();

            if (response.ok) {
                setLoading(false);
                // Call onSuccess with the new product data
                if (onSuccess && data.product) {
                    onSuccess(data.product);
                }
                onClose();
            } else {
                setLoading(false);
                // Handle validation errors
                if (data.errors) {
                    setValidationErrors(data.errors);
                } else {
                    alert(data.message || 'Error adding product. Please try again.');
                }
            }
        } catch (error) {
            setLoading(false);
            console.error('Error adding product:', error);
            alert('Error adding product. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Product1</h2>
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
                <form onSubmit={handleSubmit} className="p-6">
                    {/* General Error Alert */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Please fix the following errors:</span>
                            </div>
                            <ul className="list-disc list-inside mt-2 text-sm">
                                {Object.entries(validationErrors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Product Name */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {validationErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* SKU Code */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                SKU Code <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="e.g., SKU-001"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.sku ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {validationErrors.sku && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.sku}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category <span className="text-red-600">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.category ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {validationErrors.category && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
                            )}
                        </div>

                        {/* Unit */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Unit <span className="text-red-600">*</span>
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.unit ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="">Select Unit</option>
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                            {validationErrors.unit && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.unit}</p>
                            )}
                        </div>

                        {/* Barcode */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Barcode (Auto-generated)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    readOnly
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={handleRegenerateBarcode}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                                    title="Generate New Barcode"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Enter price"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Current Stock */}
                        {/* <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Stock
                            </label>
                            <input
                                type="number"
                                name="current_stock"
                                value={formData.current_stock}
                                onChange={handleChange}
                                placeholder="Enter stock quantity"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div> */}

                        {/* Minimum Stock Level */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Minimum Stock Level
                            </label>
                            <input
                                type="number"
                                name="minimum_stock"
                                value={formData.minimum_stock}
                                onChange={handleChange}
                                placeholder="Enter minimum stock"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter product description"
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Image
                            </label>
                            <div className="flex items-center space-x-4">
                                <input
                                    id="image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 border-t border-gray-200 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
