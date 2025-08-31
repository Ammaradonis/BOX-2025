export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (userData: any) => void;
}