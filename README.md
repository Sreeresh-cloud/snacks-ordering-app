# Snack Ordering App

A mobile-first snack ordering web application built with Next.js, Tailwind CSS, and Firebase Firestore.

## Features

### Customer Side (/)
- Browse a menu of 8+ snack items with prices in INR
- Add items to cart with quantity management
- Floating cart bar with expand/collapse functionality
- Checkout form with name, phone, and address fields
- Order submission to Firebase Firestore
- Success confirmation after placing order

### Admin Dashboard (/admin)
- Password-protected access (password: `admin123`)
- Real-time order updates via Firestore listeners
- View customer details, items, totals, and timestamps
- Mark orders as "Completed"
- Separate sections for Pending and Completed orders

## Tech Stack

- **Next.js 16+** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Firebase SDK v9+** (modular)
- **Firestore** for real-time database

## Project Structure

```
app/
  page.tsx              # Customer menu page
  admin/page.tsx        # Admin dashboard
  layout.tsx            # Root layout with viewport meta
  globals.css           # Global styles & Tailwind imports
  types/index.ts        # Shared TypeScript interfaces
  lib/
    firebase.ts         # Firebase initialization
    firestore.ts        # Firestore CRUD helpers
  components/
    MenuItem.tsx        # Snack item card with add button
    Cart.tsx            # Floating cart bar + drawer modal
    CheckoutForm.tsx    # Order placement form
    OrderCard.tsx       # Admin order display card
public/                 # Static assets
```

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to get your configuration
4. Enable Firestore Database
5. Create a collection named `orders`

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Firestore Rules (for testing)

In Firebase Console > Firestore Database > Rules, set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{order} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **Note**: These rules allow public read/write. Update them for production use.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the customer app.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Admin Access

- Password: `admin123`

## Building for Production

```bash
npm run build
```

## Notes

- All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- The app uses `useState` and `useEffect` for state management (no Redux/Context needed)
- Mobile-first design with `max-w-md` centered layout on desktop
- Large touch targets (min 44px) for mobile usability
- Uses emoji and colored divs as image placeholders (no external images required)

## License

MIT
