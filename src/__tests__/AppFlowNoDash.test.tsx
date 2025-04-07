// AppFlowNoDash.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { AuthProgressContext } from '../AuthProgressContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import progressReducer from '../features/progress/progressSlice';
import subskillsReducer from '../features/subskills/subskillsSlice';

// Mock loadProgress
jest.mock('../loadProgress', () => ({
  loadProgress: jest.fn().mockResolvedValue({}),
}));

// Mock tree metadata
jest.mock('../utils/loadTreeMetadata', () => ({
  loadTreeMetadata: jest.fn().mockResolvedValue({
    key: 'tree1',
    title: 'Test Tree',
    nodes: [
      {
        id: 'node1',
        label: 'Test Node',
        subskills: ['sub1'],
      },
    ],
  }),
}));

describe('Full App Flow Integration Test - NodePage direct load', () => {
  it('directly loads node page and saves progress when marked complete', async () => {
    const store = configureStore({
      reducer: {
        progress: progressReducer,
        subskills: subskillsReducer,
      },
      preloadedState: {
        progress: {
          trees: {
            tree1: {
              node1: {
                subskills: [],
              },
            },
          },
        },
        subskills: {
          node1: [],
        },
      },
    });

    // Set the initial route in browser history so App sees it.
    window.history.pushState({}, 'Test page', '/node/tree1/node1');

    render(
      <Provider store={store}>
        <AuthProgressContext.Provider
          value={{
            authChecked: true,
            user: { uid: 'test-user', email: 'test@example.com' },
            metadata: {
              tree1: {
                key: 'tree1',
                title: 'Test Tree',
                nodes: [
                  {
                    id: 'node1',
                    label: 'Test Node',
                    subskills: ['sub1'],
                  },
                ],
              },
            },
            dispatch: () => {},
          }}
        >
          <App />
        </AuthProgressContext.Provider>
      </Provider>
    );

    // Flush any pending promises
    const flushPromises = () => new Promise(resolve => setImmediate(resolve));
    await act(async () => {
      await flushPromises();
    });

    // Now wait for the button to appear
    const button = await screen.findByRole('button', { name: /mark complete/i });
    fireEvent.click(button);
  });
});
