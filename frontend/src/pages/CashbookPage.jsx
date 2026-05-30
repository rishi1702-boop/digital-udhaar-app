import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import Header from '../components/Layout/Header';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import Loader from '../components/Common/Loader';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineBookOpen,
} from 'react-icons/hi';

const CashbookPage = () => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    cashInHand: 0,
    todayCashIn: 0,
    todayCashOut: 0,
    filteredIn: 0,
    filteredOut: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [period, setPeriod] = useState('today');
  const [paymentMode, setPaymentMode] = useState('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Add Entry Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState('in'); // 'in' or 'out'
  const [entryForm, setEntryForm] = useState({
    amount: '',
    description: '',
    paymentMode: 'cash',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Entry State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      const params = {};
      if (period !== 'custom') {
        params.period = period;
      } else {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      if (paymentMode !== 'all') {
        params.paymentMode = paymentMode;
      }

      if (search) {
        params.search = search;
      }

      const { data } = await API.get('/cashbook', { params });
      setEntries(data.data);
      setStats(data.stats);
    } catch (err) {
      toast.error('Failed to load cashbook entries');
    } finally {
      setLoading(false);
    }
  }, [period, paymentMode, search, startDate, endDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Open Modal for In/Out
  const handleOpenAddModal = (type) => {
    setEntryType(type);
    setEntryForm({
      amount: '',
      description: '',
      paymentMode: 'cash',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  // Submit new entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!entryForm.amount || parseFloat(entryForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/cashbook', {
        type: entryType,
        ...entryForm,
      });
      toast.success(
        entryType === 'in' ? 'Cash In recorded successfully' : 'Cash Out recorded successfully'
      );
      setShowAddModal(false);
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save cashbook entry');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Entry
  const handleOpenDelete = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    setDeleting(true);
    try {
      await API.delete(`/cashbook/${entryToDelete._id}`);
      toast.success('Cashbook entry deleted');
      setShowDeleteDialog(false);
      setEntryToDelete(null);
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete cashbook entry');
    } finally {
      setDeleting(false);
    }
  };

  // Download PDF Report
  const handleDownloadReport = async () => {
    try {
      const params = {};
      if (period !== 'custom') {
        params.period = period;
      } else {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      if (paymentMode !== 'all') {
        params.paymentMode = paymentMode;
      }

      if (search) {
        params.search = search;
      }

      const queryString = new URLSearchParams(params).toString();
      const downloadUrl = `/api/cashbook/report?${queryString}`;

      // Open download in new window/tab
      window.open(downloadUrl, '_blank');
    } catch (err) {
      toast.error('Failed to download PDF report');
    }
  };

  return (
    <>
      <Header
        title={t('cashbook')}
        subtitle={t('cashInHandDesc')}
        onToggleSidebar={() => {}}
      />

      {/* Hero Stats Section */}
      <div className="hero-grid" style={{ marginBottom: '20px' }}>
        <div
          className={`hero-card ${stats.cashInHand >= 0 ? 'hero-give' : 'hero-get'}`}
          style={{ cursor: 'default' }}
        >
          <div className="hero-card-label">
            <HiOutlineBookOpen /> {t('cashInHand')}
          </div>
          <div className="hero-card-amount">
            ₹{stats.cashInHand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="hero-card-sub">{t('cashInHandDesc')}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('todaysCashIn')}
            </span>
            <div
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
              }}
            >
              <HiOutlineArrowDown style={{ fontSize: '1.2rem' }} />
              ₹{stats.todayCashIn.toLocaleString('en-IN')}
            </div>
          </div>
          <div
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('todaysCashOut')}
            </span>
            <div
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--danger-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
              }}
            >
              <HiOutlineArrowUp style={{ fontSize: '1.2rem' }} />
              ₹{stats.todayCashOut.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Content */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '80px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('transactionHistory')}</h3>
          <button className="btn btn-outline btn-sm" onClick={handleDownloadReport}>
            <HiOutlineDownload /> {t('downloadStatement')}
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="filters-bar" style={{ background: 'rgba(0,0,0,0.1)', padding: '16px' }}>
          <div className="search-box">
            
            <input
              type="text"
              className="form-input"
              placeholder="Search remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            /><HiOutlineSearch />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: 'calc(100% - 340px)', justifyContent: 'flex-end' }}>
            <select
              className="form-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ maxWidth: '150px' }}
            >
              <option value="today">{t('today')}</option>
              <option value="yesterday">{t('yesterday')}</option>
              <option value="this-month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>

            <select
              className="form-select"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              style={{ maxWidth: '140px' }}
            >
              <option value="all">All Modes</option>
              <option value="cash">{t('cash')}</option>
              <option value="online">{t('online')}</option>
            </select>

            {period === 'custom' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ maxWidth: '130px', padding: '6px 10px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ maxWidth: '130px', padding: '6px 10px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Entries Table */}
        {loading ? (
          <Loader />
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <HiOutlineBookOpen />
            <h3>{t('noCashbookEntries')}</h3>
            <p>{t('addFirstCashbook')}</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>{t('paymentMode')}</th>
                    <th>{t('remarks')}</th>
                    <th style={{ textAlign: 'right' }}>{t('cashIn')} (₹)</th>
                    <th style={{ textAlign: 'right' }}>{t('cashOut')} (₹)</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const isCashIn = entry.type === 'in';
                    const formattedDate = new Date(entry.date).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={entry._id}>
                        <td style={{ fontSize: '0.82rem' }}>{formattedDate}</td>
                        <td>
                          <span
                            className={`badge ${
                              entry.paymentMode === 'cash' ? 'badge-pending' : 'badge-debit'
                            }`}
                          >
                            {entry.paymentMode === 'cash' ? t('cash') : t('online')}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{entry.description || '—'}</td>
                        <td
                          className="amount-debit"
                          style={{ textAlign: 'right', fontWeight: 600 }}
                        >
                          {isCashIn ? `+₹${entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td
                          className="amount-credit"
                          style={{ textAlign: 'right', fontWeight: 600 }}
                        >
                          {!isCashIn ? `-₹${entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--danger-light)' }}
                            onClick={() => handleOpenDelete(entry)}
                            title={t('delete')}
                          >
                            <HiOutlineTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Filter Summary footer */}
            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '24px',
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Cash In: </span>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
                  ₹{stats.filteredIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Cash Out: </span>
                <span style={{ color: 'var(--danger-light)', fontWeight: 600 }}>
                  ₹{stats.filteredOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="cashbook-actions">
        <button
          className="action-btn action-btn-got"
          onClick={() => handleOpenAddModal('in')}
          style={{ gap: '10px' }}
        >
          <HiOutlineArrowDown /> {t('addCashIn')}
        </button>
        <button
          className="action-btn action-btn-gave"
          onClick={() => handleOpenAddModal('out')}
          style={{ gap: '10px' }}
        >
          <HiOutlineArrowUp /> {t('addCashOut')}
        </button>
      </div>

      {/* Add Cash In / Cash Out Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={entryType === 'in' ? t('addCashIn') : t('addCashOut')}
      >
        <form onSubmit={handleAddEntry}>
          <div className="form-group">
            <label className="form-label">{t('amount')} (₹) *</label>
            <input
              type="number"
              className="form-input"
              required
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={entryForm.amount}
              onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('paymentMode')} *</label>
            <select
              className="form-select"
              required
              value={entryForm.paymentMode}
              onChange={(e) => setEntryForm({ ...entryForm, paymentMode: e.target.value })}
            >
              <option value="cash">{t('cash')}</option>
              <option value="online">{t('online')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('remarks')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Paid tea vendor, received opening bal..."
              value={entryForm.description}
              onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('date')}</label>
            <input
              type="date"
              className="form-input"
              value={entryForm.date}
              onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowAddModal(false)}
            >
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Cashbook Entry?"
        message="Are you sure you want to delete this cash entry? The cash balance will be recalculated."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        danger={true}
      />
    </>
  );
};

export default CashbookPage;
