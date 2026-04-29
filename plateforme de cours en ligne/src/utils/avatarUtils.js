/**
 * Generate user initials from first name and last name
 * @param {string} prenom - First name
 * @param {string} nom - Last name
 * @returns {string} User initials (e.g., "RT" for Raharison Tokiniana)
 */
export const getInitials = (prenom = '', nom = '') => {
  const first = prenom.trim().charAt(0).toUpperCase() || '';
  const last = nom.trim().charAt(0).toUpperCase() || '';
  return (first + last) || '?';
};

/**
 * Parse full name into prenom and nom
 * @param {string} fullName - Full name (e.g., "Jean Dupont")
 * @returns {Object} Object with prenom and nom
 */
export const parseFullName = (fullName = '') => {
  const trimmed = fullName.trim();
  if (!trimmed) return { prenom: '', nom: '' };
  
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { prenom: parts[0], nom: '' };
  }
  
  const prenom = parts[0];
  const nom = parts.slice(1).join(' ');
  return { prenom, nom };
};

/**
 * Generate initials from full name
 * @param {string} fullName - Full name (e.g., "Jean Dupont")
 * @returns {string} User initials (e.g., "JD")
 */
export const getInitialsFromFullName = (fullName = '') => {
  const { prenom, nom } = parseFullName(fullName);
  return getInitials(prenom, nom);
};

/**
 * Generate a consistent color based on user name for avatar background
 * @param {string} name - User name or initials
 * @returns {string} Hex color code
 */
export const getAvatarColor = (name = '') => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Light Blue
    '#F8B88B', // Peach
    '#B19CD9', // Lavender
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};
