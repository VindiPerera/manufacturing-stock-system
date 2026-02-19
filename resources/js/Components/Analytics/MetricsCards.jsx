import React from 'react';

export default function MetricsCards({ metrics, onCardClick }) {
    const cards = [
        {
            id: 'manufactured',
            title: 'Total Manufactured Today',
            value: metrics?.totalManufacturedToday?.quantity || 0,
            label: `${metrics?.totalManufacturedToday?.count || 0} batches`,
            icon: '🏭',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
        },
        {
            id: 'stock',
            title: 'Live Store Stock',
            value: metrics?.liveStoreStock?.total_quantity || 0,
            label: `Across ${metrics?.liveStoreStock?.total_batches || 0} batches`,
            icon: '📦',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-500',
            textColor: 'text-green-600',
            iconBg: 'bg-green-100',
        },
        {
            id: 'sales',
            title: 'Sales Today',
            value: metrics?.salesToday?.quantity || 0,
            label: `${metrics?.salesToday?.count || 0} transactions`,
            icon: '💰',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-500',
            textColor: 'text-purple-600',
            iconBg: 'bg-purple-100',
        },
        {
            id: 'lowStock',
            title: 'Low Stock Alerts',
            value: metrics?.lowStockCount || 0,
            label: 'Products below minimum',
            icon: '⚠️',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-500',
            textColor: 'text-red-600',
            iconBg: 'bg-red-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
                <div
                    key={card.id}
                    onClick={() => onCardClick && onCardClick(card.id)}
                    className={`${card.bgColor} rounded-xl border-l-4 ${card.borderColor} shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer hover:scale-105 transform`}
                >
                    {/* Icon */}
                    <div className={`${card.iconBg} w-14 h-14 rounded-lg flex items-center justify-center text-2xl mb-4`}>
                        {card.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                        {card.title}
                    </h3>

                    {/* Main Value */}
                    <div className="mb-2">
                        <p className={`text-4xl font-bold ${card.textColor}`}>
                            {Number(card.value).toLocaleString()}
                        </p>
                    </div>

                    {/* Sub Label */}
                    <p className="text-xs text-slate-600 font-medium">
                        {card.label}
                    </p>
                    
                    {/* Click indicator */}
                    <p className="text-xs text-slate-500 mt-4 font-medium">
                        Click to view details →
                    </p>
                </div>
            ))}
        </div>
    );
}
