import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthService } from '../services/authService';
import { OtpService } from '../services/otpService';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const startResendCooldown = () => {
    setResendCooldown(30);
  };

  const handleAuthSubmit = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), 'Please fill in all required fields');
      return;
    }

    if (isSignUp && !displayName) {
      Alert.alert(t('common.error'), 'Please enter your display name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const user = await signUp(email, password, displayName, language);
        if (user) {
          setPendingUserId(user.uid);
          setPendingEmail(user.email ?? email);
          setOtpStep(true);
          Alert.alert('OTP Sent', 'Please check your email for the verification code.');
          startResendCooldown();
        }
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      if (error.code === 'otp-required') {
        setPendingUserId(error.uid);
        setPendingEmail(error.email ?? email);
        setOtpStep(true);
        Alert.alert('OTP Required', 'Please enter the OTP sent to your email.');
        startResendCooldown();
      } else {
        Alert.alert(t('common.error'), error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pendingUserId || !otpCode) {
      Alert.alert(t('common.error'), 'Enter the OTP code you received.');
      return;
    }
    setLoading(true);
    try {
      await AuthService.verifyOtp(pendingUserId, otpCode);
      Alert.alert('Success', 'Your email has been verified. Please sign in.');
      setOtpStep(false);
      setOtpCode('');
      setIsSignUp(false);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingUserId || !pendingEmail) {
      Alert.alert(t('common.error'), 'No pending verification found.');
      return;
    }
    if (resendCooldown > 0) {
      return;
    }
    try {
      await OtpService.requestOtp(pendingUserId, pendingEmail);
      Alert.alert('OTP Sent', 'Check your email for the new code.');
      startResendCooldown();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[styles.langButton, language === 'en' && styles.langButtonActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, language === 'rw' && styles.langButtonActive]}
            onPress={() => setLanguage('rw')}
          >
            <Text style={[styles.langText, language === 'rw' && styles.langTextActive]}>
              Kinyarwanda
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('auth.displayName')}</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('auth.displayName')}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.password')}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuthSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? t('auth.signUp') : t('auth.signIn')}
              </Text>
            )}
          </TouchableOpacity>

          {!otpStep && (
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
                <Text style={styles.switchLink}>
                  {isSignUp ? t('auth.signIn') : t('auth.signUp')}
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          {otpStep && (
            <View style={styles.otpContainer}>
              <Text style={styles.otpTitle}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="6-digit code"
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.resendButton,
                  resendCooldown > 0 && styles.buttonDisabled,
                ]}
                onPress={handleResendOtp}
                disabled={resendCooldown > 0}
              >
                <Text style={styles.resendText}>
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 10,
  },
  langButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  langButtonActive: {
    backgroundColor: '#4CAF50',
  },
  langText: {
    color: '#666',
    fontWeight: '500',
  },
  langTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  otpContainer: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  resendText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

