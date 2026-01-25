import { ValidationError } from './validation-error.dto';

/**
 * Standard error response structure for all API errors
 */
export interface ErrorResponseDto {
  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Error type name (e.g., "Not Found", "Bad Request")
   */
  error: string;

  /**
   * ISO 8601 timestamp of when the error occurred
   */
  timestamp: string;

  /**
   * The API path where the error occurred
   */
  path: string;

  /**
   * Optional: Additional error details
   */
  details?: string;

  /**
   * Optional: Array of field-level validation errors
   * Used when multiple fields fail validation (e.g., form submission)
   */
  validationErrors?: ValidationError[];
}

