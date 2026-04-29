import { getInitials, getAvatarColor } from '../utils/avatarUtils';
import '../styles/avatar.css';

const Avatar = ({ prenom = '', nom = '', size = 'medium', className = '' }) => {
  const initials = getInitials(prenom, nom);
  const fullName = `${prenom} ${nom}`.trim() || 'Utilisateur';
  const bgColor = getAvatarColor(fullName);

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={fullName}
    >
      <span className="avatar-text">{initials}</span>
    </div>
  );
};

export default Avatar;
