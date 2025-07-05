import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FiShoppingCart, FiCalendar, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [rentalDays, setRentalDays] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const { data: productResponse, isLoading, error } = useQuery(
    ['product', id],
    async () => {
      const response = await axios.get(`/api/products/${id}`);
      return response.data;
    },
    {
      retry: 2,
      refetchOnWindowFocus: false,
    }
  );

  const product = productResponse?.data;

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    addToCart(product, quantity, rentalDays);
    toast.success('Item added to cart!');
  };

  const handleRentNow = () => {
    if (!user) {
      toast.error('Please login to rent items');
      navigate('/login');
      return;
    }
    addToCart(product, quantity, rentalDays);
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/collection')}
            className="btn-primary"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  // Find the pricePerDay from product, default to 0 if not available
  const pricePerDay = Number(product.pricePerDay) || 0;
  const totalPrice = pricePerDay * rentalDays * quantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-green-600 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <button
                  onClick={() => navigate('/collection')}
                  className="text-gray-500 hover:text-green-600 transition-colors"
                >
                  Collection
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 w-full">
                <img
                  src={product.images && product.images[0] ? product.images[0] : '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 4)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.rating || 4}.0)</span>
                </div>
                <p className="text-gray-600 text-lg">{product.description}</p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    ₹{pricePerDay}/day
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.availableQuantity} items available
                  </span>
                </div>
              </div>

              {/* Rental Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Duration (days)
                  </label>
                  <select
                    value={rentalDays}
                    onChange={(e) => setRentalDays(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 14, 30].map((days) => (
                      <option key={days} value={days}>
                        {days} {days === 1 ? 'day' : 'days'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{totalPrice}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    For {rentalDays} {rentalDays === 1 ? 'day' : 'days'} × {quantity} {quantity === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleRentNow}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <FiCalendar className="w-5 h-5" />
                  <span>Rent Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Features */}
          <div className="border-t border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Product Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <FiTruck className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Free Campus Delivery</h4>
                  <p className="text-gray-600 text-sm">We deliver to your campus location</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiShield className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Quality Assured</h4>
                  <p className="text-gray-600 text-sm">All equipment is tested and maintained</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiRefreshCw className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Easy Returns</h4>
                  <p className="text-gray-600 text-sm">Simple return process with no hassle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 