import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function ExpiryAlertsTable({ batches }) {
    const [expandedBatch, setExpandedBatch] = useState(null);

    if (!batches || batches.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-slate-600 text-lg">✅ No batches expiring in the next 7 days</p>
            </div>
        );
    }

    const getUrgencyColor = (urgency) => {
        const urgencyMap = {
            critical: { bg: 'bg-red-100', text: 'text-red-800', badge: '🔴 CRITICAL' },
            warning: { bg: 'bg-amber-100', text: 'text-amber-800', badge: '🟡 WARNING' },
            normal: { bg: 'bg-blue-100', text: 'text-blue-800', badge: '🔵 NORMAL' },
        };
        return urgencyMap[urgency] || urgencyMap.normal;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">Batch ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">Product</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">Expiry Date</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase">Days Left</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Current Qty</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {batches.map((batch) => {
                        const urgencyColor = getUrgencyColor(batch.urgency);
                        return (
                            <tr
                                key={batch.id}
                                className={`${
                                    batch.urgency === 'critical'
                                        ? 'bg-red-50 hover:bg-red-100'
                                        : batch.urgency === 'warning'
                                        ? 'bg-amber-50 hover:bg-amber-100'
                                        : 'hover:bg-slate-50'
                                } transition`}
                            >
                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                    <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                                        {batch.batch_number}
                                    </code>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-900">{batch.product_name}</p>
                                        <p className="text-xs text-slate-500">{batch.product_sku}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    {batch.expiry_date}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-right">
                                    <span className={`${urgencyColor.text} text-lg`}>
                                        {batch.days_until_expiry} days
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-center font-semibold text-slate-900">
                                    {batch.remaining_quantity} / {batch.initial_quantity}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`${urgencyColor.bg} ${urgencyColor.text} px-3 py-1 rounded-full text-xs font-bold`}>
                                        {urgencyColor.badge}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link
                                        href={`/analytics/batch/${batch.batch_number}`}
                                        className="text-blue-600 hover:text-blue-900 font-semibold text-sm underline"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* FIFO RECOMMENDATION */}
            <div className="bg-blue-50 border-t-2 border-blue-500 p-4">
                <p className="text-sm text-blue-900 font-semibold">
                    💡 <strong>FIFO Recommendation:</strong> The table is sorted by expiry date (soonest first). 
                    Sell batches at the top first to minimize loss.
                </p>
            </div>
        </div>
    );
}
