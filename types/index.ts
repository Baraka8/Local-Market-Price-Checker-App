// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'vendor' | 'admin';
  createdAt: Date;
  language: 'en' | 'rw';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  otpVerified?: boolean;
  otpRequestedAt?: Date;
}

// Market Types
export interface Market {
  id: string;
  name: string;
  nameRw?: string; // Kinyarwanda name
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  operatingHours?: {
    open: string;
    close: string;
  };
  createdAt: Date;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  nameRw: string;
  icon?: string;
  sector: 'groceries' | 'clothing' | 'electronics' | 'household' | 'services' | 'other';
}

// Product/Item Types
export interface Product {
  id: string;
  name: string;
  nameRw?: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  unit: string; // e.g., "kg", "piece", "liter"
  imageUrl?: string;
  createdAt: Date;
}

// Price Entry Types
export interface PriceEntry {
  id: string;
  productId: string;
  productName: string;
  marketId: string;
  marketName: string;
  price: number;
  unit: string;
  submittedBy: string; // User UID
  submittedByName?: string;
  verified: boolean;
  verifiedBy?: string; // Admin UID
  verifiedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Price Alert Types
export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  marketId?: string; // Optional: specific market or all markets
  thresholdType: 'increase' | 'decrease' | 'both';
  thresholdPercent: number; // e.g., 10 for 10%
  currentPrice?: number;
  isActive: boolean;
  createdAt: Date;
}

// Favorite Types
export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  createdAt: Date;
}

// Price Trend Types
export interface PriceTrend {
  productId: string;
  productName: string;
  marketId?: string;
  dataPoints: {
    date: Date;
    price: number;
    verified: boolean;
  }[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
}

