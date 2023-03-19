import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux'
import { combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga'
import { configureStore } from '@reduxjs/toolkit'
import { reducer } from './stores/galleryStore/galleryState'
import { nostrReducer } from './stores/nostrStore/nostrState'
import gallerySaga from './stores/galleryStore/gallerySaga'
import nostrSaga from './stores/nostrStore/nostrSaga'

const root = ReactDOM.createRoot(document.getElementById('root'));

const saga = createSagaMiddleware()
const rootReducer = combineReducers({
  gallery: reducer,
  nostr: nostrReducer
})

const store = configureStore({
  reducer: rootReducer,
  middleware: [saga]
})

saga.run(nostrSaga)
saga.run(gallerySaga)

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
