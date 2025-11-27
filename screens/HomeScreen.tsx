import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { PriceService } from '../services/priceService';
import { MarketService } from '../services/marketService';
import { PriceEntry, Market } from '../types';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useLanguage();
  const [recentPrices, setRecentPrices] = useState<PriceEntry[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load recent prices and markets
      // Note: This is a simplified version. In production, you'd have a dedicated endpoint
      const allMarkets = await MarketService.getAllMarkets();
      setMarkets(allMarkets.slice(0, 5)); // Show top 5
      
      // For recent prices, we'd need to implement a proper query
      // For now, we'll show empty state
      setRecentPrices([]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.nearbyMarkets')}</Text>
        {markets.length > 0 ? (
          markets.map((market) => (
            <TouchableOpacity
              key={market.id}
              style={styles.marketCard}
              onPress={() => navigation.navigate('Search', { marketId: market.id })}
            >
              <Text style={styles.marketName}>{market.name}</Text>
              <Text style={styles.marketAddress}>{market.location.address}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No markets available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.recentPrices')}</Text>
        {recentPrices.length > 0 ? (
          recentPrices.map((price) => (
            <View key={price.id} style={styles.priceCard}>
              <Text style={styles.priceProductName}>{price.productName}</Text>
              <Text style={styles.priceValue}>
                {price.price} {price.unit}
              </Text>
              <Text style={styles.priceMarket}>{price.marketName}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent prices</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => navigation.navigate('Submit')}
      >
        <Text style={styles.submitButtonText}>{t('nav.submit')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  marketCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  marketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  marketAddress: {
    fontSize: 14,
    color: '#666',
  },
  priceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  priceMarket: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

