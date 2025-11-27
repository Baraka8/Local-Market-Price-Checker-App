import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  where,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Market, Product, Category } from '../types';

export class MarketService {
  // Get all markets
  static async getAllMarkets(): Promise<Market[]> {
    try {
      const q = query(
        collection(db, 'markets'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Market[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch markets');
    }
  }

  // Get market by ID
  static async getMarketById(marketId: string): Promise<Market | null> {
    try {
      const marketDoc = await getDoc(doc(db, 'markets', marketId));
      if (marketDoc.exists()) {
        return {
          id: marketDoc.id,
          ...marketDoc.data(),
          createdAt: marketDoc.data().createdAt?.toDate() || new Date(),
        } as Market;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch market');
    }
  }

  // Get nearby markets
  static async getNearbyMarkets(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<Market[]> {
    try {
      // Note: Firestore doesn't support geospatial queries natively
      // This is a simplified version. For production, use GeoFirestore or similar
      const allMarkets = await this.getAllMarkets();

      return allMarkets.filter((market) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          market.location.latitude,
          market.location.longitude
        );
        return distance <= radiusKm;
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch nearby markets');
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, 'categories'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }

  // Get products by category
  static async getProductsByCategory(
    categoryId: string
  ): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'),
        where('categoryId', '==', categoryId),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Product[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Product[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  }
}

