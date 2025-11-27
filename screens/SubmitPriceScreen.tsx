import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PriceService } from '../services/priceService';
import { MarketService } from '../services/marketService';
import { Product, Market } from '../types';

export const SubmitPriceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showMarketPicker, setShowMarketPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prods, marts] = await Promise.all([
        MarketService.getAllProducts(),
        MarketService.getAllMarkets(),
      ]);
      setProducts(prods);
      setMarkets(marts);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to load data');
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert(t('common.error'), 'Please sign in to submit prices');
      return;
    }

    if (!selectedProduct || !selectedMarket || !price) {
      Alert.alert(t('common.error'), 'Please fill in all required fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(t('common.error'), 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await PriceService.submitPrice({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        marketId: selectedMarket.id,
        marketName: selectedMarket.name,
        price: priceNum,
        unit: selectedProduct.unit,
        submittedBy: currentUser.uid,
        notes: notes || undefined,
      });

      Alert.alert(t('submit.success'), '', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedProduct(null);
            setSelectedMarket(null);
            setPrice('');
            setNotes('');
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(t('submit.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('submit.product')}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowProductPicker(true)}
          >
            <Text style={selectedProduct ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedProduct ? selectedProduct.name : t('submit.selectProduct')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('submit.market')}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowMarketPicker(true)}
          >
            <Text style={selectedMarket ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedMarket ? selectedMarket.name : t('submit.selectMarket')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('submit.price')}</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('submit.unit')}</Text>
          <Text style={styles.unitText}>
            {selectedProduct ? selectedProduct.unit : '-'}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('submit.notes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('submit.notes')}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('submit.submit')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('submit.selectProduct')}</Text>
            <ScrollView>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedProduct(product);
                    setShowProductPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowProductPicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Market Picker Modal */}
      {showMarketPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('submit.selectMarket')}</Text>
            <ScrollView>
              {markets.map((market) => (
                <TouchableOpacity
                  key={market.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedMarket(market);
                    setShowMarketPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{market.name}</Text>
                  <Text style={styles.pickerItemSubtext}>{market.location.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMarketPicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  unitText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

