import { createSlice } from "@reduxjs/toolkit"

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    currentImageSet: [],
    nextImageSet: [],
    previousImageSet: [],
    unsortedEventList: [],
    sortedData: [],
    isLoading: false
  },
  reducers: {
    // add each event to the unsorted event list
    addUnsortedEvent: (state, action) => {
      console.log("Adding unsorted event ", action.payload)
      state.unsortedEventList = (action.payload)
    },
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
    // For updating Images states
    updateImagesSet: (state, action) => {
      if (action.payload.imagesSetType === 'currentImageSet') {
        state.currentImageSet = action.payload.imagesSet
      }
      else if (action.payload.imagesSetType === 'nextImageSet') {
        state.nextImageSet = action.payload.imagesSet
      }
      else {
        state.previousImageSet = action.payload.imagesSet
      }
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
      state.previousImageSet = action.payload
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
  addUnsortedEvent,
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
  getSortedDataFailure,
  updateImagesSet
} = gallerySlice.actions

export const reducer = gallerySlice.reducer