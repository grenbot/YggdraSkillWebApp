import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProgressContext } from '../AuthProgressContext';
import App from '../App';
import * as saveProgressModule from '../saveProgress';
import * as loadProgressModule from '../loadProgress';
import { SkillTree } from '../types/sharedTypes';

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: '',
};

const mockMetadata: Record<string, SkillTree> = {
  tree1: {
    key: 'tree1',
    title: 'Test Tree',
    description: 'A test skill tree',
    tags: ['test'],
    nodes: [
      {
        id: 'node1',
        label: 'Test Node',
        description: 'Test node description',
      }
    ],
    metadata: {
      edges: [],
    },
  },
};

const mockProgress = {
  tree1: {
    node1: {
      subskills: [],
    },
  },
};

jest.spyOn(loadProgressModule, 'loadProgress');
jest.spyOn(saveProgressModule, 'saveProgress');

describe('Full App Flow Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadProgressModule.loadProgress as jest.Mock).mockResolvedValue(mockProgress.tree1);
    (saveProgressModule.saveProgress as jest.Mock).mockResolvedValue(undefined);
  });

  it('logs in, selects a node, marks progress, and saves it', async () => {
    render(
      <AuthProgressContext.Provider
        value={{
          user: mockUser,
          authChecked: true,
          metadata: mockMetadata,
          dispatch: jest.fn(),
        }}
      >
        <App />
      </AuthProgressContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    const nodeLink = await screen.findByText(/Test Node/i);
    fireEvent.click(nodeLink);

    const markButton = await screen.findByRole('button', { name: /mark complete/i });
    fireEvent.click(markButton);

    await waitFor(() => {
      expect(saveProgressModule.saveProgress).toHaveBeenCalledWith({
        treeId: 'tree1',
        nodeId: 'node1',
        completedSubskills: [],
      });
    });
  });
});
