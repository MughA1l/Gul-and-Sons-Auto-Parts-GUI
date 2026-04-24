import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    filters: {
      keyword: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      make: '',
      model: '',
      year: '',
      sort: 'newest',
    },
    currentPage: 1,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = { keyword: '', category: '', brand: '', minPrice: '', maxPrice: '', make: '', model: '', year: '', sort: 'newest' };
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
});

export const { setFilters, resetFilters, setPage } = productSlice.actions;
export default productSlice.reducer;
