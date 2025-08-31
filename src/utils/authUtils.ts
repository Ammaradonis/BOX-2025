export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    const parts = [];
    if (match[1]) parts.push(`(${match[1]}`);
    if (match[2]) parts.push(`) ${match[2]}`);
    if (match[3]) parts.push(`-${match[3]}`);
    return parts.join('');
  }
  return phone;
};

export const validatePhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 0;
};

export const getPasswordStrength = (password: string) => {
  if (password.length < 6) return { strength: 'Weak', color: 'text-red-500' };
  if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { strength: 'Medium', color: 'text-yellow-500' };
  }
  return { strength: 'Strong', color: 'text-green-500' };
};