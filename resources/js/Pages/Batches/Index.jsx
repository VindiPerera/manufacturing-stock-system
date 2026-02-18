import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import Barcode from 'react-barcode';
import { FiPrinter, FiSearch, FiTrash2, FiEye, FiCheck, FiFilter } from 'react-icons/fi';

export default function BatchIndex({ batches: initialBatches = [], stats = {}, filters: initialFilters = {} }) {
    const [batches, setBatches] = useState(initialBatches);
    const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [filters, setFilters] = useState({
        printed: initialFilters.printed || '',
        dateFrom: initialFilters.date_from || '',
        dateTo: initialFilters.date_to || '',
    });

    // Filter batches based on search
    const filteredBatches = useMemo(() => {
        return batches.filter(batch => {
            const matchesSearch = 
                batch.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                batch.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                batch.product.sku.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [batches, searchQuery]);

    const handleSelectAll = () => {
        if (selectedBatches.length === filteredBatches.length) {
            setSelectedBatches([]);
        } else {
            setSelectedBatches(filteredBatches.map(b => b.id));
        }
    };

    const handleSelectBatch = (batchId) => {
        setSelectedBatches(prev => 
            prev.includes(batchId) 
                ? prev.filter(id => id !== batchId)
                : [...prev, batchId]
        );
    };

    const handlePrintSelected = () => {
        if (selectedBatches.length === 0) return;
        
        router.post('/batches/print-multiple', {
            batch_ids: selectedBatches,
        });
    };

    const handleMarkSelectedPrinted = () => {
        if (selectedBatches.length === 0) return;
        
        router.post('/batches/mark-multiple-printed', {
            batch_ids: selectedBatches,
        }, {
            onSuccess: () => {
                setBatches(prev => prev.map(batch => 
                    selectedBatches.includes(batch.id) 
                        ? { ...batch, label_printed: true, label_print_count: batch.label_print_count + 1 }
                        : batch
                ));
                setSelectedBatches([]);
            }
        });
    };

    const handleDeleteBatch = (batchId) => {
        if (confirm('Are you sure you want to delete this batch?')) {
            router.delete(`/batches/${batchId}`, {
                onSuccess: () => {
                    setBatches(prev => prev.filter(b => b.id !== batchId));
                }
            });
        }
    };

    const handleApplyFilters = () => {
        router.get('/batches', {
            search: searchQuery,
            printed: filters.printed,
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
        }, {
            preserveState: true,
        });
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilters({ printed: '', dateFrom: '', dateTo: '' });
        router.get('/batches');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Batch & Labeling" />

            <div className="bg-gray-50 min-h-screen py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.visit('/dashboard')}
                                className="text-3xl font-bold text-gray-700 hover:text-gray-900"
                            >
                                ‹
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">BATCH & LABELING</h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                    {filteredBatches.length}
                                </div>
                                <span className="text-gray-700 font-semibold">/ Total Batches</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                            <div className="text-sm text-gray-500">Total Batches</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.today || 0}</div>
                            <div className="text-sm text-gray-500">Created Today</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-yellow-600">{stats.unprinted || 0}</div>
                            <div className="text-sm text-gray-500">Labels Not Printed</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.expiring_soon || 0}</div>
                            <div className="text-sm text-gray-500">Expiring Soon</div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by batch number, product name or SKU..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Printed Filter */}
                            <select
                                value={filters.printed}
                                onChange={(e) => setFilters(prev => ({ ...prev, printed: e.target.value }))}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Labels</option>
                                <option value="false">Not Printed</option>
                                <option value="true">Printed</option>
                            </select>

                            {/* Date From */}
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="From Date"
                            />

                            {/* Date To */}
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="To Date"
                            />

                            <button
                                onClick={handleApplyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <FiFilter /> Apply
                            </button>

                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedBatches.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                            <span className="text-blue-700 font-medium">
                                {selectedBatches.length} batch(es) selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrintSelected}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <FiPrinter /> Print Labels
                                </button>
                                <button
                                    onClick={handleMarkSelectedPrinted}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <FiCheck /> Mark as Printed
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Batch Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedBatches.length === filteredBatches.length && filteredBatches.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Batch Number
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mfg Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expiry Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Label Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBatches.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                            No batches found. Batches are automatically created when manufacturing orders are placed.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBatches.map((batch) => (
                                        <tr key={batch.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBatches.includes(batch.id)}
                                                    onChange={() => handleSelectBatch(batch.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-semibold text-gray-900">
                                                        {batch.batch_number}
                                                    </span>
                                                    <div className="mt-1 transform scale-75 origin-left">
                                                        <Barcode 
                                                            value={batch.batch_number}
                                                            width={1}
                                                            height={25}
                                                            fontSize={8}
                                                            displayValue={false}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">{batch.product.name}</div>
                                                <div className="text-xs text-gray-500">{batch.product.sku}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {batch.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {batch.manufacturing_date}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {batch.expiry_date ? (
                                                    <span className={`${
                                                        new Date(batch.expiry_date) <= new Date(Date.now() + 30*24*60*60*1000)
                                                            ? 'text-red-600 font-medium'
                                                            : 'text-gray-900'
                                                    }`}>
                                                        {batch.expiry_date}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {batch.label_printed ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Printed ({batch.label_print_count}x)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Not Printed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/batches/${batch.id}/print`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Print Label"
                                                    >
                                                        <FiPrinter className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/batches/${batch.id}`}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteBatch(batch.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
