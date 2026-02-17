import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AddManufacturingOrderModal({ products, onClose }) {
    const [formData, setFormData] = useState({
        product_id: '',
        production_quantity: '',
        manufacturing_date: '',
        expiry_date: '',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationErrors({});

        // Client-side validation
        const errors = {};
        if (!formData.product_id) errors.product_id = 'Product is required';
        if (!formData.production_quantity || formData.production_quantity < 1) {
            errors.production_quantity = 'Production quantity must be at least 1';
        }
        if (!formData.manufacturing_date) errors.manufacturing_date = 'Manufacturing date is required';
        if (formData.expiry_date && formData.expiry_date <= formData.manufacturing_date) {
            errors.expiry_date = 'Expiry date must be after manufacturing date';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);

        const form = new FormData();
        form.append('product_id', formData.product_id);
        form.append('production_quantity', formData.production_quantity);
        form.append('manufacturing_date', formData.manufacturing_date);
        if (formData.expiry_date) {
            form.append('expiry_date', formData.expiry_date);
        }
        if (formData.notes.trim()) {
            form.append('notes', formData.notes.trim());
        }

        router.post('/manufacturing', form, {
            onSuccess: (response) => {
                setLoading(false);
                onClose();
                console.log('Manufacturing order created successfully:', response);
            },
            onError: (errors) => {
                setLoading(false);
                console.error('Error creating manufacturing order:', errors);
                
                // Handle Laravel validation errors
                if (errors && typeof errors === 'object') {
                    setValidationErrors(errors);
                } else {
                    alert('Error creating manufacturing order. Please try again.');
                }
            }
        });
    };

    const selectedProduct = products.find(p => p.id.toString() === formData.product_id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Create Manufacturing Order</h2>
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

                    <div className="grid grid-cols-1 gap-6">
                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Product <span className="text-red-600">*</span>
                            </label>
                            <select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.product_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="">Choose a product to manufacture</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.sku}) - Current Stock: {product.current_stock}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.product_id && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.product_id}</p>
                            )}
                        </div>

                        {/* Production Quantity */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Production Quantity <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                name="production_quantity"
                                value={formData.production_quantity}
                                onChange={handleChange}
                                min="1"
                                placeholder="Enter quantity to produce"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.production_quantity ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {validationErrors.production_quantity && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.production_quantity}</p>
                            )}
                        </div>

                        {/* Manufacturing Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Manufacturing Date <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                name="manufacturing_date"
                                value={formData.manufacturing_date}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.manufacturing_date ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
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
                                name="expiry_date"
                                value={formData.expiry_date}
                                onChange={handleChange}
                                min={formData.manufacturing_date}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.expiry_date ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {validationErrors.expiry_date && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.expiry_date}</p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Enter any additional notes or instructions..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Preview Information */}
                        {selectedProduct && formData.production_quantity && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Order Preview:</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Product:</span> {selectedProduct.name}</p>
                                    <p><span className="font-medium">Current Stock:</span> {selectedProduct.current_stock}</p>
                                    <p><span className="font-medium">Production Quantity:</span> {formData.production_quantity}</p>
                                    <p><span className="font-medium">Stock After Production:</span> {parseInt(selectedProduct.current_stock) + parseInt(formData.production_quantity || 0)}</p>
                                    <p><span className="font-medium">Batch Number:</span> Will be auto-generated</p>
                                </div>
                            </div>
                        )}
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
                            {loading ? 'Creating Order...' : 'Create Manufacturing Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}