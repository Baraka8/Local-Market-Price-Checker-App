# Local Market Price Checker App

A comprehensive mobile application for checking and comparing market prices across Rwanda, built with React Native (Expo) and Node.js.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT
- **Market Browsing**: View all available markets across Rwanda
- **Product Catalog**: Browse products organized by categories
- **Price Comparison**: Compare prices across different markets
- **Price Submission**: Contribute real-time price information
- **Price Verification**: Admin verification system for submitted prices
- **Beautiful UI**: Modern, premium design with smooth animations

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Expo CLI (for mobile app)

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the `backend` directory with the following:
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=local_market_price_checker
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key
```

4. Create the database:
```sql
CREATE DATABASE local_market_price_checker;
```

5. Initialize database tables:
```bash
node src/scripts/initDb.js
```

6. (Optional) Seed the database with sample data:
```bash
node src/scripts/seedDb.js
```

7. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npx expo start
```

4. Run on your device:
   - Scan the QR code with the Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Markets
- `GET /api/markets` - Get all markets
- `GET /api/markets/:id` - Get market by ID
- `POST /api/markets` - Create market (requires auth)
- `PUT /api/markets/:id` - Update market (requires auth)
- `DELETE /api/markets/:id` - Delete market (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (requires auth)
- `GET /api/products/categories/all` - Get all categories
- `POST /api/products/categories` - Create category (requires auth)

### Prices
- `GET /api/prices` - Get all prices
- `GET /api/prices/product/:productId` - Get prices by product
- `GET /api/prices/market/:marketId` - Get prices by market
- `POST /api/prices` - Submit price (requires auth)
- `PATCH /api/prices/:id/verify` - Verify price (admin only)
- `DELETE /api/prices/:id` - Delete price (requires auth)

## 🏗️ Project Structure

```
Local-Market-Price-Checker-App/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── marketController.js
│   │   │   ├── productController.js
│   │   │   └── priceController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── marketRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── priceRoutes.js
│   │   ├── scripts/
│   │   │   ├── initDb.js
│   │   │   └── seedDb.js
│   │   ├── db/
│   │   │   └── schema.sql
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── mobile/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── navigation/
    │   │   └── AppNavigator.js
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── MarketsScreen.js
    │   │   ├── ProductsScreen.js
    │   │   ├── PriceSubmissionScreen.js
    │   │   └── PriceComparisonScreen.js
    │   └── services/
    │       ├── api.js
    │       └── storage.js
    ├── App.js
    └── package.json
```

## 👤 User Roles

- **Consumer**: Browse markets, view prices, submit prices
- **Vendor**: Same as consumer + manage their own prices
- **Admin**: Full access including price verification

## 🎨 Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs

### Frontend
- React Native (Expo)
- React Navigation
- Axios
- AsyncStorage

## 📝 License

This project is part of a final year project.

## 👥 Contributing

This is an academic project. For any questions or suggestions, please contact the project maintainer.

## 🙏 Acknowledgments

- Rwanda ICT sector for digital transformation initiatives
- All contributors to the open-source libraries used in this project