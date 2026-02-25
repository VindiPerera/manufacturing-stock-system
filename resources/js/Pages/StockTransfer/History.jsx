import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import React from 'react';
import { FiSearch, FiPackage, FiArrowLeft } from 'react-icons/fi';

export default function History({ auth, transfers: initialTransfers = {}, stats = {}, filters: initialFilters = {} }) {
    const [expandedTransfer, setExpandedTransfer] = useState(null);
    const [filters, setFilters] = useState({
        dateFrom: initialFilters.date_from || '',
        dateTo: initialFilters.date_to || '',
        searchQuery: initialFilters.search_query || '',
        status: initialFilters.status || '',
    });

    const handleSearch = () => {
        router.get('/stock-transfers/history', {
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
            search_query: filters.searchQuery,
            status: filters.status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFilters({
            dateFrom: '',
            dateTo: '',
            searchQuery: '',
            status: '',
        });
        router.get('/stock-transfers/history');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

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

    const transfers = initialTransfers.data || initialTransfers;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Transfer History" />

            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.visit('/stock-transfers')}
                                className="text-3xl font-bold text-gray-700 hover:text-gray-900"
                            >
                                ‹
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">TRANSFER HISTORY</h1>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_transfers || 0}</div>
                            <div className="text-sm text-gray-500">Total Transfers</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.completed_transfers || 0}</div>
                            <div className="text-sm text-gray-500">Completed Transfers</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-purple-600">{stats.pending_transfers || 0}</div>
                            <div className="text-sm text-gray-500">Pending Transfers</div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-lg shadow p-4 mb-8">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={filters.searchQuery}
                                        onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Search by transfer #, batch #, or store..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Transfers Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date/Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transfer #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Batch #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Store
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Items
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transferred By
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transfers && transfers.length > 0 ? (
                                        transfers.map((transfer) => (
                                            <React.Fragment key={transfer.id}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {transfer.transfer_date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {transfer.transfer_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                        {transfer.batch_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div>
                                                            <p className="font-medium">{transfer.store.name}</p>
                                                            <p className="text-gray-500 text-xs">{transfer.store.location}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {transfer.total_items}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                                                            {transfer.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {transfer.transferred_by}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <button
                                                            onClick={() => toggleExpand(transfer.id)}
                                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                                        >
                                                            {expandedTransfer === transfer.id ? 'Hide Details' : 'View Details'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedTransfer === transfer.id && (
                                                    <tr>
                                                        <td colSpan="8" className="px-6 py-4 bg-gray-50">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-3">Transfer Items:</h4>
                                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                                                                                {transfer.items.map((item, index) => (
                                                                                    <tr key={index}>
                                                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                                                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.product_sku}</td>
                                                                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.batch_number}</td>
                                                                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{item.quantity}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                {transfer.notes && (
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                                                                        <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                                                                            {transfer.notes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <FiPackage className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500">No transfers found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {initialTransfers.links && initialTransfers.links.length > 3 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {initialTransfers.from} to {initialTransfers.to} of {initialTransfers.total} results
                                    </div>
                                    <div className="flex gap-1">
                                        {initialTransfers.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
