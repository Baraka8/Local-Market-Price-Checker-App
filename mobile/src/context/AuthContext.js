import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import { saveToken, saveUser, getToken, getUser, removeToken, removeUser } from '../services/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const loadUserData = async () => {
            const storedToken = await getToken();
            const storedUser = await getUser();
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser);
            }
            setLoading(false);
        };
        loadUserData();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiLogin(email, password);
            const { token: authToken, user: userData } = response.data;

            await saveToken(authToken);
            await saveUser(userData);

            setToken(authToken);
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await apiRegister(userData);
            const { token: authToken, user: newUser } = response.data;

            await saveToken(authToken);
            await saveUser(newUser);

            setToken(authToken);
            setUser(newUser);

            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        await removeToken();
        await removeUser();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
