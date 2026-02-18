import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiPackage, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiClock, FiBox, FiSearch } from 'react-icons/fi';

export default function Scanner({ recentTransactions = [], todayStats = {} }) {
    const [scanInput, setScanInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [transactions, setTransactions] = useState(recentTransactions);
    const [stats, setStats] = useState(todayStats);
    const inputRef = useRef(null);

    // Auto-focus input on mount and after each scan
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Focus input when clicking anywhere on the scan area
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    // Handle the scan submission
    const handleScan = useCallback(async () => {
        const batchId = scanInput.trim();
        
        if (!batchId || isProcessing) return;

        setIsProcessing(true);
        setScanInput(''); // Clear input immediately for next scan

        try {
            const response = await axios.post('/stock-out/scan', { batch_id: batchId });

            const data = response.data;

            if (data.success) {
                // Success result
                setLastResult({
                    type: 'success',
                    message: data.message,
                    warning: data.warning,
                    batch: data.batch,
                });

                // Add to recent transactions
                setTransactions(prev => [{
                    id: Date.now(),
                    batch_number: data.batch.batch_number,
                    product_name: data.batch.product_name,
                    quantity: data.batch.deducted,
                    created_at: new Date().toLocaleString(),
                    time_ago: 'Just now',
                }, ...prev.slice(0, 19)]);

                // Update stats
                setStats(prev => ({
                    ...prev,
                    total_scans: (prev.total_scans || 0) + 1,
                    total_quantity: (prev.total_quantity || 0) + data.batch.deducted,
                }));

                // Play success sound
                playSound('success');
            } else {
                // Error result
                setLastResult({
                    type: 'error',
                    error: data.error,
                    message: data.message,
                    batch: data.batch,
                });

                // Play error sound
                playSound('error');
            }
        } catch (error) {
            const errData = error.response?.data;
            if (errData && errData.success === false) {
                setLastResult({
                    type: 'error',
                    error: errData.error,
                    message: errData.message,
                    batch: errData.batch,
                });
            } else {
                setLastResult({
                    type: 'error',
                    error: 'network_error',
                    message: 'Network error. Please check your connection.',
                });
            }
            playSound('error');
        } finally {
            setIsProcessing(false);
            // Re-focus input for next scan
            inputRef.current?.focus();
        }
    }, [scanInput, isProcessing]);

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleScan();
        }
    };

    // Simple sound feedback (uses Web Audio API)
    const playSound = (type) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'success') {
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.1;
            } else {
                oscillator.frequency.value = 300;
                oscillator.type = 'square';
                gainNode.gain.value = 0.1;
            }

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) {
            // Audio not supported, silently fail
        }
    };

    // Clear result after timeout
    useEffect(() => {
        if (lastResult) {
            const timer = setTimeout(() => {
                setLastResult(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [lastResult]);

    return (
        <AuthenticatedLayout>
            <Head title="Barcode Scanning" />

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
                            <h1 className="text-3xl font-bold text-gray-900">BARCODE SCANNING</h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <a 
                                href="/stock-out/history" 
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <FiClock />
                                View History
                            </a>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_scans || 0}</div>
                            <div className="text-sm text-gray-500">Today's Scans</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.total_quantity || 0}</div>
                            <div className="text-sm text-gray-500">Items Out</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-purple-600">{stats.unique_batches || 0}</div>
                            <div className="text-sm text-gray-500">Unique Batches</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Scanner Area */}
                        <div className="lg:col-span-2">
                            {/* Scan Input Section */}
                            <div 
                                className="bg-white rounded-lg shadow p-8 cursor-text"
                                onClick={handleContainerClick}
                            >
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                        <FiPackage className="w-10 h-10 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Ready to Scan
                                    </h2>
                                    <p className="text-gray-500">
                                        Scan a barcode or type a Batch ID and press Enter
                                    </p>
                                </div>

                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Scan barcode here..."
                                        disabled={isProcessing}
                                        className={`w-full text-center text-xl font-mono py-4 pl-12 pr-12 rounded-lg border-2 
                                            ${isProcessing 
                                                ? 'bg-gray-100 border-gray-300 text-gray-400' 
                                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                            } 
                                            placeholder-gray-400 outline-none transition-all`}
                                        autoComplete="off"
                                        autoFocus
                                    />
                                    {isProcessing && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-center text-gray-400 text-sm mt-4">
                                    Input auto-clears after each scan
                                </p>
                            </div>

                            {/* Result Display */}
                            {lastResult && (
                                <div className={`mt-6 rounded-lg shadow p-6 transition-all animate-fadeIn
                                    ${lastResult.type === 'success' 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'bg-red-50 border border-red-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {lastResult.type === 'success' ? (
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FiCheckCircle className="w-6 h-6 text-green-600" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FiAlertCircle className="w-6 h-6 text-red-600" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold mb-2 
                                                ${lastResult.type === 'success' ? 'text-green-700' : 'text-red-700'}`}
                                            >
                                                {lastResult.message}
                                            </h3>
                                            
                                            {lastResult.warning && (
                                                <div className="flex items-center gap-2 text-yellow-600 mb-3 bg-yellow-50 p-2 rounded">
                                                    <FiAlertTriangle />
                                                    <span>{lastResult.warning}</span>
                                                </div>
                                            )}

                                            {lastResult.batch && (
                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-gray-500 text-sm">Product</p>
                                                        <p className="text-gray-900 font-medium">{lastResult.batch.product_name}</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-gray-500 text-sm">Batch Number</p>
                                                        <p className="text-gray-900 font-mono">{lastResult.batch.batch_number}</p>
                                                    </div>
                                                    {lastResult.type === 'success' && (
                                                        <>
                                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <p className="text-gray-500 text-sm">Deducted</p>
                                                                <p className="text-green-600 font-bold text-lg">-{lastResult.batch.deducted}</p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <p className="text-gray-500 text-sm">Remaining Stock</p>
                                                                <p className={`font-bold text-lg ${
                                                                    lastResult.batch.current_quantity <= 10 
                                                                        ? 'text-yellow-600' 
                                                                        : 'text-gray-900'
                                                                }`}>
                                                                    {lastResult.batch.current_quantity}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                    {lastResult.type === 'error' && lastResult.batch?.current_quantity !== undefined && (
                                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                            <p className="text-gray-500 text-sm">Current Stock</p>
                                                            <p className="text-red-600 font-bold text-lg">{lastResult.batch.current_quantity}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Instructions */}
                            <div className="mt-6 bg-white rounded-lg shadow p-4">
                                <h4 className="text-gray-900 font-semibold mb-3">Quick Guide:</h4>
                                <ul className="text-gray-600 text-sm space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Point barcode scanner at the item label
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Scanner automatically inputs the Batch ID and presses Enter
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Wait for confirmation sound before scanning next item
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Check the result display for any warnings
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Recent Transactions Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                                        <FiClock className="text-gray-500" />
                                        Recent Scans
                                    </h3>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto">
                                    {transactions.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <FiBox className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500">No scans yet today</p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {transactions.map((tx, index) => (
                                                <li 
                                                    key={tx.id || index} 
                                                    className={`p-3 hover:bg-gray-50 transition-colors
                                                        ${index === 0 && lastResult?.type === 'success' ? 'bg-green-50' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-gray-900 font-medium truncate">
                                                                {tx.product_name}
                                                            </p>
                                                            <p className="text-gray-500 text-xs font-mono">
                                                                {tx.batch_number}
                                                            </p>
                                                        </div>
                                                        <div className="text-right ml-2">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                -{tx.quantity}
                                                            </span>
                                                            <p className="text-gray-400 text-xs mt-1">
                                                                {tx.time_ago}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {transactions.length > 0 && (
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                        <a 
                                            href="/stock-out/history" 
                                            className="text-blue-600 text-sm hover:text-blue-700 transition-colors font-medium"
                                        >
                                            View Full History →
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
