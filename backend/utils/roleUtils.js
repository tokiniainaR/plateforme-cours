export const mapRole = (role) => {
  if (!role) return 'student';
  const normalized = role.toString().toLowerCase();
  if (normalized.includes('formateur') || normalized.includes('instructeur') || normalized.includes('instructor')) {
    return 'instructor';
  }
  if (normalized.includes('admin')) {
    return 'admin';
  }
  return 'student';
};
