import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </LanguageProvider>
    </AuthProvider>
  );
}
