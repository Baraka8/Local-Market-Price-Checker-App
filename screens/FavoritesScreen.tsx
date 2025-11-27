import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FavoriteService } from '../services/favoriteService';
import { PriceService } from '../services/priceService';
import { Favorite, PriceEntry } from '../types';

export const FavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceEntry>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  const loadFavorites = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const favs = await FavoriteService.getUserFavorites(currentUser.uid);
      setFavorites(favs);

      // Load prices for each favorite
      const pricePromises = favs.map(async (fav) => {
        const priceList = await PriceService.getPricesByProduct(fav.productId, undefined, true);
        return { productId: fav.productId, price: priceList[0] || null };
      });

      const priceResults = await Promise.all(pricePromises);
      const priceMap: Record<string, PriceEntry> = {};
      priceResults.forEach(({ productId, price }) => {
        if (price) {
          priceMap[productId] = price;
        }
      });
      setPrices(priceMap);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!currentUser) return;

    try {
      await FavoriteService.removeFavorite(currentUser.uid, productId);
      setFavorites(favorites.filter((f) => f.productId !== productId));
      const newPrices = { ...prices };
      delete newPrices[productId];
      setPrices(newPrices);
    } catch (error: any) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const renderFavoriteItem = ({ item }: { item: Favorite }) => {
    const price = prices[item.productId];

    return (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => navigation.navigate('PriceDetail', { productId: item.productId })}
      >
        <View style={styles.favoriteContent}>
          <Text style={styles.productName}>{item.productName}</Text>
          {price ? (
            <View>
              <Text style={styles.priceValue}>
                {price.price} {price.unit}
              </Text>
              <Text style={styles.marketName}>{price.marketName}</Text>
            </View>
          ) : (
            <Text style={styles.noPriceText}>No price data available</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.productId)}
        >
          <Text style={styles.removeButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>{t('favorites.empty')}</Text>
        <Text style={styles.emptyText}>{t('favorites.emptyDesc')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      renderItem={renderFavoriteItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  favoriteContent: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  marketName: {
    fontSize: 14,
    color: '#666',
  },
  noPriceText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f44336',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

