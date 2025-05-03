
export interface AuthFormData {
  email: string;
  password: string;
}

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface AuthHandlerParams {
  setLoggedInUser: (user: any) => void;
  setShowLoginPrompt: (show: boolean) => void;
  setHasDeliveryInfo: (has: boolean) => void;
  setDefaultValues: (values: any) => void;
  toast: (props: ToastProps) => void;
}

export interface UserType {
  user_id: string;
  type: 'customer' | 'restaurant' | 'delivery';
  created_at?: string;
}
