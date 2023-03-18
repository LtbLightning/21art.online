import { createSlice } from "@reduxjs/toolkit"

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    currentImageSet: [],
    nextImageSet: [],
    PreviousImageSet: [],
    sortedData: [],
    isLoading: false
  },
  reducers: {
    getImagesFetch: (state) => {
      state.isLoading = true
    },
    getImagesSuccess: (state, action) => {
      state.currentImageSet = action.payload
      state.isLoading = false
    },
    getImagesFailure: (state) => {
      state.isLoading = false
    },
    // For next images
    getNextImagesFetch: (state) => {
      state.isLoading = true
    },
    getNextImagesSuccess: (state, action) => {
      state.nextImageSet = action.payload
      state.isLoading = false
    },
    getNextImagesFailure: (state) => {
      state.isLoading = false
    },
    // For previous images
    getPreviousImagesFetch: (state) => {
      state.isLoading = true
    },
    getPreviousImagesSuccess: (state, action) => {
      state.PreviousImageSet = action.payload
      state.isLoading = false
    },
    getPreviousImagesFailure: (state) => {
      state.isLoading = false
    },
    // For sorted Data
    getSortedDataFetch: (state) => {
      state.isLoading = true
    },
    getSortedDataSuccess: (state, action) => {
      state.sortedData = action.payload
      state.isLoading = false
    },
    getSortedDataFailure: (state) => {
      state.isLoading = false
    }
  }
})

export const {
  getImagesFetch,
  getImagesSuccess,
  getImagesFailure,
  getNextImagesFetch,
  getNextImagesSuccess,
  getNextImagesFailure,
  getPreviousImagesFetch,
  getPreviousImagesSuccess,
  getPreviousImagesFailure,
  getSortedDataFetch,
  getSortedDataSuccess,
  getSortedDataFailure
} = gallerySlice.actions
export const reducer = gallerySlice.reducer