import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { PriceAlert } from '../types';
import { PriceService } from './priceService';

export class AlertService {
  // Create price alert
  static async createAlert(
    alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'alerts'), {
        ...alertData,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create alert');
    }
  }

  // Get user alerts
  static async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const q = query(
        collection(db, 'alerts'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as PriceAlert[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch alerts');
    }
  }

  // Delete alert
  static async deleteAlert(alertId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'alerts', alertId));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete alert');
    }
  }

  // Deactivate alert
  static async deactivateAlert(alertId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to deactivate alert');
    }
  }

  // Check alerts (should be called by Cloud Function or scheduled task)
  static async checkAlerts(): Promise<void> {
    try {
      const q = query(
        collection(db, 'alerts'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);

      for (const alertDoc of snapshot.docs) {
        const alert = {
          id: alertDoc.id,
          ...alertDoc.data(),
        } as PriceAlert;

        // Get current prices
        const prices = await PriceService.getPricesByProduct(
          alert.productId,
          alert.marketId,
          true // verified only
        );

        if (prices.length > 0) {
          const currentPrice = prices[0].price;
          const previousPrice = alert.currentPrice || currentPrice;

          if (previousPrice) {
            const changePercent =
              ((currentPrice - previousPrice) / previousPrice) * 100;

            // Check if threshold is met
            const shouldTrigger =
              (alert.thresholdType === 'increase' && changePercent >= alert.thresholdPercent) ||
              (alert.thresholdType === 'decrease' && changePercent <= -alert.thresholdPercent) ||
              (alert.thresholdType === 'both' &&
                Math.abs(changePercent) >= alert.thresholdPercent);

            if (shouldTrigger) {
              // Update alert with new price
              await updateDoc(doc(db, 'alerts', alert.id), {
                currentPrice,
                updatedAt: serverTimestamp(),
              });

              // Trigger notification (this would be handled by Cloud Function)
              // For now, we'll just log it
              console.log(`Alert triggered for ${alert.productName}: ${changePercent.toFixed(2)}% change`);
            }
          } else {
            // First time checking, set current price
            await updateDoc(doc(db, 'alerts', alert.id), {
              currentPrice,
              updatedAt: serverTimestamp(),
            });
          }
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check alerts');
    }
  }
}

