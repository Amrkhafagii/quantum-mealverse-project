
export interface DeliveryNotificationPreferences {
  id: string;
  delivery_user_id: string;
  
  // Push notification settings
  push_delivery_assignments: boolean;
  push_order_updates: boolean;
  push_payment_notifications: boolean;
  push_system_alerts: boolean;
  
  // SMS notification settings
  sms_delivery_assignments: boolean;
  sms_order_updates: boolean;
  sms_payment_notifications: boolean;
  sms_system_alerts: boolean;
  
  // Email notification settings
  email_delivery_assignments: boolean;
  email_order_updates: boolean;
  email_payment_notifications: boolean;
  email_system_alerts: boolean;
  email_weekly_summary: boolean;
  
  // Sound and vibration settings
  sound_enabled: boolean;
  vibration_enabled: boolean;
  sound_delivery_assignments: string;
  sound_order_updates: string;
  sound_payment_notifications: string;
  sound_system_alerts: string;
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  
  created_at: string;
  updated_at: string;
}
