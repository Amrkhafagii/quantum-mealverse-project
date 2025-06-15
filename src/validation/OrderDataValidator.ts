
import { CreateOrderRequest } from '@/services/orders/UnifiedOrderService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class OrderDataValidator {
  async validateOrderRequest(request: CreateOrderRequest): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate customer data
    if (!request.customerData.name?.trim()) {
      errors.push('Customer name is required');
    }

    if (!request.customerData.email?.trim()) {
      errors.push('Customer email is required');
    } else if (!this.isValidEmail(request.customerData.email)) {
      errors.push('Invalid email format');
    }

    if (!request.customerData.phone?.trim()) {
      errors.push('Customer phone is required');
    }

    // Validate delivery data
    if (!request.deliveryData.address?.trim()) {
      errors.push('Delivery address is required');
    }

    if (!request.deliveryData.city?.trim()) {
      errors.push('City is required');
    }

    if (request.deliveryData.method === 'delivery') {
      if (!request.deliveryData.latitude || !request.deliveryData.longitude) {
        errors.push('Location coordinates are required for delivery');
      }
    }

    // Validate payment data
    if (!request.paymentData.method) {
      errors.push('Payment method is required');
    }

    if (!request.paymentData.total || request.paymentData.total <= 0) {
      errors.push('Order total must be greater than 0');
    }

    if (!request.paymentData.subtotal || request.paymentData.subtotal <= 0) {
      errors.push('Order subtotal must be greater than 0');
    }

    // Validate items
    if (!request.items || request.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    for (const item of request.items) {
      if (!item.name?.trim()) {
        errors.push(`Item name is required for item ${item.id}`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Item price must be greater than 0 for item ${item.name}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item quantity must be greater than 0 for item ${item.name}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
