
export interface TicketFormData {
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateTicketForm = (formData: TicketFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.category.trim()) {
    errors.push({ field: 'category', message: 'Please select a category' });
  }

  if (!formData.subject.trim()) {
    errors.push({ field: 'subject', message: 'Subject is required' });
  } else if (formData.subject.trim().length < 5) {
    errors.push({ field: 'subject', message: 'Subject must be at least 5 characters long' });
  } else if (formData.subject.trim().length > 100) {
    errors.push({ field: 'subject', message: 'Subject must not exceed 100 characters' });
  }

  if (!formData.description.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (formData.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters long' });
  } else if (formData.description.trim().length > 1000) {
    errors.push({ field: 'description', message: 'Description must not exceed 1000 characters' });
  }

  return errors;
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
};
