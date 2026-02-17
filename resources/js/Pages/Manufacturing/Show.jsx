import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function ManufacturingShow({ manufacturingOrder }) {
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500',
            in_progress: 'bg-blue-500',
            completed: 'bg-green-500',
            cancelled: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return texts[status] || status;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Manufacturing Order Details
                    </h2>
                </div>
            }
        >
            <Head title={`Manufacturing Order - ${manufacturingOrder.batch_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <button 
                            onClick={() => router.visit('/manufacturing')}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Manufacturing Orders
                        </button>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {manufacturingOrder.batch_number}
                                </h1>
                                <div className={`${getStatusColor(manufacturingOrder.status)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                                    {getStatusText(manufacturingOrder.status)}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Product Information
                                </h3>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Product Name</label>
                                    <p className="text-lg font-semibold">{manufacturingOrder.product.name}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">SKU</label>
                                    <p className="text-lg">{manufacturingOrder.product.sku}</p>
                                </div>
                            </div>

                            {/* Production Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Production Details
                                </h3>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Production Quantity</label>
                                    <p className="text-lg font-semibold text-green-600">{manufacturingOrder.production_quantity}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Stock Before</label>
                                    <p className="text-lg">{manufacturingOrder.stock_before}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Stock After</label>
                                    <p className="text-lg font-semibold">{manufacturingOrder.stock_after}</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Important Dates
                                </h3>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Manufacturing Date</label>
                                    <p className="text-lg">{manufacturingOrder.manufacturing_date}</p>
                                </div>

                                {manufacturingOrder.expiry_date && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                                        <p className="text-lg">{manufacturingOrder.expiry_date}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Created At</label>
                                    <p className="text-lg">{new Date(manufacturingOrder.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Additional Information
                                </h3>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Order ID</label>
                                    <p className="text-lg">#{manufacturingOrder.id}</p>
                                </div>

                                {manufacturingOrder.notes && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Notes</label>
                                        <div className="bg-gray-50 p-3 rounded border mt-1">
                                            <p className="text-gray-700">{manufacturingOrder.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-50 px-6 py-4 border-t">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => window.print()}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Label
                                </button>
                                
                                <button
                                    onClick={() => router.delete(`/manufacturing/${manufacturingOrder.id}`, {
                                        onBefore: () => confirm('Are you sure you want to delete this manufacturing order?'),
                                        onSuccess: () => router.visit('/manufacturing')
                                    })}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}