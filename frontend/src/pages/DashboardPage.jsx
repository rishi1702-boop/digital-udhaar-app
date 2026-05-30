import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Header from '../components/Layout/Header';
import Modal from '../components/Common/Modal';
import Loader from '../components/Common/Loader';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowUp, HiOutlineArrowDown, HiOutlineUsers,
  HiOutlineCreditCard, HiOutlineExclamation, HiOutlineClock,
  HiOutlineSparkles
} from 'react-icons/hi';

const quotes = [
  "“The customer's perception is your reality.” – Kate Zabriskie",
  "“Quality is remembered long after the price is forgotten.” – Aldo Gucci",
  "“Great things in business are never done by one person.” – Steve Jobs",
  "“Your most unhappy customers are your greatest source of learning.” – Bill Gates",
  "“A satisfied customer is the best business strategy of all.” – Michael LeBoeuf"
];

const DashboardPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnForm, setTxnForm] = useState({ customer: '', type: 'credit', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    const fetchAll = async () => {
      try {
        const [statsRes, custRes] = await Promise.all([
          API.get('/transactions/stats'),
          API.get('/customers?sort=balance-high')
        ]);
        setStats(statsRes.data.data);
        setCustomers(custRes.data.data);
      } catch (err) { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleAddTxn = async (e) => {
    e.preventDefault();
    if (!txnForm.customer) { toast.error(t('selectCustomer')); return; }
    setSubmitting(true);
    try {
      await API.post('/transactions', txnForm);
      toast.success(txnForm.type === 'credit' ? t('udhaarRecorded') : t('paymentRecorded'));
      setShowTxnModal(false);
      setTxnForm({ customer: '', type: 'credit', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      const [statsRes, custRes] = await Promise.all([
        API.get('/transactions/stats'), API.get('/customers?sort=balance-high')
      ]);
      setStats(statsRes.data.data); setCustomers(custRes.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const openTxnModal = (type) => {
    setTxnForm({ ...txnForm, type, customer: '', amount: '', description: '' });
    setShowTxnModal(true);
  };

  if (loading) return <><Header title={t('dashboard')} subtitle={t('overviewOfStore')} /><Loader fullPage /></>;

  return (
    <div className="dashboard-wrapper">
      <Header title={t('dashboard')} subtitle={t('overviewOfStore')} />

      {/* Inspirational Quote Banner */}
      <div className="quote-banner" style={{ marginBottom: '40px' }}>
        <HiOutlineSparkles className="quote-icon" />
        <p className="quote-text">{quote}</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* Hero Cards */}
        <div className="hero-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          <div className="hero-card hero-get" style={{ padding: '32px', borderRadius: '24px' }}>
            <div className="hero-card-header">
              <span className="hero-card-label" style={{ fontSize: '1.2rem' }}><HiOutlineArrowDown /> {t('youWillGet')}</span>
              <span className="hero-card-sub" style={{ fontSize: '1rem' }}>{stats?.customersWithDues || 0} {t('customersWithDues')}</span>
            </div>
            <div className="hero-card-amount" style={{ fontSize: '3.5rem' }}>₹{(stats?.youWillGet || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="hero-card hero-give" style={{ padding: '32px', borderRadius: '24px' }}>
            <div className="hero-card-header">
              <span className="hero-card-label" style={{ fontSize: '1.2rem' }}><HiOutlineArrowUp /> {t('youWillGive')}</span>
              <span className="hero-card-sub" style={{ fontSize: '1rem' }}>{t('advancePayment')}</span>
            </div>
            <div className="hero-card-amount" style={{ fontSize: '3.5rem' }}>₹{(stats?.youWillGive || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="action-buttons-container" style={{ gap: '24px', marginBottom: '48px', justifyContent: 'center' }}>
          <button className="action-btn action-btn-gave" style={{ padding: '20px 40px', fontSize: '1.2rem', borderRadius: '100px' }} onClick={() => openTxnModal('credit')}>
            <HiOutlineArrowUp size={24} /> {t('youGave')}
          </button>
          <button className="action-btn action-btn-got" style={{ padding: '20px 40px', fontSize: '1.2rem', borderRadius: '100px' }} onClick={() => openTxnModal('debit')}>
            <HiOutlineArrowDown size={24} /> {t('youGot')}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ fontSize: '1rem' }}>{t('totalCustomers')}</span>
              <div className="stat-card-icon blue" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}><HiOutlineUsers /></div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>{stats?.totalCustomers || 0}</div>
          </div>
          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ fontSize: '1rem' }}>{t('todayTransactions')}</span>
              <div className="stat-card-icon green" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}><HiOutlineCreditCard /></div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>{stats?.todayTransactions || 0}</div>
          </div>
          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ fontSize: '1rem' }}>{t('pendingDues')}</span>
              <div className="stat-card-icon yellow" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}><HiOutlineClock /></div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>{stats?.pendingTransactions || 0}</div>
          </div>
          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ fontSize: '1rem' }}>{t('highRisk')}</span>
              <div className="stat-card-icon red" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}><HiOutlineExclamation /></div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>{stats?.highRiskCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showTxnModal} onClose={() => setShowTxnModal(false)} title={t('addTransaction')}>
        <form onSubmit={handleAddTxn}>
          <div className="form-group">
            <label className="form-label">{t('customers')} *</label>
            <select className="form-select" required value={txnForm.customer} onChange={(e) => setTxnForm({...txnForm, customer: e.target.value})}>
              <option value="">{t('selectCustomer')}</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name} — ₹{c.balance.toLocaleString('en-IN')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('type')} *</label>
            <select className="form-select" value={txnForm.type} onChange={(e) => setTxnForm({...txnForm, type: e.target.value})}>
              <option value="credit">{t('udhaarDesc')}</option>
              <option value="debit">{t('jamaDesc')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('amount')} (₹) *</label>
            <input className="form-input" type="number" min="0.01" step="0.01" required value={txnForm.amount}
              onChange={(e) => setTxnForm({...txnForm, amount: e.target.value})} placeholder="Enter amount" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('description')}</label>
            <input className="form-input" value={txnForm.description} onChange={(e) => setTxnForm({...txnForm, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('date')}</label>
            <input className="form-input" type="date" value={txnForm.date} onChange={(e) => setTxnForm({...txnForm, date: e.target.value})} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowTxnModal(false)}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? t('saving') : t('save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
