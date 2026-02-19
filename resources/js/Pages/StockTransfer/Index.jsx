import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, batches, stores }) {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    
    const { data, setData, post, processing, errors, reset } = useForm({
        batch_number: '',
        to_store_id: '',
        transfer_date: new Date().toISOString().split('T')[0],
        items: [],
        notes: '',
    });

    const handleSelectBatch = (batch) => {
        setSelectedBatch(batch);
        setData('batch_number', batch.batch_number);
        
        // Initialize all items as selected with their full available quantity
        const items = {};
        batch.products.forEach(product => {
            items[product.batch_id] = {
                selected: true,
                quantity: product.available_quantity,
                max: product.available_quantity,
            };
        });
        setSelectedItems(items);
    };

    const handleItemToggle = (batchId) => {
        setSelectedItems(prev => ({
            ...prev,
            [batchId]: {
                ...prev[batchId],
                selected: !prev[batchId].selected,
            },
        }));
    };

    const handleQuantityChange = (batchId, value) => {
        const quantity = parseInt(value) || 0;
        setSelectedItems(prev => ({
            ...prev,
            [batchId]: {
                ...prev[batchId],
                quantity: Math.min(Math.max(0, quantity), prev[batchId].max),
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedBatch) {
            alert('Please select a batch');
            return;
        }

        if (!data.to_store_id) {
            alert('Please select a store');
            return;
        }

        // Build items array from selected items
        const items = selectedBatch.products
            .filter(product => selectedItems[product.batch_id]?.selected && selectedItems[product.batch_id]?.quantity > 0)
            .map(product => ({
                batch_id: product.batch_id,
                product_id: product.product_id,
                quantity_transferred: selectedItems[product.batch_id].quantity,
            }));

        if (items.length === 0) {
            alert('Please select at least one product with quantity > 0');
            return;
        }

        setData('items', items);
        
        // Submit the form
        post(route('stock-transfers.store'), {
            data: {
                ...data,
                items,
            },
            onSuccess: () => {
                reset();
                setSelectedBatch(null);
                setSelectedItems({});
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Transfer</h2>}
        >
            <Head title="Stock Transfer" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Panel - Available Batches */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">Available Batches</h3>
                            </div>
                            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                                {batches.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No batches available for transfer</p>
                                ) : (
                                    batches.map((batch) => (
                                        <div
                                            key={batch.batch_number}
                                            onClick={() => handleSelectBatch(batch)}
                                            className={`border rounded-lg p-4 cursor-pointer transition ${
                                                selectedBatch?.batch_number === batch.batch_number
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{batch.batch_number}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Manufacturing Date: {batch.manufacturing_date}
                                                    </p>
                                                    {batch.expiry_date && (
                                                        <p className="text-sm text-gray-600">
                                                            Expiry Date: {batch.expiry_date}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    {batch.available_quantity} Available
                                                </span>
                                            </div>
                                            <div className="mt-3 space-y-1">
                                                <p className="text-sm font-medium text-gray-700">Products:</p>
                                                {batch.products.map((product, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm text-gray-600 pl-2">
                                                        <span>{product.product_name} ({product.product_sku})</span>
                                                        <span>{product.available_quantity} units</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Panel - Transfer Form */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">Transfer Details</h3>
                            </div>
                            <div className="p-6">
                                {!selectedBatch ? (
                                    <p className="text-gray-500 text-center py-16">Select a batch to start transfer</p>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Batch Information */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Batch
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <p className="font-semibold">{selectedBatch.batch_number}</p>
                                                <p className="text-sm text-gray-600">
                                                    Available: {selectedBatch.available_quantity} units
                                                </p>
                                            </div>
                                        </div>

                                        {/* Products Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Products & Quantities
                                            </label>
                                            <div className="space-y-3">
                                                {selectedBatch.products.map((product) => (
                                                    <div
                                                        key={product.batch_id}
                                                        className="border border-gray-200 rounded p-3"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedItems[product.batch_id]?.selected || false}
                                                                onChange={() => handleItemToggle(product.batch_id)}
                                                                className="mt-1"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">
                                                                    {product.product_name}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    SKU: {product.product_sku} | Available: {product.available_quantity}
                                                                </p>
                                                                {selectedItems[product.batch_id]?.selected && (
                                                                    <div className="mt-2">
                                                                        <label className="block text-sm text-gray-700 mb-1">
                                                                            Quantity to Transfer
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max={product.available_quantity}
                                                                            value={selectedItems[product.batch_id]?.quantity || 0}
                                                                            onChange={(e) => handleQuantityChange(product.batch_id, e.target.value)}
                                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Store Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Destination Store *
                                            </label>
                                            <select
                                                value={data.to_store_id}
                                                onChange={(e) => setData('to_store_id', e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Select Store</option>
                                                {stores.map((store) => (
                                                    <option key={store.id} value={store.id}>
                                                        {store.name} - {store.location}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.to_store_id && (
                                                <p className="text-red-500 text-sm mt-1">{errors.to_store_id}</p>
                                            )}
                                        </div>

                                        {/* Transfer Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Transfer Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={data.transfer_date}
                                                onChange={(e) => setData('transfer_date', e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            {errors.transfer_date && (
                                                <p className="text-red-500 text-sm mt-1">{errors.transfer_date}</p>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows="3"
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Add any notes about this transfer..."
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
                                            >
                                                {processing ? 'Processing...' : 'Complete Transfer'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedBatch(null);
                                                    setSelectedItems({});
                                                    reset();
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        {errors.error && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                                {errors.error}
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
