import { Head, router } from '@inertiajs/react';
import Barcode from 'react-barcode';

/**
 * PrintMultiple Component - Print multiple labels on a single page
 * Each label is designed for 4" x 2" sticky labels
 */
export default function PrintMultiple({ batches }) {
    const handlePrint = () => {
        // Mark all as printed
        router.post('/batches/mark-multiple-printed', {
            batch_ids: batches.map(b => b.id),
        }, {
            preserveState: true,
            onSuccess: () => {
                window.print();
            }
        });
    };

    const handleBack = () => {
        router.visit('/batches');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
            <Head title="Print Multiple Labels" />
            
            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        /* Hide non-printable elements */
                        .no-print {
                            display: none !important;
                        }
                        
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        
                        .print-area {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        
                        .label-item {
                            width: 4in !important;
                            height: 2in !important;
                            padding: 0.15in !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            border: 1px solid #ccc !important;
                            border-radius: 0 !important;
                            background: white !important;
                            page-break-inside: avoid;
                            page-break-after: always;
                        }
                        
                        .label-item:last-child {
                            page-break-after: auto;
                        }
                        
                        /* CRITICAL: Ensure barcode SVG prints correctly */
                        .label-item svg {
                            display: block !important;
                            visibility: visible !important;
                        }
                        
                        .label-item svg rect,
                        .label-item svg text {
                            visibility: visible !important;
                        }
                        
                        .label-item * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        @page {
                            size: 4in 2in;
                            margin: 0;
                        }
                    }
                `}
            </style>

            {/* Screen View - Controls */}
            <div className="no-print min-h-screen bg-gray-100 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={handleBack}
                                className="text-3xl font-bold text-gray-700 hover:text-gray-900"
                            >
                                ‹
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Print Multiple Labels</h1>
                                <p className="text-sm text-gray-500">{batches.length} labels selected</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Print All Labels</span>
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-800 mb-2">Printing Tips:</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Each label will print on a separate page (4" × 2")</li>
                            <li>• Load label paper before printing</li>
                            <li>• Use "Actual Size" or "100%" scale setting</li>
                        </ul>
                    </div>

                    {/* Preview Header */}
                    <div className="text-center mb-4">
                        <p className="text-gray-600 text-sm">Label Previews (Each label: 4" × 2")</p>
                    </div>
                </div>
            </div>

            {/* Printable Labels Area */}
            <div className="print-area">
                <div className="no-print:max-w-6xl no-print:mx-auto no-print:px-4 no-print:grid no-print:grid-cols-1 no-print:md:grid-cols-2 no-print:gap-6 no-print:mt-[-180px]">
                    {batches.map((batch) => (
                        <div 
                            key={batch.id}
                            className="label-item bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-lg no-print:mx-auto no-print:mb-6"
                            style={{
                                width: '4in',
                                height: '2in',
                                padding: '0.15in',
                            }}
                        >
                            {/* Label Content */}
                            <div className="h-full flex flex-col justify-between">
                                {/* Top Section - Product Name */}
                                <div className="text-center border-b border-gray-200 pb-1">
                                    <h2 className="text-lg font-bold text-gray-900 truncate">
                                        {batch.product.name}
                                    </h2>
                                    <p className="text-xs text-gray-500">{batch.product.sku}</p>
                                </div>

                                {/* Middle Section - Barcode */}
                                <div className="flex-1 flex items-center justify-center py-1 barcode-container">
                                    <Barcode
                                        value={batch.batch_number}
                                        width={1.5}
                                        height={40}
                                        fontSize={10}
                                        margin={0}
                                        displayValue={true}
                                        font="monospace"
                                        textAlign="center"
                                        textPosition="bottom"
                                        textMargin={2}
                                        renderer="svg"
                                        background="#ffffff"
                                        lineColor="#000000"
                                    />
                                </div>

                                {/* Bottom Section - Dates */}
                                <div className="flex justify-between items-center border-t border-gray-200 pt-1">
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-500 uppercase font-medium">Mfg Date</p>
                                        <p className="text-xs font-semibold text-gray-800">
                                            {formatDate(batch.manufacturing_date)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-500 uppercase font-medium">Qty</p>
                                        <p className="text-xs font-semibold text-gray-800">
                                            {batch.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase font-medium">Expiry Date</p>
                                        <p className={`text-xs font-semibold ${batch.expiry_date ? 'text-red-600' : 'text-gray-400'}`}>
                                            {formatDate(batch.expiry_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
