/**
 * Structure for field-level validation errors
 */
export interface ValidationError {
  /**
   * The field name that failed validation
   */
  field: string;

  /**
   * The validation error message
   */
  message: string;

  /**
   * Optional: The value that failed validation (for debugging)
   */
  value?: any;
}

