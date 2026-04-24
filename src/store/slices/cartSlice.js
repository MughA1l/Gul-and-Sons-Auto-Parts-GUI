import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../api/cartApi';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart();
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await cartApi.addToCart(data);
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartApi.updateItem(itemId, quantity);
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await cartApi.removeItem(itemId);
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartApi.clearCart();
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => { state.cart = null; },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.isLoading = true; };
    const setCart = (state, action) => {
      state.isLoading = false;
      state.cart = action.payload;
    };
    const setError = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchCart.pending, setLoading)
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, setError)

      .addCase(addToCart.pending, setLoading)
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success('Added to cart! 🛒');
      })
      .addCase(addToCart.rejected, (state, action) => {
        setError(state, action);
        toast.error(action.payload || 'Failed to add to cart');
      })

      .addCase(updateCartItem.pending, setLoading)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(updateCartItem.rejected, setError)

      .addCase(removeFromCart.pending, setLoading)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success('Item removed from cart');
      })
      .addCase(removeFromCart.rejected, setError)

      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
        state.isLoading = false;
      });
  },
});

// Selectors
export const selectCartItemCount = (state) =>
  state.cart.cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

export const selectCartSubtotal = (state) =>
  state.cart.cart?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
