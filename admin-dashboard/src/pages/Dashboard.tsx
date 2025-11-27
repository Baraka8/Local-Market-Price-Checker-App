import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingSubmissions: 0,
    totalPrices: 0,
    totalMarkets: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [pricesSnapshot, unverifiedSnapshot, marketsSnapshot, productsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'prices')),
        getDocs(query(collection(db, 'prices'), where('verified', '==', false))),
        getDocs(collection(db, 'markets')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'users')),
      ]);

      setStats({
        pendingSubmissions: unverifiedSnapshot.size,
        totalPrices: pricesSnapshot.size,
        totalMarkets: marketsSnapshot.size,
        totalProducts: productsSnapshot.size,
        totalUsers: usersSnapshot.size,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Submissions</h3>
          <p className="stat-value">{stats.pendingSubmissions}</p>
        </div>
        <div className="stat-card">
          <h3>Total Prices</h3>
          <p className="stat-value">{stats.totalPrices}</p>
        </div>
        <div className="stat-card">
          <h3>Total Markets</h3>
          <p className="stat-value">{stats.totalMarkets}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

