import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { FaSearch, FaFilter, FaSort, FaEye } from 'react-icons/fa';

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'createdAt:desc',
  });

  const { data: productsData, isLoading, error } = useQuery(
    ['products', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      
      const response = await axios.get(`/api/products?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (filters.category) newSearchParams.set('category', filters.category);
    if (filters.search) newSearchParams.set('search', filters.search);
    if (filters.sort) newSearchParams.set('sort', filters.sort);
    
    setSearchParams(newSearchParams);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the filters state
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Collection</h1>
          <p className="text-gray-600">
            Browse our selection of high-quality mini drafters and lab aprons
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="mini-drafter">Mini Drafters</option>
                <option value="lab-apron">Lab Aprons</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="pricePerDay:asc">Price: Low to High</option>
                <option value="pricePerDay:desc">Price: High to Low</option>
                <option value="name:asc">Name: A to Z</option>
                <option value="name:desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {products.length} of {productsData?.total || 0} products
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-medium transition-shadow duration-300"
              >
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400x300?text=Product'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge ${
                      product.category === 'mini-drafter' ? 'badge-info' : 'badge-success'
                    }`}>
                      {product.category === 'mini-drafter' ? 'Mini Drafter' : 'Lab Apron'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.availableQuantity} available
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-green-600">
                        ₹{product.pricePerDay}
                      </span>
                      <span className="text-sm text-gray-500">/day</span>
                    </div>
                    <Link
                      to={`/product/${product._id}`}
                      className="btn-primary text-sm px-4 py-2 flex items-center"
                    >
                      <FaEye className="mr-1" />
                      View
                    </Link>
                  </div>

                  {/* Condition */}
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 capitalize">
                      Condition: {product.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all products
            </p>
            <button
              onClick={() => setFilters({ category: '', search: '', sort: 'createdAt:desc' })}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              {pagination.hasPrev && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', pagination.current - 1);
                    setSearchParams(newParams);
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
              )}

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', page);
                    setSearchParams(newParams);
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.current
                      ? 'bg-green-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {pagination.hasNext && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', pagination.current + 1);
                    setSearchParams(newParams);
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection; 