import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import React from 'react';

export default function History({ auth, transfers }) {
    const [expandedTransfer, setExpandedTransfer] = useState(null);

    const toggleExpand = (transferId) => {
        setExpandedTransfer(expandedTransfer === transferId ? null : transferId);
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Transfer History</h2>}
        >
            <Head title="Transfer History" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation Buttons */}
                    <div className="mb-6 flex gap-3 justify-end">
                        <Link
                            href={route('stock-transfers.index')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
                        >
                            New Transfer
                        </Link>
                        {/* <Link
                            href={route('stock-transfers.stores')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition"
                        >
                            Manage Stores
                        </Link> */}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">All Stock Transfers</h3>
                        </div>

                        {transfers.length === 0 ? (
                            <div className="p-6">
                                <p className="text-gray-500 text-center py-8">No transfers found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Transfer #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Batch #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Store
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Items
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Transferred By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transfers.map((transfer) => (
                                            <React.Fragment key={transfer.id}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {transfer.transfer_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transfer.batch_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div>
                                                            <p className="font-medium">{transfer.store.name}</p>
                                                            <p className="text-gray-500">{transfer.store.location}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transfer.transfer_date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transfer.total_items}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                                                            {transfer.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transfer.transferred_by}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => toggleExpand(transfer.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            {expandedTransfer === transfer.id ? 'Hide' : 'View'} Details
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedTransfer === transfer.id && (
                                                    <tr>
                                                        <td colSpan="8" className="px-6 py-4 bg-gray-50">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-2">Transfer Items:</h4>
                                                                    <div className="bg-white rounded border border-gray-200">
                                                                        <table className="min-w-full">
                                                                            <thead className="bg-gray-100">
                                                                                <tr>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Product</th>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">SKU</th>
                                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Batch #</th>
                                                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Quantity</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-gray-200">
                                                                                {transfer.items.map((item) => (
                                                                                    <tr key={`${transfer.id}-${item.batch_id}-${item.product_id}`}>
                                                                                        <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-600">{item.product_sku}</td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-600">{item.batch_number}</td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                {transfer.notes && (
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 mb-1">Notes:</h4>
                                                                        <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                                                            {transfer.notes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
