import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Favorite } from '../types';

export class FavoriteService {
  // Add to favorites
  static async addFavorite(
    userId: string,
    productId: string,
    productName: string
  ): Promise<string> {
    try {
      // Check if already favorited
      const existing = await this.isFavorite(userId, productId);
      if (existing) {
        throw new Error('Product already in favorites');
      }

      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        productId,
        productName,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add favorite');
    }
  }

  // Remove from favorites
  static async removeFavorite(userId: string, productId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Favorite not found');
      }

      await deleteDoc(snapshot.docs[0].ref);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove favorite');
    }
  }

  // Get user favorites
  static async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Favorite[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch favorites');
    }
  }

  // Check if product is favorited
  static async isFavorite(
    userId: string,
    productId: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error: any) {
      return false;
    }
  }
}

