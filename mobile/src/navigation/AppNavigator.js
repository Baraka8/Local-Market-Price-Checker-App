import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MarketsScreen from '../screens/MarketsScreen';
import ProductsScreen from '../screens/ProductsScreen';
import PriceSubmissionScreen from '../screens/PriceSubmissionScreen';
import PriceComparisonScreen from '../screens/PriceComparisonScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#4F46E5',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                {!user ? (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{ title: 'Market Price Checker' }}
                        />
                        <Stack.Screen
                            name="Markets"
                            component={MarketsScreen}
                            options={{ title: 'Markets' }}
                        />
                        <Stack.Screen
                            name="Products"
                            component={ProductsScreen}
                            options={{ title: 'Products' }}
                        />
                        <Stack.Screen
                            name="PriceSubmission"
                            component={PriceSubmissionScreen}
                            options={{ title: 'Submit Price' }}
                        />
                        <Stack.Screen
                            name="PriceComparison"
                            component={PriceComparisonScreen}
                            options={{ title: 'Compare Prices' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
