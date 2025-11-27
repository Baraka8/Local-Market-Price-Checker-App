import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { PriceEntry, Product, Market, PriceTrend } from '../types';

export class PriceService {
  // Get prices by product
  static async getPricesByProduct(
    productId: string,
    marketId?: string,
    verifiedOnly: boolean = false
  ): Promise<PriceEntry[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('productId', '==', productId),
        orderBy('createdAt', 'desc'),
        limit(50),
      ];

      if (marketId) {
        constraints.unshift(where('marketId', '==', marketId));
      }

      if (verifiedOnly) {
        constraints.unshift(where('verified', '==', true));
      }

      const q = query(collection(db, 'prices'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
      })) as PriceEntry[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch prices');
    }
  }

  // Get prices by market
  static async getPricesByMarket(
    marketId: string,
    categoryId?: string
  ): Promise<PriceEntry[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('marketId', '==', marketId),
        orderBy('createdAt', 'desc'),
        limit(100),
      ];

      if (categoryId) {
        constraints.unshift(where('categoryId', '==', categoryId));
      }

      const q = query(collection(db, 'prices'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
      })) as PriceEntry[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch prices');
    }
  }

  // Submit new price
  static async submitPrice(
    priceData: Omit<PriceEntry, 'id' | 'createdAt' | 'updatedAt' | 'verified' | 'verifiedBy' | 'verifiedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'prices'), {
        ...priceData,
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit price');
    }
  }

  // Verify price (admin only)
  static async verifyPrice(
    priceId: string,
    adminId: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'prices', priceId), {
        verified: true,
        verifiedBy: adminId,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify price');
    }
  }

  // Get price trends
  static async getPriceTrends(
    productId: string,
    marketId?: string,
    days: number = 30
  ): Promise<PriceTrend> {
    try {
      const constraints: QueryConstraint[] = [
        where('productId', '==', productId),
        orderBy('createdAt', 'desc'),
        limit(100),
      ];

      if (marketId) {
        constraints.unshift(where('marketId', '==', marketId));
      }

      const q = query(collection(db, 'prices'), ...constraints);
      const snapshot = await getDocs(q);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const dataPoints = snapshot.docs
        .map((doc) => ({
          date: doc.data().createdAt?.toDate() || new Date(),
          price: doc.data().price as number,
          verified: doc.data().verified as boolean,
        }))
        .filter((point) => point.date >= cutoffDate)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const prices = dataPoints.map((p) => p.price);
      const averagePrice =
        prices.reduce((sum, p) => sum + p, 0) / prices.length || 0;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (dataPoints.length >= 2) {
        const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
        const secondHalf = prices.slice(Math.floor(prices.length / 2));
        const firstAvg =
          firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
        const secondAvg =
          secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (change > 5) trend = 'up';
        else if (change < -5) trend = 'down';
      }

      const productDoc = await getDoc(doc(db, 'products', productId));
      const productName = productDoc.data()?.name || 'Unknown';

      return {
        productId,
        productName,
        marketId,
        dataPoints,
        averagePrice,
        minPrice,
        maxPrice,
        trend,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get price trends');
    }
  }

  // Search prices
  static async searchPrices(
    searchTerm: string,
    categoryId?: string,
    marketId?: string
  ): Promise<PriceEntry[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation. For production, consider Algolia or similar
      const constraints: QueryConstraint[] = [
        orderBy('createdAt', 'desc'),
        limit(50),
      ];

      if (categoryId) {
        constraints.unshift(where('categoryId', '==', categoryId));
      }

      if (marketId) {
        constraints.unshift(where('marketId', '==', marketId));
      }

      const q = query(collection(db, 'prices'), ...constraints);
      const snapshot = await getDocs(q);

      const results = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as PriceEntry[];

      // Client-side filtering (basic)
      const term = searchTerm.toLowerCase();
      return results.filter(
        (entry) =>
          entry.productName.toLowerCase().includes(term) ||
          entry.marketName.toLowerCase().includes(term)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search prices');
    }
  }
}

