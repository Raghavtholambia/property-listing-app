// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart(state, action) {
//       const item = action.payload;
//       const exist = state.cartItems.find(i => i._id === item._id);
//       if (exist) {
//         exist.quantity += 1;
//       } else {
//         state.cartItems.push({ ...item, quantity: 1 });
//       }
//       localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
//     },
//     removeFromCart(state, action) {
//       state.cartItems = state.cartItems.filter(i => i._id !== action.payload);
//       localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
//     },
//     clearCart(state) {
//       state.cartItems = [];
//       localStorage.removeItem("cartItems");
//     }
//   }
// });

// export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;

