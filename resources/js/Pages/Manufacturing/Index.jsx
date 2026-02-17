import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import AddManufacturingOrderModal from '@/Components/AddManufacturingOrderModal';

export default function ManufacturingIndex({ manufacturingOrders: initialOrders = [], products = [], flash = {} }) {
    const [orders, setOrders] = useState(initialOrders);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        product: '',
        date: '',
    });

    // Check for new order from flash data and add it dynamically
    useEffect(() => {
        if (flash.newOrder) {
            setOrders(prev => {
                // Avoid duplicates by checking if order already exists
                const exists = prev.some(o => o.id === flash.newOrder.id);
                if (!exists) {
                    return [flash.newOrder, ...prev];
                }
                return prev;
            });
        }
    }, [flash]);

    // Get unique statuses
    const statuses = useMemo(() => {
        return [...new Set(orders.map(o => o.status))].filter(Boolean);
    }, [orders]);

    // Filter orders based on search and filters
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = 
                order.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.product.sku.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = !filters.status || order.status === filters.status;
            const matchesProduct = !filters.product || order.product.id.toString() === filters.product;

            return matchesSearch && matchesStatus && matchesProduct;
        });
    }, [orders, searchQuery, filters]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilters({ status: '', product: '', date: '' });
    };

    const handleDeleteOrder = (orderId) => {
        if (confirm('Are you sure you want to delete this manufacturing order?')) {
            router.delete(`/manufacturing/${orderId}`, {
                onSuccess: () => {
                    setOrders(orders.filter(o => o.id !== orderId));
                }
            });
        }
    };

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
           
        >
            <Head title="Manufacturing" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.visit('/dashboard')}
                                className="text-3xl font-bold text-gray-700 hover:text-gray-900"
                            >
                                ‹
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">MANUFACTURING</h1>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                {filteredOrders.length}
                            </div>
                            <span className="text-gray-700 font-semibold">/ Total Orders</span>
                        </div>
                    </div>

                    {/* Search Bar and Add Order Button Row */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search by batch number, product name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition"
                        >
                            <span>+</span>
                            <span>CREATE ORDER</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mb-8">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Filter by Status</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {getStatusText(status)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.product}
                            onChange={(e) => handleFilterChange('product', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Filter by Product</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                </option>
                            ))}
                        </select>

                        {(filters.status || filters.product || searchQuery) && (
                            <button
                                onClick={handleResetFilters}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Orders Grid */}
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">No manufacturing orders found</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white border-2 border-black rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 truncate">
                                                {order.batch_number}
                                            </h3>
                                            <div className={`${getStatusColor(order.status)} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                                                {getStatusText(order.status)}
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {order.product.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            SKU: {order.product.sku}
                                        </p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Quantity:</span>
                                            <span className="font-medium">{order.production_quantity}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Stock Change:</span>
                                            <span className="font-medium text-green-600">
                                                {order.stock_before} → {order.stock_after}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Mfg Date:</span>
                                            <span className="font-medium">{order.manufacturing_date}</span>
                                        </div>

                                        {order.expiry_date && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Exp Date:</span>
                                                <span className="font-medium">{order.expiry_date}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="bg-black text-white p-3">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => router.visit(`/manufacturing/${order.id}`)}
                                                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition"
                                                title="View"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Manufacturing Order Modal */}
            {showAddModal && (
                <AddManufacturingOrderModal 
                    products={products}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}