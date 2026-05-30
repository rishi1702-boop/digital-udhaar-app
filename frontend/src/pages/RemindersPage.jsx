import { useState, useEffect } from 'react';
import API from '../api/axios';
import Header from '../components/Layout/Header';
import Loader from '../components/Common/Loader';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const RemindersPage = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const sendWhatsApp = (customer) => {
    let phone = customer.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone; // Default to India if no country code
    
    const message = encodeURIComponent(
      `Hello ${customer.name}, this is a reminder that ₹${customer.balance} is pending in your Udhaar account.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (loading) return <><Header title={t('reminders')} subtitle={t('sendPaymentReminders')} /><Loader fullPage /></>;

  return (
    <>
      <Header title={t('reminders')} subtitle={t('sendPaymentReminders')} />
      <div className="page-header">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{customers.length} {t('customersWithDues')}</span>
        </div>
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
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => sendWhatsApp(c)}
                      style={{ color: '#25D366', borderColor: '#25D366' }}
                    >
                      <FaWhatsapp style={{ fontSize: '1.2em' }} /> WhatsApp
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
