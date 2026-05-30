import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Ensure axios base URL is set or handled by proxy
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

const PaymentCheckoutPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const fetchCheckoutDetails = async () => {
      try {
        const response = await api.get(`/reminders/checkout/${customerId}`);
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          setError('Failed to fetch checkout details.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading payment details.');
      } finally {
        setLoading(false);
      }
    };
    if (customerId) {
      fetchCheckoutDetails();
    }
  }, [customerId]);

  const handleInstantSettle = useCallback(async () => {
    if (!data) return;
    setConfirming(true);
    
    // Generate a mock 12-digit UPI transaction reference / UTR number
    const randomUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    
    try {
      const response = await api.post(`/reminders/checkout/${customerId}/confirm-payment`, {
        utr: randomUtr,
        amount: parseFloat(data.balance),
      });
      if (response.data?.success) {
        toast.success('Payment recorded successfully!');
        setIsPaid(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setConfirming(false);
    }
  }, [customerId, data]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loader}></div>
          <p style={{ marginTop: '20px', color: '#64748b' }}>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Error</h2>
          <p style={{ color: '#64748b' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.balance <= 0) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={{ color: '#10b981', marginBottom: '10px' }}>All Settled!</h2>
          <p style={{ color: '#64748b' }}>You have no outstanding balance.</p>
        </div>
      </div>
    );
  }

  // 1. Format standard UPI deep-link URL
  const upiLink = data.upiId 
    ? `upi://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.storeName)}&am=${data.balance}&cu=INR&tn=${encodeURIComponent('Udhaar Payment - ' + data.storeName)}`
    : '';
  
  // 2. Generate UPI QR code
  const qrCodeUrl = upiLink 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`
    : '';

  if (isPaid) {
    return (
      <div style={styles.container}>
        <div style={{...styles.card, ...styles.successCard}}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={{ color: '#10b981', marginBottom: '10px', fontSize: '24px' }}>Payment Successful</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Thank you, {data.name}!</p>
          <div style={styles.receipt}>
            <div style={styles.receiptRow}>
              <span>Paid to:</span>
              <strong>{data.storeName}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Amount:</span>
              <strong>₹{data.balance.toFixed(2)}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Status:</span>
              <strong style={{color: '#10b981'}}>Settled</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.storeName}>{data.storeName}</h1>
          <p style={styles.customerGreeting}>Hello, {data.name}</p>
        </div>

        <div style={styles.amountContainer}>
          <p style={styles.amountLabel}>Outstanding Balance</p>
          <h2 style={styles.amountValue}>₹{data.balance.toFixed(2)}</h2>
        </div>

        {data.upiId ? (
          <div style={styles.qrSection}>
            <p style={styles.qrLabel}>Scan to Pay via any UPI App</p>
            <div style={styles.qrWrapper}>
              <img src={qrCodeUrl} alt="UPI QR Code" style={styles.qrImage} />
            </div>
            <p style={styles.upiIdDisplay}>{data.upiId}</p>

            <div style={styles.actions}>
              {/* On mobile, this will try to open GPay, PhonePe, Paytm etc */}
              <a href={upiLink} style={styles.payButton}>
                Pay via UPI App
              </a>
              
              <button 
                onClick={handleInstantSettle} 
                disabled={confirming}
                style={confirming ? styles.simulateButtonDisabled : styles.simulateButton}
              >
                {confirming ? 'Confirming...' : 'I have made the payment'}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.noUpi}>
            <p>Store owner hasn't set up UPI. Please contact {data.storeName} directly to settle your balance.</p>
            {data.storePhone && <p style={{marginTop: '10px'}}>Phone: {data.storePhone}</p>}
          </div>
        )}
      </div>
      <div style={styles.footer}>
        <p>Powered by Digital Udhaar Khata</p>
      </div>
    </div>
  );
};

// Sleek inline styles for standalone public page
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  successCard: {
    animation: 'slideUp 0.5s ease-out',
  },
  header: {
    marginBottom: '30px',
  },
  storeName: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 5px 0',
  },
  customerGreeting: {
    fontSize: '16px',
    color: '#64748b',
    margin: '0',
  },
  amountContainer: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    border: '1px solid #e2e8f0',
  },
  amountLabel: {
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#64748b',
    margin: '0 0 10px 0',
  },
  amountValue: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#ef4444', // Red for outstanding
    margin: '0',
    lineHeight: '1',
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '15px',
    fontWeight: '500',
  },
  qrWrapper: {
    background: 'white',
    padding: '15px',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    marginBottom: '15px',
    border: '1px solid #f1f5f9',
  },
  qrImage: {
    width: '200px',
    height: '200px',
    display: 'block',
  },
  upiIdDisplay: {
    fontSize: '14px',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '6px 12px',
    borderRadius: '20px',
    marginBottom: '25px',
  },
  actions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  payButton: {
    display: 'block',
    background: '#0ea5e9',
    color: 'white',
    textDecoration: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'background 0.2s',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
  },
  simulateButton: {
    background: 'transparent',
    color: '#0ea5e9',
    border: '2px solid #0ea5e9',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  simulateButtonDisabled: {
    background: '#f1f5f9',
    color: '#94a3b8',
    border: '2px solid #e2e8f0',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'not-allowed',
  },
  noUpi: {
    color: '#64748b',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
  },
  successIcon: {
    width: '64px',
    height: '64px',
    background: '#10b981',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 20px auto',
    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
  },
  receipt: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    textAlign: 'left',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '15px',
    color: '#475569',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0ea5e9',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  footer: {
    marginTop: '30px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
  }
};

export default PaymentCheckoutPage;
