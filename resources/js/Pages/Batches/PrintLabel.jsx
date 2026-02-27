import { Head, router } from '@inertiajs/react';
import { useRef } from 'react';
import Barcode from 'react-barcode';

/**
 * PrintLabel Component - Displays a printable sticky label
 * Standard sticky label size: 2" x 1" (50mm x 25mm) or 4" x 2" (100mm x 50mm)
 * This component is optimized for printing on standard label printers
 */
export default function PrintLabel({ batch }) {
    const labelRef = useRef(null);

    const handlePrint = () => {
        // Mark as printed first
        router.post(`/batches/${batch.id}/mark-printed`, {}, {
            preserveState: true,
            onSuccess: () => {
                window.print();
            }
        });
    };

    const handleBack = () => {
        router.visit('/batches');
    };

    // Format date for display
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
            <Head title={`Print Label - ${batch.batch_number}`} />
            
            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        /* Hide non-printable elements */
                        .no-print {
                            display: none !important;
                        }
                        
                        /* Show only the print area */
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        
                        .print-area {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: flex-start;
                            padding: 0;
                            margin: 0;
                        }
                        
                        /* Label sizing for standard sticky labels */
                        .label-container {
                            width: 30mm !important;
                            height: 15mm !important;
                            padding: 1mm !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            border: 1px solid #000 !important;
                            border-radius: 0 !important;
                            background: white !important;
                        }
                        
                        /* CRITICAL: Ensure barcode SVG is visible and prints correctly */
                        .label-container svg {
                            display: block !important;
                            visibility: visible !important;
                            width: auto !important;
                            height: auto !important;
                        }
                        
                        .label-container svg rect,
                        .label-container svg text {
                            visibility: visible !important;
                        }
                        
                        /* Ensure text colors print */
                        .label-container * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                        
                        @page {
                            size: 30mm 15mm;
                            margin: 0;
                        }
                    }
                `}
            </style>

            {/* Screen View - Controls */}
            <div className="no-print min-h-screen bg-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={handleBack}
                                className="text-3xl font-bold text-gray-700 hover:text-gray-900"
                            >
                                ‹
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Print Label</h1>
                        </div>
                        
                        <button
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Print Label</span>
                        </button>
                    </div>


                </div>
            </div>

            {/* Printable Label Area */}
            <div className="print-area flex justify-center no-print:mt-0 mt-[-500px]">
                <div 
                    ref={labelRef}
                    className="label-container bg-white border border-black"
                    style={{
                        width: '60mm',
                        height: '30mm',
                        padding: '1mm',
                    }}
                >
                    {/* Label Content - Horizontal Barcode with Dates */}
                    <div className="h-full flex flex-col justify-between">
                        {/* Top Section - Barcode */}
                        <div className="flex items-center justify-center flex-1">
                            <Barcode
                                value={batch.batch_number}
                                format="CODE93"
                                width={2}
                                height={25}
                                margin={0}
                                displayValue={false}
                                renderer="svg"
                                background="#ffffff"
                                lineColor="#000000"
                            />
                        </div>

                        {/* Bottom Section - Dates */}
                        {/* Bottom Section - Batch Number in Middle, Dates with Month/Year (short year) */}
<div className="flex justify-between items-end border-t border-gray-300" style={{ paddingTop: '1px' }}>
    <div className="text-left">
        <p className="text-[6px] text-black font-bold uppercase leading-tight">MFG</p>
        <p className="text-[7px] font-bold text-black leading-tight">
            {batch.manufacturing_date ? new Date(batch.manufacturing_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : 'N/A'}
        </p>
    </div>
    
    {/* Batch Number in the Middle */}
    <div className="text-center">
        <p className="text-[5px] text-black font-bold uppercase leading-tight">BATCH</p>
        <p className="text-[7px] font-bold text-black leading-tight font-mono">
            {batch.batch_number}
        </p>
    </div>
    
    <div className="text-right">
        <p className="text-[6px] text-black font-bold uppercase leading-tight">EXP</p>
        <p className="text-[7px] font-bold text-black leading-tight">
            {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : 'N/A'}
        </p>
    </div>
</div>
                    </div>
                </div>
            </div>

            {/* Additional Options - Screen Only */}
            <div className="no-print max-w-4xl mx-auto px-4 mt-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Batch Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Batch Number:</span>
                            <span className="ml-2 font-mono font-semibold">{batch.batch_number}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Product:</span>
                            <span className="ml-2 font-semibold">{batch.product.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">SKU:</span>
                            <span className="ml-2 font-mono">{batch.product.sku}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Quantity:</span>
                            <span className="ml-2 font-semibold">{batch.quantity}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Manufacturing Date:</span>
                            <span className="ml-2">{formatDate(batch.manufacturing_date)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Expiry Date:</span>
                            <span className="ml-2">{batch.expiry_date ? formatDate(batch.expiry_date) : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
