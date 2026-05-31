import { useState, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Layout/Header';
import Modal from '../components/Common/Modal';
import { toast } from 'react-toastify';
import { HiOutlineCamera } from 'react-icons/hi';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    name: user?.name || '', storeName: user?.storeName || '',
    phone: user?.phone || '', upiId: user?.upiId || '',
  });
  
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const submitProfileData = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('storeName', form.storeName);
      formData.append('phone', form.phone);
      formData.append('upiId', form.upiId);
      
      if (password) {
        formData.append('password', password);
      }

      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const { data } = await API.put('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser(data.data);
      setProfileImage(data.data.profileImage || '');
      setSelectedFile(null);
      setPreviewUrl('');
      setPassword('');
      setShowPasswordModal(false);
      toast.success(t('profileUpdated'));
      setIsEditing(false);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Update failed');
      setPassword('');
    }
    finally { setSaving(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.upiId !== (user?.upiId || '')) {
      setShowPasswordModal(true);
    } else {
      submitProfileData();
    }
  };

  const displayImage = previewUrl || profileImage;

  return (
    <>
      <Header title={isEditing ? t('manageProfile') : t('storeProfile')} subtitle={isEditing ? 'Update your information' : 'Your store details'} />
      <div className="glass-card" style={{ padding: '28px', maxWidth: '600px', margin: '0 auto' }}>
        
        {!isEditing ? (
          <div className="store-profile-view">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <div className="profile-image-preview" style={{ cursor: 'default', width: '100px', height: '100px' }}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image-img" />
                ) : (
                  <div className="profile-image-placeholder" style={{ fontSize: '2.5rem' }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <h2 style={{ marginTop: '16px', fontSize: '1.5rem', fontWeight: '700' }}>{user?.storeName || 'Your Store'}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>

            <div className="profile-info-grid" style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
              <div className="info-item" style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('yourName')}</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '500', marginTop: '4px' }}>{user?.name || '—'}</div>
              </div>
              <div className="info-item" style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('phoneNumber')}</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '500', marginTop: '4px' }}>{user?.phone || '—'}</div>
              </div>
              <div className="info-item" style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('upiId')}</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '500', marginTop: '4px' }}>{user?.upiId || '—'}</div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>{t('editProfile')}</h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="profile-image-upload-container">
                <div 
                  className="profile-image-preview" 
                  onClick={() => fileInputRef.current.click()}
                >
                  {displayImage ? (
                    <img src={displayImage} alt="Profile" className="profile-image-img" />
                  ) : (
                    <div className="profile-image-placeholder">
                      {form.name ? form.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="profile-image-overlay">
                    <HiOutlineCamera size={24} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <p className="profile-image-hint">Click to update photo</p>
              </div>

              <div className="form-group">
                <label className="form-label">{t('yourName')}</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('storeName')}</label>
                <input className="form-input" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('phoneNumber')}</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('upiId')}</label>
                <input className="form-input" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  placeholder={t('upiPlaceholder')} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  This UPI ID will be included in payment reminder messages as a collection link.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-outline" type="button" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                  {t('cancel')}
                </button>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Security Verification">
        <form onSubmit={submitProfileData}>
          <div className="form-group">
            <label className="form-label">Enter your password to change UPI ID</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoFocus 
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-outline" type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1 }}>
              {t('cancel')}
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Verifying...' : 'Verify & Save'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SettingsPage;
