import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import './PendingSubmissions.css';

interface PriceEntry {
  id: string;
  productName: string;
  marketName: string;
  price: number;
  unit: string;
  submittedBy: string;
  createdAt: Timestamp;
  notes?: string;
}

const PendingSubmissions: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const q = query(collection(db, 'prices'), where('verified', '==', false));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PriceEntry[];
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'prices', id), {
        verified: true,
        verifiedBy: user.uid,
        verifiedAt: new Date(),
      });
      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to verify:', error);
      alert('Failed to verify submission');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this submission?')) return;

    try {
      await updateDoc(doc(db, 'prices', id), {
        verified: false,
        // You might want to add a 'rejected' field instead of deleting
      });
      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject submission');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pending-submissions">
      <h1>Pending Submissions</h1>
      {submissions.length === 0 ? (
        <p>No pending submissions</p>
      ) : (
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Market</th>
              <th>Price</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.productName}</td>
                <td>{submission.marketName}</td>
                <td>
                  {submission.price} {submission.unit}
                </td>
                <td>{submission.submittedBy}</td>
                <td>{submission.createdAt.toDate().toLocaleDateString()}</td>
                <td>
                  <button
                    className="verify-btn"
                    onClick={() => handleVerify(submission.id)}
                  >
                    Verify
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(submission.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingSubmissions;

