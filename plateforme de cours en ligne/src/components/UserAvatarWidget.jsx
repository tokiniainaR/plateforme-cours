import { useState, useEffect } from 'react';
import { getInitials, getAvatarColor } from '../utils/avatarUtils';

const UserAvatarWidget = ({ size = 'medium' }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Dynamically import authService to avoid circular dependencies
        const authService = (await import('../services/authService')).default;
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser?.user || currentUser || null);
      } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div style={{ width: getSize(size), height: getSize(size), backgroundColor: '#e0e0e0', borderRadius: '50%' }} />;
  }

  if (!user) {
    return <div style={{ width: getSize(size), height: getSize(size), backgroundColor: '#ccc', borderRadius: '50%' }} />;
  }

  const initials = getInitials(user.prenom || '', user.nom || '');
  const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
  const bgColor = getAvatarColor(fullName);

  return (
    <div
      className={`avatar avatar-${size}`}
      style={{ backgroundColor: bgColor }}
      title={fullName}
    >
      <span className="avatar-text">{initials}</span>
    </div>
  );
};

const getSize = (size) => {
  const sizes = {
    small: '32px',
    medium: '56px',
    large: '120px',
    xlarge: '160px'
  };
  return sizes[size] || sizes.medium;
};

export default UserAvatarWidget;
