import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  loginStatus: boolean;
};

const checkInitialLoginStatus = (): boolean => {
  try {
    const user = localStorage.getItem("user");
    if (!user) return false;
    const parsed = JSON.parse(user);
    return Boolean(parsed && parsed.id);
  } catch {
    return false;
  }
};

const initialState: AuthState = {
  loginStatus: checkInitialLoginStatus(),
};

export const authSlice = createSlice({
  name: "auth",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setLoginStatus: (state, action: PayloadAction<boolean>) => {
      state.loginStatus = action.payload;
      
    },
  },
});

export const { setLoginStatus } = authSlice.actions;

export default authSlice.reducer;
