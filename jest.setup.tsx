import "@testing-library/jest-dom";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock Firebase
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
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
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  })),
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

// Mock our firebase.ts module
jest.mock("./lib/firebase", () => ({
  db: {},
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
}));

// Mock our firestore.ts module
jest.mock("./lib/firestore", () => ({
  createOrder: jest.fn(() => Promise.resolve("order-123")),
  getOrders: jest.fn((callback) => {
    callback([]);
    return jest.fn();
  }),
  getUserOrders: jest.fn((userId, callback) => {
    callback([]);
    return jest.fn();
  }),
  updateOrderStatus: jest.fn(() => Promise.resolve()),
  deleteBanner: jest.fn(() => Promise.resolve()),
  createBanner: jest.fn(() => Promise.resolve("banner-123")),
  getBanners: jest.fn((callback) => {
    callback([]);
    return jest.fn();
  }),
}));
