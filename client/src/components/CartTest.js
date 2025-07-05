import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartTest = () => {
  const {
    items,
    totalAmount,
    rentalDays,
    cartLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateRentalDays,
    clearCart,
    getCartItemCount,
    isCartEmpty,
  } = useCart();
  const { user, isAuthenticated } = useAuth();

  const testProduct = {
    _id: '685ecf516e9de95ac0d5ca95',
    name: 'Lab Safety Apron - Chemical Resistant',
    pricePerDay: 20,
    availableQuantity: 25
  };

  const handleAddToCart = () => {
    addToCart(testProduct, 1, 2);
  };

  const handleRemoveFromCart = () => {
    if (items.length > 0) {
      removeFromCart(items[0].product._id);
    }
  };

  const checkLocalStorage = () => {
    const cartKey = isAuthenticated && user && user._id ? `cart_${user._id}` : 'cart';
    const savedCart = localStorage.getItem(cartKey);
    console.log('Current localStorage cart key:', cartKey);
    console.log('Current localStorage cart data:', savedCart);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed localStorage cart:', parsedCart);
        alert(`LocalStorage cart: ${JSON.stringify(parsedCart, null, 2)}`);
      } catch (error) {
        console.error('Error parsing localStorage cart:', error);
        alert('Error parsing localStorage cart');
      }
    } else {
      alert('No cart found in localStorage');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Cart Test Component</h3>
      <p>User: {user ? user.name : 'Not logged in'}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>Cart Loading: {cartLoading ? 'Yes' : 'No'}</p>
      <p>Cart Items: {items.length}</p>
      <div>
        <button onClick={handleAddToCart}>Add Test Item</button>
        <button onClick={handleRemoveFromCart}>Remove First Item</button>
        <button onClick={clearCart}>Clear Cart</button>
        <button onClick={checkLocalStorage}>Check LocalStorage</button>
      </div>
      <div>
        <h4>Cart Items:</h4>
        {items.map((item, index) => (
          <div key={index}>
            {item.product.name} - Qty: {item.quantity} - Days: {item.rentalDays}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartTest; 