import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Barcode from 'react-barcode';
import { FiPrinter, FiArrowLeft, FiTrash2 } from 'react-icons/fi';

export default function BatchShow({ batch }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this batch?')) {
            router.delete(`/batches/${batch.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Batch - ${batch.batch_number}`} />

            <div className="bg-gray-50 min-h-screen py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/batches"
                                className="text-3xl font-bold text-gray-700 hover:text-gray-900"
                            >
                                ‹
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Batch Details</h1>
                                <p className="text-sm text-gray-500 font-mono">{batch.batch_number}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Link
                                href={`/batches/${batch.id}/print`}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition"
                            >
                                <FiPrinter className="w-4 h-4" />
                                <span>Print Label</span>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition"
                            >
                                <FiTrash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Batch Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                Batch Information
                            </h2>
                            <dl className="space-y-4">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Batch Number</dt>
                                    <dd className="text-sm font-mono font-semibold text-gray-900">{batch.batch_number}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Product Code</dt>
                                    <dd className="text-sm font-mono text-gray-900">{batch.product_code}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Serial Number</dt>
                                    <dd className="text-sm font-mono text-gray-900">#{String(batch.serial_number).padStart(3, '0')}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Quantity</dt>
                                    <dd className="text-sm font-semibold text-gray-900">{batch.quantity}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Manufacturing Date</dt>
                                    <dd className="text-sm text-gray-900">{formatDate(batch.manufacturing_date)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Expiry Date</dt>
                                    <dd className={`text-sm ${batch.expiry_date ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                                        {formatDate(batch.expiry_date)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Product Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                Product Information
                            </h2>
                            <dl className="space-y-4">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Product Name</dt>
                                    <dd className="text-sm font-semibold text-gray-900">{batch.product.name}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">SKU</dt>
                                    <dd className="text-sm font-mono text-gray-900">{batch.product.sku}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Category</dt>
                                    <dd className="text-sm text-gray-900">{batch.product.category || 'N/A'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Unit</dt>
                                    <dd className="text-sm text-gray-900">{batch.product.unit || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Label Status */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                Label Status
                            </h2>
                            <dl className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <dt className="text-sm text-gray-500">Print Status</dt>
                                    <dd>
                                        {batch.label_printed ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Printed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Not Printed
                                            </span>
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Times Printed</dt>
                                    <dd className="text-sm text-gray-900">{batch.label_print_count}</dd>
                                </div>
                                {batch.manufacturing_order_id && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Manufacturing Order</dt>
                                        <dd className="text-sm">
                                            <Link 
                                                href={`/manufacturing/${batch.manufacturing_order_id}`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                View Order →
                                            </Link>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Barcode Preview */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                Barcode Preview
                            </h2>
                            <div className="flex flex-col items-center justify-center py-4">
                                <Barcode
                                    value={batch.batch_number}
                                    width={2}
                                    height={80}
                                    fontSize={14}
                                    displayValue={true}
                                    font="monospace"
                                    textAlign="center"
                                    textPosition="bottom"
                                    textMargin={6}
                                />
                                <p className="text-xs text-gray-500 mt-4">
                                    Scan this barcode to identify the batch
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {batch.notes && (
                        <div className="mt-6 bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                Notes
                            </h2>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{batch.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
