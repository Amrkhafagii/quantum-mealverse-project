
interface MessageValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedContent?: string;
}

interface MessageValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowEmpty?: boolean;
  requireRecipient?: boolean;
}

/**
 * Validates message content before sending
 */
export const validateMessageContent = (
  content: string,
  recipientId?: string,
  options: MessageValidationOptions = {}
): MessageValidationResult => {
  const {
    maxLength = 1000,
    minLength = 1,
    allowEmpty = false,
    requireRecipient = true
  } = options;

  try {
    // Check if content exists
    if (!content && !allowEmpty) {
      return {
        isValid: false,
        error: 'Message content is required'
      };
    }

    // Trim content
    const trimmedContent = content?.trim() || '';

    // Check length requirements
    if (!allowEmpty && trimmedContent.length < minLength) {
      return {
        isValid: false,
        error: `Message must be at least ${minLength} character${minLength > 1 ? 's' : ''} long`
      };
    }

    if (trimmedContent.length > maxLength) {
      return {
        isValid: false,
        error: `Message must be no more than ${maxLength} characters long. Current: ${trimmedContent.length}`
      };
    }

    // Check recipient if required
    if (requireRecipient && (!recipientId || recipientId.trim() === '')) {
      return {
        isValid: false,
        error: 'Recipient is required'
      };
    }

    // Sanitize content (basic XSS prevention)
    const sanitizedContent = sanitizeMessageContent(trimmedContent);

    // Check for suspicious patterns
    if (containsSuspiciousContent(sanitizedContent)) {
      return {
        isValid: false,
        error: 'Message contains inappropriate content'
      };
    }

    return {
      isValid: true,
      sanitizedContent
    };

  } catch (error) {
    console.error('Error validating message:', error);
    return {
      isValid: false,
      error: 'Failed to validate message'
    };
  }
};

/**
 * Basic content sanitization
 */
const sanitizeMessageContent = (content: string): string => {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Check for suspicious or inappropriate content
 */
const containsSuspiciousContent = (content: string): boolean => {
  const suspiciousPatterns = [
    /javascript:/i,
    /<script/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /window\.location/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(content));
};

/**
 * Validates phone number format
 */
export const validatePhoneNumber = (phone: string): MessageValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  const trimmedPhone = phone.trim();
  
  // Basic phone number validation (adjust pattern as needed)
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  
  if (!phonePattern.test(trimmedPhone.replace(/[\s\-\(\)]/g, ''))) {
    return {
      isValid: false,
      error: 'Invalid phone number format'
    };
  }

  return {
    isValid: true,
    sanitizedContent: trimmedPhone
  };
};

/**
 * Validates user ID format
 */
export const validateUserId = (userId: string): MessageValidationResult => {
  if (!userId || userId.trim() === '') {
    return {
      isValid: false,
      error: 'User ID is required'
    };
  }

  // Basic UUID validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidPattern.test(userId.trim())) {
    return {
      isValid: false,
      error: 'Invalid user ID format'
    };
  }

  return {
    isValid: true,
    sanitizedContent: userId.trim()
  };
};
