import Barcode from 'react-barcode';

/**
 * PrintableLabel Component
 * 
 * A reusable component for displaying product batch labels
 * Designed for standard sticky labels (4" x 2" / 100mm x 50mm)
 * 
 * @param {Object} props
 * @param {string} props.productName - Name of the product
 * @param {string} props.productSku - Product SKU
 * @param {string} props.batchNumber - Unique batch identifier for barcode
 * @param {number} props.quantity - Quantity in the batch
 * @param {string} props.manufacturingDate - Manufacturing date (YYYY-MM-DD)
 * @param {string} props.expiryDate - Expiry date (YYYY-MM-DD)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showBorder - Whether to show border (default: true)
 */
export default function PrintableLabel({
    productName,
    productSku,
    batchNumber,
    quantity,
    manufacturingDate,
    expiryDate,
    className = '',
    showBorder = true,
}) {
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
        <div 
            className={`
                bg-white rounded-lg
                ${showBorder ? 'border-2 border-dashed border-gray-300' : ''}
                ${className}
            `}
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
                        {productName}
                    </h2>
                    <p className="text-xs text-gray-500">{productSku}</p>
                </div>

                {/* Middle Section - Barcode */}
                <div className="flex-1 flex items-center justify-center py-1 barcode-container">
                    <Barcode
                        value={batchNumber}
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
                            {formatDate(manufacturingDate)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Qty</p>
                        <p className="text-xs font-semibold text-gray-800">
                            {quantity}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Expiry Date</p>
                        <p className={`text-xs font-semibold ${expiryDate ? 'text-red-600' : 'text-gray-400'}`}>
                            {formatDate(expiryDate)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Compact Label variant for smaller labels (2" x 1")
 */
export function CompactLabel({
    productName,
    batchNumber,
    expiryDate,
    className = '',
    showBorder = true,
}) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        });
    };

    return (
        <div 
            className={`
                bg-white rounded
                ${showBorder ? 'border border-gray-300' : ''}
                ${className}
            `}
            style={{
                width: '2in',
                height: '1in',
                padding: '0.1in',
            }}
        >
            <div className="h-full flex flex-col justify-between">
                {/* Product Name */}
                <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-900 truncate">
                        {productName}
                    </p>
                </div>

                {/* Barcode */}
                <div className="flex items-center justify-center barcode-container">
                    <Barcode
                        value={batchNumber}
                        width={1}
                        height={25}
                        fontSize={8}
                        margin={0}
                        displayValue={true}
                        font="monospace"
                        textAlign="center"
                        textPosition="bottom"
                        textMargin={1}
                        renderer="svg"
                        background="#ffffff"
                        lineColor="#000000"
                    />
                </div>

                {/* Expiry */}
                {expiryDate && (
                    <div className="text-center">
                        <p className="text-[8px] text-red-600 font-medium">
                            EXP: {formatDate(expiryDate)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
