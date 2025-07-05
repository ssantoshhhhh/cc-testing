import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { FaArrowRight, FaStar, FaClock, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch products for the collection preview
  const { data: products, isLoading } = useQuery(
    'homeProducts',
    async () => {
      const response = await axios.get('/api/products?limit=6');
      return response.data.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    if (products && products.length > 0) {
      // Set the first product as featured
      setFeaturedProduct(products[0]);
    }
  }, [products]);

  const features = [
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: 'Safe & Secure',
      description: 'All equipment is thoroughly cleaned and sanitized before each rental.'
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: 'Flexible Rental',
      description: 'Choose your rental duration from 1 day to several weeks.'
    },
    {
      icon: <FaStar className="text-2xl" />,
      title: 'Quality Equipment',
      description: 'Premium quality mini drafters and lab aprons for your needs.'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Campus Equipment
                  <span className="text-green-600 block">Rental Made Easy</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Rent high-quality mini drafters and lab aprons for your academic needs. 
                  Convenient, affordable, and reliable equipment rental service.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/collection"
                  className="btn-primary text-lg px-8 py-3 flex items-center justify-center"
                >
                  Browse Collection
                  <FaArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/about"
                  className="btn-secondary text-lg px-8 py-3 flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600">Happy Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">50+</div>
                  <div className="text-sm text-gray-600">Equipment Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            {/* Right side - Featured Product */}
            <div className="relative">
              {featuredProduct && (
                <div className="bg-white rounded-2xl shadow-soft p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-4xl">📐</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {featuredProduct.name}
                    </h3>
                    <p className="text-gray-600">
                      {featuredProduct.description.substring(0, 100)}...
                    </p>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{featuredProduct.pricePerDay}/day
                    </div>
                    <Link
                      to={`/product/${featuredProduct._id}`}
                      className="btn-primary w-full"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Campus Connect?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the best rental experience with quality equipment and excellent service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our collection of high-quality mini drafters and lab aprons.
            </p>
          </div>

          {products && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.slice(0, 6).map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow duration-300"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400x300?text=Product'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        ₹{product.pricePerDay}/day
                      </span>
                      <Link
                        to={`/product/${product._id}`}
                        className="btn-primary text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/collection"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              View All Products
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when user is not logged in */}
      {!isAuthenticated && (
        <section className="py-20 bg-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who trust Campus Connect for their equipment rental needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-green-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Sign Up Now
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home; 