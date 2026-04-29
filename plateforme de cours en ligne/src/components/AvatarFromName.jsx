import { getInitialsFromFullName, getAvatarColor } from '../utils/avatarUtils';
import '../styles/avatar.css';

/**
 * Avatar component that accepts a full name instead of separate prenom/nom
 * Useful for display names like "Jean Dupont"
 */
const AvatarFromName = ({ name = '', size = 'medium', className = '' }) => {
  const initials = getInitialsFromFullName(name);
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      <span className="avatar-text">{initials}</span>
    </div>
  );
};

export default AvatarFromName;
