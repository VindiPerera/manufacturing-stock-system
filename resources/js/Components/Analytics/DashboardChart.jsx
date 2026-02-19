import React from 'react';

export default function DashboardChart() {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Daily Manufacturing Trend</h3>
            
            {/* PLACEHOLDER CHART */}
            <div className="w-full h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                <div className="text-center">
                    <p className="text-slate-600 text-lg font-semibold mb-2">📊 Chart Visualization</p>
                    <p className="text-slate-500 text-sm">
                        Connect Chart.js, Recharts, or ApexCharts here
                    </p>
                    <p className="text-slate-400 text-xs mt-4">
                        Recommended: Show manufacturing quantity, sales, and stock levels over time
                    </p>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-blue-900">
                    <strong>💡 Implementation Tip:</strong> Use Recharts or ApexCharts for interactive charts.
                    Display: Manufacturing orders created, batches produced, and sales per hour/day.
                </p>
            </div>
        </div>
    );
}
