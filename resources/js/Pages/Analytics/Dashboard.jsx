import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import MetricsCards from '@/Components/Analytics/MetricsCards';
import ExpiryAlertsTable from '@/Components/Analytics/ExpiryAlertsTable';
import LowStockAlertsTable from '@/Components/Analytics/LowStockAlertsTable';
import DashboardChart from '@/Components/Analytics/DashboardChart';
import ManufacturedDetailsModal from '@/Components/Analytics/ManufacturedDetailsModal';
import StoreStockModal from '@/Components/Analytics/StoreStockModal';
import SalesDetailsModal from '@/Components/Analytics/SalesDetailsModal';
import LowStockModal from '@/Components/Analytics/LowStockModal';

export default function Dashboard({ metrics, expiringBatches, lowStockAlerts }) {
    const [activeModal, setActiveModal] = useState(null);
    const [manufacturedBatches, setManufacturedBatches] = useState([]);
    const [storeStockBatches, setStoreStockBatches] = useState([]);
    const [salesTransactions, setSalesTransactions] = useState([]);

    useEffect(() => {
        // Fetch all detail data on component mount
        fetchAllDetails();
    }, []);

    const fetchAllDetails = async () => {
        try {
            const [manufactured, storeStock, sales] = await Promise.all([
                fetch('/api/analytics/manufactured-details').then(r => r.json()),
                fetch('/api/analytics/store-stock-details').then(r => r.json()),
                fetch('/api/analytics/sales-details').then(r => r.json()),
            ]);

            if (manufactured.success) setManufacturedBatches(manufactured.data);
            if (storeStock.success) setStoreStockBatches(storeStock.data);
            if (sales.success) setSalesTransactions(sales.data);
        } catch (error) {
            console.error('Error fetching analytics details:', error);
        }
    };

    const handleCardClick = (cardId) => {
        setActiveModal(cardId);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Analytics & Dashboard" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            Manufacturing Analytics Dashboard
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Real-time insights from Manufacturing, Batch & Stock-Out modules
                        </p>
                    </div>

                    {/* KEY METRICS CARDS - Top Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Today's Key Metrics</h2>
                        <MetricsCards metrics={metrics} onCardClick={handleCardClick} />
                    </div>

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <DashboardChart />
                    </div>

                    {/* EXPIRY ALERTS - Middle Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">
                                🚨 Batches Expiring Soon (Next 7 Days)
                            </h2>
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {expiringBatches?.length || 0} Batches
                            </span>
                        </div>
                        <ExpiryAlertsTable batches={expiringBatches || []} />
                    </div>

                    {/* LOW STOCK ALERTS - Bottom Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">
                                ⚠️ Low Stock Alerts
                            </h2>
                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {lowStockAlerts?.length || 0} Products
                            </span>
                        </div>
                        <LowStockAlertsTable products={lowStockAlerts || []} />
                    </div>

                    {/* Quick Actions Footer */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link
                                href="/manufacturing"
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-center transition"
                            >
                                📦 Manufacturing
                            </Link>
                            <Link
                                href="/batches"
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-center transition"
                            >
                                🏷️ Batches & Labels
                            </Link>
                            <Link
                                href="/stock-out"
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-center transition"
                            >
                                📤 Stock Out
                            </Link>
                            <Link
                                href="/products"
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-center transition"
                            >
                                📋 Products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ManufacturedDetailsModal
                isOpen={activeModal === 'manufactured'}
                onClose={closeModal}
                quantity={metrics?.totalManufacturedToday?.quantity ?? 0}
                batchCount={metrics?.totalManufacturedToday?.count ?? 0}
                batches={manufacturedBatches}
            />

            <StoreStockModal
                isOpen={activeModal === 'stock'}
                onClose={closeModal}
                totalQuantity={metrics?.liveStoreStock?.total_quantity ?? 0}
                totalBatches={metrics?.liveStoreStock?.total_batches ?? 0}
                initialQuantity={metrics?.liveStoreStock?.initial_quantity ?? 0}
                soldQuantity={metrics?.liveStoreStock?.sold_quantity ?? 0}
                batches={storeStockBatches}
            />

            <SalesDetailsModal
                isOpen={activeModal === 'sales'}
                onClose={closeModal}
                transactionCount={metrics?.salesToday?.count ?? 0}
                quantitySold={metrics?.salesToday?.quantity ?? 0}
                transactions={salesTransactions}
            />

            <LowStockModal
                isOpen={activeModal === 'lowStock'}
                onClose={closeModal}
                products={lowStockAlerts}
            />
        </AuthenticatedLayout>
    );
}
