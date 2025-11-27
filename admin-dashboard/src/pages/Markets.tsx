import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const Markets: React.FC = () => {
  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'markets'));
      setMarkets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Failed to load markets:', error);
    }
  };

  return (
    <div>
      <h1>Markets</h1>
      <p>Market management coming soon...</p>
    </div>
  );
};

export default Markets;

