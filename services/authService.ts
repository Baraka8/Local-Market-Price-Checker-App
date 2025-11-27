import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';
import { OtpService } from './otpService';

export class AuthService {
  // Register new user
  static async register(
    email: string,
    password: string,
    displayName: string,
    language: 'en' | 'rw' = 'en'
  ): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      const userData: Omit<User, 'uid'> = {
        email: user.email!,
        displayName,
        role: 'user',
        createdAt: new Date(),
        language,
        otpVerified: false,
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
      });

      await OtpService.requestOtp(user.uid, user.email!, displayName);

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Sign in
  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  }

  // Sign out
  static async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Get user data from Firestore
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() } as User;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user data');
    }
  }

  // Update user profile
  static async updateUserProfile(
    uid: string,
    updates: Partial<User>
  ): Promise<void> {
    try {
      await setDoc(
        doc(db, 'users', uid),
        { ...updates, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  // Auth state observer
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Verify OTP
  static async verifyOtp(uid: string, otp: string): Promise<void> {
    try {
      await OtpService.verifyOtp(uid, otp);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }
}

