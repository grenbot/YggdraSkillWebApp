import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import subskillsReducer from './features/subskills/subskillsSlice';
import progressReducer from './features/progress/progressSlice';

// Combine reducers
const rootReducer = combineReducers({
  subskills: subskillsReducer,
  progress: progressReducer,
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
};

// Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware customization
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store); // Create the persistor
export default store;
