import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
  items: [],
  totalAmount: 0,
  rentalDays: 1,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(
        item => item.product._id === action.payload.product._id && item.rentalDays === action.payload.rentalDays
      );
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product._id === action.payload.product._id && item.rentalDays === action.payload.rentalDays
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        const totalAmount = updatedItems.reduce(
          (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
          0
        );
        return { ...state, items: updatedItems, totalAmount };
      } else {
        const newItems = [...state.items, action.payload];
        const totalAmount = newItems.reduce(
          (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
          0
        );
        return { ...state, items: newItems, totalAmount };
      }

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.product._id !== action.payload);
      const newTotalAmount = filteredItems.reduce(
        (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
        0
      );
      return { ...state, items: filteredItems, totalAmount: newTotalAmount };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const updatedTotalAmount = updatedItems.reduce(
        (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
        0
      );
      return { ...state, items: updatedItems, totalAmount: updatedTotalAmount };

    case 'UPDATE_RENTAL_DAYS':
      const itemsWithUpdatedRentalDays = state.items.map(item => ({
        ...item,
        rentalDays: action.payload
      }));
      const totalAmountWithUpdatedRentalDays = itemsWithUpdatedRentalDays.reduce(
        (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
        0
      );
      return {
        ...state,
        items: itemsWithUpdatedRentalDays,
        rentalDays: action.payload,
        totalAmount: totalAmountWithUpdatedRentalDays
      };

    case 'CLEAR_CART':
      return { ...initialState };

    case 'LOAD_CART':
      return { ...action.payload };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [cartLoading, setCartLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { isAuthenticated, user, loading } = useAuth();

  // Helper to get the correct localStorage key
  const getCartKey = () => (isAuthenticated && user && user._id ? `cart_${user._id}` : 'cart');

  // Load cart from localStorage first, then sync with backend if needed
  useEffect(() => {
    if (loading) {
      console.log('Cart loading: waiting for auth to load');
      return;
    }

    console.log('Cart loading: auth loaded, isAuthenticated:', isAuthenticated, 'user:', user);
    
    // Reset initial load flag when auth changes
    setIsInitialLoad(true);
    
    const loadCart = async () => {
      setCartLoading(true);
      
      try {
        // Always try localStorage first
        const cartKey = getCartKey();
        const savedCart = localStorage.getItem(cartKey);
        console.log('Checking localStorage with key:', cartKey);

        if (savedCart) {
          try {
            const cartData = JSON.parse(savedCart);
            console.log('Found localStorage cart:', cartData);
            
            if (cartData.items && cartData.items.length > 0) {
              console.log('Loading cart from localStorage');
              dispatch({ type: 'LOAD_CART', payload: cartData });
              
              // If authenticated, sync to backend in background
              if (isAuthenticated && user && user._id) {
                console.log('Syncing localStorage cart to backend');
                const cartForBackend = cartData.items.map(item => ({
                  product: item.product._id,
                  quantity: item.quantity,
                  rentalDays: item.rentalDays
                }));
                
                try {
                  await axios.post('/api/users/cart', { cart: cartForBackend });
                  console.log('Cart synced to backend successfully');
                } catch (error) {
                  console.error('Error syncing to backend:', error);
                }
              }
              setIsInitialLoad(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing localStorage cart:', error);
          }
        }

        // If no localStorage cart and user is authenticated, try backend
        if (isAuthenticated && user && user._id) {
          console.log('No localStorage cart found, checking backend');
          try {
            const res = await axios.get('/api/users/cart');
            const backendCart = res.data && res.data.cart ? res.data.cart : [];
            
            if (backendCart.length > 0) {
              console.log('Found backend cart:', backendCart);
              const formattedCart = backendCart.map(item => ({
                product: item.product,
                quantity: item.quantity,
                rentalDays: item.rentalDays
              }));
              const totalAmount = formattedCart.reduce(
                (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
                0
              );
              const cartData = { items: formattedCart, totalAmount, rentalDays: 1 };
              console.log('Loading cart from backend:', cartData);
              dispatch({ type: 'LOAD_CART', payload: cartData });
              localStorage.setItem(cartKey, JSON.stringify(cartData));
            } else {
              console.log('Backend cart is empty, using initial state');
              dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
            }
          } catch (error) {
            console.error('Error loading from backend:', error);
            dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
          }
        } else {
          console.log('No localStorage cart found and not authenticated, using initial state');
          dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
        }
      } finally {
        setCartLoading(false);
        setIsInitialLoad(false);
      }
    };

    loadCart();
  }, [isAuthenticated, loading, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartLoading || isInitialLoad) {
      console.log('Cart loading or initial load, skipping save');
      return;
    }

    console.log('Cart state changed, saving to localStorage:', state);
    
    if (state && typeof state === 'object') {
      const cartKey = getCartKey();
      console.log('Saving cart to localStorage with key:', cartKey);
      localStorage.setItem(cartKey, JSON.stringify(state));
      console.log('Cart saved to localStorage successfully');
    }
  }, [state, cartLoading, isInitialLoad]);

  // Sync cart to backend when it changes (only for authenticated users)
  useEffect(() => {
    if (cartLoading || !isAuthenticated || !user || !user._id) {
      return;
    }

    console.log('Syncing cart to backend:', state.items.length, 'items');
    
    if (state.items && state.items.length > 0) {
      const cartForBackend = state.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        rentalDays: item.rentalDays
      }));
      
      console.log('Syncing cart to backend:', cartForBackend);
      axios.post('/api/users/cart', { cart: cartForBackend })
        .then((response) => {
          console.log('Cart synced to backend successfully:', response.data);
        })
        .catch((error) => {
          console.error('Error syncing cart to backend:', error);
        });
    } else {
      // Don't clear backend cart automatically - only clear when explicitly called
      console.log('Cart is empty, but not clearing backend cart automatically');
    }
  }, [state.items, isAuthenticated, user, cartLoading]);

  // Clear user-specific cart from localStorage on logout
  useEffect(() => {
    if (!isAuthenticated && user && user._id) {
      localStorage.removeItem(`cart_${user._id}`);
    }
  }, [isAuthenticated, user]);

  // Add item to cart
  const addToCart = (product, quantity = 1, rentalDays = 1) => {
    if (product.availableQuantity < quantity) {
      toast.error(`Only ${product.availableQuantity} items available`);
      return false;
    }
    
    const existingItem = state.items.find(item => item.product._id === product._id && item.rentalDays === rentalDays);
    if (existingItem && existingItem.quantity + quantity > product.availableQuantity) {
      toast.error(`Cannot add more items. Only ${product.availableQuantity} available`);
      return false;
    }
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        quantity,
        rentalDays,
      },
    });
    return true;
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId,
    });
    toast.success('Item removed from cart');
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = state.items.find(item => item.product._id === productId);
    if (item && quantity > item.product.availableQuantity) {
      toast.error(`Only ${item.product.availableQuantity} items available`);
      return;
    }
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        productId,
        quantity,
      },
    });
  };

  // Update rental days
  const updateRentalDays = (days) => {
    if (days < 1) {
      toast.error('Rental days must be at least 1');
      return;
    }
    dispatch({
      type: 'UPDATE_RENTAL_DAYS',
      payload: days,
    });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    
    // Explicitly clear backend cart
    if (isAuthenticated && user && user._id) {
      console.log('Explicitly clearing backend cart');
      axios.post('/api/users/cart', { cart: [] })
        .then((response) => {
          console.log('Backend cart cleared successfully:', response.data);
        })
        .catch((error) => {
          console.error('Error clearing backend cart:', error);
        });
    }
    
    toast.success('Cart cleared');
  };

  // Get cart item count
  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if cart is empty
  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  // Get cart items for checkout
  const getCheckoutItems = () => {
    return state.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
    }));
  };

  const value = {
    items: state.items,
    totalAmount: state.totalAmount,
    rentalDays: state.rentalDays,
    cartLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateRentalDays,
    clearCart,
    getCartItemCount,
    isCartEmpty,
    getCheckoutItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 