import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { FiCreditCard, FiCalendar, FiMapPin, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cart, clearCart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      deliveryAddress: user?.address || '',
      deliveryInstructions: '',
      paymentMethod: 'cash',
    },
  });

  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      return total + ((item.product.pricePerDay || 0) * (item.rentalDays || 1) * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const handlePlaceOrder = async (data) => {
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      // Get the rental days from the first item (assuming all items have same rental days)
      const rentalDays = cart[0]?.rentalDays || 1;
      
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        rentalDays: rentalDays,
        notes: `Delivery Address: ${data.deliveryAddress}${data.deliveryInstructions ? ` | Instructions: ${data.deliveryInstructions}` : ''} | Payment Method: ${data.paymentMethod}`
      };

      const response = await axios.post('/api/orders', orderData);
      setOrderId(response.data.data._id);
      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been confirmed. We'll deliver your items to your campus location.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{orderId}</span></p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/collection')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Please add some items to your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => navigate('/collection')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
              </div>

              <form onSubmit={handleSubmit(handlePlaceOrder)} className="p-6 space-y-6">
                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="mr-2 h-5 w-5 text-green-600" />
                    Delivery Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <textarea
                        {...register('deliveryAddress', { required: 'Delivery address is required' })}
                        rows={3}
                        className={`input-field ${
                          errors.deliveryAddress ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="Enter your campus delivery address"
                      />
                      {errors.deliveryAddress && (
                        <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        {...register('deliveryInstructions')}
                        rows={2}
                        className="input-field"
                        placeholder="Any special instructions for delivery"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiCreditCard className="mr-2 h-5 w-5 text-green-600" />
                    Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="cash"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">Cash on Delivery</span>
                        <span className="block text-sm text-gray-600">Pay when you receive your items</span>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="upi"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">UPI Payment</span>
                        <span className="block text-sm text-gray-600">Pay online via UPI</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiCalendar className="mr-2 h-5 w-5 text-green-600" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3">
                    {cart && cart.map((item) => (
                      <div key={item.product._id + '-' + item.rentalDays} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.image || '/placeholder-product.svg'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × {item.rentalDays || 1} {(item.rentalDays || 1) === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{(item.product.pricePerDay || 0) * (item.rentalDays || 1) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{calculateSubtotal()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">₹{calculateTotal()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Including all applicable taxes
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit(handlePlaceOrder)}
                disabled={isLoading}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - ₹${calculateTotal()}`
                )}
              </button>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">What happens next:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Order confirmation sent to your email</li>
                  <li>• Items prepared and delivered to campus</li>
                  <li>• Payment collected upon delivery</li>
                  <li>• Return date tracking activated</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 