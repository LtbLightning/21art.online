import { createSlice } from "@reduxjs/toolkit"

export const nostrSlice = createSlice({
  name: 'nostr',
  initialState: {
    relay: null,
    isLoggedIn: false,
    npub: null,
    isLoading: false,
    mockData: {
      originalEvent: {
        "kind": 1,
        "content": "Abstract Citadel: \nClick to Enjoy 21Art.Online: https://21artonline.s3.amazonaws.com/21artonlineimageaabb3_fullsize.png\n\nhttps://21artonline.s3.amazonaws.com/21artonlineimageaabb3_thumbnail.png\n",
        "tags": [],
        "created_at": 1678597703,
        "pubkey": "4dcae5c60ed258e687ecd4decade045740926054ff656582cf47d38416f28629",
        "id": "edfe6c501037cd1b90fa86801a799533e153471726289af3fa855eb022223b1a",
        "sig": "46b20b25c26eeeeb3e4371b7fac8d7b2d9e9464cc90d8ca23d30c10a9c2af5a044f5578d801241a8a72a8ffa66b4005f05c876b0c82fdd051ea86e01208a18a3"
      }
    }
  },
  reducers: {
    // NIP07 Login
    doNIP07Login: (state) => {
    },
    doNIP07LoginSuccess: (state, action) => {
      state.isLoggedIn = true
      state.npub = action.payload
    },
    doNIP07LoginFailure: (state) => {
      state.isLoggedIn = false
      state.npub = null
    },

    // Get Events
    getEvents: (state) => {
    },
    getEventsSuccess: (state, action) => {
      console.log('getEventsSuccess ', action.payload)
      state.relay = action.payload
    },
    getEventsFailure: (state) => {
    },
    // Like Event
    doLikeEvent: (state, actioin) => {
    },
    doLikeEventSuccess: (state, action) => {
      state.events = action.payload
    },
    doLikeEventFailure: (state) => {
    },
    // internal use, not exposed to UI
    // publish list of events
    publishArtEvents: (state, action) => {
      state.events = action.payload
    }
  }
})

export const {
  doNIP07Login,
  doNIP07LoginSuccess,
  doNIP07LoginFailure,
  getEvents,
  getEventsSuccess,
  getEventsFailure,
  doLikeEvent,
  doLikeEventSuccess,
  doLikeEventFailure,
  publishArtEvents
} = nostrSlice.actions

export const nostrReducer = nostrSlice.reducer