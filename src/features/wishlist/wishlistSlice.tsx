import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type WishlistState = {
  wishlistItems: Product[];
};

const getInitialWishlist = (): Product[] => {
  try {
    const stored = localStorage.getItem("inspiredbynature_wishlist");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const initialState: WishlistState = {
  wishlistItems: getInitialWishlist(),
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.wishlistItems.find((item) => item.id === action.payload.id);
      if (exists) {
        state.wishlistItems = state.wishlistItems.filter((item) => item.id !== action.payload.id);
      } else {
        state.wishlistItems.push(action.payload);
      }
      localStorage.setItem("inspiredbynature_wishlist", JSON.stringify(state.wishlistItems));
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      localStorage.removeItem("inspiredbynature_wishlist");
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
