import React, { useState } from 'react';

export default function BatchTraceabilitySearch({ onBatchSelect, isLoading }) {
    const [searchInput, setSearchInput] = useState('');
    const [error, setError] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        setError('');

        if (!searchInput.trim()) {
            setError('Please enter a batch ID or batch number');
            return;
        }

        onBatchSelect(searchInput.trim());
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">🔍 Search Batch</h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Batch ID or Batch Number
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., JUICE-20260217-001 or batch ID: 5"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition"
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-600 text-sm mt-2 font-semibold">❌ {error}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-1">📌 Format 1: Batch Number</p>
                        <p className="text-xs text-blue-700 font-mono">JUICE-20260217-001</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-green-900 mb-1">📌 Format 2: Batch ID</p>
                        <p className="text-xs text-green-700 font-mono">5</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-purple-900 mb-1">📌 Use Case</p>
                        <p className="text-xs text-purple-700">Scan barcode or enter manually</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
