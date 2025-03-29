import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProgressProvider } from './AuthProgressContext';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate
import store, { persistor } from './store'; // Import store and persistor

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<p>Loading...</p>} persistor={persistor}>
        <AuthProgressProvider>
          <App />
        </AuthProgressProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
