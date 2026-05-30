import { useState, useEffect } from 'react';
import API from '../api/axios';
import Header from '../components/Layout/Header';
import Loader from '../components/Common/Loader';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { HiOutlineChatAlt2, HiOutlinePaperAirplane } from 'react-icons/hi';

const RemindersPage = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});
  const [bulkSending, setBulkSending] = useState(false);
  const [method, setMethod] = useState('sms');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/customers?sort=balance-high');
        setCustomers(data.data.filter(c => c.balance > 0));
      } catch (err) { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const sendOne = async (customerId) => {
    setSending(p => ({ ...p, [customerId]: true }));
    try {
      const { data } = await API.post(`/reminders/send/${customerId}`, { method });
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSending(p => ({ ...p, [customerId]: false })); }
  };

  const sendBulk = async () => {
    setBulkSending(true);
    try {
      const { data } = await API.post('/reminders/send-bulk', { method });
      toast.success(data.message);
    } catch (err) { toast.error('Bulk send failed'); }
    finally { setBulkSending(false); }
  };

  if (loading) return <><Header title={t('reminders')} subtitle={t('sendPaymentReminders')} /><Loader fullPage /></>;

  return (
    <>
      <Header title={t('reminders')} subtitle={t('sendPaymentReminders')} />
      <div className="page-header">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{customers.length} {t('customersWithDues')}</span>
        </div>
        <button className="btn btn-primary" onClick={sendBulk} disabled={bulkSending || customers.length === 0}>
          <HiOutlinePaperAirplane /> {bulkSending ? t('sending') : t('sendToAll')}
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="glass-card empty-state"><h3>{t('noPendingDues')}</h3><p>{t('noPendingDuesMsg')}</p></div>
      ) : (
        <div className="table-container glass-card">
          <table className="data-table">
            <thead><tr><th>{t('customerName')}</th><th>{t('phone')}</th><th>{t('riskLevel')}</th><th>{t('pendingAmount')}</th><th>{t('actions')}</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>{c.phone}</td>
                  <td><span className={`risk-badge risk-${c.riskLevel || 'low'}`}>{t(c.riskLevel || 'low')}</span></td>
                  <td className="amount-credit" style={{ fontWeight: 600 }}>₹{c.balance.toLocaleString('en-IN')}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => sendOne(c._id)} disabled={sending[c._id]}>
                      <HiOutlineChatAlt2 /> {sending[c._id] ? t('sending') : t('send')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default RemindersPage;
