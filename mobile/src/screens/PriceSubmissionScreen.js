import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { getMarkets, getProducts, submitPrice } from '../services/api';

const PriceSubmissionScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [markets, setMarkets] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedMarket, setSelectedMarket] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [marketsRes, productsRes] = await Promise.all([
                getMarkets(),
                getProducts(),
            ]);
            setMarkets(marketsRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedMarket || !selectedProduct || !price) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        setSubmitting(true);
        try {
            await submitPrice(
                {
                    market_id: selectedMarket,
                    product_id: selectedProduct,
                    price: parseFloat(price),
                    currency: 'RWF',
                },
                token
            );
            Alert.alert('Success', 'Price submitted successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        setSelectedMarket('');
                        setSelectedProduct('');
                        setPrice('');
                        navigation.goBack();
                    },
                },
            ]);
        } catch (error) {
            console.error('Error submitting price:', error);
            Alert.alert('Error', 'Failed to submit price');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Submit Price</Text>
                    <Text style={styles.subtitle}>
                        Help the community by sharing current prices
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Select Market</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedMarket}
                                onValueChange={(itemValue) => setSelectedMarket(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Choose a market..." value="" />
                                {markets.map((market) => (
                                    <Picker.Item
                                        key={market.id}
                                        label={market.name}
                                        value={market.id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Select Product</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedProduct}
                                onValueChange={(itemValue) => setSelectedProduct(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Choose a product..." value="" />
                                {products.map((product) => (
                                    <Picker.Item
                                        key={product.id}
                                        label={`${product.name} (${product.category_name})`}
                                        value={product.id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Price (RWF)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter price"
                            placeholderTextColor="#9CA3AF"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, submitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text style={styles.buttonText}>
                            {submitting ? 'Submitting...' : 'Submit Price'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    form: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    picker: {
        height: 50,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    button: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#4F46E5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PriceSubmissionScreen;
