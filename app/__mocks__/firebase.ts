// Mock Firebase modules
export const mockInitializeApp = jest.fn(() => ({}));
export const mockGetApps = jest.fn(() => []);
export const mockGetFirestore = jest.fn(() => ({}));
export const mockGetAuth = jest.fn(() => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
}));

jest.mock("firebase/app", () => ({
  initializeApp: (...args: any[]) => mockInitializeApp(...args),
  getApps: () => mockGetApps(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: () => mockGetFirestore(),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: "order-123" })),
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn((_, success) => {
    success({
      docs: [],
      empty: true,
    });
    return jest.fn();
  }),
  serverTimestamp: jest.fn(() => new Date("2024-01-01")),
}));

jest.mock("firebase/auth", () => ({
  getAuth: () => mockGetAuth(),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(() => Promise.resolve({ user: { uid: "user-123" } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null);
    return jest.fn();
  }),
}));
