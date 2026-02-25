import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import AddProductModal from '@/Components/AddProductModal';
import EditProductModal from '@/Components/EditProductModal';
import AddCategoryModal from '@/Components/AddCategoryModal';

export default function ProductIndex({ products: initialProducts = [], categories: initialCategories = [], flash = {} }) {
    const [products, setProducts] = useState(initialProducts);
    const [categories, setCategories] = useState(initialCategories);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        stock: '',
        price: '',
    });

    // Check for new product from flash data and add it dynamically
    useEffect(() => {
        if (flash.newProduct) {
            setProducts(prev => {
                // Avoid duplicates by checking if product already exists
                const exists = prev.some(p => p.id === flash.newProduct.id);
                if (!exists) {
                    return [...prev, flash.newProduct];
                }
                return prev;
            });
        }
    }, [flash]);

    // Filter products based on search and filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = !filters.category || product.category === filters.category;

            const matchesStock = !filters.stock || 
                (filters.stock === 'low' && product.minimum_stock && product.stock <= product.minimum_stock) ||
                (filters.stock === 'out' && product.stock === 0) ||
                (filters.stock === 'available' && product.stock > 0);

            const matchesPrice = !filters.price ||
                (filters.price === 'under100' && product.price < 100) ||
                (filters.price === '100to500' && product.price >= 100 && product.price < 500) ||
                (filters.price === 'above500' && product.price >= 500);

            return matchesSearch && matchesCategory && matchesStock && matchesPrice;
        });
    }, [products, searchQuery, filters]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilters({ category: '', stock: '', price: '' });
    };

    const handleAddProduct = (newProduct) => {
        setProducts([...products, newProduct]);
        setShowAddModal(false);
    };

    const handleUpdateProduct = (updatedProduct) => {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const handleDeleteProduct = (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${productId}`, {
                onSuccess: () => {
                    setProducts(products.filter(p => p.id !== productId));
                }
            });
        }
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedProduct(null);
    };

    const handleCategoryAdded = () => {
        // Reload the page to get fresh categories from server
        router.reload({ only: ['categories'] });
        setShowAddCategoryModal(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Products" />

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
                            <h1 className="text-3xl font-bold text-gray-900">PRODUCTS</h1>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                {filteredProducts.length}
                            </div>
                            <span className="text-gray-700 font-semibold">/ Total Products</span>
                        </div>
                    </div>

                    {/* Search Bar and Add Product Button Row */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search by name, code or scan barcode."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddCategoryModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition"
                            >
                                <span>+</span>
                                <span>ADD CATEGORY</span>
                            </button>
                            
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition"
                            >
                                <span>+</span>
                                <span>ADD MORE PRODUCT</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-blue-600 font-semibold hover:bg-gray-50 focus:outline-none"
                        >
                            <option value="">Filter by Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                            ))}
                        </select>

                        <select className="px-4 py-2 border border-gray-300 rounded-lg text-blue-600 font-semibold hover:bg-gray-50 focus:outline-none">
                            <option>Filter by Location</option>
                        </select>

                        <select
                            value={filters.stock}
                            onChange={(e) => handleFilterChange('stock', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-blue-600 font-semibold hover:bg-gray-50 focus:outline-none"
                        >
                            <option value="">Filter by Stock</option>
                            <option value="available">Available</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>

                        <select
                            value={filters.price}
                            onChange={(e) => handleFilterChange('price', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-blue-600 font-semibold hover:bg-gray-50 focus:outline-none"
                        >
                            <option value="">Filter by Price</option>
                            <option value="under100">Under $100</option>
                            <option value="100to500">$100 - $500</option>
                            <option value="above500">Above $500</option>
                        </select>

                        

                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-600 text-lg">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white border-2 border-black rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                                >
                                    {/* Image Container */}
                                    <div className="relative h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {product.image ? (
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-gray-500 text-xs font-medium">NO IMAGE</p>
                                                <p className="text-gray-500 text-xs font-medium">AVAILABLE</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3 bg-black text-white space-y-2">
                                        {/* Product Name and Price */}
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-sm text-white truncate flex-1 pr-2">
                                                {product.name}
                                            </h3>
                                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[60px] text-center">
                                                {product.price || '0.00'}
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="text-xs text-gray-400 space-y-1">
                                            <p>Color: N/A Size: N/A</p>
                                            <p>Supplier: N/A</p>
                                        </div>

                                        {/* Stock Status */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-green-400 text-xs font-medium">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                In Stock ({product.stock || 0})
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-center gap-2 pt-2">
                                            <button
                                                onClick={() => router.visit(`/products/${product.id}`)}
                                                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition"
                                                title="View"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <AddProductModal 
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddProduct}
                    categories={initialCategories}
                />
            )}

            {/* Edit Product Modal */}
            {showEditModal && (
                <EditProductModal 
                    product={selectedProduct}
                    onClose={handleCloseEditModal}
                    onSuccess={(updatedProduct) => {
                        handleUpdateProduct(updatedProduct);
                        setShowEditModal(false);
                        setSelectedProduct(null);
                    }}
                    categories={initialCategories}
                />
            )}

            {/* Add Category Modal */}
            {showAddCategoryModal && (
                <AddCategoryModal 
                    onClose={() => setShowAddCategoryModal(false)}
                    onSuccess={handleCategoryAdded}
                />
            )}
        </AuthenticatedLayout>
    );
}
