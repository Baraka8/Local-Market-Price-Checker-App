import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    const features = [
        {
            title: 'Markets',
            description: 'Browse all available markets',
            icon: '🏪',
            screen: 'Markets',
            color: '#10B981',
        },
        {
            title: 'Products',
            description: 'View all products and categories',
            icon: '📦',
            screen: 'Products',
            color: '#3B82F6',
        },
        {
            title: 'Compare Prices',
            description: 'Compare prices across markets',
            icon: '💰',
            screen: 'PriceComparison',
            color: '#F59E0B',
        },
        {
            title: 'Submit Price',
            description: 'Contribute price information',
            icon: '📝',
            screen: 'PriceSubmission',
            color: '#8B5CF6',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {user?.username}!</Text>
                        <Text style={styles.subGreeting}>Welcome to Market Price Checker</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Your Account</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>👤</Text>
                            <Text style={styles.statLabel}>{user?.role}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>📧</Text>
                            <Text style={styles.statLabel}>{user?.email}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.features}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <View style={styles.featureGrid}>
                        {features.map((feature, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.featureCard, { borderLeftColor: feature.color }]}
                                onPress={() => navigation.navigate(feature.screen)}
                            >
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subGreeting: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    logoutText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    features: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    featureGrid: {
        gap: 16,
    },
    featureCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
});

export default HomeScreen;
