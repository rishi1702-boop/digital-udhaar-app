import { HiOutlineExclamation } from 'react-icons/hi';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', danger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth:'400px'}}>
        <div className="confirm-dialog">
          <HiOutlineExclamation />
          <h3>{title || 'Are you sure?'}</h3>
          <p>{message || 'This action cannot be undone.'}</p>
          <div className="confirm-actions">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
