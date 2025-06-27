import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
      const filteredItems = state.items.filter(item => item.product._id !== action.payload.productId);
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

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
    toast.success(`${product.name} added to cart`);
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