import { loadProgress } from '../loadProgress';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
}));

describe('loadProgress', () => {
  const mockedDoc = doc as jest.Mock;
  const mockedGetDoc = getDoc as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return TreeProgress when document exists', async () => {
    const mockProgress = {
      algebra: { subskills: ['fractions'], completedAt: '2023-01-01' },
    };
    mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => mockProgress });

    const result = await loadProgress('user123', 'math');

    expect(mockedDoc).toHaveBeenCalledWith(expect.any(Object), 'users', 'user123', 'progress', 'math');
    expect(result).toEqual(mockProgress);
  });

  it('should return empty object when document does not exist', async () => {
    mockedGetDoc.mockResolvedValue({ exists: () => false });

    const result = await loadProgress('user123', 'math');

    expect(result).toEqual({});
  });

  it('should throw error on Firestore failure', async () => {
    mockedGetDoc.mockImplementation(() => {
      throw new Error('Firestore is down');
    });

    await expect(loadProgress('user123', 'math')).rejects.toThrow('Failed to load progress');
  });
});
