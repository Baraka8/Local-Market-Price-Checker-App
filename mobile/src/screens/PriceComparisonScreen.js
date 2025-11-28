import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getProducts, getPricesByProduct } from '../services/api';

const PriceComparisonScreen = ({ route, navigation }) => {
    const { productId: initialProductId } = route.params || {};
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(initialProductId || '');
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingPrices, setFetchingPrices] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchPrices();
        }
    }, [selectedProduct]);

    const fetchProducts = async () => {
        try {
            const response = await getProducts();
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrices = async () => {
        setFetchingPrices(true);
        try {
            const response = await getPricesByProduct(selectedProduct);
            setPrices(response.data);
        } catch (error) {
            console.error('Error fetching prices:', error);
        } finally {
            setFetchingPrices(false);
        }
    };

    const getAveragePrice = () => {
        if (prices.length === 0) return 0;
        const sum = prices.reduce((acc, price) => acc + parseFloat(price.price), 0);
        return (sum / prices.length).toFixed(2);
    };

    const getLowestPrice = () => {
        if (prices.length === 0) return null;
        return prices.reduce((min, price) =>
            parseFloat(price.price) < parseFloat(min.price) ? price : min
        );
    };

    const getHighestPrice = () => {
        if (prices.length === 0) return null;
        return prices.reduce((max, price) =>
            parseFloat(price.price) > parseFloat(max.price) ? price : max
        );
    };

    const renderPriceItem = ({ item }) => {
        const lowest = getLowestPrice();
        const highest = getHighestPrice();
        const isLowest = lowest && item.id === lowest.id;
        const isHighest = highest && item.id === highest.id;

        return (
            <View
                style={[
                    styles.priceCard,
                    isLowest && styles.priceCardLowest,
                    isHighest && styles.priceCardHighest,
                ]}
            >
                <View style={styles.priceHeader}>
                    <Text style={styles.marketName}>{item.market_name}</Text>
                    {isLowest && <Text style={styles.badge}>🎉 Best Price</Text>}
                    {isHighest && <Text style={styles.badgeHighest}>⚠️ Highest</Text>}
                </View>
                <Text style={styles.priceAmount}>{item.price} RWF</Text>
                <Text style={styles.priceDetails}>
                    Submitted by: {item.submitted_by}
                </Text>
                <Text style={styles.priceDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
                {item.verified && <Text style={styles.verified}>✓ Verified</Text>}
            </View>
        );
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
            <View style={styles.header}>
                <Text style={styles.title}>Compare Prices</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedProduct}
                        onValueChange={(itemValue) => setSelectedProduct(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select a product..." value="" />
                        {products.map((product) => (
                            <Picker.Item
                                key={product.id}
                                label={product.name}
                                value={product.id}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {selectedProduct && (
                <>
                    {fetchingPrices ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#4F46E5" />
                        </View>
                    ) : prices.length > 0 ? (
                        <>
                            <View style={styles.statsContainer}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>Average Price</Text>
                                    <Text style={styles.statValue}>{getAveragePrice()} RWF</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>Markets</Text>
                                    <Text style={styles.statValue}>{prices.length}</Text>
                                </View>
                            </View>

                            <FlatList
                                data={prices}
                                renderItem={renderPriceItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.list}
                            />
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No prices available for this product
                            </Text>
                        </View>
                    )}
                </>
            )}
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
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
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
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    list: {
        padding: 16,
    },
    priceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#D1D5DB',
    },
    priceCardLowest: {
        borderLeftColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    priceCardHighest: {
        borderLeftColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    priceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    marketName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    badge: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    badgeHighest: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '600',
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4F46E5',
        marginBottom: 8,
    },
    priceDetails: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    priceDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    verified: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default PriceComparisonScreen;
