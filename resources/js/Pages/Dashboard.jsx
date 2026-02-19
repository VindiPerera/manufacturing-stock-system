import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    
    const features = [
        {
            id: 1,
            name: 'PRODUCT MANAGEMENT',
            description: 'Create, edit, and delete products. Set attributes like SKU, Category, Unit, Barcode, and Minimum stock level.',
            color: 'bg-red-600',
            image: '/images/product-png.png',
            link: '/products',
        },
        {
            id: 2,
            name: 'MANUFACTURING',
            description: 'Create manufacturing orders, select products, enter quantities and dates. Auto-generate batch numbers and update stock.',
            color: 'bg-blue-900',
            image: '/images/Manufacturing.png',
            link: '/manufacturing',
        },
        {
            id: 3,
            name: 'BATCH & LABELING',
            description: 'Manage batch creation, print labels with product info and barcode. Reprint, search, and view batch history.',
            color: 'bg-yellow-400',
            image: '/images/product-png.png',
            link: '/batches',
        },
        {
            id: 4,
            name: 'STORE MANAGEMENT',
            description: 'Transfer manufactured batches to stores, track stock movements, and manage store locations.',
            color: 'bg-green-600',
            image: '/images/Store.png',
            link: '/stock-transfers',
        },
        {
            id: 5,
            name: 'BARCODE SCANNING',
            description: 'Scan product barcodes, reduce stock automatically, and record stock-out transactions with batch tracking.',
            color: 'bg-purple-900',
            image: '/images/product-png.png',
            link: '/stock-out',
        },
        {
            id: 7,
            name: 'TRANSFER HISTORY',
            description: 'View all batch transfer records to stores. Track transfer numbers, quantities, destinations, status and detailed item breakdown.',
            color: 'bg-teal-600',
            image: '/images/Store.png',
            link: '/stock-transfers/history',
        },
        {
            id: 6,
            name: 'STOCK OUT HISTORY',
            description: 'View the complete history of stock-out transactions, filter by date or product, and track all barcode-scanned stock removals.',
            color: 'bg-orange-500',
            image: '/images/report.png',
            link: '/stock-out/history',
        },
        // {
        //     id: 7,
        //     name: 'CATEGORIES',
        //     description: 'Organize products into categories for better structure and easy navigation throughout the system.',
        //     color: 'bg-indigo-600',
        //     image: '/images/product-png.png',
        //     link: '/categories',
        // },
        // {
        //     id: 8,
        //     name: 'USERS',
        //     description: 'Manage user accounts, roles, and permissions. Control access to different modules and features.',
        //     color: 'bg-pink-500',
        //     image: '/images/users.png',
        //     link: '/users',
        // },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="bg-gray-50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <Link
                                key={feature.id}
                                href={feature.link}
                                className={`${feature.color} rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-white flex flex-col items-center justify-center text-center overflow-hidden group`}
                            >
                                {/* Card Content */}
                                <div className="relative z-10 flex flex-col items-center">
                                    {/* Icon/Image Circle */}
                                    <div className="rounded-full bg-white p-4 mb-4 flex items-center justify-center h-24 w-24">
                                        <img 
                                            src={feature.image} 
                                            alt={feature.name} 
                                            className="h-16 w-16 object-contain"
                                        />
                                    </div>
                                    
                                    {/* Title */}
                                    <h3 className="text-lg font-bold mb-3">{feature.name}</h3>
                                    
                                    {/* Description */}
                                    <p className="text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
