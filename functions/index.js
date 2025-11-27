const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

const OTP_TTL_MINUTES = 10;
const MAILER_CONFIG = functions.config().mailer || {};

const transporter = nodemailer.createTransport({
  service: MAILER_CONFIG.service || 'gmail',
  auth: {
    user: MAILER_CONFIG.user,
    pass: MAILER_CONFIG.pass,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// Check price alerts and send notifications
exports.checkPriceAlerts = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const alertsSnapshot = await db
        .collection('alerts')
        .where('isActive', '==', true)
        .get();

      const batch = db.batch();
      let notificationsSent = 0;

      for (const alertDoc of alertsSnapshot.docs) {
        const alert = alertDoc.data();
        
        // Get latest verified prices for the product
        const pricesSnapshot = await db
          .collection('prices')
          .where('productId', '==', alert.productId)
          .where('verified', '==', true)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (pricesSnapshot.empty) continue;

        const latestPrice = pricesSnapshot.docs[0].data();
        const currentPrice = latestPrice.price;
        const previousPrice = alert.currentPrice || currentPrice;

        if (previousPrice && previousPrice !== currentPrice) {
          const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
          const threshold = alert.thresholdPercent;

          let shouldTrigger = false;
          if (alert.thresholdType === 'increase' && changePercent >= threshold) {
            shouldTrigger = true;
          } else if (alert.thresholdType === 'decrease' && changePercent <= -threshold) {
            shouldTrigger = true;
          } else if (alert.thresholdType === 'both' && Math.abs(changePercent) >= threshold) {
            shouldTrigger = true;
          }

          if (shouldTrigger) {
            // Update alert with new price
            batch.update(alertDoc.ref, {
              currentPrice: currentPrice,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Create notification document (to be sent via FCM)
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
              userId: alert.userId,
              type: 'priceAlert',
              title: 'Price Alert',
              body: `${alert.productName} price changed by ${changePercent.toFixed(2)}%`,
              data: {
                productId: alert.productId,
                productName: alert.productName,
                oldPrice: previousPrice,
                newPrice: currentPrice,
                changePercent: changePercent.toFixed(2),
              },
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            notificationsSent++;
          }
        } else if (!alert.currentPrice) {
          // First time checking, set current price
          batch.update(alertDoc.ref, {
            currentPrice: currentPrice,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      await batch.commit();
      console.log(`Processed ${alertsSnapshot.size} alerts, sent ${notificationsSent} notifications`);
      return null;
    } catch (error) {
      console.error('Error checking price alerts:', error);
      return null;
    }
  });

// Send push notification when notification document is created
exports.sendNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    // Get user's FCM token
    const userDoc = await db.collection('users').doc(notification.userId).get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token for user:', notification.userId);
      return null;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type: notification.type,
        ...notification.data,
      },
      token: fcmToken,
    };

    try {
      await admin.messaging().send(message);
      console.log('Notification sent to user:', notification.userId);
      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

// Audit log for admin actions
exports.logAdminAction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  await db.collection('auditLogs').add({
    adminId: context.auth.uid,
    action: data.action,
    target: data.target,
    details: data.details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

// Clean up old unverified prices (older than 30 days)
exports.cleanupOldPrices = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldPricesSnapshot = await db
        .collection('prices')
        .where('verified', '==', false)
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();

      const batch = db.batch();
      let deletedCount = 0;

      oldPricesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      await batch.commit();
      console.log(`Deleted ${deletedCount} old unverified prices`);
      return null;
    } catch (error) {
      console.error('Error cleaning up old prices:', error);
      return null;
    }
  });

// On user creation, set default role
exports.setDefaultUserRole = functions.auth.user().onCreate(async (user) => {
  try {
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      language: 'en',
      otpVerified: false,
    }, { merge: true });
    console.log('Default user role set for:', user.uid);
    return null;
  } catch (error) {
    console.error('Error setting default user role:', error);
    return null;
  }
});

exports.requestRegistrationOtp = functions.https.onCall(async (data, context) => {
  const { uid, email, displayName } = data;
  if (!uid || !email) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing uid or email.');
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
  );

  await db.collection('users').doc(uid).set(
    {
      otpVerified: false,
      otpRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
      otp: {
        hash: otpHash,
        expiresAt,
      },
    },
    { merge: true }
  );

  try {
    await transporter.sendMail({
      from: MAILER_CONFIG.from || MAILER_CONFIG.user,
      to: email,
      subject: 'Your Local Market Price Checker OTP Code',
      text: `Hello ${displayName || ''},\n\nYour verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.\n\nIf you did not request this, please ignore.\n`,
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send OTP email.');
  }

  return { success: true };
});

exports.verifyRegistrationOtp = functions.https.onCall(async (data, context) => {
  const { uid, otp } = data;
  if (!uid || !otp) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing uid or otp.');
  }

  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found.');
  }

  const otpData = userDoc.data().otp;
  if (!otpData) {
    throw new functions.https.HttpsError('failed-precondition', 'No OTP pending verification.');
  }

  if (otpData.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError('deadline-exceeded', 'OTP has expired. Please request a new one.');
  }

  if (otpData.hash !== hashOtp(otp)) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid OTP code.');
  }

  await userRef.update({
    otpVerified: true,
    otp: admin.firestore.FieldValue.delete(),
  });

  return { success: true };
});

