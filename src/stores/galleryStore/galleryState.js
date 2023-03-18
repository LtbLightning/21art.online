import { createSlice } from "@reduxjs/toolkit"

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    images: [],
    isLoading: false,
    isLoggedIn: false,
    npub: null
  },
  reducers: {
    doNIP07Login: (state) => {
    },
    doNIP07LoginSuccess: (state, action) => {
      console.log("action.payload", action.payload)
      state.isLoggedIn = true
      state.npub = action.payload
    },
    doNIP07LoginFailure: (state) => {
      alert("There was a problem loggin in with your nostr extension\nPlease make sure you have getAlby or Nostore extension installed")
      state.isLoggedIn = false
      state.npub = null
    },
    getImagesFetch: (state) => {
      state.isLoading = true
    },
    getImagesSuccess: (state, action) => {
      state.images = action.payload
      state.isLoading = false
    },
    getImagesFailure: (state) => {
      state.isLoading = false
    }
  }
})

export const {
  getImagesFetch,
  getImagesSuccess,
  getImagesFailure,
  doNIP07Login,
  doNIP07LoginSuccess,
  doNIP07LoginFailure
} = gallerySlice.actions

export const reducer = gallerySlice.reducer