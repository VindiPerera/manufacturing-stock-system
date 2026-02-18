import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function EditProductModal({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        unit: '',
        barcode: '',
        description: '',
        minimum_stock: '',
        current_stock: '',
        price: '',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const units = ['pcs', 'box', 'kg', 'ltr', 'meter', 'dozen', 'set', 'piece'];
    const categories = ['Electronics', 'Clothing', 'Food', 'Beverages', 'Furniture', 'Other'];

    // Populate form data when product prop changes
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                category: product.category || '',
                unit: product.unit || '',
                barcode: product.barcode || '',
                description: product.description || '',
                minimum_stock: product.minimum_stock || '0',
                current_stock: product.current_stock || product.stock || '0',
                price: product.price || '0',
            });
            setImagePreview(product.image || null);
        }
    }, [product]);

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

        if (!formData.name || !formData.sku || !formData.category || !formData.unit) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        const form = new FormData();
        form.append('name', formData.name);
        form.append('sku', formData.sku);
        form.append('category', formData.category);
        form.append('unit', formData.unit);
        form.append('barcode', formData.barcode);
        form.append('description', formData.description);
        form.append('minimum_stock', formData.minimum_stock || '0');
        form.append('current_stock', formData.current_stock || '0');
        form.append('price', formData.price || '0');
        form.append('_method', 'PUT');

        const imageInput = document.querySelector('#edit-image-input');
        if (imageInput && imageInput.files[0]) {
            form.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch(`/products/${product.id}`, {
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
                // Call onSuccess with the updated product data
                if (onSuccess && data.product) {
                    onSuccess(data.product);
                }
                onClose();
            } else {
                setLoading(false);
                // Handle validation errors
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join('\n');
                    alert('Error updating product:\n' + errorMessages);
                } else {
                    alert(data.message || 'Error updating product. Please try again.');
                }
            }
        } catch (error) {
            setLoading(false);
            console.error('Error updating product:', error);
            alert('Error updating product. Please try again.');
        }
    };

    if (!product) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
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
                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Image
                        </label>
                        
                        <div className="flex items-center gap-4">
                            {/* Image Preview */}
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs text-gray-400">NO IMAGE</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Upload Button */}
                            <div className="flex-1">
                                <label 
                                    htmlFor="edit-image-input"
                                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block transition"
                                >
                                    Choose New Image
                                </label>
                                <input 
                                    id="edit-image-input"
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty to keep current image
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        {/* SKU */}
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                                Product SKU *
                            </label>
                            <input
                                type="text"
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="e.g., PROD-001"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Unit */}
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                                Unit *
                            </label>
                            <select
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select Unit</option>
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>

                        {/* Barcode */}
                        <div>
                            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                                Barcode
                            </label>
                            <input
                                type="text"
                                id="barcode"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Enter barcode"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                Price
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>

                        {/* Minimum Stock */}
                        <div>
                            <label htmlFor="minimum_stock" className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Stock
                            </label>
                            <input
                                type="number"
                                id="minimum_stock"
                                name="minimum_stock"
                                value={formData.minimum_stock}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="0"
                            />
                        </div>

                        {/* Current Stock */}
                        {/* <div>
                            <label htmlFor="current_stock" className="block text-sm font-medium text-gray-700 mb-2">
                                Current Stock
                            </label>
                            <input
                                type="number"
                                id="current_stock"
                                name="current_stock"
                                value={formData.current_stock}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="0"
                            />
                        </div> */}

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Product description..."
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}