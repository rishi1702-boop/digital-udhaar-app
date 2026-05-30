import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import Header from '../components/Layout/Header';
import Modal from '../components/Common/Modal';
import Loader from '../components/Common/Loader';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft, HiOutlineArrowUp, HiOutlineArrowDown,
  HiOutlineChatAlt2, HiOutlineDocumentDownload, HiOutlineTrash,
  HiOutlinePhone, HiOutlineLocationMarker, HiOutlineCalendar,
  HiOutlineExclamation, HiOutlineCheckCircle,
} from 'react-icons/hi';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const chatEndRef = useRef(null);
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnType, setTxnType] = useState('credit');
  const [txnForm, setTxnForm] = useState({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  const fetchData = async () => {
    try {
      const [custRes, txnRes] = await Promise.all([
        API.get(`/customers/${id}`),
        API.get(`/transactions?customer=${id}&limit=200`),
      ]);
      setCustomer(custRes.data.data);
      setTransactions(txnRes.data.data);
    } catch (err) { toast.error('Failed to load customer'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transactions]);

  const handleAddTxn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/transactions', {
        customer: id, type: txnType,
        amount: txnForm.amount, description: txnForm.description, date: txnForm.date,
      });
      toast.success(txnType === 'credit' ? t('udhaarRecorded') : t('paymentRecorded'));
      setShowTxnModal(false);
      setTxnForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/transactions/${deleteId}`);
      toast.success(t('transactionDeleted'));
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleSettle = async (txnId) => {
    try {
      await API.put(`/transactions/${txnId}/settle`);
      toast.success(t('markAsSettled'));
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const handleReminder = async () => {
    try {
      const { data } = await API.post(`/reminders/send/${id}`, { method: 'sms' });
      toast.success(data.message);
    } catch (err) { toast.error('Reminder failed'); }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await API.get(`/customers/${id}/statement`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customer.name}-statement.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('downloadStatement'));
    } catch (err) { toast.error('Download failed'); }
  };

  const openTxnModal = (type) => {
    setTxnType(type);
    setTxnForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowTxnModal(true);
  };

  // Group transactions by date for chat separators
  const groupedTransactions = () => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const groups = [];
    let currentDate = '';
    for (const txn of sorted) {
      const dateStr = new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ type: 'date', label: dateStr });
      }
      groups.push({ type: 'txn', data: txn });
    }
    return groups;
  };

  if (loading) return <><Header title={t('loading')} /><Loader fullPage /></>;
  if (!customer) return <><Header title="Not Found" /><div className="glass-card empty-state"><h3>Customer not found</h3></div></>;

  const riskColors = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' };

  return (
    <>
      <Header title={customer.name} subtitle={customer.phone} />

      {/* Back link */}
      <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
        <HiOutlineArrowLeft /> {t('backToCustomers')}
      </Link>

      {/* Customer Profile + Balance */}
      <div className="customer-profile">
        <div className="profile-card">
          <h3 style={{ marginBottom: '16px' }}>{t('customerInfo')}</h3>
          <div className="profile-info">
            <div className="profile-info-item">
              <label><HiOutlinePhone style={{marginRight:'4px'}} /> {t('phone')}</label>
              <span>{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="profile-info-item">
                <label><HiOutlineLocationMarker style={{marginRight:'4px'}} /> {t('address')}</label>
                <span>{customer.address}</span>
              </div>
            )}
            <div className="profile-info-item">
              <label><HiOutlineCalendar style={{marginRight:'4px'}} /> {t('customerSince')}</label>
              <span>{new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="profile-info-item">
              <label><HiOutlineExclamation style={{marginRight:'4px'}} /> {t('riskLevel')}</label>
              <span className={`risk-badge ${riskColors[customer.riskLevel || 'low']}`}>
                {t(customer.riskLevel || 'low')}
              </span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-outline btn-sm" onClick={handleReminder}>
              <HiOutlineChatAlt2 /> {t('sendReminder')}
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleDownloadPDF}>
              <HiOutlineDocumentDownload /> {t('downloadStatement')}
            </button>
          </div>
        </div>

        <div className="profile-card">
          <div className="balance-display">
            <div className={`balance-amount ${customer.balance > 0 ? 'balance-due' : 'balance-clear'}`}>
              ₹{Math.abs(customer.balance).toLocaleString('en-IN')}
            </div>
            <div className="balance-label">
              {customer.balance > 0 ? t('outstandingUdhaar') : customer.balance < 0 ? t('advancePayment') : t('allClear')}
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {transactions.length} {t('transactions').toLowerCase()} • {customer.totalTransactions || 0} total
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp-style Chat Timeline */}
      <div className="glass-card" style={{ padding: '0', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem' }}>{t('transactionHistory')}</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <h3>{t('noTransactions')}</h3>
            <p>{t('recordFirst')}</p>
          </div>
        ) : (
          <div className="chat-timeline">
            {groupedTransactions().map((item, i) => {
              if (item.type === 'date') {
                return <div className="chat-date-sep" key={`date-${i}`}><span>{item.label}</span></div>;
              }
              const txn = item.data;
              return (
                <div className={`chat-bubble chat-bubble-${txn.type}`} key={txn._id}>
                  <div className="chat-bubble-label">
                    {txn.type === 'credit' ? t('youGave') : t('youGot')}
                  </div>
                  <div className="chat-bubble-amount">
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                  </div>
                  {txn.description && <div className="chat-bubble-desc">{txn.description}</div>}
                  {txn.billImageUrl && (
                    <img src={txn.billImageUrl} alt="Bill" className="chat-bubble-bill"
                      onClick={() => setLightboxImg(txn.billImageUrl)} />
                  )}
                  <div className="chat-bubble-meta">
                    <span>{new Date(txn.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`chat-bubble-status ${txn.paymentStatus === 'SETTLED' ? 'settled' : 'pending'}`}>
                      {txn.paymentStatus === 'SETTLED' ? t('settled') : t('pending')}
                    </span>
                    {txn.type === 'credit' && txn.paymentStatus === 'PENDING' && (
                      <button onClick={() => handleSettle(txn._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
                        <HiOutlineCheckCircle style={{ marginRight: '2px' }} /> {t('markAsSettled')}
                      </button>
                    )}
                    <button onClick={() => setDeleteId(txn._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginLeft: 'auto' }}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn action-btn-gave" onClick={() => openTxnModal('credit')}>
          <HiOutlineArrowUp /> {t('youGave')}
        </button>
        <button className="action-btn action-btn-got" onClick={() => openTxnModal('debit')}>
          <HiOutlineArrowDown /> {t('youGot')}
        </button>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showTxnModal} onClose={() => setShowTxnModal(false)}
        title={txnType === 'credit' ? t('youGave') : t('youGot')}>
        <form onSubmit={handleAddTxn}>
          <div className="form-group">
            <label className="form-label">{t('amount')} (₹) *</label>
            <input className="form-input" type="number" min="0.01" step="0.01" required
              value={txnForm.amount} onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })}
              placeholder="Enter amount" autoFocus style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 700 }} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('description')}</label>
            <input className="form-input" value={txnForm.description}
              onChange={(e) => setTxnForm({ ...txnForm, description: e.target.value })}
              placeholder="e.g., Rice 10kg, Atta 5kg" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('date')}</label>
            <input className="form-input" type="date" value={txnForm.date}
              onChange={(e) => setTxnForm({ ...txnForm, date: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowTxnModal(false)}>{t('cancel')}</button>
            <button type="submit" className={`btn ${txnType === 'credit' ? 'btn-danger' : 'btn-primary'}`} disabled={submitting}>
              {submitting ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Bill" />
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title={t('deleteTransaction')} message={t('deleteTransactionMsg')} />
    </>
  );
};

export default CustomerDetailPage;
