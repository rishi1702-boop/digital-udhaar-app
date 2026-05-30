import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Header from '../components/Layout/Header';
import Modal from '../components/Common/Modal';
import Loader from '../components/Common/Loader';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineTrash, HiOutlineChatAlt2 } from 'react-icons/hi';

const CustomersPage = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await API.get('/customers', { params });
      setCustomers(data.data);
    } catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/customers', form);
      toast.success(t('customerAdded'));
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/customers/${deleteId}`);
      toast.success(t('customerDeleted'));
      setDeleteId(null);
      fetchCustomers();
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleRemind = async (e, customerId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await API.post(`/reminders/send/${customerId}`);
      toast.success(data.message);
      if (data.previewUrl) {
        console.log('Email preview URL:', data.previewUrl);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send reminder'); }
  };

  if (loading) return <><Header title={t('customers')} subtitle={t('manageCustomers')} /><Loader fullPage /></>;

  return (
    <>
      <Header title={t('customers')} subtitle={t('manageCustomers')} />
      <div className="page-header">
        <div className="search-box">
          <HiOutlineSearch />
          <input className="form-input" placeholder={`${t('search')} ...`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <HiOutlinePlus /> {t('addCustomer')}
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="glass-card empty-state">
          <h3>{t('noCustomers')}</h3>
          <p>{t('addFirstCustomer')}</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{marginTop:'8px'}}>
            <HiOutlinePlus /> {t('addCustomer')}
          </button>
        </div>
      ) : (
        <div className="table-container glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('customerName')}</th>
                <th>{t('phone')}</th>
                <th>{t('balance')}</th>
                <th>{t('riskLevel')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>
                    <Link to={`/customers/${c._id}`} style={{color:'var(--text-primary)', fontWeight:600}}>{c.name}</Link>
                  </td>
                  <td>{c.phone}</td>
                  <td style={{fontWeight:600}} className={c.balance > 0 ? 'amount-credit' : c.balance < 0 ? 'amount-debit' : ''}>
                    ₹{Math.abs(c.balance).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`risk-badge risk-${c.riskLevel || 'low'}`}>
                      {t(c.riskLevel || 'low')}
                    </span>
                  </td>
                  <td>
                    {c.balance > 0 ? (
                      <span className="badge badge-credit">{t('due')}</span>
                    ) : c.balance < 0 ? (
                      <span className="badge badge-debit">{t('advance')}</span>
                    ) : (
                      <span className="badge badge-clear">{t('clear')}</span>
                    )}
                  </td>
                  <td>
                    <div style={{display:'flex', gap:'6px'}}>
                      {c.balance > 0 && (
                        <button className="btn btn-ghost btn-sm btn-icon" title={t('sendReminder')} onClick={(e) => handleRemind(e, c._id)}>
                          <HiOutlineChatAlt2 style={{color:'var(--accent)'}} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteId(c._id)}>
                        <HiOutlineTrash style={{color:'var(--danger)'}} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={t('addCustomer')}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('customerName')} *</label>
            <input className="form-input" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('phone')} *</label>
            <input className="form-input" required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('emailAddress') || 'Email Address'}</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="customer@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('address')}</label>
            <input className="form-input" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? t('saving') : t('save')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title={t('deleteCustomer')} message={t('deleteCustomerMsg')} />
    </>
  );
};

export default CustomersPage;
