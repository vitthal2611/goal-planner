import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProfileModal({ onClose }) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onClose();
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">👤 Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-info">
          <div className="profile-avatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-email">{user?.email}</div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
