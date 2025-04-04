import { saveProgress } from '../saveProgress';
import { auth } from '../firebaseConfig';

jest.mock('../firebaseConfig', () => ({
  auth: {
    currentUser: { uid: 'test-user-123' },
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(() =>
    Promise.resolve({ exists: () => true, data: () => ({ subskills: ['fractions'] }) })
  ),
  setDoc: jest.fn(() => Promise.resolve()),
}));

describe('saveProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = { uid: 'test-user-123' }; // reset auth user each test
  });

  it('should successfully save progress when user is logged in', async () => {
    await expect(
      saveProgress({ treeId: 'math', nodeId: 'algebra', completedSubskills: ['fractions'] })
    ).resolves.toBeDefined();
  });

  it('should not save progress when user is not logged in', async () => {
    (auth as any).currentUser = null;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await saveProgress({
      treeId: 'math',
      nodeId: 'algebra',
      completedSubskills: ['fractions'],
    });

    expect(consoleSpy).toHaveBeenCalledWith('User not logged in!');
    expect(result).toBeUndefined();

    consoleSpy.mockRestore();
  });
});
