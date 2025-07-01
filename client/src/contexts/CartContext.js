import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  totalAmount: 0,
  rentalDays: 1,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.product._id === action.payload.product._id && item.rentalDays === action.payload.rentalDays);
      
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
        
        return {
          ...state,
          items: updatedItems,
          totalAmount,
        };
      } else {
        const newItems = [...state.items, action.payload];
        const totalAmount = newItems.reduce(
          (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
          0
        );
        
        return {
          ...state,
          items: newItems,
          totalAmount,
        };
      }

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.product._id !== action.payload);
      const newTotalAmount = filteredItems.reduce(
        (total, item) => total + (item.product.pricePerDay * item.quantity * item.rentalDays),
        0
      );
      
      return {
        ...state,
        items: filteredItems,
        totalAmount: newTotalAmount,
      };

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
      
      return {
        ...state,
        items: updatedItems,
        totalAmount: updatedTotalAmount,
      };

    case 'UPDATE_RENTAL_DAYS':
      const recalculatedTotalAmount = state.items.reduce(
        (total, item) => total + (item.product.pricePerDay * item.quantity * action.payload),
        0
      );
      
      return {
        ...state,
        rentalDays: action.payload,
        totalAmount: recalculatedTotalAmount,
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalAmount: 0,
      };

    case 'LOAD_CART':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated, loading } = useAuth();

  // Helper to get the correct localStorage key
  const getCartKey = () => (isAuthenticated && user && user._id ? `cart_${user._id}` : 'cart');

  // Load cart from backend for logged-in users, or from localStorage for guests
  useEffect(() => {
    if (loading) return;
    const fetchAndSetCart = async () => {
      if (isAuthenticated && user && user._id) {
        try {
          const res = await axios.get('/api/users/cart');
          const backendCart = res.data && Array.isArray(res.data.cart) ? res.data.cart : [];
          if (backendCart.length > 0) {
            // Use backend cart if it exists
            dispatch({ type: 'LOAD_CART', payload: { ...initialState, items: backendCart } });
            localStorage.setItem(getCartKey(), JSON.stringify({ ...initialState, items: backendCart }));
          } else {
            // If backend cart is empty, check local cart
            const savedCart = localStorage.getItem(getCartKey());
            if (savedCart) {
              try {
                const cartData = JSON.parse(savedCart);
                if (cartData.items && cartData.items.length > 0) {
                  // Sync local cart to backend
                  await axios.post('/api/users/cart', {
                    cart: cartData.items.map(item => ({
                      product: typeof item.product === 'object' ? item.product._id : item.product,
                      quantity: item.quantity,
                      rentalDays: item.rentalDays
                    }))
                  });
                  dispatch({ type: 'LOAD_CART', payload: cartData });
                } else {
                  dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
                }
              } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
              }
            } else {
              dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
            }
          }
        } catch (err) {
          // fallback to localStorage if backend fails
          const savedCart = localStorage.getItem(getCartKey());
          if (savedCart) {
            try {
              const cartData = JSON.parse(savedCart);
              dispatch({ type: 'LOAD_CART', payload: cartData });
            } catch (error) {
              console.error('Error loading cart from localStorage:', error);
              dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
            }
          } else {
            dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
          }
        }
      } else {
        // Guest: load from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const cartData = JSON.parse(savedCart);
            dispatch({ type: 'LOAD_CART', payload: cartData });
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
          }
        } else {
          dispatch({ type: 'LOAD_CART', payload: { ...initialState } });
        }
      }
    };
    fetchAndSetCart();
    // eslint-disable-next-line
  }, [isAuthenticated, loading, user]);

  // Save cart to backend and to the correct localStorage key whenever it changes
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(state));
    if (isAuthenticated) {
      axios.post('/api/users/cart', {
        cart: state.items
          .filter(item => item.product && (typeof item.product === 'string' || (typeof item.product === 'object' && item.product._id)))
          .map(item => ({
            product: typeof item.product === 'object' ? item.product._id : item.product,
            quantity: item.quantity,
            rentalDays: item.rentalDays
          }))
      }).catch(() => {/* ignore errors for now */});
    }
  }, [state, isAuthenticated, user]);

  // On logout, clear user-specific cart from localStorage
  useEffect(() => {
    if (!isAuthenticated && user && user._id) {
      localStorage.removeItem(`cart_${user._id}`);
    }
    // eslint-disable-next-line
  }, [isAuthenticated, user]);

  // Helper to sync cart to backend
  const syncCartToBackend = (items) => {
    if (isAuthenticated) {
      axios.post('/api/users/cart', {
        cart: items
          .filter(item => item.product && (typeof item.product === 'string' || (typeof item.product === 'object' && item.product._id)))
          .map(item => ({
            product: typeof item.product === 'object' ? item.product._id : item.product,
            quantity: item.quantity,
            rentalDays: item.rentalDays
          }))
      }).catch(() => {/* ignore errors for now */});
    }
  };

  // Add item to cart
  const addToCart = (product, quantity = 1, rentalDays = 1) => {
    if (product.availableQuantity < quantity) {
      toast.error(`Only ${product.availableQuantity} items available`);
      return false;
    }
    // Check if item already exists in cart (same product and rentalDays)
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
    // Sync to backend after add
    syncCartToBackend([
      ...state.items,
      { product, quantity, rentalDays }
    ]);
    toast.success(`${product.name} added to cart`);
    return true;
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    const newItems = state.items.filter(item => item.product._id !== productId);
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId,
    });
    // Sync to backend after remove
    syncCartToBackend(newItems);
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
    const newItems = state.items.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    );
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        productId,
        quantity,
      },
    });
    // Sync to backend after update
    syncCartToBackend(newItems);
  };

  // Update rental days
  const updateRentalDays = (days) => {
    if (days < 1) {
      toast.error('Rental days must be at least 1');
      return;
    }
    const newItems = state.items.map(item => ({ ...item, rentalDays: days }));
    dispatch({
      type: 'UPDATE_RENTAL_DAYS',
      payload: days,
    });
    // Sync to backend after update
    syncCartToBackend(newItems);
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    // Sync to backend after clear
    syncCartToBackend([]);
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