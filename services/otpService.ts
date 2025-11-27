import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export class OtpService {
  static async requestOtp(uid: string, email: string, displayName?: string) {
    const callable = httpsCallable(functions, 'requestRegistrationOtp');
    await callable({ uid, email, displayName });
  }

  static async verifyOtp(uid: string, otp: string) {
    const callable = httpsCallable(functions, 'verifyRegistrationOtp');
    const result = await callable({ uid, otp });
    return result.data as { success: boolean };
  }
}

